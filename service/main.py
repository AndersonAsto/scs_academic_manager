from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()
bundle = joblib.load('model.pkl')
model = bundle['model']
columns = bundle['columns']

class Features(BaseModel):
    daily_average: float | None
    practice_average: float | None
    exam_average: float | None
    attendance_average: float | None
    trend: float | None
    cumulative_average: float | None
    incident_count: int

@app.post('/predict')
def predict(features: Features):
    row = pd.DataFrame([features.dict()])[columns].fillna(-1)
    classes = list(model.classes_)

    if len(classes) == 1:
        # El modelo nunca vio ambas clases durante el entrenamiento —
        # no puede distinguir riesgo, solo replica la única clase que conoce.
        probability = 1.0 if classes[0] == 1 else 0.0
    else:
        risk_index = classes.index(1)
        probability = float(model.predict_proba(row)[0][risk_index])

    if probability >= 0.66:
        risk_level = 'Alto'
    elif probability >= 0.33:
        risk_level = 'Medio'
    else:
        risk_level = 'Bajo'

    return {
        'probability': round(probability, 4),
        'risk_level': risk_level,
        'model_version': bundle['version'],
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8001)