var svg = d3.select("svg");

const g = svg.append("g");

// 創建一個地圖投影
var projectmethod = d3.geoMercator().center([120.7, 24.3]).scale(10500);
// 地理路徑生成器
var pathGenerator = d3.geoPath().projection(projectmethod);

d3.json("./asset/COUNTY_MOI_1090820.json")
.then(data => {
    const geometries = topojson.feature(data, data.objects["COUNTY_MOI_1090820"])

    g.append("path")
    const paths = g.selectAll("path").data(geometries.features);
    paths.enter()
      .append("path")
        .attr("d", pathGenerator)
        .attr("class","county")
        .on("click", function(event, d) {
            console.log(d);
            
            Onclick(this,d); // 將資料傳遞給 Onclick 函數
          })
      // 加上簡易版本 tooltip
      .append("title")
        .text(d => d.properties["COUNTYNAME"])
        .attr("class","tooltip")
  })

  function Onclick(element,name){
    console.log("123");
    document.querySelector(".county").textContent = name;

    // 移除所有縣區的選中狀態
    d3.selectAll(".county").classed("selected", false);

    // 為當前點擊的縣區添加選中狀態
    d3.select(element).classed("selected", true);
    document.getElementById("tooltip").textContent = name;
    
    // let testword = document.createElement("div");
    // testword.className = "test";
    // testword.textContent = name;
    // document.querySelector(".county").appendChild(testword);
    // document.getElementsByClassName("1234")[0].appendChild(testword);
  }
  
