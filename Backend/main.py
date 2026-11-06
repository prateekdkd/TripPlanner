import pandas as pd
import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel


model = joblib.load("packvote_model.pkl")
encoder = joblib.load("packvote_encoder.pkl")



app = FastAPI(
title="PackVote API",
description="Travel Cost Prediction API",
version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TripInput(BaseModel):
  trip_days: int
  destination_city: str
  traveler_count: int
  origin_city: str
  stay_preference: str
  season: str
  transport_mode: str
  approx_route_distance_km: float


@app.post("/predict")
def predict_trip(data: TripInput):

  input_df = pd.DataFrame([data.model_dump()])

  categorical_cols = [
    'origin_city',
    'destination_city',
    'stay_preference',
    'season',
    'transport_mode'
  ]

  numerical_cols = [
    'trip_days',
    'traveler_count',
    'approx_route_distance_km'
  ]

  input_cat = encoder.transform(input_df[categorical_cols])

  input_num = input_df[numerical_cols]

  input_final = np.hstack([
    input_num.to_numpy(),
    input_cat
])

  prediction = model.predict(input_final)

  return {
    "predicted_trip_cost": round(float(prediction[0]), 2),
    "currency": "INR"
  }

@app.get("/")
def home():
   return {
"message": "Welcome to PackVote API"
}