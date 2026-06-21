---
title: Programa
layout: page
templateEngineOverride: njk
description: "Programa completo y cronológico de ACH 2026 — sesiones, ponencias, conferencias magistrales. Horarios mostrados en CDT con opción para ET, PT, BRT, UTC o su zona horaria local."
---

<p class="text-center">
  <a href="https://www.conftool.pro/ach2026/sessions.php" class="btn btn-outline-secondary" target="_blank" rel="noopener noreferrer">Programa con enlaces de Zoom</a>
</p>

<p class="prog-intro">ACH 2026 reúne presentaciones en múltiples sesiones, con participantes de zonas horarias que abarcan las Américas, Europa, el Medio Oriente, el sur y el este de Asia. Explora el programa cronológico completo a continuación — busca por título, autor o tema, o filtra por día, sesión o tema.</p>

<p class="prog-intro">Los horarios se muestran en <strong>Hora Central (CDT)</strong> por defecto — la zona horaria principal de la conferencia. Usa el selector para cambiar a Hora del Este, Pacífico, Brasil, UTC o tu zona horaria local. El programa completo también está disponible en <a href="https://www.conftool.pro/ach2026/sessions.php" target="_blank">ConfTool</a> (se requiere registro para acceder a los enlaces privados de sesiones).</p>

{% if conftool.error %}
<div class="alert alert-warning mt-3" role="alert">
  <strong>No se pueden cargar los datos del programa:</strong> {{ conftool.error }}
</div>
{% endif %}

{% if conftool.normalizedSessionsEs and conftool.normalizedSessionsEs.length > 0 %}

<p class="text-muted">Última actualización: {{ conftool.fetchedAt | dateFilterEs }}</p>

<div class="viz-stats">
  <div class="viz-stat"><span class="viz-num">{{ conftool.totalPapers }}</span><span class="viz-label">Presentaciones</span></div>
  <div class="viz-stat"><span class="viz-num">{{ conftool.totalSessions }}</span><span class="viz-label">Sesiones</span></div>
  <div class="viz-stat"><span class="viz-num">{{ conftool.uniqueDays }}</span><span class="viz-label">Días de conferencia</span></div>
  <div class="viz-stat"><span class="viz-num">{{ conftool.totalTopics }}</span><span class="viz-label">Temas distintos</span></div>
</div>

{% if conftool.allTopics and conftool.allTopics.length > 0 %}

<section class="topics-section">
  <h2>Temas</h2>
  <p class="text-muted">{{ conftool.totalTopics }} temas elegidos por los autores en {{ conftool.totalPapers }} ponencias, con un tamaño según cuántas ponencias eligieron cada uno. El color indica la categoría (idioma, geografía, periodo temporal, área temática, métodos, disciplinas y campos). <strong>Haz clic en cualquier tema para filtrar el programa a continuación.</strong></p>

  <div class="topic-cloud topic-cloud--flat">
    {% for item in conftool.allTopics %}
    <button type="button" class="topic-tag topic-tag--btn{% if loop.index > 30 %} is-overflow{% endif %}" data-topic="{{ item.topic | lower }}" data-label="{{ item.topic }}" data-cat="{{ item.slug }}" style="font-size:{{ item.sizeRem }}rem" title="{{ item.count }} paper{% if item.count != 1 %}s{% endif %}">{{ item.topic }} <span class="topic-count-badge">{{ item.count }}</span></button>
    {% endfor %}
    {% if conftool.allTopics.length > 30 %}
    <button type="button" class="topic-show-more"
            data-less-label="Mostrar menos"
            data-more-label="Mostrar {{ conftool.allTopics.length - 30 }} más">Mostrar {{ conftool.allTopics.length - 30 }} más</button>
    {% endif %}
  </div>
</section>

<div class="topic-filter-status" id="topicFilterBar" data-empty="1">
  <span id="topicFilterStatus" class="text-muted small"></span>
  <button type="button" id="topicFilterClear" class="prog-reset" hidden>Borrar filtros de temas</button>
</div>

{% endif %}

{% include "partials/tz-toggle.html" %}

