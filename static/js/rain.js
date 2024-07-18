import { showRainfall } from "./map.js";
import { showLoading, hideLoading } from "./weather.js";

// 30 mins 快取過期
const RAIN_CACHE_EXPIRY = 30 * 60 * 1000;

function getRainData(cityName = "臺北市") {
  const cacheKey = `rainData_${cityName}`;

  showLoading();

  const rainResult = document.querySelector("#rainResult");
  rainResult.innerHTML = "";

  // 先 Check cache
  const cachedData = getRainDataFromCache(cacheKey);
  if (cachedData) {
    console.log("快取到的雨量縣市：", cityName);
    showRainData(cachedData);
    return;
  }

  const url = `http://52.9.113.1:8001/api/rainfall/${encodeURIComponent(
    cityName
  )}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("雨量資料連線：", data);
      hideLoading();
      const cityData = data.result.rainfall_data;

      // 快取最新資料
      setRainDataToCache(cacheKey, cityData);

      showRainData(cityData);
    })
    .catch((error) => {
      hideLoading();
      console.error("Error fetching data: ", error);
      return null;
    });

  function showRainData(cityData) {
    if (cityData.length > 0) {
      cityData.forEach((city) => {
        city.stations.forEach((station, index) => {
          const stationDiv = document.createElement("div");
          stationDiv.className = "rain_info";
          stationDiv.id = `station-${index}`;
          stationDiv.innerHTML = `
            <span class="rain_info_station">${station.StationName}</span>
            <div class="rain_info_bar_container">
              <div class="rain_info_bar">
                ${generateColorBoxes()}
              </div>
            </div>
            <div class="rain_info_mm"><span class="rain_info_number">${
              station.Past24hr_rainfall
            }</span> mm</div>`;
          rainResult.appendChild(stationDiv);
          const boxes = stationDiv.querySelectorAll(".color_box");
          applyColorsToBoxes(boxes, parseInt(station.Past24hr_rainfall, 10));
        });
      });

      // Station names for showRainfall
      const stationNames = cityData[0].stations;
      // Call showRainfall
      showRainfall(stationNames);
      console.log(stationNames);
    }
  }
}

function getRainDataFromCache(key) {
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < RAIN_CACHE_EXPIRY) {
        return data;
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error("Error parsing cached rain data:", error);
      localStorage.removeItem(key);
    }
  }
  return null;
}

function setRainDataToCache(key, data) {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

function generateColorBoxes() {
  const colors = [
    "#d3d3d3",
    "#add8e6",
    "#87ceeb",
    "#4682b4",
    "#66e0b1",
    "#35c135",
    "#f8f811",
    "#f0cd06",
    "#ee9d06",
    "#f29b70",
    "#ec5e26",
    "#ae5a5a",
    "#8244ae",
    "#8822aa",
    "#ca62e9",
    "#f9a7f1",
  ];
  return colors
    .map(
      (color) =>
        `<div class="color_box" style="background-color: ${color};"></div>`
    )
    .join("");
}

function applyColorsToBoxes(boxes, mmValue) {
  const thresholds = [
    1, 2, 6, 10, 15, 20, 30, 40, 50, 70, 90, 110, 130, 150, 200, 300,
  ];
  let thresholdIndex = thresholds.findIndex(
    (threshold) => mmValue <= threshold
  );
  thresholdIndex = thresholdIndex === -1 ? boxes.length - 1 : thresholdIndex;

  boxes.forEach((box, index) => {
    box.style.height = index <= thresholdIndex ? "12px" : "2px";
  });
}

export { getRainData };
