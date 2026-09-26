"use strict";

/* ============================================================
   SECTION 1: YOUR 41 CAMERA STATIONS
   Fixed list of station IDs + coordinates. This rarely changes,
   so it's safe to keep it directly in the code.
   ============================================================ */
var STATIONS = [{"id":"CT21","lat":12.907101,"lon":107.489706},{"id":"CT63","lat":12.875089,"lon":107.484641},{"id":"CT31","lat":12.865666,"lon":107.485992},{"id":"CT30","lat":12.847325,"lon":107.485092},{"id":"CT33","lat":12.842241,"lon":107.496648},{"id":"CT65","lat":12.847064,"lon":107.500161},{"id":"CT42","lat":12.826207,"lon":107.527453},{"id":"CT37","lat":12.838379,"lon":107.518099},{"id":"CT36","lat":12.83818,"lon":107.512496},{"id":"CT39","lat":12.832541,"lon":107.513048},{"id":"CT43","lat":12.815175,"lon":107.53659},{"id":"CT45","lat":12.804699,"lon":107.542748},{"id":"CT46","lat":12.801079,"lon":107.549982},{"id":"CT47","lat":12.796216,"lon":107.547855},{"id":"CT59","lat":12.774345,"lon":107.537165},{"id":"CT9","lat":13.00614,"lon":107.465928},{"id":"CT10","lat":12.994088,"lon":107.461701},{"id":"CT13","lat":12.983994,"lon":107.44398},{"id":"CT12","lat":12.972445,"lon":107.457326},{"id":"CT49","lat":12.923743,"lon":107.468312},{"id":"CT62","lat":12.902148,"lon":107.484385},{"id":"CT22","lat":12.893838,"lon":107.486586},{"id":"CT28","lat":12.855542,"lon":107.470912},{"id":"CT29","lat":12.854012,"lon":107.475393},{"id":"CT32","lat":12.857947,"lon":107.504776},{"id":"CT26 K583","lat":12.863193,"lon":107.469176},{"id":"CT8","lat":13.014833,"lon":107.448512},{"id":"CT6","lat":13.04025,"lon":107.433968},{"id":"CT7","lat":13.039719,"lon":107.447046},{"id":"CT19","lat":12.905633,"lon":107.467876},{"id":"CT20","lat":12.907258,"lon":107.479213},{"id":"CT61","lat":12.901823,"lon":107.484429},{"id":"CT23","lat":12.881407,"lon":107.48661},{"id":"CT25","lat":12.883469,"lon":107.491634},{"id":"CT64","lat":12.874646,"lon":107.484711},{"id":"CT35","lat":12.834253,"lon":107.509163},{"id":"CT038","lat":12.789319,"lon":107.528992},{"id":"CT44","lat":12.79783,"lon":107.51918},{"id":"CT40","lat":12.820423,"lon":107.506239},{"id":"CT48","lat":12.775802,"lon":107.548565},{"id":"CT11","lat":12.9925,"lon":107.489511}];

/* ============================================================
   SECTION 2: STATE
   The data the page is currently showing. `records` comes from
   data.csv. `IMAGES` comes from images.csv (optional — see
   Section 6 for the folder auto-discovery alternative).
   ============================================================ */
var records = [];
var IMAGES = {};          // station id -> [{file, date, caption}]
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

function renderMap(){
  var wrap = document.getElementById("mapWrap");
  var agg = stationAgg();
  var W = 480, H = 300, pad = 28;
  var lats = agg.map(function(a){ return a.lat; }), lons = agg.map(function(a){ return a.lon; });
  var latMin = Math.min.apply(null, lats), latMax = Math.max.apply(null, lats);
  var lonMin = Math.min.apply(null, lons), lonMax = Math.max.apply(null, lons);
  var maxEvents = Math.max(1, Math.max.apply(null, agg.map(function(a){ return a.events; })));

  function x(lon){ return pad + (lon - lonMin) / (lonMax - lonMin) * (W - 2 * pad); }
  function y(lat){ return H - pad - (lat - latMin) / (latMax - latMin) * (H - 2 * pad); }

  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;max-height:340px;">';
  for (var i = 0; i <= 4; i++){
    var gx = pad + i * (W - 2 * pad) / 4, gy = pad + i * (H - 2 * pad) / 4;
    svg += '<line x1="' + gx + '" y1="' + pad + '" x2="' + gx + '" y2="' + (H - pad) + '" stroke="#374238" stroke-width="0.5"/>';
    svg += '<line x1="' + pad + '" y1="' + gy + '" x2="' + (W - pad) + '" y2="' + gy + '" stroke="#374238" stroke-width="0.5"/>';
  }
  agg.forEach(function(a){
    var r = a.events > 0 ? (4 + (a.events / maxEvents) * 12) : 3;
    var col = a.events > 0 ? "#c98a3e" : "#5a655c";
    var cx = x(a.lon).toFixed(1), cy = y(a.lat).toFixed(1);
    var hasPhotos = IMAGES[a.id] && IMAGES[a.id].length;
    if (hasPhotos) svg += '<circle class="cam-ring" cx="' + cx + '" cy="' + cy + '" r="' + (r + 4).toFixed(1) + '"/>';
    svg += '<circle class="site-dot" data-station="' + esc(a.id) + '" cx="' + cx + '" cy="' + cy + '" r="' + r.toFixed(1) + '" fill="' + col + '" fill-opacity="0.85" stroke="' + col + '"><title>' + esc(a.id) + ' — ' + a.events + ' event(s)' + (hasPhotos ? ' · photos available' : '') + '</title></circle>';
  });
  svg += '</svg>';
  wrap.innerHTML = svg;
  wrap.querySelectorAll(".site-dot").forEach(function(el){
    el.addEventListener("click", function(){ openStationModal(el.getAttribute("data-station")); });
  });
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
   Load data.csv and images.csv, then draw the page.
   ============================================================ */
populateFilter();

// The cacheBuster adds a unique timestamp to the URL (e.g., data.csv?t=169000000)
// This forces the browser to always grab your freshest saved data instead of an old cached copy.
var cacheBuster = "?t=" + new Date().getTime();

Promise.all([
  fetch("data.csv" + cacheBuster).then(function(r){ return r.text(); }).catch(function(){ return ""; }),
  fetch("images.csv" + cacheBuster).then(function(r){ return r.text(); }).catch(function(){ return ""; })
]).then(function(results){
  records = parseCSV(results[0]);
  IMAGES = parseImagesCSV(results[1]);
  renderAll();
});