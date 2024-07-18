import { showRainfall } from "./map.js";
import { showLoading, hideLoading } from "./weather.js";

function getRainData(cityName = "臺北市") {
  const url = `http://52.9.113.1:8001/api/rainfall/${encodeURIComponent(
    cityName
  )}`;

  showLoading();

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      hideLoading();

      console.log(data);
      const rainResult = document.querySelector("#rainResult");
      rainResult.innerHTML = "";

      const cityData = data.result.rainfall_data;

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
        const stationNames = data["result"]["rainfall_data"][0]["stations"];

        // Call showRainfall
        showRainfall(stationNames);
        console.log(stationNames);
      }
    })
    .catch((error) => {
      hideLoading();
      console.error("Error fetching data: ", error);
      return null;
    });
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
