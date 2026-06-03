require('dotenv').config();
const ConfToolFetcher = require('./lib/conftool-fetcher');
const fetcher = new ConfToolFetcher(process.env.CONFTOOL_SHARED_SECRET, process.env.CONFTOOL_REST_URL);

fetcher.fetchAdminExport('papers', {
  'form_export_papers_options[]': ['abstracts', 'session'],
  'form_status': 'p'
}).then(function(data) {
  if (!data) { console.log('No data returned'); return; }
  console.log('Record count:', data.records ? data.records.length : 0);
  var first = data.records && data.records[0];
  if (first) {
    console.log('Keys:', Object.keys(first));
    console.log('Sample record:', JSON.stringify(first, null, 2));
  }
}).catch(function(e) { console.error(e); });
