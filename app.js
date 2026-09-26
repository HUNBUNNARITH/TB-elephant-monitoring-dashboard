"use strict";

/* ============================================================
   SECTION 1: YOUR 41 CAMERA STATIONS
   Fixed list of station IDs + coordinates. This rarely changes,
   so it's safe to keep it directly in the code.
   ============================================================ */
var STATIONS = [{"id":"CT21","lat":12.907101,"lon":107.489706},{"id":"CT63","lat":12.875089,"lon":107.484641},{"id":"CT31","lat":12.865666,"lon":107.485992},{"id":"CT30","lat":12.847325,"lon":107.485092},{"id":"CT33","lat":12.842241,"lon":107.496648},{"id":"CT65","lat":12.847064,"lon":107.500161},{"id":"CT42","lat":12.826207,"lon":107.527453},{"id":"CT37","lat":12.838379,"lon":107.518099},{"id":"CT36","lat":12.83818,"lon":107.512496},{"id":"CT39","lat":12.832541,"lon":107.513048},{"id":"CT43","lat":12.815175,"lon":107.53659},{"id":"CT45","lat":12.804699,"lon":107.542748},{"id":"CT46","lat":12.801079,"lon":107.549982},{"id":"CT47","lat":12.796216,"lon":107.547855},{"id":"CT59","lat":12.774345,"lon":107.537165},{"id":"CT9","lat":13.00614,"lon":107.465928},{"id":"CT10","lat":12.994088,"lon":107.461701},{"id":"CT13","lat":12.983994,"lon":107.44398},{"id":"CT12","lat":12.972445,"lon":107.457326},{"id":"CT49","lat":12.923743,"lon":107.468312},{"id":"CT62","lat":12.902148,"lon":107.484385},{"id":"CT22","lat":12.893838,"lon":107.486586},{"id":"CT28","lat":12.855542,"lon":107.470912},{"id":"CT29","lat":12.854012,"lon":107.475393},{"id":"CT32","lat":12.857947,"lon":107.504776},{"id":"CT26 K583","lat":12.863193,"lon":107.469176},{"id":"CT8","lat":13.014833,"lon":107.448512},{"id":"CT6","lat":13.04025,"lon":107.433968},{"id":"CT7","lat":13.039719,"lon":107.447046},{"id":"CT19","lat":12.905633,"lon":107.467876},{"id":"CT20","lat":12.907258,"lon":107.479213},{"id":"CT61","lat":12.901823,"lon":107.484429},{"id":"CT23","lat":12.881407,"lon":107.48661},{"id":"CT25","lat":12.883469,"lon":107.491634},{"id":"CT64","lat":12.874646,"lon":107.484711},{"id":"CT35","lat":12.834253,"lon":107.509163},{"id":"CT038","lat":12.789319,"lon":107.528992},{"id":"CT44","lat":12.79783,"lon":107.51918},{"id":"CT40","lat":12.820423,"lon":107.506239},{"id":"CT48","lat":12.775802,"lon":107.548565},{"id":"CT11","lat":12.9925,"lon":107.489511}];

/* ============================================================
   SECTION 1b: STUDY AREA BOUNDARY (10km layer)
   Outer ring of Study_Area_10km.geojson, converted to plain
   [lon,lat] pairs (that file is already WGS84 / CRS84, so no
   reprojection was needed — just simplified to 5 decimals).
   ============================================================ */
