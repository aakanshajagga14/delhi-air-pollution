let data = [];
let map;
let wardLayers = [];

const wardSelect = document.getElementById("wardSelect");

// AQI color coding
function getAQIColor(aqi) {
  if (aqi <= 50) return "bg-green-500";
  if (aqi <= 100) return "bg-lime-400";
  if (aqi <= 200) return "bg-yellow-400";
  if (aqi <= 300) return "bg-orange-500";
  if (aqi <= 400) return "bg-red-500";
  return "bg-rose-900";
}

// Initialize Map
function initMap() {
  map = L.map("map").setView([28.6139, 77.2090], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);
}

// Plot ward circles
function plotWards() {
  wardLayers.forEach(layer => map.removeLayer(layer));
  wardLayers = [];

  data.forEach(w => {
    const color =
      w.aqi <= 100 ? "green" :
      w.aqi <= 200 ? "yellow" :
      w.aqi <= 300 ? "orange" : "red";

    const circle = L.circle([w.lat, w.lng], {
      radius: 1200,
      color,
      fillColor: color,
      fillOpacity: 0.5
    })
      .bindPopup(`<b>${w.ward}</b><br>AQI: ${w.aqi}`)
      .addTo(map);

    wardLayers.push(circle);
  });
}

// Draw AQI Trend Chart
function drawChart(trend) {
  const chart = echarts.init(document.getElementById("aqiChart"));
  chart.setOption({
    xAxis: {
      type: "category",
      data: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"]
    },
    yAxis: { type: "value" },
    series: [{
      data: trend,
      type: "line",
      smooth: true
    }]
  });
}

// 🔥 MAIN FUNCTION judges care about
function loadWard(ward) {
  const aqiBox = document.getElementById("aqiValue");
  aqiBox.innerText = ward.aqi;
  aqiBox.className = `text-2xl font-bold text-white px-2 py-1 rounded ${getAQIColor(ward.aqi)}`;

  document.getElementById("riskLevel").innerText = ward.risk;
  document.getElementById("pollutant").innerText = ward.pollutant;
  document.getElementById("source").innerText = ward.source;

  const actionsList = document.getElementById("actions");
  actionsList.innerHTML = "";
  ward.actions.forEach(action => {
    const li = document.createElement("li");
    li.innerText = action;
    actionsList.appendChild(li);
  });

  drawChart(ward.trend);
}

// Load data
fetch("data/wards.json")
  .then(res => res.json())
  .then(json => {
    data = json;

    data.forEach(w => {
      const opt = document.createElement("option");
      opt.value = w.ward;
      opt.innerText = w.ward;
      wardSelect.appendChild(opt);
    });

    initMap();
    plotWards();
    loadWard(data[0]);
  });

// Dropdown listener
wardSelect.addEventListener("change", () => {
  const selectedWard = data.find(w => w.ward === wardSelect.value);
  loadWard(selectedWard);
});
