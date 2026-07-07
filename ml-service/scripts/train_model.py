import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
import xgboost as xgb
import joblib
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def load_and_preprocess_data(csv_path):
    print(" Loading data...")
    df = pd.read_csv(csv_path)
    print(f"   Loaded {len(df)} records")
    
    # Convert TotalCharges to numeric
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
    df['TotalCharges'] = df['TotalCharges'].fillna(0)
    
    # Create features
    df['HasPartner'] = (df['Partner'] == 'Yes').astype(int)
    df['HasDependents'] = (df['Dependents'] == 'Yes').astype(int)
    df['IsSenior'] = df['SeniorCitizen'].astype(int)
    df['IsMale'] = (df['gender'] == 'Male').astype(int)
    df['IsMonthToMonth'] = (df['Contract'] == 'Month-to-month').astype(int)
    df['IsOneYear'] = (df['Contract'] == 'One year').astype(int)
    df['IsTwoYear'] = (df['Contract'] == 'Two year').astype(int)
    df['HasOnlineSecurity'] = (df['OnlineSecurity'] == 'Yes').astype(int)
    df['HasTechSupport'] = (df['TechSupport'] == 'Yes').astype(int)
    df['HasOnlineBackup'] = (df['OnlineBackup'] == 'Yes').astype(int)
    df['HasDeviceProtection'] = (df['DeviceProtection'] == 'Yes').astype(int)
    df['HasStreamingTV'] = (df['StreamingTV'] == 'Yes').astype(int)
    df['HasStreamingMovies'] = (df['StreamingMovies'] == 'Yes').astype(int)
    df['HasFiberOptic'] = (df['InternetService'] == 'Fiber optic').astype(int)
    df['HasDSL'] = (df['InternetService'] == 'DSL').astype(int)
    df['HasPhoneService'] = (df['PhoneService'] == 'Yes').astype(int)
    df['HasMultipleLines'] = (df['MultipleLines'] == 'Yes').astype(int)
    df['ElectronicCheck'] = (df['PaymentMethod'] == 'Electronic check').astype(int)
    df['PaperlessBilling'] = (df['PaperlessBilling'] == 'Yes').astype(int)
    
    # Service count
    service_cols = ['PhoneService', 'MultipleLines', 'OnlineSecurity', 'OnlineBackup',
                   'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies']
    df['ServiceCount'] = 0
    for col in service_cols:
        df['ServiceCount'] += (df[col] == 'Yes').astype(int)
    df['HasInternetService'] = (df['InternetService'] != 'No').astype(int)
    df['ServiceCount'] += df['HasInternetService']
    
    # Average monthly spend per service
    df['SpendPerService'] = df['MonthlyCharges'] / (df['ServiceCount'] + 1)
    
    # Tenure groups
    df['Tenure_0_12'] = (df['tenure'] <= 12).astype(int)
    df['Tenure_13_24'] = ((df['tenure'] > 12) & (df['tenure'] <= 24)).astype(int)
    df['Tenure_25_48'] = ((df['tenure'] > 24) & (df['tenure'] <= 48)).astype(int)
    df['Tenure_49_plus'] = (df['tenure'] > 48).astype(int)
    
    # Target
    df['Churn'] = (df['Churn'] == 'Yes').astype(int)
    
    return df

def train_model(df):
    print("\n🤖 Training ML model...")
    
    feature_cols = [
        'tenure', 'MonthlyCharges', 'TotalCharges', 'ServiceCount',
        'SpendPerService', 'IsSenior', 'IsMale', 'HasPartner', 'HasDependents',
        'IsMonthToMonth', 'IsOneYear', 'HasOnlineSecurity', 'HasTechSupport',
        'HasOnlineBackup', 'HasDeviceProtection', 'HasStreamingTV',
        'HasStreamingMovies', 'HasFiberOptic', 'HasDSL', 'HasPhoneService',
        'HasMultipleLines', 'ElectronicCheck', 'PaperlessBilling',
        'Tenure_0_12', 'Tenure_13_24', 'Tenure_25_48'
    ]
    
    X = df[feature_cols]
    y = df['Churn']
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled = pd.DataFrame(X_scaled, columns=feature_cols)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"   Training set: {len(X_train)} samples")
    print(f"   Test set: {len(X_test)} samples")
    
    # Train with better parameters
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=len(y_train[y_train==0]) / len(y_train[y_train==1]),
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)
    
    print(f"\n Model Performance:")
    print(f"   Accuracy: {accuracy:.2%}")
    print(f"   ROC-AUC: {roc_auc:.2%}")
    print(f"\n   Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['No Churn', 'Churn']))
    
    # Feature importance
    importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n Top 10 Important Features:")
    for _, row in importance.head(10).iterrows():
        print(f"   {row['feature']}: {row['importance']:.3f}")
    
    return model, scaler, feature_cols, accuracy, roc_auc

def save_model(model, scaler, feature_cols, accuracy, roc_auc):
    print("\n Saving model...")
    
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    joblib.dump(model, os.path.join(models_dir, 'churn_model.pkl'))
    joblib.dump(scaler, os.path.join(models_dir, 'scaler.pkl'))
    joblib.dump({
        'feature_cols': feature_cols,
        'accuracy': accuracy,
        'roc_auc': roc_auc
    }, os.path.join(models_dir, 'model_metadata.pkl'))
    
    print(f"   All files saved to: {models_dir}")

def main():
    csv_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'server', 'data', 'Telco_Customer_Churn.csv'
    )
    
    if not os.path.exists(csv_path):
        print(f" CSV not found at: {csv_path}")
        sys.exit(1)
    
    print("=" * 50)
    print(" Telco Churn Prediction - Enhanced Model")
    print("=" * 50)
    
    df = load_and_preprocess_data(csv_path)
    model, scaler, feature_cols, accuracy, roc_auc = train_model(df)
    save_model(model, scaler, feature_cols, accuracy, roc_auc)
    
    print("\n✨ Training completed successfully!")

if __name__ == '__main__':
    main()