var BOUNDARY = [[107.40353,13.06588],[107.4063,13.07328],[107.4065,13.07381],[107.40818,13.07822],[107.41091,13.08432],[107.41249,13.08913],[107.41311,13.09045],[107.41316,13.09058],[107.41404,13.09247],[107.42647,13.12129],[107.4268,13.12205],[107.44361,13.16004],[107.44539,13.16489],[107.44783,13.17086],[107.46604,13.21123],[107.4817,13.23498],[107.50409,13.25283],[107.53102,13.26303],[107.55985,13.26457],[107.58775,13.25731],[107.61199,13.24195],[107.6302,13.22001],[107.64059,13.19363],[107.64216,13.16539],[107.63474,13.13806],[107.61783,13.10065],[107.61616,13.0961],[107.61398,13.09072],[107.59614,13.05047],[107.58543,13.02567],[107.58606,13.02164],[107.58606,13.02161],[107.58772,13.01296],[107.58955,13.0102],[107.58972,13.00978],[107.5961,12.98442],[107.59612,12.98423],[107.59552,12.96203],[107.59547,12.96172],[107.58997,12.9426],[107.59019,12.94215],[107.59425,12.91468],[107.59327,12.90888],[107.59437,12.90696],[107.61369,12.88749],[107.62234,12.87989],[107.62659,12.87286],[107.62676,12.87271],[107.62884,12.86915],[107.63662,12.85627],[107.6368,12.85551],[107.6403,12.84952],[107.64361,12.83527],[107.64422,12.83417],[107.64434,12.83384],[107.64491,12.8323],[107.64752,12.8239],[107.65051,12.81735],[107.65158,12.81366],[107.65477,12.79633],[107.65493,12.79443],[107.65267,12.76585],[107.65233,12.76506],[107.65216,12.75602],[107.64055,12.72659],[107.6391,12.72424],[107.6205,12.70265],[107.59602,12.68775],[107.56804,12.68101],[107.53932,12.68308],[107.51265,12.69376],[107.49064,12.71201],[107.47546,12.73604],[107.46858,12.7635],[107.46892,12.76816],[107.46808,12.77149],[107.45784,12.77946],[107.4519,12.78878],[107.44888,12.79097],[107.44791,12.79188],[107.42919,12.81661],[107.42766,12.82151],[107.42478,12.82492],[107.42333,12.82725],[107.42344,12.82731],[107.41732,12.83565],[107.41322,12.84741],[107.41319,12.84744],[107.40132,12.8777],[107.40067,12.88105],[107.39941,12.9057],[107.40024,12.90929],[107.39748,12.91399],[107.39704,12.91526],[107.39576,12.92627],[107.39328,12.93312],[107.39349,12.94571],[107.39263,12.95316],[107.39269,12.95377],[107.3937,12.95745],[107.39383,12.96537],[107.394,12.96618],[107.39416,12.96659],[107.39409,12.96819],[107.39414,12.96849],[107.39456,12.96986],[107.39478,12.97127],[107.39482,12.97194],[107.39485,12.97216],[107.39503,12.97291],[107.39514,12.97365],[107.39496,12.97545],[107.39505,12.97664],[107.39948,12.99527],[107.39874,13.00088],[107.39873,13.00166],[107.39878,13.0048],[107.39878,13.0048],[107.39879,13.00585],[107.39881,13.00599],[107.39881,13.00651],[107.39886,13.00742],[107.39894,13.00741],[107.39941,13.01242],[107.39792,13.01665],[107.3979,13.01682],[107.39822,13.02643],[107.39779,13.0264],[107.39771,13.02772],[107.39767,13.03811],[107.3977,13.03863],[107.398,13.04251],[107.39802,13.04267],[107.39893,13.04764],[107.39897,13.04879],[107.39923,13.04998],[107.3995,13.05074],[107.40069,13.05716],[107.4007,13.05721],[107.40319,13.06496],[107.40344,13.06563],[107.4035,13.06573],[107.40353,13.06588]];

/* ============================================================
   SECTION 2: STATE
   The data the page is currently showing. `records` comes from
   data.csv. `IMAGES` comes from images.csv (optional — see
   Section 6 for the folder auto-discovery alternative).
   ============================================================ */
var records = [];
var IMAGES = {};          // station id -> [{file, date, caption}]
var BUFFER_GEOJSON = null; // the real 500m buffer polygon, loaded from buffer_500m.geojson
var selectedStation = "";
var sortKeyS = "id", sortDirS = 1;
var sortKeyR = "date", sortDirR = -1;

/* ============================================================
   SECTION 3: SMALL HELPERS
   ============================================================ */
