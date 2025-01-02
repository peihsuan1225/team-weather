from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime, timezone, timedelta
import requests
import json
from decimal import Decimal, ROUND_HALF_UP
import asyncio
import aiohttp

router = APIRouter()


def get_date(days_offset=0):
    tz = timezone(timedelta(hours=+8))
    date = datetime.now(tz) + timedelta(days=days_offset)
    return date.strftime('%Y-%m-%d')


def get_values(official_response, element_name):
    values = []
    for location in official_response["records"]["Locations"][0]["Location"]:
        for weatherElement in location["WeatherElement"]:
            if weatherElement["ElementName"] == element_name:
                for time in weatherElement["Time"]:
                    for elementValue in time["ElementValue"]:
                        if element_name == "最低溫度" and "MinTemperature" in elementValue:
                            values.append(elementValue["MinTemperature"])
                        elif element_name == "最高溫度" and "MaxTemperature" in elementValue:
                            values.append(elementValue["MaxTemperature"])
                        elif element_name == "天氣現象":
                            values.append(elementValue["Weather"])
                            values.append(elementValue["WeatherCode"])    
    if element_name == "天氣現象":
        if len(values) == 2:
            values.insert(0, None)
            values.insert(1, None)
    else:
        if len(values) == 1:
            values.insert(0, None)
    return values


def get_avg_value(official_response, element_name):
    values = []
    # special_process = ["風速", "紫外線指數", "天氣現象", "天氣預報綜合描述"]
    for location in official_response["records"]["Locations"][0]["Location"]:
        for weatherElement in location["WeatherElement"]:
            if weatherElement["ElementName"] == element_name:
                for time in weatherElement["Time"]:
                    for elementValue in time["ElementValue"]:
                        if element_name == "平均溫度" and "Temperature" in elementValue:
                            values.append(Decimal(elementValue["Temperature"]))
                        elif element_name == "最低溫度" and "MinTemperature" in elementValue:
                            values.append(Decimal(elementValue["MinTemperature"]))
                        elif element_name == "最高溫度" and "MaxTemperature" in elementValue:
                            values.append(Decimal(elementValue["MaxTemperature"]))
                        elif element_name == "12小時降雨機率" and "ProbabilityOfPrecipitation" in elementValue:
                            values.append(Decimal(elementValue["ProbabilityOfPrecipitation"]))
                        elif element_name == "風速" and "WindSpeed" in elementValue:
                            values.append(Decimal(elementValue["WindSpeed"]))
                        elif element_name == "紫外線指數" :
                            values.append(elementValue["UVIndex"])
                            values.append(elementValue["UVExposureLevel"])
                        elif element_name == "天氣現象":
                            values.append(elementValue["Weather"])
                            values.append(elementValue["WeatherCode"])
                        elif element_name == "天氣預報綜合描述" and "WeatherDescription" in elementValue:
                            values.append(elementValue["WeatherDescription"])
    if element_name in ["紫外線指數", "天氣現象", "天氣預報綜合描述"]:
        if len(values) == 2:
            values.insert(0, None)
            values.insert(1, None)
        elif len(values) == 1:
            values.insert(0, None)
        elif len(values) == 0:
            values.insert(0, None)
            values.insert(1, None)
        return values
    elif len(values) >= 2:
        value = sum(values) / len(values)
        rounded_value = value.quantize(Decimal('1.'), rounding=ROUND_HALF_UP)
        return int(rounded_value)
    elif len(values) == 1:
        value = Decimal(values[0])
        rounded_value = value.quantize(Decimal('1.'), rounding=ROUND_HALF_UP)
        return int(rounded_value)
    else:
        return None


async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()


async def get_official_response(day_offset, locationName, elements):
    date = get_date(days_offset=day_offset)
    timeFrom = date + "T00:00:00"
    timeTo = get_date(days_offset=day_offset + 1) + "T00:00:00"
    url = f'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=CWA-F75AC89B-4BC1-49EC-B310-A79E92016825&ElementName={elements}&LocationName={locationName}&timeFrom={timeFrom}&timeTo={timeTo}'

    async with aiohttp.ClientSession() as session:
        response_text = await fetch(session, url)
        # print("API Response Text:", response_text)

        return json.loads(response_text)