<div class="prog-filters" role="search" aria-label="Filtrar programa">
  <input id="progSearch" type="search" placeholder="Buscar por título, autor o tema" aria-label="Buscar sesiones">
  <select id="progDay" aria-label="Filtrar por día">
    <option value="">Todos los días</option>
    {% set seenDays = [] %}
    {% for session in conftool.normalizedSessionsEs %}
      {% if session.startISO and session.startISO not in seenDays %}
        {% set seenDays = (seenDays.push(session.startISO), seenDays) %}
        <option value="{{ session.startISO }}">{{ session.dateDisplay }}</option>
      {% endif %}
    {% endfor %}
  </select>
  <select id="progPanel" aria-label="Filtrar por sesión">
    <option value="">Todas las sesiones</option>
    {% for session in conftool.normalizedSessionsEs %}
    <option value="{{ session.title }}">{{ session.zoneTimes.CT.start }} · {{ session.title }}</option>
    {% endfor %}
  </select>
  <button type="button" id="progReset" class="prog-reset">Restablecer</button>
  <span id="progCount" class="prog-count text-muted small" aria-live="polite"></span>
</div>

<p id="progNoResults" class="prog-noresults" hidden>No se encontraron sesiones que coincidan con tus filtros.</p>

<div class="prog-list">
  {% for day in conftool.normalizedSessionsEs | groupbyProp('startISO') %}
  <section class="prog-day"
    data-day-iso="{{ day.grouper }}">
    <h3 class="prog-day-header">{{ day.list[0].dateDisplay }}</h3>

    {% for session in day.list %}
    {%- set sessionTopics = [] -%}
    {%- for p in session.papers -%}
      {%- for t in p.topics -%}
        {%- set sessionTopics = (sessionTopics.push(t | lower), sessionTopics) -%}
      {%- endfor -%}
    {%- endfor -%}
    <article class="prog-session"
      data-day-iso="{{ day.grouper }}"
      data-panel="{{ session.title }}"
      data-start-utc="{{ session.startUTC }}"
      data-end-utc="{{ session.endUTC }}"
      data-topics="{{ sessionTopics | join('|') }}"
      data-search="{{ session.title | lower }}{% for chair in session.chairs %} {{ chair | lower }}{% endfor %}{% for p in session.papers %} {{ p.title | lower }} {{ p.authors | lower }}{% for k in p.keywords %} {{ k | lower }}{% endfor %}{% for t in p.topics %} {{ t | lower }}{% endfor %}{% endfor %}">

      <div class="prog-session-time">
        <time class="session-time"
          datetime="{{ session.startUTC }}"
          data-end="{{ session.endUTC }}"
          data-zone-CT="{{ session.zoneTimes.CT.range }}"
          data-zone-ET="{{ session.zoneTimes.ET.range }}"
          data-zone-PT="{{ session.zoneTimes.PT.range }}"
          data-zone-BRT="{{ session.zoneTimes.BRT.range }}"
          data-zone-UTC="{{ session.zoneTimes.UTC.range }}">
          <span class="session-time-primary">{{ session.zoneTimes.CT.range }}</span>
          <span class="session-time-zone-label">CDT</span>
        </time>
        <span class="prog-live-badge" hidden>&#9679; EN VIVO</span>
      </div>

      <div class="prog-session-body">
        <h4 class="prog-session-title">
          {% if session.sessionUrl %}
          <a href="{{ session.sessionUrl }}" target="_blank">{{ session.title }}</a>
          {% else %}
          {{ session.title }}
          {% endif %}
          {% if session.isLightning %}<span class="prog-session-badge">Charlas relámpago</span>{% endif %}
        </h4>

        <div class="prog-session-meta">
          {% if session.location %}
          <span class="prog-meta-item"><strong>Ubicación virtual:</strong>
            {% if session.locationUrl %}<a href="{{ session.locationUrl }}" target="_blank">{{ session.location }}</a>
            {% else %}{{ session.location }}{% endif %}
          </span>
          {% endif %}
          {% for chair in session.chairs %}
          <span class="prog-meta-item"><strong>Coordinador/a:</strong> {{ chair }}</span>
          {% endfor %}
        </div>

        {% if session.sessionInfo %}
        <div class="prog-session-info">{{ session.sessionInfo }}</div>
        {% endif %}

        {% if session.papers and session.papers.length > 0 %}
        <details class="prog-papers" open>
          <summary>{{ session.papers.length }} ponencia{% if session.papers.length != 1 %}s{% endif %}</summary>
          <ul class="prog-paper-list">
            {% for paper in session.papers %}
            <li class="prog-paper">
              <div class="prog-paper-title">{{ paper.title }}</div>
              {% if paper.authors %}<div class="prog-paper-authors">{{ paper.authors }}</div>{% endif %}
              {% if paper.abstractPlain %}
              <details class="prog-abstract-details">
                <summary class="prog-abstract-toggle">Resumen</summary>
                <div class="prog-abstract-body">{{ paper.abstractPlain | safe }}</div>
              </details>
              {% endif %}
              {% if paper.topicGroups and paper.topicGroups.length > 0 %}
              <div class="prog-paper-topics-grouped">
                {% for grp in paper.topicGroups %}
                <span class="paper-topic-group" data-cat="{{ grp.slug }}">
                  {% for item in grp.items %}<span class="prog-kw{% if item.idx > 5 %} is-overflow{% endif %}">{{ item.value }}</span>{% endfor %}
                </span>
                {% endfor %}
                {% if paper.topicCount > 5 %}
                <button type="button" class="topic-show-more paper-show-more"
                        data-less-label="Mostrar menos"
                        data-more-label="+ {{ paper.topicCount - 5 }} más">+ {{ paper.topicCount - 5 }} más</button>
                {% endif %}
              </div>
              {% endif %}
            </li>
            {% endfor %}
          </ul>
        </details>
        {% elif session.speakers and session.speakers.length > 0 %}
        <div class="prog-paper-authors"><strong>Ponente(s):</strong> {{ session.speakers | join(', ') }}</div>
        {% endif %}
      </div>
    </article>
    {% endfor %}
  </section>
  {% endfor %}
