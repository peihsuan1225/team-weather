from fastapi import *
from fastapi.middleware.cors import CORSMiddleware
from routes import forecast
from routes import rainfallAPI
app=FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(forecast.router)
app.include_router(rainfallAPI.router)