@router.get("/api/daily/forecast/{locationName}")
async def get_forecast(locationName: str):
    locationNames = ["新竹縣", "金門縣", "苗栗縣", "新北市", "宜蘭縣", "雲林縣", "臺南市", "高雄市", "彰化縣", "臺北市",
                     "南投縣", "澎湖縣", "基隆市", "桃園市", "花蓮縣", "連江縣", "臺東縣", "嘉義市", "嘉義縣", "屏東縣", "臺中市", "新竹市"]

    if locationName not in locationNames:
        result = {
            "error": True,
            "message": "locationName not exist"
        }
        return JSONResponse(content=result, status_code=400)
    try:
        # elements = "T,MinT,UVI,MaxT,PoP12h,Wx,WeatherDescription,WS"
        elements = "平均溫度,最低溫度,紫外線指數,最高溫度,12小時降雨機率,天氣現象,天氣預報綜合描述,風速"
        date = get_date()
        timeFrom = date + "T00:00:00"
        timeTo = get_date(days_offset=1) + "T00:00:00"
        url = f'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=CWA-F75AC89B-4BC1-49EC-B310-A79E92016825&ElementName={elements}&LocationName={locationName}&timeFrom={timeFrom}&timeTo={timeTo}'
        x = requests.get(url)
        official_response = json.loads(x.text)
        # print("Official Response:", official_response)

        avg_temp = get_avg_value(official_response, "平均溫度")
        min_temp = get_avg_value(official_response, "最低溫度")
        max_temp = get_avg_value(official_response, "最高溫度")
        avg_PoP = get_avg_value(official_response, "12小時降雨機率")
        avg_WS = get_avg_value(official_response, "風速")
        UVI = get_avg_value(official_response, "紫外線指數")
        Wx = get_avg_value(official_response, "天氣現象")
        WeatherDescription = get_avg_value(
            official_response, "天氣預報綜合描述")

        if UVI[0] == None:
            UVI[0] = UVI[0]
        else:
            UVI[0] = int(UVI[0])
        # print(avg_temp)
        # print(min_temp)
        # print(avg_PoP)
        # print(avg_WS)
        # print(UVI)
        # print(Wx)
        # print(WeatherDescription)

        response_data = {
            "result": {
                "locationName": locationName,
                "weatherElements": [
                    {
                        "date": date,
                        "weatherElement": [
                            {
                                "avgTemp": {
                                    "value": avg_temp,
                                    "measures": "攝氏度"
                                }
                            },
                            {
                                "Mintemp": {
                                    "value": min_temp,
                                    "measures": "攝氏度"
                                }
                            },
                            {
                                "MaxTemp": {
                                    "value": max_temp,
                                    "measures": "攝氏度"
                                }
                            },
                            {
                                "avgPoP": {
                                    "value": avg_PoP,
                                    "measures": "百分比"
                                }
                            },
                            {
                                "avgWS": {
                                    "value": avg_WS,
                                    "measures": "公尺/秒"
                                }
                            },

                            {
                                "UVI": [
                                    {
                                        "value": UVI[0],
                                        "measures": "紫外線指數"
                                    },
                                    {
                                        "value": str(UVI[1]),
                                        "measures": "曝曬級數"
                                    }
                                ]
                            },
                            {
                                "Wx": [
                                    {
                                        "time": "daytime",
                                        "value": Wx[0],
                                        "code": str(Wx[1])
                                    },
                                    {
                                        "time": "night",
                                        "value": Wx[2],
                                        "code": str(Wx[3])
                                    }
                                ]
                            },
                            {
                                "WeatherDescription": [
                                    {
                                        "time": "daytime",
                                        "value": WeatherDescription[0]
                                    },
                                    {
                                        "time": "night",
                                        "value": WeatherDescription[1]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
        response = JSONResponse(content=response_data, status_code=200)

    except Exception as e:
        response_data = {"error": True, "message": str(e)}
        response = JSONResponse(content=response_data, status_code=500)

    return response


@router.get("/api/weekly/forecast/{locationName}")
async def get_forecast(locationName: str):
    locationNames = ["新竹縣", "金門縣", "苗栗縣", "新北市", "宜蘭縣", "雲林縣", "臺南市", "高雄市", "彰化縣", "臺北市",
                     "南投縣", "澎湖縣", "基隆市", "桃園市", "花蓮縣", "連江縣", "臺東縣", "嘉義市", "嘉義縣", "屏東縣", "臺中市", "新竹市"]

    if locationName not in locationNames:
        result = {
            "error": True,
            "message": "locationName not exist"
        }
        return JSONResponse(content=result, status_code=400)
    try:
        elements = "最低溫度,最高溫度,天氣現象"
        response_data = {
            "result": {
                "locationName": locationName,
                "weatherElement": []
            }
        }

        tasks = [get_official_response(
            day_offset, locationName, elements) for day_offset in range(7)]
        responses = await asyncio.gather(*tasks)

        for day_offset, official_response in enumerate(responses):
            date = get_date(days_offset=day_offset)

            min_temp = get_values(official_response, "最低溫度")
            max_temp = get_values(official_response, "最高溫度")
            Wx = get_values(official_response, "天氣現象")

            if min_temp[0] == None:
                min_temp[0] = min_temp[0]
            else:
                min_temp[0] = int(min_temp[0])

            if max_temp[0] == None:
                max_temp[0] = max_temp[0]
            else:
                max_temp[0] = int(max_temp[0])

            response_data["result"]["weatherElement"].append(
                {
                    "date": date,
                    "weatherElement": [
                        {
                            "Mintemp": [
                                {
                                    "time": "daytime",
                                    "value": min_temp[0],
                                    "measures": "攝氏度"
                                },
                                {
                                    "time": "night",
                                    "value": int(min_temp[1]),
                                    "measures": "攝氏度"
                                }
                            ]
                        },
                        {
                            "MaxTemp": [
                                {
                                    "time": "daytime",
                                    "value": max_temp[0],
                                    "measures": "攝氏度"
                                },
                                {
                                    "time": "night",
                                    "value": int(max_temp[1]),
                                    "measures": "攝氏度"
                                }
                            ]
                        },
                        {
                            "Wx": [
                                {
                                    "time": "daytime",
                                    "value": Wx[0],
                                    "code": str(Wx[1])
                                },
                                {
                                    "time": "night",
                                    "value": Wx[2],
                                    "code": str(Wx[3])
                                }
                            ]
                        }
                    ]
                }
            )

        response = JSONResponse(content=response_data, status_code=200)

    except Exception as e:
        response_data = {"error": True, "message": str(e)}
        response = JSONResponse(content=response_data, status_code=500)

    return response