</div>

{% else %}
<div class="alert alert-info mt-4" role="alert">
  <p>Los datos del cronograma se están cargando desde ConfTool. Por favor, vuelve a consultar pronto.</p>
</div>
{% endif %}

<style>
  [data-cat="lang"]    .topic-tag, [data-cat="lang"]    .prog-kw,
  .topic-tag[data-cat="lang"]    { background:#e3f2fd; color:#1565c0; }
  [data-cat="geo"]     .topic-tag, [data-cat="geo"]     .prog-kw,
  .topic-tag[data-cat="geo"]     { background:#e8f5e9; color:#2e7d32; }
  [data-cat="time"]    .topic-tag, [data-cat="time"]    .prog-kw,
  .topic-tag[data-cat="time"]    { background:#fff3e0; color:#a85300; }
  [data-cat="topical"] .topic-tag, [data-cat="topical"] .prog-kw,
  .topic-tag[data-cat="topical"] { background:#f3e5f5; color:#6a1b9a; }
  [data-cat="method"]  .topic-tag, [data-cat="method"]  .prog-kw,
  .topic-tag[data-cat="method"]  { background:#fbe9e7; color:#c0392b; }
  [data-cat="field"]   .topic-tag, [data-cat="field"]   .prog-kw,
  .topic-tag[data-cat="field"]   { background:#e0f2f1; color:#00695c; }
  [data-cat="other"]   .topic-tag, [data-cat="other"]   .prog-kw,
  .topic-tag[data-cat="other"]   { background:#eceff1; color:#455a64; }

  .topic-tag--btn.is-active,
  .topic-tag--btn.is-active[data-cat] {
    background: #4C25E1 !important;
    color: #fff !important;
    border-color: #4C25E1 !important;
  }
  .topic-tag--btn.is-active .topic-count-badge {
    background: rgba(255,255,255,0.25);
    color: #fff;
  }

  .topics-section { margin: 1.5rem 0 1rem; }
  .topics-section h2 { margin: 0 0 0.25rem; font-size: 1.2rem; }
  .topics-section > p.text-muted { margin-top: 0.15rem; font-size: 0.9rem; }

  .topic-facets { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.6rem; }
  .topic-facet {
    border: 1px solid #d8d4ec;
    border-radius: 4px;
    background: #fff;
  }
  .topic-facet > summary {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    list-style: revert;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .topic-facet-name { font-weight: 600; color: #2a2440; }
  .topic-facet-meta { font-size: 0.78rem; color: #777; }
  .topic-facet-chips {
    padding: 0.25rem 0.75rem 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.4rem;
    align-items: baseline;
  }
  .topic-facet-chips .is-overflow,
  .topic-cloud--flat .is-overflow { display: none; }
  .topic-facet-chips.show-all .is-overflow,
  .topic-cloud--flat.show-all .is-overflow { display: inline-block; }

  .topic-cloud--flat { padding: 0.3rem 0; }
  .topic-show-more {
    background: #fff;
    border: 1px dashed #c8c8d4;
    border-radius: 12px;
    padding: 0.12rem 0.6rem;
    font-size: 0.78rem;
    font-family: inherit;
    color: #4C25E1;
    cursor: pointer;
    margin-left: 0.2rem;
  }
  .topic-show-more:hover { border-color: #4C25E1; background: #f6f4ff; }

  .topic-tag {
    padding: 0.12rem 0.5rem;
    background: #ece8ff;
    color: #4C25E1;
    border-radius: 12px;
    white-space: nowrap;
    transition: background 0.15s, border-color 0.15s;
    font-size: 0.8rem;
    border: 1px solid transparent;
  }
  .topic-tag--btn { cursor: pointer; font-family: inherit; }
  .topic-tag--btn:hover { border-color: rgba(0,0,0,0.25); }
  .topic-count-badge {
    display: inline-block;
    margin-left: 0.25rem;
    padding: 0 0.3rem;
    background: rgba(0,0,0,0.08);
    border-radius: 8px;
    font-size: 0.72em;
    font-weight: 500;
  }

  .topic-filter-status {
    margin: 0.6rem 0 1rem;
    padding: 0.5rem 0.75rem;
    display: flex;
    gap: 0.8rem;
    align-items: center;
    background: #f6f4ff;
    border: 1px solid #e6e2f5;
    border-radius: 4px;
    min-height: 2rem;
  }
  .topic-filter-status:empty,
  .topic-filter-status[data-empty="1"] { display: none; }

  .prog-paper-topics-grouped {
    margin-top: 0.2rem;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.15rem 0.3rem;
  }
  .paper-topic-group { display: contents; }
  .prog-paper-topics-grouped .is-overflow { display: none; }
  .prog-paper.show-all .prog-paper-topics-grouped .is-overflow { display: inline-block; }
  .paper-show-more {
    align-self: flex-start;
    margin-top: 0.1rem;
    padding: 0 0.45rem;
    font-size: 0.66rem;
  }

  .prog-count { margin-left: 0.25rem; }

  .prog-filters {
    display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;
    margin: 1rem 0 1.5rem;
  }
  .prog-filters input[type="search"] { flex: 1 1 240px; padding: 0.4rem 0.6rem; font-size: 0.9rem; border: 1px solid #c8c8d4; border-radius: 4px; }
  .prog-filters select { padding: 0.4rem 0.6rem; font-size: 0.9rem; border: 1px solid #c8c8d4; border-radius: 4px; background: #fff; }
  .prog-reset { background: #fff; border: 1px solid #c8c8d4; border-radius: 4px; padding: 0.4rem 0.8rem; font-size: 0.85rem; cursor: pointer; }
  .prog-reset:hover { border-color: #4C25E1; color: #4C25E1; }

  .prog-intro { margin: 0 0 0.6rem; }
  .prog-list { margin-top: 0.6rem; }
  .prog-list * { line-height: 1.35; }
  .prog-list p { margin: 0; }
  .prog-day { margin: 0 0 1.2rem; }
  .prog-day-header {
    margin: 1rem 0 0.4rem;
    padding-bottom: 0.3rem;
    border-bottom: 2px solid #4C25E1;
    font-size: 1.15rem;
    font-weight: 600;
  }
  .prog-session {
    display: grid;
    grid-template-columns: 7.5rem 1fr;
    gap: 0.8rem;
    padding: 0.6rem 0.8rem;
    margin-bottom: 0.3rem;
    background: #fafafd;
    border-left: 3px solid #c8c8d4;
    border-radius: 3px;
    align-items: start;
  }
  .prog-session.is-live { border-left-color: #d62b2b; background: #fff4f4; }
  .prog-session[hidden] { display: none; }
  .prog-session.topic-filtered { display: none; }
  @media (max-width: 640px) {
    .prog-session { grid-template-columns: 1fr; gap: 0.3rem; padding: 0.6rem; }
    /* keep the page from busting out of the viewport: the session select has a
       ~985px intrinsic width from long option labels, and topic chips don't wrap */
    .prog-filters select { max-width: 100%; }
    .topic-tag--btn { white-space: normal; max-width: 100%; }
    /* larger touch targets and a 16px search input (under 16px iOS zooms on focus) */
    .prog-filters input[type="search"] { font-size: 1rem; }
    .topic-show-more { padding: 0.35rem 0.8rem; font-size: 0.85rem; }
    .paper-show-more { padding: 0.25rem 0.6rem; font-size: 0.78rem; }
    .prog-papers summary { font-size: 0.9rem; padding: 0.3rem 0; }
  }
  .prog-session-time { font-variant-numeric: tabular-nums; line-height: 1.2; }
  .prog-session-time .session-time-primary {
    display: block; font-weight: 600; font-size: 0.95rem; color: #222;
  }
  .prog-session-time .session-time-zone-label { font-size: 0.7rem; color: #555; }
  .prog-live-badge {
    display: inline-block; margin-top: 0.25rem; padding: 0.05rem 0.35rem;
    font-size: 0.65rem; font-weight: 700; background: #d62b2b; color: #fff; border-radius: 3px;
  }
  .prog-session-body > * + * { margin-top: 0.25rem; }
  .prog-session-title { margin: 0; font-size: 1rem; font-weight: 600; }
  .prog-session-title a { color: inherit; text-decoration: none; border-bottom: 1px dotted #4C25E1; }
  .prog-session-badge { display: inline-block; margin-left: 0.5rem; padding: 0.08rem 0.45rem; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #fff; background: #4C25E1; border-radius: 3px; vertical-align: middle; white-space: nowrap; }
  .prog-session-meta { font-size: 0.82rem; color: #555; }
  .prog-meta-item { display: inline-block; margin-right: 0.8rem; }
  .prog-papers { margin-top: 0.25rem; }
  .prog-papers summary { cursor: pointer; font-size: 0.78rem; color: #4C25E1; margin-bottom: 0.25rem; list-style: revert; }
  .prog-paper-list { list-style: none; padding-left: 0; margin: 0; }
  .prog-paper { padding: 0.35rem 0; border-top: 1px solid #e6e6ee; }
  .prog-paper:first-child { border-top: none; padding-top: 0.15rem; }
  .prog-paper-title { font-weight: 500; font-size: 0.9rem; line-height: 1.3; }
  .prog-paper-authors { font-size: 0.8rem; color: #555; margin-top: 0.1rem; }
  .prog-kw {
    display: inline-block; padding: 0.05rem 0.4rem; margin: 0;
    font-size: 0.7rem; background: #ece8ff; color: #4C25E1; border-radius: 10px; line-height: 1.4;
  }
  .prog-noresults { padding: 1rem; text-align: center; color: #777; background: #f6f6f9; border-radius: 4px; }

  .prog-abstract-details { margin-top: 0.3rem; }
  .prog-abstract-toggle {
    display: inline-block;
    padding: 0.1rem 0.55rem;
    font-size: 0.72rem;
    font-weight: 500;
    color: #4C25E1;
    background: #f6f4ff;
    border: 1px solid #cec8f5;
    border-radius: 3px;
    cursor: pointer;
    line-height: 1.5;
    list-style: none;
    transition: background 0.15s, border-color 0.15s;
  }
  .prog-abstract-toggle::-webkit-details-marker { display: none; }
  .prog-abstract-toggle::after { content: " ▾"; font-size: 0.65em; }
  details[open] > .prog-abstract-toggle::after { content: " ▴"; }
  .prog-abstract-toggle:hover { background: #ece8ff; border-color: #4C25E1; }

  .prog-abstract-body {
    margin-top: 0.15rem;
    padding: 0.5rem 0.7rem;
    font-size: 0.82rem;
    line-height: 1.55;
    color: #333;
    background: #fafafa;
    border-left: 3px solid #cec8f5;
    border-radius: 0 3px 3px 0;
  }
</style>

<script>
(function () {
  const search = document.getElementById('progSearch');
  const dayF   = document.getElementById('progDay');
  const panelF = document.getElementById('progPanel');
  const reset  = document.getElementById('progReset');
  const none   = document.getElementById('progNoResults');
  const count  = document.getElementById('progCount');
  if (!search) return;

  const sessions = Array.from(document.querySelectorAll('.prog-session'));
  const days     = Array.from(document.querySelectorAll('.prog-day'));
  const total    = sessions.length;

  function applyFilters() {
    const q  = search.value.trim().toLowerCase();
    const df = dayF.value;
    const pf = panelF.value;

    sessions.forEach(s => {
      const matchDay   = !df || s.dataset.dayIso === df;
      const matchPanel = !pf || s.dataset.panel === pf;
      const matchQ     = !q || s.dataset.search.includes(q);
      s.hidden = !(matchDay && matchPanel && matchQ);
    });

    days.forEach(d => {
      const visible = Array.from(d.querySelectorAll('.prog-session'))
        .some(s => !s.hidden && !s.classList.contains('topic-filtered'));
      d.hidden = !visible;
    });

    const visibleCount = sessions.filter(s => !s.hidden && !s.classList.contains('topic-filtered')).length;
    none.hidden = visibleCount > 0;
    if (count) {
      count.textContent = visibleCount === total ? '' : `Mostrando ${visibleCount} de ${total} sesiones`;
    }
  }
  window.progApplyFilters = applyFilters;

  function updateLive() {
    const now = Date.now();
    sessions.forEach(s => {
      const start = Date.parse(s.dataset.startUtc);
      const end   = Date.parse(s.dataset.endUtc);
      const live  = !isNaN(start) && !isNaN(end) && now >= start && now < end;
      s.classList.toggle('is-live', live);
      const badge = s.querySelector('.prog-live-badge');
      if (badge) badge.hidden = !live;
    });
  }

  search.addEventListener('input', applyFilters);
  dayF.addEventListener('change', applyFilters);
  panelF.addEventListener('change', applyFilters);
  reset.addEventListener('click', () => {
    search.value = ''; dayF.value = ''; panelF.value = '';
    applyFilters();
  });

  applyFilters();
  updateLive();
  setInterval(updateLive, 60 * 1000);
})();

(function () {
  const status = document.getElementById('topicFilterStatus');
  const clear  = document.getElementById('topicFilterClear');
  const bar    = document.getElementById('topicFilterBar');
  if (!status || !clear || !bar) return;

  const active = new Map();
  const sessions = document.querySelectorAll('.prog-session');

  function syncPillState() {
    document.querySelectorAll('.topic-tag--btn').forEach(btn => {
      btn.classList.toggle('is-active', active.has(btn.dataset.topic));
    });
  }

  function applyTopicFilter() {
    const filterActive = active.size > 0;
    sessions.forEach(s => {
      if (!filterActive) {
        s.classList.remove('topic-filtered');
        return;
      }
      const sessionTopics = (s.dataset.topics || '').split('|').filter(Boolean);
      const hasMatch = sessionTopics.some(st => active.has(st));
      s.classList.toggle('topic-filtered', !hasMatch);
    });

    syncPillState();
    if (filterActive) {
      const labels = Array.from(active.values());
      status.textContent = `Filtrando por ${active.size} tema${active.size === 1 ? '' : 's'}: ${labels.join(', ')}`;
      bar.dataset.empty = '0';
    } else {
      status.textContent = '';
      bar.dataset.empty = '1';
    }
    clear.hidden = !filterActive;

    if (window.progApplyFilters) window.progApplyFilters();
  }
  bar.dataset.empty = '1';

  document.addEventListener('click', (e) => {
    const showMore = e.target.closest('.topic-show-more');
    if (showMore) {
      e.preventDefault();
      const container = showMore.closest('.prog-paper') || showMore.closest('.topic-facet-chips') || showMore.closest('.topic-cloud');
      if (!container) return;
      const expanded = container.classList.toggle('show-all');
      showMore.textContent = expanded ? showMore.dataset.lessLabel : showMore.dataset.moreLabel;
      return;
    }
    const btn = e.target.closest('.topic-tag--btn');
    if (btn && btn.dataset.topic) {
      e.preventDefault();
      const t = btn.dataset.topic;
      if (active.has(t)) active.delete(t);
      else active.set(t, btn.dataset.label || t);
      applyTopicFilter();
    }
  });

  clear.addEventListener('click', () => {
    active.clear();
    applyTopicFilter();
  });
})();
</script>
