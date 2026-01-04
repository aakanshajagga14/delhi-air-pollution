let data = [];
let map;
let layers = [];

function $(id) {
  return document.getElementById(id);
}

function getPriority(aqi) {
  if (aqi > 300) return ["High", "text-red-600"];
  if (aqi > 200) return ["Medium", "text-orange-500"];
  return ["Low", "text-green-600"];
}

function getDepartment(p) {
  if (p.includes("PM")) return "Municipal Corporation (MCD)";
  if (p === "NO2") return "Traffic Police";
  return "DPCC";
}

/* MAP */
function initMap() {
  map = L.map("map").setView([28.6139, 77.2090], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
}

function drawMap() {
  layers.forEach(l => map.removeLayer(l));
  layers = [];

  data.forEach(w => {
    const color =
      w.aqi > 300 ? "#7f1d1d" :
      w.aqi > 200 ? "#ea580c" :
      w.aqi > 100 ? "#facc15" :
      "#16a34a";

    const c = L.circle([w.lat, w.lng], {
      radius: 1500,
      color,
      fillOpacity: 0.45
    }).bindPopup(`<b>${w.ward}</b><br>AQI: ${w.aqi}`);

    c.addTo(map);
    layers.push(c);
  });
}

/* TABLE */
function renderTable() {
  const tbody = $("wardTable");
  tbody.innerHTML = "";

  let high = 0, mid = 0, low = 0;

  data.forEach(w => {
    const [p, cls] = getPriority(w.aqi);
    if (p === "High") high++;
    else if (p === "Medium") mid++;
    else low++;

    const tr = document.createElement("tr");
    tr.className = "border-b";

    tr.innerHTML = `
      <td class="py-2">${w.ward}</td>
      <td>${w.aqi}</td>
      <td>${w.pollutant}</td>
      <td class="${cls} font-semibold">${p}</td>
      <td>${getDepartment(w.pollutant)}</td>
    `;
    tbody.appendChild(tr);
  });

  $("highCount").innerText = `${high} wards`;
  $("mediumCount").innerText = `${mid} wards`;
  $("lowCount").innerText = `${low} wards`;
}

/* CHARTS */
function renderGauge(avg) {
  const el = $("cityGauge");
  el.style.height = "220px";

  requestAnimationFrame(() => {
    echarts.init(el).setOption({
      series: [{
        type: "gauge",
        min: 0,
        max: 500,
        progress: { show: true, width: 18 },
        axisLine: { lineStyle: { width: 18 } },
        detail: { fontSize: 28 },
        data: [{ value: Math.round(avg), name: "City AQI" }]
      }]
    });
  });
}

function renderTrend() {
  const el = $("trendChart");
  el.style.height = "200px";

  requestAnimationFrame(() => {
    echarts.init(el).setOption({
      xAxis: { type: "category", data: ["D1","D2","D3","D4","D5","D6"] },
      yAxis: { type: "value" },
      series: [{ type: "line", smooth: true, data: data[0].trend }]
    });
  });
}

function renderPie(id, key) {
  const el = $(id);
  el.style.height = "200px";

  const agg = {};
  data.forEach(w => {
    Object.entries(w[key]).forEach(([k,v]) => {
      agg[k] = (agg[k] || 0) + v;
    });
  });

  requestAnimationFrame(() => {
    echarts.init(el).setOption({
      series: [{
        type: "pie",
        radius: "70%",
        data: Object.entries(agg).map(([k,v]) => ({ name:k, value:v }))
      }]
    });
  });
}

/* LOAD */
fetch("./wards.json")
  .then(r => r.json())
  .then(j => {
    data = j;

    initMap();
    drawMap();
    renderTable();

    const avg = data.reduce((s,w)=>s+w.aqi,0) / data.length;

    renderGauge(avg);
    renderTrend();
    renderPie("pollutantChart", "pollutants");
    renderPie("sourceChart", "sources");
  });
