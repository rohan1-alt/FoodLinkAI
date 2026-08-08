import joblib
import pandas as pd
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'urgency_model.joblib')

# Load the serialized model into memory once when the backend starts
try:
    urgency_model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    urgency_model = None
    print("Warning: Model not found. Run train_model.py first.")

def predict_urgency(hours_to_expiry: float, is_perishable: int, quantity_kg: float) -> float:
    """
    Takes strictly aligned inputs from the FastAPI backend and returns an urgency score.
    """
    if not urgency_model:
        raise ValueError("AI Model is not loaded.")
        
    # Format exactly as the Random Forest model expects
    features = pd.DataFrame([{
        'hours_to_expiry': hours_to_expiry,
        'is_perishable': is_perishable,
        'quantity_kg': quantity_kg
    }])
    
    prediction = urgency_model.predict(features)[0]
    return round(float(prediction), 2)