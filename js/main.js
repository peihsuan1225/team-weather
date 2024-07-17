import { initWeather } from "./weather.js";

//轉換天氣與雨量頁面
const weatherPage = document.querySelector(".week_weather_info_container");

//初始化天氣資料
document.addEventListener("DOMContentLoaded", initWeather);
