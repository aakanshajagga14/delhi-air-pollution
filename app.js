let data = [];
let map;
let layers = [];

/* ---------- UTILS ---------- */
function getPriority(aqi) {
  if (aqi > 300) return ["High", "text-red-500"];
  if (aqi > 200) return ["Medium", "text-orange-400"];
  return ["Low", "text-green-400"];
}

function getDepartment(pollutant) {
  if (pollutant.includes("PM")) return "Municipal Corporation (MCD)";
  if (pollutant === "NO2") return "Traffic Police";
  return "DPCC";
}

/* ---------- MAP ---------- */
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

    const circle = L.circle([w.lat, w.lng], {
      radius: 1500,
      color,
      fillOpacity: 0.5
    }).bindPopup(`<b>${w.ward}</b><br>AQI: ${w.aqi}`);

    circle.addTo(map);
    layers.push(circle);
  });
}

/* ---------- TABLE ---------- */
function renderTable() {
  const tbody = document.getElementById("wardTable");
  tbody.innerHTML = "";

  let high = 0, medium = 0, low = 0;

  data.forEach(w => {
    const [priority, cls] = getPriority(w.aqi);
    if (priority === "High") high++;
    else if (priority === "Medium") medium++;
    else low++;

    const tr = document.createElement("tr");
    tr.className = "border-b border-slate-800";

    tr.innerHTML = `
      <td class="py-2">${w.ward}</td>
      <td>${w.aqi}</td>
      <td>${w.pollutant}</td>
      <td class="${cls} font-semibold">${priority}</td>
      <td>${getDepartment(w.pollutant)}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("highCount").innerText = `${high} wards`;
  document.getElementById("mediumCount").innerText = `${medium} wards`;
  document.getElementById("lowCount").innerText = `${low} wards`;
}

/* ---------- CHARTS ---------- */

// CITY AQI GAUGE
function renderCityGauge(avgAQI) {
  const el = document.getElementById("cityGauge");
  const chart = echarts.init(el);

  chart.setOption({
    series: [{
      type: "gauge",
      min: 0,
      max: 500,
      progress: { show: true, width: 18 },
      axisLine: { lineStyle: { width: 18 } },
      detail: { fontSize: 28 },
      data: [{ value: Math.round(avgAQI), name: "City AQI" }]
    }]
  });
}

// CITY AQI TREND
function renderTrendChart() {
  const el = document.getElementById("trendChart");
  const chart = echarts.init(el);

  chart.setOption({
    xAxis: {
      type: "category",
      data: ["D1", "D2", "D3", "D4", "D5", "D6"]
    },
    yAxis: { type: "value" },
    series: [{
      type: "line",
      smooth: true,
      data: data[0].trend
    }]
  });
}

// AGGREGATED PIE
function renderAggregatePie(domId, key) {
  const el = document.getElementById(domId);
  const chart = echarts.init(el);

  const aggregated = {};
  data.forEach(w => {
    Object.entries(w[key]).forEach(([k, v]) => {
      aggregated[k] = (aggregated[k] || 0) + v;
    });
  });

  chart.setOption({
    series: [{
      type: "pie",
      radius: "70%",
      data: Object.entries(aggregated).map(([k, v]) => ({
        name: k,
        value: v
      }))
    }]
  });
}

/* ---------- LOAD ---------- */
fetch("./wards.json")
  .then(res => res.json())
  .then(json => {
    data = json;

    initMap();
    drawMap();
    renderTable();

    const avgAQI =
      data.reduce((sum, w) => sum + w.aqi, 0) / data.length;

    renderCityGauge(avgAQI);
    renderTrendChart();
    renderAggregatePie("pollutantChart", "pollutants");
    renderAggregatePie("sourceChart", "sources");
  })
  .catch(err => {
    console.error("Data load failed:", err);
  });
