---
title: Regional Hubs
layout: page
---

<p>ACH 2026 explores how we create and collaborate through moments of exigency in the conference theme of <em>Emergence/ia</em>. Regional hubs support smaller, localized events connected to the larger conference, facilitating knowledge exchange, community building, and expanded access across the Digital Humanities community.</p>

<p>For questions, contact ACH at <strong>conference [at] ach [dot] org</strong>. All hubs adhere to the <a href="/en/policies/code-of-conduct/">ACH Code of Conduct</a>.</p>

<div id="hubs-map"></div>

<script>
(function () {
  // Dynamically load Leaflet CSS
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
  link.crossOrigin = '';
  document.head.appendChild(link);

  // Dynamically load Leaflet JS, then initialize map in onload callback
  var script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
  script.crossOrigin = '';
  script.onload = function () {
    var map = L.map('hubs-map', { scrollWheelZoom: false }).setView([37.5, -96], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var goldIcon = L.divIcon({
      className: 'hub-marker',
      html: '<div class="hub-marker-pin"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -14]
    });

    var hubs = [
      {
        id: 'hub-midwest',
        name: 'Midwest – Macalester College',
        location: 'St. Paul, Minnesota',
        lat: 44.9393,
        lng: -93.1028,
        contact: '<a href="mailto:aquigley@macalester.edu">aquigley@macalester.edu</a>'
      },
      {
        id: 'hub-midatlantic',
        name: 'Mid-Atlantic – University of Pennsylvania',
        location: 'Philadelphia, Pennsylvania',
        lat: 39.9522,
        lng: -75.1932,
        contact: '<a href="mailto:heider@upenn.edu">heider@upenn.edu</a>'
      },
      {
        id: 'hub-brown',
        name: 'Northeast–Brown University',
        location: 'Providence, Rhode Island',
        lat: 41.82397594464317,
        lng: -71.40219544298508,
        contact: '<a href="mailto:cds_info@brown.edu">cds_info@brown.edu</a>'
      },
      {
        id: 'hub-texas',
        name: 'Texas – Arte Público Press / USLDH',
        location: 'Houston, Texas',
        lat: 29.7631,
        lng: -95.3698,
        contact: '<a href="https://bit.ly/tx_ach_hub">bit.ly/tx_ach_hub</a>'
      },
      {
        id: 'hub-socal',
        name: 'SoCal – UC Irvine',
        location: 'Irvine, California',
        lat: 33.6405,
        lng: -117.8443,
        contact: '<a href="https://forms.gle/j7uWaqBJjPnyyFs9A">Interest form</a>'
      },
      {
        id: 'hub-florida',
        name: 'Florida / Southeast – University of Florida',
        location: 'Gainesville, Florida',
        lat: 29.6436,
        lng: -82.3549,
        contact: '<a href="mailto:clcarrdi@ufl.edu">clcarrdi@ufl.edu</a>'
      }
    ];

    hubs.forEach(function (hub) {
      var marker = L.marker([hub.lat, hub.lng], { icon: goldIcon }).addTo(map);
      marker.bindPopup(
        '<strong>' + hub.name + '</strong><br>' +
        hub.location + '<br>' +
        hub.contact + '<br>' +
        '<a href="#' + hub.id + '" class="hub-popup-link">Read more &darr;</a>'
      );
    });
  };
  document.head.appendChild(script);
})();
</script>

<hr>

<div id="hub-midwest" class="hub-blurb">
  <h3>Midwest – Macalester College</h3>
  <p class="hub-location"><i class="bi bi-geo-alt-fill"></i> St. Paul, Minnesota</p>
  <p>Having withstood the terrors of Operation Metro Surge, the Twin Cities is uniquely positioned to host this year's conference, which focuses on <em>emergence/ia</em>. Macalester College is located in St. Paul, Minnesota, and began the Spring semester in a state of emergency, with faculty, staff, students, and community neighbors covertly engaging in activism of various kinds, including patrolling, striking, and establishing mutual aid channels. The semester demanded particular and continued attention to care. Digital services proved critical to this work but also limited communication in other ways, posing dilemmas related to privacy and security. As a regional hub, we aim to offer a safe community space for viewing this year's ACH conference. We also will have an opportunity to hear from students who created digital stories for this year's Project Pericles National Civic Story Lab. Three students partnered with local organizations (the Hallie Q. Brown Community Center, Lake Street Council, and Rondo Center of Diverse Expressions) to ethically document the histories of communities impacted by oppressive immigration enforcement.</p>
  <p class="hub-contact">Contact: Dr. Aisling Quigley, DLA Librarian and Program Manager — <a href="mailto:aquigley@macalester.edu">aquigley@macalester.edu</a></p>
</div>

<div id="hub-midatlantic" class="hub-blurb">
  <h3>Mid-Atlantic – University of Pennsylvania</h3>
  <p class="hub-location"><i class="bi bi-geo-alt-fill"></i> Philadelphia, Pennsylvania</p>
  <p>We invite students, faculty, and all other interested digital scholarship practitioners to join us at the University of Pennsylvania's Van Pelt Library for the mid-Atlantic "Philadelphia-region" ACH 2026 regional hub. Hosted in partnership between Penn Libraries' Research Data and Digital Scholarship Department, the Price Lab for Digital Humanities, the Princeton University Center for Digital Humanities, and Temple University's Loretta C. Duckworth Scholars Studio, this hub will be a space to jointly watch and respond to the ACH 2026 conference in a local, collegial setting. We warmly welcome attendees from the numerous colleges and universities in the greater Philadelphia region and especially invite practitioners from non-university settings — museums, galleries, libraries, and other cultural institutions — to join us for robust discussion.</p>
  <p>Please be aware that while the joint watch-party is free and open to all, individual attendees may wish to register for the main ACH 2026 conference separately to take full advantage of all conference events.</p>
  <p class="hub-contact">Register: <a href="https://www.library.upenn.edu/events/ach-2026-regional-hub">library.upenn.edu/events/ach-2026-regional-hub</a> &mdash; Questions: Cynthia Heider — <a href="mailto:heider@upenn.edu">heider@upenn.edu</a></p>
</div>

<div id="hub-brown" class="hub-blurb">
  <h3>Northeast–Brown University</h3>
  <p class="hub-location"><i class="bi bi-geo-alt-fill"></i> Providence, Rhode Island</p>
<p>For digital humanists in New England, Brown University is hosting a regional hub. Organized by the Center for Digital Scholarship, this regional hub will feature three unique events: a pre-conference workshop and project showcase on June 23, and a keynote watch party on June 24. The pre-conference workshop, "Decolonizing Methods in Caribbean and Latin American DH," will be led by Dr. Tarika Sankar, followed by a showcase of Latin American digital humanities projects including the Opening the Archives Dominican Republic project by Dr. René Cordero and Ivanna Torres. The keynote watch party will be followed by a community open discussion. This regional hub focuses on integrating digital methods across the humanities through a critical lens and a commitment to equity, transparency, and community-engaged work. Interested in this regional hub?</p>
<p class="hub-contact">Contact CDS at cds_info at brown dot edu (cds_info@brown.edu) or register at our event page: <a href="https://events.brown.edu/library/event/333221-ach-2026-pre-conference-workshops">(1) Pre-conference Workshops and Project Showcase</a> and <a href="https://events.brown.edu/library/event/333225-ach-2026-keynote-watch-party">(2) Keynote Watch Party.</a>
</p> 
</div>

<div id="hub-texas" class="hub-blurb">
  <h3>Texas – Arte Público Press / US Latino Digital Humanities Center</h3>
  <p class="hub-location"><i class="bi bi-geo-alt-fill"></i> Houston, Texas</p>
  <p>Located in Houston, Texas, this regional hub hosted by the US Latino Digital Humanities Center (USLDH) at Arte Público Press will bring together faculty, students, archivists, and community members for an in-person keynote watch party, tour, and discussion. The event will include a keynote watch party from the main ACH conference, followed by a guided tour of Arte Público Press showcasing USLDH digital projects and demonstrating how the center trains students to work with cultural data using ethical, community-centered methodologies. The program will extend the conference theme of <em>Emergence/ia</em> into a localized space, connecting digital humanities to US Latino archival recovery and community preservation. Situated in one of the largest and most diverse Latino metropolitan areas in the United States, the hub will highlight bilingual data, community archival materials, and partnerships with local educators and cultural organizations.</p>
  <p class="hub-contact">Spots are limited. Register: <a href="https://bit.ly/tx_ach_hub">bit.ly/tx_ach_hub</a></p>
</div>

<div id="hub-socal" class="hub-blurb">
  <h3>SoCal Gathering – UC Irvine</h3>
  <p class="hub-location"><i class="bi bi-geo-alt-fill"></i> Irvine, California</p>
  <p>Join us virtually or on campus at the University of California, Irvine, on Monday, June 29th, for a post-conference discussion of what we are inspired by and have learned from the ACH 2026 sessions, keynote, and creative presentations. This facilitated discussion will be followed by a community-building sharing of what's happening on our respective campuses now and what we imagine for the future, with time for connecting with potential collaborators and exchanging information. Organized by UCI's <a href="https://www.humanities.uci.edu/dhx">Digital Humanities Exchange</a>.</p>
  <p class="hub-contact">Register via the <a href="https://forms.gle/j7uWaqBJjPnyyFs9A">interest form</a>.</p>
</div>

<div id="hub-florida" class="hub-blurb">
  <h3>Florida / Southeast – University of Florida</h3>
  <p class="hub-location"><i class="bi bi-geo-alt-fill"></i> Gainesville, Florida</p>
  <p>Hosted in Gainesville, Florida, the University of Florida's Center for the Humanities and the Public Sphere will convene an in-person regional hub for digital humanists across Florida and the Southeast. Taking place in UF's newly opened Digital Humanities Lab, this hub will feature watch parties for ACH 2026 keynotes and panels, alongside facilitated discussions and informal networking. Programming will highlight emerging work in public and environmental humanities, multilingual scholarship, and community-engaged digital practice, with particular attention to students and early-career scholars. This regional hub offers a welcoming space to link regional DH communities with the broader ACH virtual conference.</p>
  <p class="hub-contact">Contact: Dr. Clarissa Carr, CHPS Digital Scholarship Specialist — <a href="mailto:clcarrdi@ufl.edu">clcarrdi@ufl.edu</a></p>
</div>

