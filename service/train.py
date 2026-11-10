import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# dataset.csv: exportado desde tu BD (o vía un endpoint temporal en Node)
# columnas: daily_average, practice_average, exam_average, attendance_average,
#           trend, incident_count, overall_course_average, label (0=aprobó, 1=desaprobó)
df = pd.read_csv('dataset.csv')

X = df.drop(columns=['label'])
y = df['label']

# Los null se imputan con -1 (el modelo aprende que "sin nota aún" es distinto de "nota baja")
X = X.fillna(-1)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

model = RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42, class_weight='balanced')
model.fit(X_train, y_train)

print(classification_report(y_test, model.predict(X_test)))
print(confusion_matrix(y_test, model.predict(X_test)))

joblib.dump({'model': model, 'columns': list(X.columns), 'version': 'rf-v1'}, 'model.pkl')