function esc(s){
  // Escapes text before dropping it into HTML, so a station name
  // or caption can never accidentally break the page's markup.
  return String(s).replace(/[&<>"']/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}

function fixDate(d) {
  if (!d) return "";
  // If the date uses slashes (MM/DD/YYYY), convert it to YYYY-MM-DD
  if (d.includes("/")) {
    var p = d.split("/"); 
    return p[2] + "-" + p[0].padStart(2, "0") + "-" + p[1].padStart(2, "0");
  }
  return d; // Otherwise, leave it alone
}

function parseCSV(text){
  // A simple CSV reader: first line = column names, every line
  // after = one row. Good enough for plain data with no commas
  // inside a field (that's why the sample data uses semicolons
  // inside the age_sex column instead of commas).
  var lines = text.split(/\r?\n/).filter(function(l){ return l.trim().length; });
  if (lines.length < 2) return [];
  var headers = lines[0].split(",").map(function(h){ return h.trim().toLowerCase(); });
  var out = [];
  for (var i = 1; i < lines.length; i++){
    var cells = lines[i].split(",").map(function(c){ return c.trim().replace(/^"|"$/g, ""); });
    var obj = {};
    headers.forEach(function(h, idx){ obj[h] = cells[idx]; });
    if (!obj.station || !obj.date) continue;
    out.push({
      station: obj.station,
      date: fixDate(obj.date),
      species: obj.species || "Asian elephant",
      groupSize: parseInt(obj.group_size, 10) || 1,
      ageSex: obj.age_sex || "",
      independent: obj.independent || "yes"
    });
  }
  return out;
}

function parseImagesCSV(text){
  var lines = text.split(/\r?\n/).filter(function(l){ return l.trim().length; });
  if (lines.length < 2) return {};
  var headers = lines[0].split(",").map(function(h){ return h.trim().toLowerCase(); });
  var map = {};
  for (var i = 1; i < lines.length; i++){
    var cells = lines[i].split(",").map(function(c){ return c.trim().replace(/^"|"$/g, ""); });
    var obj = {};
    headers.forEach(function(h, idx){ obj[h] = cells[idx]; });
    if (!obj.station || !obj.filename) continue;
    if (!map[obj.station]) map[obj.station] = [];
    map[obj.station].push({ file: obj.filename, date: fixDate(obj.date), caption: obj.caption || "" });
  }
  return map;
}

/* ============================================================
   SECTION 4: TURN RAW RECORDS INTO PER-STATION SUMMARIES
   ============================================================ */
function stationAgg(){
  var map = {};
  STATIONS.forEach(function(s){
    map[s.id] = { id: s.id, lat: s.lat, lon: s.lon, events: 0, individuals: 0, last: null };
  });
  records.forEach(function(r){
    var m = map[r.station];
    if (!m) return; // record's station id doesn't match any known station — skip it
    if (r.independent !== "no") m.events++;      // "no" = repeat trigger, not a new sighting
    m.individuals += Number(r.groupSize) || 0;
    if (!m.last || r.date > m.last) m.last = r.date;
  });
  return Object.keys(map).map(function(k){ return map[k]; });
}

/* ============================================================
   SECTION 5: RENDER FUNCTIONS
   Each one reads the current state and rewrites one part of the page.
   ============================================================ */
function renderStats(){
  var agg = stationAgg();
  document.getElementById("statActive").textContent = agg.filter(function(a){ return a.events > 0; }).length;
  document.getElementById("statEvents").textContent = agg.reduce(function(s, a){ return s + a.events; }, 0);
  document.getElementById("statIndiv").textContent = agg.reduce(function(s, a){ return s + a.individuals; }, 0);
}

/* ============================================================
   SECTION 4b: MAP (Leaflet)
   Real basemap (street/satellite, switchable) with three
   overlay layers — study boundary, 500m buffers, stations —
   each toggled from Leaflet's built-in layer control, plus a
   legend explaining every symbol. Leaflet's own zoom/pan
   handles the "interactive" part, so no custom code is needed
   for that.
   ============================================================ */
var leafletMap = null;

function renderMap(){
  var agg = stationAgg();
  var maxEvents = Math.max(1, Math.max.apply(null, agg.map(function(a){ return a.events; })));

  if (leafletMap){ leafletMap.remove(); leafletMap = null; } // safe to call renderMap() more than once

  leafletMap = L.map("mapWrap", { zoomControl: true });

  var streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
  });
  streets.addTo(leafletMap);

  // Layer 1: 10km study area boundary (BOUNDARY is already [lon,lat], as GeoJSON expects)
  var boundaryLayer = L.geoJSON(
    { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [BOUNDARY] } },
    { style: { color: "#eae3d2", weight: 1.5, dashArray: "5 4", fillColor: "#c98a3e", fillOpacity: 0.05 } }
  );

  // Layer 2: 500m buffer — your actual Buffer_500m.geojson polygon (converted from its
  // original UTM projection to lon/lat so it lines up correctly on the basemap), loaded
  // from buffer_500m.geojson at startup. It's its own independent shape, not something
  // computed from the station points.
  var bufferLayer = BUFFER_GEOJSON
    ? L.geoJSON(BUFFER_GEOJSON, { style: { color: "#c98a3e", weight: 1.2, opacity: 0.6, fillColor: "#c98a3e", fillOpacity: 0.08 } })
    : L.layerGroup();

  // Layer 3: camera trap stations (clickable — opens the existing detail/photo panel)
  var stationLayer = L.layerGroup();
  agg.forEach(function(a){
    var active = a.events > 0;
    var col = active ? "#c98a3e" : "#5a655c";
    var r = active ? (5 + (a.events / maxEvents) * 9) : 4;
    var hasPhotos = IMAGES[a.id] && IMAGES[a.id].length;
    if (hasPhotos){
      L.circleMarker([a.lat, a.lon], { radius: r + 5, color: "#eae3d2", weight: 1.3, dashArray: "2 2", fill: false, interactive: false }).addTo(stationLayer);
    }
    var marker = L.circleMarker([a.lat, a.lon], { radius: r, color: col, weight: 1.5, fillColor: col, fillOpacity: 0.9 }).addTo(stationLayer);
    marker.bindTooltip(a.id + " — " + a.events + " event(s)" + (hasPhotos ? " · photos available" : ""));
    marker.on("click", function(){ openStationModal(a.id); });
  });

  boundaryLayer.addTo(leafletMap);
  bufferLayer.addTo(leafletMap);
  stationLayer.addTo(leafletMap);

  L.control.layers(
    { "Street map": streets, "Satellite": satellite },
    { "Study area (10km)": boundaryLayer, "500m buffers": bufferLayer, "Stations": stationLayer },
    { collapsed: false }
  ).addTo(leafletMap);

  var legend = L.control({ position: "bottomleft" });
  legend.onAdd = function(){
    var div = L.DomUtil.create("div", "map-legend");
    div.innerHTML =
      '<div class="row"><i class="sw dot" style="background:#5a655c"></i>No detections yet</div>' +
      '<div class="row"><i class="sw dot" style="background:#c98a3e"></i>Elephant activity (size = events)</div>' +
      '<div class="row"><i class="sw ring"></i>Photos available</div>' +
      '<div class="row"><i class="sw line"></i>Study area (10km)</div>' +
      '<div class="row"><i class="sw circle"></i>500m buffer</div>';
    L.DomEvent.disableClickPropagation(div);
    return div;
  };
  legend.addTo(leafletMap);

  var bounds = boundaryLayer.getBounds();
  agg.forEach(function(a){ bounds.extend([a.lat, a.lon]); });
  if (BUFFER_GEOJSON) bounds.extend(bufferLayer.getBounds());
  leafletMap.fitBounds(bounds, { padding: [16, 16] });
}


