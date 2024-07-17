import { updateWeatherForCounty } from './weather.js';

var svg = d3.select("svg");

const g = svg.append("g");

// 創建一個地圖投影
var projectmethod = d3.geoMercator().center([120.3, 24.25]).scale(12000);
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
        .on("click", function(d) {
            onClickMap(this,d.properties["COUNTYNAME"]); // 將資料傳遞給 Onclick 函數
          })
        .on("mouseover", function(d) {
          d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">縣市：' + d.properties["COUNTYNAME"] +'</div>')
        })
        .on("mousemove", function(d) {
          d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px')
        })
        .on("mouseout", function(d) {
          d3.select('#tooltip').style('opacity', 0)
        })
  })

  // 加上tooltip id
  d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('style', 'position: absolute; opacity: 0;');


  // ** clearRainfall 移除地圖雨量的function
  function clearRainfall(){
    d3.selectAll("circle").remove();
  }

  // ** showRainfall(雨量陣列資料) 在地圖上顯示雨量全圈
  function showRainfall(data_rainfall){
    clearRainfall();

    // 創建一個地圖投影
    var projection = d3.geoMercator().center([120.3, 24.25]).scale(12000);

    g.selectAll("circle")
      .data(data_rainfall)
      .enter()
      .append("circle")
        .attr("cx", function(d) {
          return projection([d.StationLongitude, d.StationLatitude])[0];
        })
        .attr("cy", function(d) {
          return projection([d.StationLongitude, d.StationLatitude])[1];
        })
        .attr("r",function(d) {
            return d.Past24hr_rainfall/3;
          })
        .attr("fill","rgb(125, 204, 224,0.4)")
      //觀測站的tooltip
      .on("mouseover", function(d) {
        d3.select('#tooltip').style('opacity', 1).html('<div class="custom_tooltip">觀測站：' + d.StationName + '<br>雨量：' + d.Past24hr_rainfall + "mm"  +'</div>')
      })
      .on("mousemove", function(d) {
        d3.select('#tooltip').style('left', (d3.event.pageX+10) + 'px').style('top', (d3.event.pageY+10) + 'px')
      })
      .on("mouseout", function(d) {
        d3.select('#tooltip').style('opacity', 0)
      })
  }


  //點擊地圖後的事件
  function onClickMap(element,name){
    document.querySelector(".county").textContent = name;

    // 移除所有縣市的選中狀態和名稱
    d3.selectAll(".county").classed("selected", false);
    d3.selectAll(".county-label").remove();
    
    // 為當前點擊的縣市添加選中狀態
    d3.select(element).classed("selected", true);

    clearRainfall(); //清掉雨量顯示
    console.log(name);
    updateWeatherForCounty(name);  
  
  }

  // //點擊切換雨量按鈕，出現雨量資料(測試用)
  // document.querySelector("#rain_btn").addEventListener("click",function(){
  //    //假裝自己撈到資料
  //   let testdata = data;
  //   let stations = testdata.result.rainfall_data[0].stations;
  //   // console.log(stations);

  //   //畫雨量長條圖資料
  //   showRainfall(stations);
  // })

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


  export{showRainfall, clearRainfall};