let data;
const wardSelect = document.getElementById("wardSelect");

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
    loadWard(data[0]);
  });

wardSelect.addEventListener("change", () => {
  const ward = data.find(w => w.ward === wardSelect.value);
  loadWard(ward);
});

function loadWard(ward) {
  document.getElementById("aqiValue").innerText = ward.aqi;
  document.getElementById("riskLevel").innerText = ward.risk;
  document.getElementById("pollutant").innerText = ward.pollutant;
  document.getElementById("source").innerText = ward.source;

  const actions = document.getElementById("actions");
  actions.innerHTML = "";
  ward.actions.forEach(a => {
    const li = document.createElement("li");
    li.innerText = a;
    actions.appendChild(li);
  });

  drawChart(ward.trend);
}

function drawChart(trend) {
  const chart = echarts.init(document.getElementById("aqiChart"));
  chart.setOption({
    xAxis: { type: "category", data: ["Day 1","Day 2","Day 3","Day 4","Day 5"] },
    yAxis: { type: "value" },
    series: [{ data: trend, type: "line", smooth: true }]
  });
}
