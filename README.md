# [第一觀測站](http://127.0.0.1:8000)

##### 第一觀測站是一個氣象觀測網站，提供各縣市即時及當週的天氣預報和 24 小時的降雨量資訊。請點擊連結查看我們的網站成果展示。

### 目錄

- [網站功能](#網站功能)
- [使用技術/資源](#使用技術)
- [團隊分工](#團隊分工)
- [資料來源](#資料來源)

---

### 網站功能

- 點擊地圖各縣市，呈現指定區域當日天氣及一週天氣預報
- hover 一週天氣圖示，可切換成當天夜晚天氣資訊
- 點擊 24 小時雨量按鈕，呈現指定區域各測站累積雨量
- 雨量資訊將同步顯示在地圖

---

### 使用技術

- 前後端分離開發
- 使用 Git Flow 掌控開發流程及版本控制
- 前端使用：HTML、CSS、JavaScript、D3 資源庫
- 後端使用：Python、FastAPI、MVC 模式檔案管理
- 使用 AWS EC2 部署網站

---

### 團隊分工

#### 前端開人員：

##### 組長 李映萱

- 視覺版面規劃設計
- 當日天氣與當週天氣日夜展示區塊
- 專案 Host 管理
- 與前端討論如何相互串接
- 與後端溝通 API 回傳資料格式
- README 文件共同撰寫

##### 王思穎

- 研究並使用 D3 資源庫
- 互動式台灣地圖
- 地圖動態顯示雨量
- 與前端討論如何相互串接
- 與後端溝通 API 回傳資料格式

##### 童俐

- 全台雨量展示區塊
- 天氣與雨量頁面轉換
- 與前端討論如何相互串接
- 與後端溝通 API 回傳資料格式
- 成果報告

#### 後端開發人員：

##### 周珮萱

- 串接中央氣象 API 並彙整資料
- 當日預報和當周預報的 API 設計與實現
- 與前端溝通 API 回傳資料格式
- 網站部署上線
- README 文件共同撰寫

##### 陳暐茗

- 串接中央氣象 API 並彙整資料
- 24 小時降雨量 API 的設計與實現
- 與前端溝通 API 回傳資料格式
- Discord Webhook 串接
- 成果報告

---

### 成果展示

---

### 資料來源

- [臺灣各鄉鎮市區預報資料 API](https://opendata.cwa.gov.tw/dist/opendata-swagger.html#/%E9%A0%90%E5%A0%B1/get_v1_rest_datastore_F_D0047_091)

- [自動雨量站資料 API](https://opendata.cwa.gov.tw/dist/opendata-swagger.html#/%E8%A7%80%E6%B8%AC/get_v1_rest_datastore_O_A0002_001)

---

如果有任何疑問或建議，歡迎聯繫我們。謝謝！
