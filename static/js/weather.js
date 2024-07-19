// 獲取當前網址
const currentURL = window.location.origin;

//preload圖片
function preloadTodayWeatherIcon(iconId) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = `/static/asset/${iconId}.svg`;
  link.as = "image";
  document.head.appendChild(link);
}

//天氣關鍵字與 icon對照
const weatherIconMapping = {
  // 晴空萬里
  "01": "/static/asset/晴空萬里.svg",

  // 晴時多雲
  "02": "/static/asset/晴時多雲.svg",
  "03": "/static/asset/晴時多雲.svg",

  // 多雲時陰
  "04": "/static/asset/多雲時陰.svg",
  "05": "/static/asset/多雲時陰.svg",
  "06": "/static/asset/多雲時陰.svg",
  "07": "/static/asset/多雲時陰.svg",

  // 多雲短暫陣雨
  "08": "/static/asset/多雲短暫陣雨.svg",
  "09": "/static/asset/多雲短暫陣雨.svg",
  10: "/static/asset/多雲短暫陣雨.svg",

  // 晴短暫陣雨
  11: "/static/asset/晴短暫陣雨.svg",
  12: "/static/asset/晴短暫陣雨.svg",
  13: "/static/asset/晴短暫陣雨.svg",
  14: "/static/asset/晴短暫陣雨.svg",

  // 雷陣雨
  15: "/static/asset/晴午後短暫雷陣雨.svg",
  16: "/static/asset/晴午後短暫雷陣雨.svg",
  17: "/static/asset/晴午後短暫雷陣雨.svg",
  18: "/static/asset/晴午後短暫雷陣雨.svg",

  // 晴午後短暫雷陣雨
  19: "/static/asset/晴午後短暫雷陣雨.svg",
  20: "/static/asset/晴午後短暫雷陣雨.svg",
  21: "/static/asset/晴午後短暫雷陣雨.svg",
  22: "/static/asset/晴午後短暫雷陣雨.svg",
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
  return "/static/asset/多雲時陰.svg"; // 默認icon
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

//根據溫度範圍變化溫度數字顏色
function getColorForTemp(value) {
  let r, g, b;
  if (value < 20) {
    // 低溫範圍：藍色到綠色
    r = 0;
    g = Math.floor((100 * (20 - value)) / 20);
    b = Math.floor((200 * (20 - value)) / 20);
  } else if (value <= 30) {
    // 中溫範圍：綠色到黃色
    r = Math.floor((200 * (value - 20)) / 10);
    g = Math.floor((100 * (30 - value)) / 10);
    b = 0;
  } else {
    // 高溫：過渡到指定的紅色 (R173, G83, B73)
    const transition = Math.min((value - 30) / 10, 1); // 10度内完成過渡
    r = Math.floor(200 + (173 - 200) * transition);
    g = Math.floor(83 * transition);
    b = Math.floor(73 * transition);
  }
  return `rgb(${r}, ${g}, ${b})`;
}

//把顏色套用進溫度數字
const applyTemperatureColor = (element, temperature) => {
  const color = getColorForTemp(temperature);
  element.style.color = color;
};

//動畫遞增溫度數字
//記得轉成整數
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = Math.round(progress * (end - start) + start);
    obj.textContent = `${currentValue}°C`;

    //更新顏色
    const color = getColorForTemp(currentValue);
    obj.style.color = color;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      // 確保最終值和顏色是正確的
      obj.textContent = `${end}°C`;
      obj.style.color = getColorForTemp(end);
    }
  };
  window.requestAnimationFrame(step);
}

//檢查資料可不可用
function checkData(Mintemp, MaxTemp, Wx) {
  const daytimeData = {
    min: Mintemp.find((item) => item.time === "daytime")?.value,
    max: MaxTemp.find((item) => item.time === "daytime")?.value,
    weatherCode: Wx.find((item) => item.time === "daytime")?.code,
  };

  const nightData = {
    min: Mintemp.find((item) => item.time === "night")?.value,
    max: MaxTemp.find((item) => item.time === "night")?.value,
    weatherCode: Wx.find((item) => item.time === "night")?.code,
  };

  const hasDaytimeData =
    daytimeData.min !== null &&
    daytimeData.max !== null &&
    daytimeData.weatherCode !== null;
  const hasNightData =
    nightData.min !== null &&
    nightData.max !== null &&
    nightData.weatherCode !== null;

  if (!hasDaytimeData && !hasNightData) {
    return null;
  }

  return { hasDaytimeData, hasNightData };
}

