let data = [];
let map;
let layers = [];

const wardSelect = document.getElementById("wardSelect");

// AQI → Color
function aqiColor(aqi) {
  if (aqi <= 100) return "bg-green-500";
  if (aqi <= 200) return "bg-yellow-400";
  if (aqi <= 300) return "bg-orange-500";
  return "bg-red-600";
}

// AQI → Priority
function getPriority(aqi) {
  if (aqi > 300) return { text: "High", color: "bg-red-600" };
  if (aqi > 200) return { text: "Medium", color: "bg-orange-500" };
  return { text: "Low", color: "bg-green-500" };
}

// Department logic
function getDepartment(pollutant) {
  if (pollutant.includes("PM")) return "MCD";
  if (pollutant === "NO2") return "Traffic Police";
  return "DPCC";
}

// MAP
function initMap() {
  map = L.map("map").setView([28.6139, 77.2090], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
}

function drawMap() {
  layers.forEach(l => map.removeLayer(l));
  layers = [];

  data.forEach(w => {
    const c = w.aqi > 300 ? "red" : w.aqi > 200 ? "orange" : "green";
    const circle = L.circle([w.lat, w.lng], {
      radius: 1400,
      color: c,
      fillOpacity: 0.5
    }).bindPopup(`<b>${w.ward}</b><br>AQI: ${w.aqi}`);
    circle.addTo(map);
    layers.push(circle);
  });
}

// CHARTS
function trendChart(trend) {
  echarts.init(chartTrend).setOption({
    xAxis: { type: "category", data: ["D1","D2","D3","D4","D5"] },
    yAxis: { type: "value" },
    series: [{ data: trend, type: "line", smooth: true }]
  });
}

function pieChart(dom, obj) {
  echarts.init(dom).setOption({
    series: [{
      type: "pie",
      radius: "70%",
      data: Object.entries(obj).map(([k,v]) => ({ name: k, value: v }))
    }]
  });
}

function barCompare() {
  echarts.init(chartCompare).setOption({
    xAxis: { type: "category", data: data.map(d => d.ward) },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: data.map(d => d.aqi) }]
  });
}

// MAIN
function loadWard(w) {
  const p = getPriority(w.aqi);

  aqiValue.innerText = w.aqi;
  aqiValue.className = `text-2xl font-bold px-2 py-1 rounded text-white ${aqiColor(w.aqi)}`;
  riskLevel.innerText = w.risk;
  pollutant.innerText = w.pollutant;

  priority.innerText = p.text;
  priority.className = `px-2 py-1 rounded text-white ${p.color}`;

  department.innerText = getDepartment(w.pollutant);

  actions.innerHTML = "";
  w.actions.forEach(a => {
    const li = document.createElement("li");
    li.innerText = a;
    actions.appendChild(li);
  });

  trendChart(w.trend);
  pieChart(chartPollutant, w.pollutants);
  pieChart(chartSource, w.sources);
}

// FETCH (GitHub Pages SAFE)
fetch("./wards.json")
  .then(r => r.json())
  .then(json => {
    data = json;

    data.forEach(w => {
      const opt = document.createElement("option");
      opt.value = w.ward;
      opt.innerText = w.ward;
      wardSelect.appendChild(opt);
    });

    initMap();
    drawMap();
    barCompare();
    loadWard(data[0]);
  });

wardSelect.addEventListener("change", () => {
  loadWard(data.find(w => w.ward === wardSelect.value));
});
