import { initWeather } from "./weather.js";

//處理天氣與雨量頁面轉換
function handlePageSwitch() {
  const weatherBtn = document.getElementById("weather_btn");
  const rainBtn = document.getElementById("rain_btn");
  const weatherContainer = document.querySelector(
    ".week_weather_info_and_rain_info_container"
  );

  console.log(weatherContainer);
  const rainContainer = document.querySelector(".rain_info_container");

  // 預設 weather_btn clicked
  weatherBtn.classList.add("active");

  // update display of weather and rain
  function updateDisplay() {
    if (weatherBtn.classList.contains("active")) {
      weatherContainer.classList.add("show");
      weatherContainer.classList.remove("hide");
      rainContainer.classList.add("hide");
      rainContainer.classList.remove("show");
    } else if (rainBtn.classList.contains("active")) {
      rainContainer.classList.add("show");
      rainContainer.classList.remove("hide");
      weatherContainer.classList.add("hide");
      weatherContainer.classList.remove("show");
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
  //載入地圖

  // 載入天氣頁面
  initWeather();

  //載入雨量頁面
  // getRainData();

  //監聽頁面轉換按鈕
  handlePageSwitch();
}

// //初始化天氣資料
document.addEventListener("DOMContentLoaded", initPage);
