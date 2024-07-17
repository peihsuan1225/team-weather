//天氣關鍵字與 icon對照
const weatherIconMapping = {
  // 晴空萬里
  "01": "/asset/晴空萬里.svg",

  // 晴時多雲
  "02": "/asset/晴時多雲.svg",
  "03": "/asset/晴時多雲.svg",

  // 多雲時陰
  "04": "/asset/多雲時陰.svg",
  "05": "/asset/多雲時陰.svg",
  "06": "/asset/多雲時陰.svg",
  "07": "/asset/多雲時陰.svg",

  // 多雲短暫陣雨
  "08": "/asset/多雲短暫陣雨.svg",
  "09": "/asset/多雲短暫陣雨.svg",
  10: "/asset/多雲短暫陣雨.svg",

  // 晴短暫陣雨
  11: "/asset/晴短暫陣雨.svg",
  12: "/asset/晴短暫陣雨.svg",
  13: "/asset/晴短暫陣雨.svg",
  14: "/asset/晴短暫陣雨.svg",

  // 雷陣雨
  15: "/asset/雷陣雨.svg",
  16: "/asset/雷陣雨.svg",
  17: "/asset/雷陣雨.svg",
  18: "/asset/雷陣雨.svg",

  // 晴午後短暫雷陣雨
  19: "/asset/晴午後短暫雷陣雨.svg",
  20: "/asset/晴午後短暫雷陣雨.svg",
  21: "/asset/晴午後短暫雷陣雨.svg",
  22: "/asset/晴午後短暫雷陣雨.svg",
};

function getWeatherIcon(weatherCode, isNight = false) {
  // 將 weatherCode 轉換為字符串，去除空白，並在需要時在前面補零
  const code = String(weatherCode).trim().padStart(2, "0");

  let iconPath = weatherIconMapping[code];

  // 直接查找映射
  if (weatherIconMapping[code]) {
    if (isNight) {
      iconPath = iconPath.replace("/asset/", "/asset/晚-");
      return iconPath;
    }
    return iconPath;
  }

  // 如果都不匹配，返回默認icon
  console.error(`未找到匹配的天氣圖標代碼: ${code}`);
  return "/asset/多雲時陰.svg"; // 默認icon
}

//日期換算星期
function getDayOfWeek(date) {
  date = new Date(date);
  const daysOfWeek = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}

//換算一週星期
function getWeekDayNames(startDateStr) {
  // 解析輸入的日期字串
  const startDate = new Date(startDateStr);

  // 計算一週的日期
  const dayNames = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    let dayName = i === 0 ? "今天" : getDayOfWeek(currentDate);
    dayNames.push(dayName);
  }

  return dayNames;
}

//動畫遞增溫度數字
//記得轉成整數
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = Math.round(progress * (end - start) + start);
    obj.textContent = `${currentValue}°C`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// 創建一週天氣元素
function createWeatherElement(data, dayName, isNight) {
  //整理資料
  const { date, weatherElement } = data;
  console.log(weatherElement);
  const [{ Mintemp }, { MaxTemp }, { Wx }] = weatherElement;

  // const container = document.createElement("div");
  const info = document.createElement("div");
  const day = document.createElement("span");
  const icon = document.createElement("img");

  const tempInfo = document.createElement("div");
  const minTemp = document.createElement("span");
  const tempBar = document.createElement("div");
  const maxTemp = document.createElement("span");

  //創建一個顯示天氣狀態的 tooltip
  const tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  console.log(tooltip);

  // container.classList.add("week_weather_info_container");
  info.classList.add("week_weather_info");
  day.classList.add("week_weather_info_day");
  icon.classList.add("week_weather_info_icon");
  tempInfo.classList.add("week_weather_info_temp");
  minTemp.classList.add("week_weather_info_temp_min");
  tempBar.classList.add("week_weather_info_temp_bar");
  maxTemp.classList.add("week_weather_info_temp_max");

  //設置初始數據(白天)
  setWeather(false);

  //監聽 hover事件
  info.addEventListener("mouseenter", () => {
    setWeather(true);
  });
  info.addEventListener("mouseleave", () => {
    setWeather(false);
  });

  //檢查是白天還是夜晚，顯示相對應的資料
  function setWeather(isNight) {
    const timeOfDay = isNight ? "night" : "daytime";
    const periodText = isNight ? "晚上" : "白天";

    day.textContent = `${dayName}${periodText}`;

    const weatherCode = Wx.find((item) => item.time === timeOfDay)?.code;
    icon.src = getWeatherIcon(weatherCode, isNight);

    const min = Mintemp.find((item) => item.time === timeOfDay)?.value;
    minTemp.textContent = `${min}°C`;

    const max = MaxTemp.find((item) => item.time === timeOfDay)?.value;
    maxTemp.textContent = `${max}°C`;
  }
  tempInfo.appendChild(minTemp);
  tempInfo.appendChild(tempBar);
  tempInfo.appendChild(maxTemp);

  info.appendChild(day);
  info.appendChild(icon);
  info.appendChild(tempInfo);

  return info;
}

