from fastapi import FastAPI, APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import httpx
import asyncio
import math
#四捨五入用


router = APIRouter()
class Station(BaseModel):
    StationName: str
    Past24hr_rainfall: int
    StationLatitude: float
    StationLongitude: float

class CountyData(BaseModel):
    countryName: str
    stations: List[Station]

class RainfallData(BaseModel):
    rainfall_data: List[CountyData]
class ResultResponse(BaseModel):
    result: RainfallData

valid_locations = [
    '新竹縣', '金門縣', '苗栗縣', '新北市', '宜蘭縣', '雲林縣', '臺南市', '高雄市', 
    '彰化縣', '臺北市', '南投縣', '澎湖縣', '基隆市', '桃園市', '花蓮縣', '連江縣', 
    '臺東縣', '嘉義市', '嘉義縣', '屏東縣', '臺中市', '新竹市'
]

def validate_location(location_name: str):
    if location_name not in valid_locations:
        raise HTTPException(status_code=403, detail={
            "error": True,
            "message": "locationName not exist"
        })
    return location_name

async def get_data(location_name: str):
    url = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0002-001"
    params = {
        "Authorization": "CWA-F75AC89B-4BC1-49EC-B310-A79E92016825",
        "RainfallElement": "Past24hr",
        "GeoInfo": "Coordinates,CountyName"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()
    
    stations = []
    for station in data['records']['Station']:
        if station['GeoInfo']['CountyName'] == location_name:
            precipitation = station['RainfallElement']['Past24hr']['Precipitation']
            # 使用 math.floor 四捨五入
            rounded_rainfall = math.floor(precipitation + 0.5)
            stations.append(Station(
                StationName=station['StationName'],
                Past24hr_rainfall=rounded_rainfall,
                StationLatitude=station['GeoInfo']['Coordinates'][0]['StationLatitude'],
                StationLongitude=station['GeoInfo']['Coordinates'][0]['StationLongitude']
            ))
    
    return CountyData(countryName=location_name, stations=stations)

@router.get("/api/rainfall/{location_name}", response_model=ResultResponse)
async def get_rainfall(location_name: str = Depends(validate_location)):
    rainfall_data = await get_data(location_name)
    return ResultResponse(result=RainfallData(rainfall_data=[rainfall_data]))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

