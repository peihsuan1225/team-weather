import { updateWeatherForCounty } from "./weather.js";
import { getRainData } from "./rain.js";
import { clearRainfall, hideRainfall, openRainfall } from "./map.js";

//處理天氣與雨量頁面轉換
function handlePageSwitch() {
  const weatherBtn = document.getElementById("weather_btn");
  const rainBtn = document.getElementById("rain_btn");
  const weatherContainer = document.querySelector(
    ".week_weather_info_container"
  );

  const rainContainer = document.querySelector(".rain_info_container");

  // 預設 weather_btn clicked
  weatherBtn.classList.add("active");

  // update display of weather and rain
  function updateDisplay() {
    hideRainfall();
    if (weatherBtn.classList.contains("active")) {
      hideRainfall();
      weatherContainer.style.display = "flex";
      rainContainer.style.display = "none";
    } else if (rainBtn.classList.contains("active")) {
      // showRainfall();
      openRainfall();
      weatherContainer.style.display = "none";
      rainContainer.style.display = "flex";
    }
  }

  updateDisplay();

  // 切換頁面
  weatherBtn.addEventListener("click", function () {
    this.classList.add("active");
    rainBtn.classList.remove("active");
    updateDisplay();
  });

  rainBtn.addEventListener("click", function () {
    this.classList.add("active");
    weatherBtn.classList.remove("active");
    updateDisplay();
  });
}

function initPage() {
  //初始化載入默認城市
  const defaultCity = "臺北市";

  updateWeatherForCounty(defaultCity);

  //載入雨量頁面
  getRainData();

  //監聽頁面轉換按鈕
  handlePageSwitch();

  //監聽城市選擇事件(只有在手機版才會出現)
  const citySelector = document.querySelector(".city_selector");
  const container = document.querySelector(
    ".week_weather_info_and_rain_info_container"
  );
  if (citySelector) {
    citySelector.addEventListener("change", async (e) => {
      const city = e.target.value;
      updateWeatherForCounty(city);
      getRainData(city);
    });
  }
}

// //初始化天氣資料
document.addEventListener("DOMContentLoaded", () => {
  initPage();
});
