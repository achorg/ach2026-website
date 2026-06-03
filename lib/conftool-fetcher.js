/**
 * Advanced ConfTool API utilities.
 * Provides helper functions for fetching and caching ConfTool data.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

class ConfToolFetcher {
  constructor(sharedSecret, restUrl, cacheDir = '.cache/conftool') {
    this.sharedSecret = sharedSecret;
    this.restUrl = restUrl || 'https://www.conftool.pro/ach2026/rest.php';
    this.cacheDir = cacheDir;
    this.cacheDuration = 24 * 60 * 60 * 1000;
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseTagValue: true,
      trimValues: true,
      allowBooleanAttributes: true,
      processEntities: false,
      htmlEntities: false,
      ignoreDeclaration: true,
      numberParseOptions: { leadingZeros: false },
    });

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  getCachePath(query) {
    const filename = `${query.replace(/[^a-z0-9]/gi, '_')}.json`;
    return path.join(this.cacheDir, filename);
  }

  isCacheValid(cachePath) {
    if (!fs.existsSync(cachePath)) {
      return false;
    }

    const stats = fs.statSync(cachePath);
    const age = Date.now() - stats.mtime.getTime();
    return age < this.cacheDuration;
  }

  readCache(cachePath) {
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } catch (error) {
      console.warn(`Failed to read cache: ${error.message}`);
      return null;
    }
  }

  writeCache(cachePath, data) {
    try {
      fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.warn(`Failed to write cache: ${error.message}`);
    }
  }

  createNonce() {
    return Date.now().toString();
  }

  createPasshash(nonce) {
    return crypto
      .createHash('sha256')
      .update(`${nonce}${this.sharedSecret}`)
      .digest('hex');
  }

  buildAdminExportParams(exportSelect, extraParams = {}) {
    const nonce = this.createNonce();
    const passhash = this.createPasshash(nonce);
    const params = new URLSearchParams();

    params.set('page', 'adminExport');
    params.set('nonce', nonce);
    params.set('passhash', passhash);
    params.set('export_select', exportSelect);
    params.set('form_include_deleted', '0');
    params.set('form_export_format', 'xml_short');
    params.set('form_export_header', 'default');
    params.set('cmd_create_export', 'true');

    for (const [key, value] of Object.entries(extraParams)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          params.append(key, item);
        }
      } else if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }

    return params;
  }

  parseXml(xmlText) {
    return this.xmlParser.parse(xmlText);
  }

  normalizeRecords(value) {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value || typeof value !== 'object') {
      return [];
    }

    for (const [key, child] of Object.entries(value)) {
      if (Array.isArray(child) && child.length > 0) {
        return child.map((item) => {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            return item;
          }

          return { value: item, type: key };
        });
      }
    }

    for (const child of Object.values(value)) {
      if (child && typeof child === 'object') {
        const nested = this.normalizeRecords(child);
        if (nested.length > 0) {
          return nested;
        }
      }
    }

    return [];
  }

  async fetchAdminExport(exportSelect, extraParams = {}) {
    if (!this.sharedSecret) {
      console.warn('CONFTOOL_SHARED_SECRET not set');
      return null;
    }

    // Include a stable hash of extraParams in the cache key so that changing
    // request options (e.g. adding 'abstracts') automatically busts stale cache.
    const paramsKey = Object.keys(extraParams).length
      ? '_' + crypto.createHash('sha1')
          .update(JSON.stringify(extraParams, Object.keys(extraParams).sort()))
          .digest('hex').slice(0, 8)
      : '';
    const cachePath = this.getCachePath(`adminExport_${exportSelect}${paramsKey}`);
    if (this.isCacheValid(cachePath)) {
      console.log(`Using cached data for ${exportSelect}`);
      return this.readCache(cachePath);
    }

    try {
      const fetchModule = await import('node-fetch');
      const fetch = fetchModule.default;
      const params = this.buildAdminExportParams(exportSelect, extraParams);
      const url = `${this.restUrl}?${params.toString()}`;
      const response = await fetch(url, { headers: { Accept: 'application/xml,text/xml' } });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const parsed = this.parseXml(xmlText);

      if (parsed?.rest?.result === false) {
        throw new Error(parsed.rest.message || 'ConfTool returned an error');
      }

      const payload = {
        exportSelect,
        fetchedAt: new Date().toISOString(),
        xml: parsed,
        records: this.normalizeRecords(parsed)
      };

      this.writeCache(cachePath, payload);
      return payload;
    } catch (error) {
      console.error(`Error fetching ${exportSelect}: ${error.message}`);

      const cached = this.readCache(cachePath);
      if (cached) {
        return cached;
      }

      return null;
    }
  }

  async fetchMultiple(requests) {
    // Run all requests concurrently. If one fails (e.g. ConfTool returns no
    // `events` table on this install), the rest still succeed.
    const settled = await Promise.allSettled(
      requests.map(({ exportSelect, extraParams }) =>
        this.fetchAdminExport(exportSelect, extraParams)
      )
    );

    const out = {};
    settled.forEach((result, i) => {
      const key = requests[i].key;
      if (result.status === 'fulfilled') {
        out[key] = result.value;
      } else {
        console.warn(`fetchMultiple: ${requests[i].exportSelect} failed: ${result.reason?.message || result.reason}`);
        out[key] = null;
      }
    });
    return out;
  }
}

module.exports = ConfToolFetcher;