function renderChart(){
  var data = records.filter(function(r){ return r.independent !== "no" && (!selectedStation || r.station === selectedStation); });
  var wrap = document.getElementById("chartWrap");
  document.getElementById("chartFilterLabel").textContent = selectedStation || "all stations";
  if (!data.length){
    wrap.innerHTML = '<div class="empty">No elephant events logged yet' + (selectedStation ? ' for ' + esc(selectedStation) : '') + '.</div>';
    return;
  }
  var byMonth = {};
  data.forEach(function(r){ var m = r.date.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + 1; });
  var months = Object.keys(byMonth).sort();
  var max = Math.max.apply(null, months.map(function(m){ return byMonth[m]; }));
  var W = 460, H = 240, pad = 32, bw = (W - 2 * pad) / months.length;
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;max-height:260px;">';
  for (var i = 0; i <= 4; i++){
    var gy = H - pad - i * (H - 2 * pad) / 4;
    svg += '<line x1="' + pad + '" y1="' + gy + '" x2="' + (W - pad) + '" y2="' + gy + '" stroke="#374238" stroke-width="0.5"/>';
    svg += '<text x="' + (pad - 6) + '" y="' + (gy + 3) + '" font-size="9" text-anchor="end">' + Math.round(max * i / 4) + '</text>';
  }
  months.forEach(function(m, idx){
    var h = (byMonth[m] / max) * (H - 2 * pad);
    var bx = pad + idx * bw + bw * 0.15;
    svg += '<rect x="' + bx.toFixed(1) + '" y="' + (H - pad - h).toFixed(1) + '" width="' + (bw * 0.7).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="#c98a3e" rx="2"><title>' + m + ': ' + byMonth[m] + '</title></rect>';
    svg += '<text x="' + (bx + bw * 0.35).toFixed(1) + '" y="' + (H - pad + 14) + '" font-size="9" text-anchor="middle">' + m.slice(2) + '</text>';
  });
  svg += '</svg>';
  wrap.innerHTML = svg;
}