// 創建一週天氣元素
function createWeatherElement(data, dayName, isNight, isToday) {
  //整理資料
  const { date, weatherElement } = data;
  const [{ Mintemp }, { MaxTemp }, { Wx }] = weatherElement;

  //檢查資料可不可用
  const dataAvailability = checkData(Mintemp, MaxTemp, Wx);
  if (!dataAvailability) {
    console.log(`${dayName} 的數據不可用`);
    return null;
  }

  // const container = document.createElement("div");
  const info = document.createElement("div");
  const day = document.createElement("span");
  const icon = document.createElement("img");

  const tempInfo = document.createElement("div");
  const minTemp = document.createElement("span");
  const tempBar = document.createElement("div");
  const maxTemp = document.createElement("span");

  // container.classList.add("week_weather_info_container");
  info.classList.add("week_weather_info");
  day.classList.add("week_weather_info_day");
  icon.classList.add("week_weather_info_icon");
  tempInfo.classList.add("week_weather_info_temp");
  minTemp.classList.add("week_weather_info_temp_min");
  tempBar.classList.add("week_weather_info_temp_bar");
  maxTemp.classList.add("week_weather_info_temp_max");

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

  if (isToday) {
    if (dataAvailability.hasDaytimeData && dataAvailability.hasNightData) {
      setWeather(false);
      info.addEventListener("mouseenter", () => setWeather(true));
      info.addEventListener("mouseleave", () => setWeather(false));
    } else if (dataAvailability.hasDaytimeData) {
      setWeather(false);
    } else if (dataAvailability.hasNightData) {
      setWeather(true);
    }
  } else {
    setWeather(false);
    info.addEventListener("mouseenter", () => setWeather(true));
    info.addEventListener("mouseleave", () => setWeather(false));
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

  //先清空容器
  weatherContainer.innerHTML = "";

  const { weatherElement } = data.result;

  //獲取一週的星期名稱
  const today = weatherElement[0].date;
  const dayNames = getWeekDayNames(today);

  weatherElement.forEach((data, index) => {
    const isToday = index === 0;
    const infoEL = createWeatherElement(
      data,
      dayNames[index],
      isNight,
      isToday
    );

    if (infoEL) {
      //如果是最一個元素，拿掉下底線
      if (index === weatherElement.length - 1) {
        infoEL.style.borderBottom = "none";
      }

      weatherContainer.appendChild(infoEL);
    }
  });
}

// 顯示天氣資料
function displayWeather(dayData, weekData) {
  const todayContainer = document.querySelector("#today_weather");
  // 檢查 todayContainer 是否存在
  if (!todayContainer) {
    console.error("Cannot find .today_weather element");
    return; // 如果元素不存在，提前退出函數
  }

  // 檢查資料是否存在
  if (!dayData || !weekData) {
    todayContainer.textContent = "暫無天氣資料";
    return;
  }

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
  const infoContainer = document.querySelector(".weather_temp_and_info");
  infoContainer.style.display = "flex";

  locationEL.textContent = locationName;
  dateEL.textContent = `${date} ${dayOfWeek}`;

  const validWxItem = Wx.find(
    (item) => item.value !== null && item.code !== "None"
  );
  let validWx, validWxCode, validWxTime, isNight;

  if (validWxItem) {
    validWx = validWxItem.value;
    validWxCode = validWxItem.code;
    isNight = validWxItem.time === "night";
    validWxTime = isNight ? "晚上" : "白天";
  }

  wxEL.textContent = validWx;

  //動畫遞增溫度數字效果
  //轉成整數
  const avgTempValueInt = parseInt(avgTemp.value);
  animateValue(tempEL, 0, avgTempValueInt, 1000);

  windEL.textContent = `WIND |  ${avgWS.value} m/s`;
  rainEL.textContent = `RAIN |  ${avgPoP.value}%`;

  //用 Wx code與icon相對照
  weatherIconEL.data = getWeatherIcon(validWxCode, isNight);

  //顯示未來一週天氣
  displayWeekWeather(weekData);
}

//loading動畫
function showLoading() {
  const loadingContainer = document.querySelector(".loader");
  loadingContainer.style.display = "block";
}

function hideLoading() {
  const loadingContainer = document.querySelector(".loader");
  loadingContainer.style.display = "none";
}

const CACHE_EXPIRY = 30 * 60 * 1000; // 30分鐘後失效

//清空過期的快取
function cleanExpiredCache() {
  const now = Date.now();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("weather_")) {
      try {
        const cached = JSON.parse(localStorage.getItem(key));
        if (now - cached.timestamp > CACHE_EXPIRY) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error("Error parsing cached data:", error);
        localStorage.removeItem(key);
      }
    }
  }
}

// 從 localStorage獲取點擊過的縣市的資料
function getFromCache(key) {
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      } else {
        localStorage.removeItem(key); // 移除過期數據
      }
    } catch (error) {
      console.error("Error parsing cached data:", error);
      localStorage.removeItem(key); // 移除無效數據
    }
  }
  return null;
}

function setToCache(key, data) {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

// 合併獲取今日和一週天氣資料，並使用 localStorage快取
async function fetchWeatherData(countyName) {
  cleanExpiredCache(); // 清理過期快取
  const cacheKey = `weather_${countyName}`;
  const cachedData = getFromCache(cacheKey);

  if (cachedData) {
    console.log("使用快取的天氣數據:", countyName);
    return cachedData;
  }

  try {
    const [dayResponse, weekResponse] = await Promise.all([
      fetch(`http://52.9.113.1:8001/api/daily/forecast/${countyName}`),
      fetch(`http://52.9.113.1:8001/api/weekly/forecast/${countyName}`),
    ]);

    const dayResults = await dayResponse.json();
    const weekResults = await weekResponse.json();

    if (!dayResponse.ok) {
      const todayContainer = document.querySelector("#today_weather");
      todayContainer.classList.add("weather_error");
      todayContainer.textContent = "暫無天氣資料";
      throw new Error(dayResults.message || "獲取日天氣數據失敗");
    }

    if (!weekResponse.ok) {
      throw new Error(weekResults.message || "獲取週天氣數據失敗");
    }

    const weatherData = { dayData: dayResults, weekData: weekResults };
    setToCache(cacheKey, weatherData);

    return weatherData;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// 匯出更新天氣資料
async function updateWeatherForCounty(countyName) {
  showLoading();
  const weatherContainer = document.querySelector(
    ".week_weather_info_container"
  );
  weatherContainer.innerHTML = "";

  const weatherData = await fetchWeatherData(countyName);

  if (weatherData) {
    const { dayData, weekData } = weatherData;
    console.log("顯示天氣數據 - 日天氣:", dayData);
    console.log("顯示天氣數據 - 週天氣:", weekData);
    displayWeather(dayData, weekData);
  } else {
    console.error("無法獲取天氣數據");
    // 可以在這裡添加錯誤處理的UI邏輯
  }

  hideLoading();
}

export { updateWeatherForCounty, showLoading, hideLoading };
