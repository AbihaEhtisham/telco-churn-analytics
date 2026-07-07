import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import xgboost as xgb
import joblib
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def load_and_preprocess_data(csv_path):
    print(" Loading data...")
    df = pd.read_csv(csv_path)
    print(f"   Loaded {len(df)} records")
    
    # Convert TotalCharges to numeric
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
    df['TotalCharges'] = df['TotalCharges'].fillna(0)
    
    # Encode categorical variables
    le = LabelEncoder()
    categorical_cols = ['gender', 'Partner', 'Dependents', 'PhoneService', 'MultipleLines',
                       'InternetService', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection',
                       'TechSupport', 'StreamingTV', 'StreamingMovies', 'Contract',
                       'PaperlessBilling', 'PaymentMethod']
    
    for col in categorical_cols:
        df[col + '_encoded'] = le.fit_transform(df[col])
    
    # Create features
    df['HasPartner'] = (df['Partner'] == 'Yes').astype(int)
    df['HasDependents'] = (df['Dependents'] == 'Yes').astype(int)
    df['IsSenior'] = df['SeniorCitizen'].astype(int)
    df['IsMonthToMonth'] = (df['Contract'] == 'Month-to-month').astype(int)
    df['HasOnlineSecurity'] = (df['OnlineSecurity'] == 'Yes').astype(int)
    df['HasTechSupport'] = (df['TechSupport'] == 'Yes').astype(int)
    df['HasFiberOptic'] = (df['InternetService'] == 'Fiber optic').astype(int)
    
    # Calculate service count
    service_cols = ['PhoneService', 'MultipleLines', 'OnlineSecurity', 'OnlineBackup',
                   'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies']
    df['ServiceCount'] = 0
    for col in service_cols:
        df['ServiceCount'] += (df[col] == 'Yes').astype(int)
    df['HasInternetService'] = (df['InternetService'] != 'No').astype(int)
    df['ServiceCount'] += df['HasInternetService']
    
    # Target variable
    df['Churn'] = (df['Churn'] == 'Yes').astype(int)
    
    return df

def train_model(df):
    print("\n Training ML model...")
    
    # Feature columns
    feature_cols = [
        'tenure', 'MonthlyCharges', 'TotalCharges', 'ServiceCount',
        'IsSenior', 'HasPartner', 'HasDependents', 'IsMonthToMonth',
        'HasOnlineSecurity', 'HasTechSupport', 'HasFiberOptic'
    ]
    
    X = df[feature_cols]
    y = df['Churn']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"   Training set: {len(X_train)} samples")
    print(f"   Test set: {len(X_test)} samples")
    
    # Train XGBoost model
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n Model Performance:")
    print(f"   Accuracy: {accuracy:.2%}")
    print(f"\n   Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['No Churn', 'Churn']))
    
    # Feature importance
    importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n Top 5 Important Features:")
    for _, row in importance.head().iterrows():
        print(f"   {row['feature']}: {row['importance']:.3f}")
    
    return model, feature_cols, accuracy

def save_model(model, feature_cols, accuracy):
    print("\n Saving model...")
    
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, 'churn_model.pkl')
    metadata_path = os.path.join(models_dir, 'model_metadata.pkl')
    
    joblib.dump(model, model_path)
    joblib.dump({
        'feature_cols': feature_cols,
        'accuracy': accuracy
    }, metadata_path)
    
    print(f"   Model saved to: {model_path}")
    print(f"   Metadata saved to: {metadata_path}")

def main():
    csv_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'server', 'data', 'Telco_Customer_Churn.csv'
    )
    
    if not os.path.exists(csv_path):
        print(f" CSV not found at: {csv_path}")
        sys.exit(1)
    
    print("=" * 50)
    print(" Telco Churn Prediction Model Training")
    print("=" * 50)
    
    df = load_and_preprocess_data(csv_path)
    model, feature_cols, accuracy = train_model(df)
    save_model(model, feature_cols, accuracy)
    
    print("\n✨ Model training completed successfully!")

if __name__ == '__main__':
    main()