function renderStationTable(){
  var agg = stationAgg().sort(function(a, b){
    var av = a[sortKeyS], bv = b[sortKeyS];
    if (av == null) av = ""; if (bv == null) bv = "";
    if (typeof av === "string"){ av = av.toLowerCase(); bv = String(bv).toLowerCase(); }
    if (av < bv) return -1 * sortDirS; if (av > bv) return 1 * sortDirS; return 0;
  });
  document.getElementById("stationCount").textContent = "(" + agg.length + ")";
  document.querySelector("#stationTable tbody").innerHTML = agg.map(function(a){
    var badge = a.events > 0 ? '<span class="badge active">Active</span>' : '<span class="badge silent">No data yet</span>';
    return '<tr><td>' + esc(a.id) + '</td><td>' + a.events + '</td><td>' + a.individuals + '</td><td>' + (a.last || '—') + '</td><td>' + badge + '</td></tr>';
  }).join("");
}

function renderRecordTable(){
  var rows = records.filter(function(r){ return !selectedStation || r.station === selectedStation; }).sort(function(a, b){
    var av = a[sortKeyR], bv = b[sortKeyR];
    if (typeof av === "string"){ av = av.toLowerCase(); bv = String(bv).toLowerCase(); }
    if (av < bv) return -1 * sortDirR; if (av > bv) return 1 * sortDirR; return 0;
  });
  document.getElementById("recordCount").textContent = "(" + rows.length + ")";
  document.querySelector("#recordTable tbody").innerHTML = rows.map(function(r){
    return '<tr><td>' + esc(r.station) + '</td><td>' + esc(r.date) + '</td><td>' + esc(r.species) + '</td><td>' + esc(r.groupSize) +
      '</td><td>' + esc(r.ageSex || '—') + '</td><td>' + (r.independent === "no" ? "repeat" : "new") + '</td></tr>';
  }).join("") || '<tr><td colspan="6" style="color:var(--ink-dim); font-style:italic;">No detections logged yet.</td></tr>';
}

function renderAll(){
  renderStats(); renderMap(); renderChart(); renderStationTable(); renderRecordTable();
}

/* ============================================================
   SECTION 6: PHOTOS — two ways to supply them
   1) images.csv (explicit list you maintain — dates/captions included)
   2) Auto-discovery: if this page is running on GitHub Pages,
      it can just list whatever files are sitting in
      images/<station>/ using GitHub's public API — no manifest
      to edit. This only works once the site is actually live on
      github.io (it can't reach GitHub's API from your local
      test server), and images.csv always wins if a station
      already has entries there.
   ============================================================ */
function detectGitHubRepo(){
  var host = location.hostname; // e.g. "yourname.github.io"
  if (!host.endsWith(".github.io")) return null;
  var owner = host.split(".")[0];
  var parts = location.pathname.split("/").filter(Boolean);
  var repo = parts[0] || (owner + ".github.io");
  return { owner: owner, repo: repo };
}

function loadPhotosForStation(stationId, callback){
  if (IMAGES[stationId] && IMAGES[stationId].length){
    callback(IMAGES[stationId]);
    return;
  }
  var repo = detectGitHubRepo();
  if (!repo){ callback([]); return; }
  var url = "https://api.github.com/repos/" + repo.owner + "/" + repo.repo + "/contents/images/" + encodeURIComponent(stationId);
  fetch(url).then(function(r){ if (!r.ok) throw new Error("no folder"); return r.json(); })
    .then(function(list){
      var photos = list
        .filter(function(item){ return item.type === "file" && /\.(jpe?g|png|gif|webp)$/i.test(item.name); })
        .map(function(item){ return { file: item.name, date: "", caption: "" }; });
      callback(photos);
    })
    .catch(function(){ callback([]); });
}

