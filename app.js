let data=[], map, layers=[];

const priorityMap = aqi =>
  aqi>300 ? ["High","bg-red-600"] :
  aqi>200 ? ["Medium","bg-orange-500"] :
            ["Low","bg-green-600"];

const deptMap = p =>
  p.includes("PM") ? "MCD" :
  p==="NO2" ? "Traffic Police" : "DPCC";

function initMap(){
  map=L.map("map").setView([28.6139,77.2090],11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
}

function drawMap(){
  layers.forEach(l=>map.removeLayer(l)); layers=[];
  data.forEach(w=>{
    const c=w.aqi>300?"#7f1d1d":w.aqi>200?"#ea580c":w.aqi>100?"#facc15":"#16a34a";
    const circle=L.circle([w.lat,w.lng],{radius:1500,color:c,fillOpacity:.5})
      .bindPopup(`<b>${w.ward}</b><br>AQI ${w.aqi}`).addTo(map);
    layers.push(circle);
  });
}

function gauge(aqi){
  echarts.init(aqiGauge).setOption({
    series:[{
      type:"gauge",
      min:0,max:500,
      progress:{show:true,width:18},
      axisLine:{lineStyle:{width:18}},
      detail:{valueAnimation:true,fontSize:32},
      data:[{value:aqi,name:"AQI"}]
    }]
  });
}

function pie(dom,obj){
  echarts.init(dom).setOption({
    series:[{type:"pie",radius:"70%",
      data:Object.entries(obj).map(([k,v])=>({name:k,value:v}))}]
  });
}

function line(trend){
  echarts.init(trendChart).setOption({
    xAxis:{type:"category",data:["1","2","3","4","5","6"]},
    yAxis:{type:"value"},
    series:[{type:"line",smooth:true,data:trend}]
  });
}

function loadWard(w){
  const [p,c]=priorityMap(w.aqi);
  priority.innerText=p; priority.className=`px-2 py-1 rounded ${c}`;
  department.innerText=deptMap(w.pollutant);
  pollutant.innerText=w.pollutant;

  actions.innerHTML="";
  w.actions.forEach(a=>{
    const li=document.createElement("li"); li.innerText=a;
    actions.appendChild(li);
  });

  gauge(w.aqi);
  line(w.trend);
  pie(pollutantChart,w.pollutants);
  pie(sourceChart,w.sources);
}

fetch("./wards.json").then(r=>r.json()).then(j=>{
  data=j;
  j.forEach(w=>{
    const o=document.createElement("option");
    o.value=w.ward;o.innerText=w.ward;wardSelect.appendChild(o);
  });
  initMap(); drawMap(); loadWard(j[0]);
});

wardSelect.onchange=()=>loadWard(data.find(w=>w.ward===wardSelect.value));
