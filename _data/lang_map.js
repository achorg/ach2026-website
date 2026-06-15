// EN ↔ ES page equivalents for the navbar language switcher. Slugs differ
// between locales (/en/workshops vs /es/talleres), so the i18n plugin can't
// derive these — keep this map in sync when adding or renaming pages.
const en2es = {
  '/en/': '/es/',
  '/en/program/': '/es/programa/',
  '/en/keynote/': '/es/ponentes-magistrales/',
  '/en/workshops/': '/es/talleres/',
  '/en/hubs/': '/es/grupos/',
  '/en/cfp/': '/es/cfp/',
  '/en/people/': '/es/gente/',
  '/en/map/': '/es/mapa/',
  '/en/safety/': '/es/seguridad/',
  '/en/presenter-guide/': '/es/guia-de-presentadores/',
  '/en/work-adventure/': '/es/work-adventure/',
  '/en/policies/code-of-conduct/': '/es/politicas/codigo-de-conducta/',
  '/en/policies/accessibility/': '/es/politicas/accesibilidad/',
  '/en/policies/privacy/': '/es/politicas/privacidad/',
  '/en/reviewer-guidelines/': '/es/politicas/guia-para-revisores/',
};

const es2en = {};
for (const [en, es] of Object.entries(en2es)) {
  es2en[es] = en;
}

module.exports = { en2es, es2en };
