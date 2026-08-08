import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

# Define the path to save the serialized model
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'urgency_model.joblib')

def generate_mock_data(num_samples=1000):
    """
    Generates realistic mock data for training the algorithm.
    Features:
    - hours_to_expiry: How many hours until the food goes bad (1 to 72)
    - is_perishable: 1 if it needs refrigeration (meat/dairy), 0 if shelf-stable
    - quantity_kg: Size of the donation (1 to 50 kg)
    """
    np.random.seed(42)
    
    hours_to_expiry = np.random.uniform(1, 72, num_samples)
    is_perishable = np.random.choice([0, 1], num_samples, p=[0.3, 0.7])
    quantity_kg = np.random.uniform(1, 50, num_samples)
    
    # Calculate target: urgency_score (0.0 to 1.0)
    # Higher urgency for perishable items and fewer hours to expiry
    urgency = (1.0 / (hours_to_expiry + 1)) * (1 + is_perishable * 1.5)
    
    # Normalize the score to strictly stay between 0.1 and 0.99
    urgency_score = np.interp(urgency, (urgency.min(), urgency.max()), (0.1, 0.99))
    
    return pd.DataFrame({
        'hours_to_expiry': hours_to_expiry,
        'is_perishable': is_perishable,
        'quantity_kg': quantity_kg,
        'urgency_score': urgency_score
    })

def train_and_serialize():
    print("Generating mock dataset...")
    df = generate_mock_data()
    
    X = df[['hours_to_expiry', 'is_perishable', 'quantity_kg']]
    y = df['urgency_score']
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X, y)
    
    print(f"Model accuracy (R^2 Score): {model.score(X, y):.4f}")
    
    # Create directory if it doesn't exist
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Serialize the model using joblib
    print(f"Serializing model to {MODEL_PATH}...")
    joblib.dump(model, MODEL_PATH)
    print("Phase 1 Complete: Model successfully saved!")

if __name__ == "__main__":
    train_and_serialize()