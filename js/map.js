var svg = d3.select("svg");

const g = svg.append("g");

// 創建一個地圖投影
var projectmethod = d3.geoMercator().center([120.3, 24.25]).scale(12000);
// 地理路徑生成器
var pathGenerator = d3.geoPath().projection(projectmethod);

d3.json("./asset/COUNTY_MOI_1090820.json")
.then(data => {
    const geometries = topojson.feature(data, data.objects["COUNTY_MOI_1090820"])
    console.log(geometries);
    g.append("path")
    const paths = g.selectAll("path").data(geometries.features);
    console.log(paths);
    paths.enter()
      .append("path")
        .attr("d", pathGenerator)
        .attr("class","county")
        .on("click", function(d) {
            onClickMap(this,d.properties["COUNTYNAME"]); // 將資料傳遞給 Onclick 函數
          })
        .on("mouseover", function(d) {
          // console.log(d.properties["COUNTYNAME"]);
          d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">縣市：' + d.properties["COUNTYNAME"] +'</div>')
        })
        .on("mousemove", function(d) {
          d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px')
        })
        .on("mouseout", function(d) {
          d3.select('#tooltip').style('opacity', 0)
        })
    
      // // 加上簡易版本 tooltip
      // .append("title")
      //   .text(d => d.properties["COUNTYNAME"])
  })

  // 加上tooltip id
  d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('style', 'position: absolute; opacity: 0;');


  // 在地圖上顯示雨量長條圖和文字
  function showRainfall(data_rainfall){
    // 移除所有現有的圓圈、長條圖、文字
    // d3.selectAll("circle").remove();
    d3.selectAll("rect").remove();
    d3.selectAll(".rainfall").remove();

    // 試著把雨量資料畫在地圖上面
    // 創建一個地圖投影
    var projection = d3.geoMercator().center([120.3, 24.25]).scale(12000);

    g.selectAll("rect")
      .data(data_rainfall)
      .enter()
      .append("rect")
        .attr("x", function(d) {
          return projection([d.StationLongitude, d.StationLatitude])[0];
        })
        .attr("y", function(d) {
          return projection([d.StationLongitude, d.StationLatitude])[1];
        })
        .attr("width", 10)
        .attr("height", function(d) {
          return d.Past24hr_rainfall * 2;
        })
        .attr("class", "bar");

    // 在每個長條圖後面加上文字顯示數值
    g.selectAll("text")
    .data(data_rainfall)
    .enter()
    .append("text")
      .attr("x", function(d) {
        return projection([d.StationLongitude, d.StationLatitude])[0] + 5; // 調整文字位置，假設文字要在長條圖中心
      })
      .attr("y", function(d) {
        return projection([d.StationLongitude, d.StationLatitude])[1] - 5; // 調整文字位置，假設文字要放在長條圖上方
      })
      .text(function(d) {
        return d.StationName + "," + d.Past24hr_rainfall + "mm"; // 顯示雨量數值
      })
      .attr("class", "rainfall")
      .attr("text-anchor", "middle") // 文字置中對齊
  }


  //點擊地圖後的事件
  function onClickMap(element,name){
    document.querySelector(".county").textContent = name;

    // 移除所有縣市的選中狀態和名稱
    d3.selectAll(".county").classed("selected", false);
    d3.selectAll(".county-label").remove();
    
    // 為當前點擊的縣市添加選中狀態
    d3.select(element).classed("selected", true);

    // 在當前點擊的縣市上顯示名稱
    d3.select(element.parentNode)
    .append("text")
    .attr("class", "county-label")
    .attr("x", function() {
      const centroid = pathGenerator.centroid(d3.select(element).data()[0]);
      return centroid[0];
    })
    .attr("y", function() {
      const centroid = pathGenerator.centroid(d3.select(element).data()[0]);
      return centroid[1];
    })
    .attr("dy", ".35em")
    .attr("dx", "-25px")
    .text(name);

    // 移除所有現有的圓圈、長條圖、文字
    // d3.selectAll("circle").remove();
    d3.selectAll("rect").remove();
    d3.selectAll(".rainfall").remove();

  }

  //點擊切換雨量按鈕，出現雨量資料
  document.querySelector("#rain_btn").addEventListener("click",function(){
     //假裝自己撈到資料
    let testdata = data;
    let stations = testdata.result.rainfall_data[0].stations;
    // console.log(stations);

    //畫雨量長條圖資料
    showRainfall(stations);
  })

  //測試用資料
  let data = {
    "result":{
        "fields":[
        {
            "id": "countryName",
            "type": "string",
        },
        {
            "id": "StationName",
            "type": "string",
        },
        {
            "id": "Past24hr_rainfall",
            "type": "float",
        },
        {
            "id": "StationLatitude",
            "type": "float",
        },
        {
            "id": "StationLongitude",
            "type": "float",
        },
        ],
        "rainfall_data": [
        {
          "countryName": "臺北市",
          "stations": [
            {
              "StationName": "花蓮",
              "Past24hr_rainfall": 16,
              "StationLatitude": 23.975128,
              "StationLongitude": 121.613275
            },
            {
              "StationName": "尖山",
              "Past24hr_rainfall": 20,
              "StationLatitude": 22.813153,
              "StationLongitude": 120.367789
            },
            {
              "StationName": "後龍",
              "Past24hr_rainfall": 30,
              "StationLatitude": 24.648563,
              "StationLongitude": 120.831834
            }
          ]
        }
      ]
    }
  }