//顯示一週天氣資料
function displayWeekWeather(data, isNight = false) {
  const weatherContainer = document.querySelector(
    ".week_weather_info_container"
  );

  console.log(weatherContainer);
  //先清空容器
  weatherContainer.innerHTML = "";

  const { weatherElement } = data.result;
  console.log(weatherElement);

  //獲取一週的星期名稱
  const today = weatherElement[0].date;
  const dayNames = getWeekDayNames(today);

  weatherElement.forEach((data, index) => {
    const infoEL = createWeatherElement(data, dayNames[index], isNight);

    //如果是最一個元素，拿掉下底線
    if (index === weatherElement.length - 1) {
      infoEL.style.borderBottom = "none";
    }

    weatherContainer.appendChild(infoEL);
  });
}

// 顯示天氣資料
function displayWeather(dayData, weekData) {
  if (!dayData || !weekData) return;

  //Today Weather部分
  //擷取資料
  const { locationName, weatherElements } = dayData.result;

  const { date, weatherElement } = weatherElements[0];
  const [
    { avgTemp },
    { Mintemp },
    { MaxTemp },
    { avgPoP },
    { avgWS },
    { UVI },
    { Wx },
    { WeatherDescription },
  ] = weatherElement;

  console.log(avgPoP, avgWS, Wx, WeatherDescription);

  //計算目前是禮拜幾
  const dayOfWeek = getDayOfWeek(date);

  //顯示資料
  const locationEL = document.querySelector(".weather_location");
  const dateEL = document.querySelector(".weather_date");
  const weatherIconEL = document.querySelector(".weather_icon");
  const tempEL = document.querySelector(".weather_temp");
  const wxEL = document.querySelector(".weather_description");
  const windEL = document.querySelector(".weather_wind span");
  const rainEL = document.querySelector(".weather_rain span");

  locationEL.textContent = locationName;
  dateEL.textContent = `${date} ${dayOfWeek}`;

  //檢查 Wx陣列中的value是不是null，如果是null就顯示無資料
  const validWx = Wx.find((item) => item.value !== null)?.value || "無天氣資訊";
  wxEL.textContent = validWx;

  //動畫遞增溫度數字效果
  //轉成整數
  const avgTempValueInt = parseInt(avgTemp.value);
  animateValue(tempEL, 0, avgTempValueInt, 1000);

  windEL.textContent = `WIND |  ${avgWS.value} m/s`;
  rainEL.textContent = `RAIN |  ${avgPoP.value}%`;

  //用 Wx code與icon相對照
  //檢查 Wx陣列中的code是不是null，如果是null就顯示無資料
  const validWxCode = Wx.find((item) => item.code !== "None")?.code || "";
  console.log(validWxCode);
  weatherIconEL.data = getWeatherIcon(validWxCode);

  //顯示未來一週天氣
  displayWeekWeather(weekData);
}

//獲取今日天氣資料
async function fetchDayWeatherData(countyName) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/daily/forecast/${countyName}`
    );
    const results = await response.json();

    if (!response.ok) {
      throw new Error(results.message);
    }

    return results;
  } catch (error) {
    console.log("Error: ", error);
    return null;
  }
}

//獲取一週天氣資料
async function fetchWeekWeatherData(countyName) {
  console.log("一週：", countyName);
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/weekly/forecast/${countyName}`
    );
    const results = await response.json();
    console.log(results);

    if (!response.ok) {
      throw new Error(results.message);
    }

    return results;
  } catch (error) {
    console.log("Error: ", error);
    return null;
  }
}

// 匯出更新天氣資料
export async function updateWeatherForCounty(countyName) {
  console.log(countyName);
  const dayResult = await fetchDayWeatherData(defaultCity);
  const weekResult = await fetchWeekWeatherData(defaultCity);
  if (!result) return;
  displayWeather(dayResult, weekResult);
}

// 匯出初始化天氣頁面
export async function initWeather() {
  //初始化載入默認城市
  const defaultCity = "臺北市";
  const dayResult = await fetchDayWeatherData(defaultCity);
  const weekResult = await fetchWeekWeatherData(defaultCity);
  displayWeather(dayResult, weekResult);

  //監聽城市選擇事件(只有在手機版才會出現)
  const citySelector = document.querySelector(".city_selector");
  if (citySelector) {
    citySelector.addEventListener("change", async (e) => {
      const city = e.target.value;
      // const result = await fetchWeatherData(city);
      // if (result) {
      //   displayWeather(result);
      // }
    });
  }
}
