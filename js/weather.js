const testData = {
  result: {
    locationName: "新北市",
    weatherElement: [
      {
        date: "2024-07-16",
        avgTemp: {
          value: "29",
          measures: "攝氏度",
        },
        Mintemp: {
          value: "28",
          measures: "攝氏度",
        },
        MaxTemp: {
          value: "34",
          measures: "攝氏度",
        },
        avgPoP: {
          value: "20",
          measures: "百分比",
        },
        avgWS: [
          {
            value: "2",
            measures: "公尺/秒",
          },
          {
            value: "2",
            measures: "蒲福風級",
          },
        ],
        UVI: [
          {
            value: "11",
            measures: "紫外線指數",
          },
          {
            value: "危險級",
            measures: "曝曬級數",
          },
        ],
        Wx: [
          {
            time: "6-18",
            value: "多雲時晴",
          },
          {
            time: "18-6",
            value: "晴時多雲",
          },
        ],
        WeatherDescription: [
          {
            time: "6-18",
            value:
              "多雲時晴。降雨機率 20%。溫度攝氏28至36度。舒適至易中暑。偏北風 風速2級(每秒2公尺)。相對濕度61%。",
          },
          {
            time: "18-6",
            value:
              "晴時多雲。降雨機率 10%。溫度攝氏28至33度。舒適至悶熱。西南風 風速<= 1級(每秒2公尺)。相對濕度81%。",
          },
        ],
      },
      {
        date: "2024-07-17",
        weatherElement: [1, 2, 3],
      },
      {
        date: "2024-07-18",
        weatherElement: [1, 2, 3],
      },
      {
        date: "2024-07-19",
        weatherElement: [1, 2, 3],
      },
      {
        date: "2024-07-20",
        weatherElement: [1, 2, 3],
      },
      {
        date: "2024-07-21",
        weatherElement: [1, 2, 3],
      },
      {
        date: "2024-07-22",
        weatherElement: [1, 2, 3],
      },
    ],
  },
};

//天氣關鍵字與 icon對照
const weatherIconMapping = {
  // 晴空萬里
  1: "/asset/晴空萬里.svg",

  // 晴時多雲
  2: "/asset/晴時多雲.svg",
  3: "/asset/晴時多雲.svg",

  // 多雲時陰
  4: "/asset/多雲時陰.svg",
  5: "/asset/多雲時陰.svg",
  6: "/asset/多雲時陰.svg",
  7: "/asset/多雲時陰.svg",

  // 多雲短暫陣雨
  8: "/asset/多雲短暫陣雨.svg",
  9: "/asset/多雲短暫陣雨.svg",
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

function getWeatherIcon(weatherCode) {
  // 確保 weatherCode 是字符串，並去除空白
  const code = String(weatherCode).trim();

  // 直接查找映射
  if (weatherIconMapping[code]) {
    return weatherIconMapping[code];
  }

  // 如果都不匹配，返回默認icon
  console.error(`未找到匹配的天氣圖標代碼: ${code}`);
  return "/asset/多雲時陰.svg"; // 默認icon
}

//日期換算星期
function getDayOfWeek(date) {
  console.log(date);
  date = new Date(date);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
}

//動畫遞增溫度數字
//記得轉成整數
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 0.8);
    const currentValue = Math.round(progress * (end - start) + start);
    obj.textContent = `${currentValue}°C`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// 創建一週天氣元素
function createWeatherElement() {
  const container = document.createElement("div");
  const info = document.createElement("div");
  const day = document.createElement("span");
  const icon = document.createElement("img");

  const tempInfo = document.createElement("div");
  const minTemp = document.createElement("span");
  const tempBar = document.createElement("div");
  const maxTemp = document.createElement("span");

  container.classList.add("week_weather_info_container");
  info.classList.add("week_weather_info");
  day.classList.add("week_weather_info_day");
  icon.classList.add("week_weather_info_icon");
  tempInfo.classList.add("week_weather_info_temp");
  minTemp.classList.add("week_weather_info_temp_min");
  tempBar.classList.add("week_weather_info_temp_bar");
  maxTemp.classList.add("week_weather_info_temp_max");

  tempInfo.appendChild(minTemp);
  tempInfo.appendChild(tempBar);
  tempInfo.appendChild(maxTemp);

  info.appendChild(day);
  info.appendChild(icon);
  info.appendChild(tempInfo);

  container.appendChild(info);

  return container;
}

// 顯示天氣資料
function displayWeather(data) {
  if (!data) return;

  //Today Weather部分
  //擷取資料
  const { locationName, weatherElement } = data.result;
  const {
    date,
    avgTemp: { value: avgTempValue },
    avgPoP: { value: avgPoPValue },
    avgWS: [{ value: avgWSValue }],
    //要改成擷取編碼
    Wx: [{ value: wxDayValue }, { value: wxNightValue }],
  } = weatherElement[0];

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
  wxEL.textContent = wxDayValue;
  //動畫遞增溫度數字效果
  //轉成整數
  const avgTempValueInt = parseInt(avgTempValue);
  animateValue(tempEL, 0, avgTempValueInt, 1000);

  windEL.textContent = `WIND |  ${avgWSValue} m/s`;
  rainEL.textContent = `RAIN |  ${avgPoPValue}%`;

  //用 Wx值與icon相對照
  weatherIconEL.data = getWeatherIcon("11");

  //顯示未來一週天氣
  const weatherContainer = document.querySelectorAll(
    ".week_weather_info_and_rain_info_container"
  );

  const weekWeatherEL = createWeatherElement();
  console.log("元素:", weekWeatherEL);
}

//獲取天氣資料
async function fetchWeatherData(countyName) {
  try {
    const response = await fetch(`/api/forecast/${countyName}`);
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

// 匯出更新天氣資料
export async function updateWeatherForCounty(countyName) {
  console.log(countyName);
  const result = await fetchWeatherData(countyName);
  if (!result) return;
  displayWeather(result);
}

// 匯出初始化天氣頁面
export async function initWeather() {
  //初始化載入默認城市
  const defaultCity = "臺北市";
  if (state) {
    const result = await fetchWeatherData(defaultCity);
  } else {
    // const result = await fetchWeatherData(defaultCity);
  }

  displayWeather(testData);

  //監聽城市選擇事件(只有在手機版才會出現)
  const citySelector = document.querySelector(".city_selector");
  if (citySelector) {
    citySelector.addEventListener("change", async (e) => {
      const city = e.target.value;
      console.log(object);
      // const result = await fetchWeatherData(city);
      // if (result) {
      //   displayWeather(result);
      // }
    });
  }
}