function openStationModal(stationId){
  var agg = stationAgg().filter(function(a){ return a.id === stationId; })[0];
  if (!agg) return;
  document.getElementById("modalTitle").textContent = stationId;
  document.getElementById("modalStats").textContent =
    agg.events + " event(s) · " + agg.individuals + " individual(s) logged · last detection: " + (agg.last || "—");
  var grid = document.getElementById("modalPhotos");
  grid.innerHTML = '<div class="empty" style="grid-column:1/-1;">Loading photos…</div>';
  document.getElementById("stationModal").hidden = false;

  loadPhotosForStation(stationId, function(photos){
    if (!photos.length){
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1;">No photos found for this station yet.</div>';
      return;
    }
    grid.innerHTML = photos.map(function(p){
      var src = "images/" + encodeURIComponent(stationId) + "/" + encodeURIComponent(p.file);
      var caption = p.caption ? esc(p.caption) + (p.date ? ' · ' + esc(p.date) : '') : (p.date ? esc(p.date) : '');
      return '<div><img src="' + src + '" alt="' + esc(stationId) + ' camera trap photo" data-full="' + src + '">' +
        (caption ? '<div class="photo-cap">' + caption + '</div>' : '') + '</div>';
    }).join("");
    grid.querySelectorAll("img").forEach(function(img){
      img.addEventListener("click", function(){
        document.getElementById("lightboxImg").src = img.getAttribute("data-full");
        document.getElementById("lightbox").hidden = false;
      });
    });
  });
}

/* ============================================================
   SECTION 7: FILTER DROPDOWN + SORTABLE TABLE HEADERS
   ============================================================ */
function populateFilter(){
  var sel = document.getElementById("stationFilter");
  sel.innerHTML = '<option value="">All stations</option>' +
    STATIONS.map(function(s){ return '<option value="' + esc(s.id) + '">' + esc(s.id) + '</option>'; }).join("");
  sel.addEventListener("change", function(){ selectedStation = this.value; renderChart(); renderRecordTable(); });
}

document.querySelectorAll("#stationTable th[data-key]").forEach(function(th){
  th.addEventListener("click", function(){
    var k = th.getAttribute("data-key");
    if (sortKeyS === k) sortDirS *= -1; else { sortKeyS = k; sortDirS = 1; }
    renderStationTable();
  });
});
document.querySelectorAll("#recordTable th[data-key]").forEach(function(th){
  th.addEventListener("click", function(){
    var k = th.getAttribute("data-key");
    if (sortKeyR === k) sortDirR *= -1; else { sortKeyR = k; sortDirR = 1; }
    renderRecordTable();
  });
});

document.getElementById("modalClose").addEventListener("click", function(){ document.getElementById("stationModal").hidden = true; });
document.getElementById("stationModal").addEventListener("click", function(e){ if (e.target === this) this.hidden = true; });
document.getElementById("lightbox").addEventListener("click", function(){ this.hidden = true; });
document.addEventListener("keydown", function(e){
  if (e.key === "Escape"){
    document.getElementById("stationModal").hidden = true;
    document.getElementById("lightbox").hidden = true;
  }
});

/* ============================================================
   SECTION 8: STARTUP
   Load data.csv, images.csv, and buffer_500m.geojson, then draw
   the page.
   ============================================================ */
populateFilter();

// The cacheBuster adds a unique timestamp to the URL (e.g., data.csv?t=169000000)
// This forces the browser to always grab your freshest saved data instead of an old cached copy.
var cacheBuster = "?t=" + new Date().getTime();

Promise.all([
  fetch("data.csv" + cacheBuster).then(function(r){ return r.text(); }).catch(function(){ return ""; }),
  fetch("images.csv" + cacheBuster).then(function(r){ return r.text(); }).catch(function(){ return ""; }),
  fetch("buffer_500m.geojson" + cacheBuster).then(function(r){ return r.json(); }).catch(function(){ return null; })
]).then(function(results){
  records = parseCSV(results[0]);
  IMAGES = parseImagesCSV(results[1]);
  BUFFER_GEOJSON = results[2];
  renderAll();
});
