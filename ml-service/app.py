from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load models
models_dir = os.path.join(os.path.dirname(__file__), 'models')

try:
    model = joblib.load(os.path.join(models_dir, 'churn_model.pkl'))
    scaler = joblib.load(os.path.join(models_dir, 'scaler.pkl'))
    metadata = joblib.load(os.path.join(models_dir, 'model_metadata.pkl'))
    feature_cols = metadata['feature_cols']
    model_accuracy = metadata['accuracy']
    roc_auc = metadata['roc_auc']
    print(f"✅ Model loaded (Accuracy: {model_accuracy:.2%}, ROC-AUC: {roc_auc:.2%})")
except Exception as e:
    print(f"⚠️  Model not loaded: {e}")
    model = None
    scaler = None
    feature_cols = None

def extract_features(data):
    features = {
        'tenure': int(data.get('tenure', 0)),
        'MonthlyCharges': float(data.get('monthlyCharges', 0)),
        'TotalCharges': float(data.get('totalCharges', 0)),
        'ServiceCount': int(data.get('serviceCount', 0)),
        'SpendPerService': float(data.get('monthlyCharges', 0)) / (int(data.get('serviceCount', 1)) + 1),
        'IsSenior': 1 if data.get('seniorCitizen') else 0,
        'IsMale': 1 if data.get('gender') == 'Male' else 0,
        'HasPartner': 1 if data.get('partner') else 0,
        'HasDependents': 1 if data.get('dependents') else 0,
        'IsMonthToMonth': 1 if data.get('contract') == 'Month-to-month' else 0,
        'IsOneYear': 1 if data.get('contract') == 'One year' else 0,
        'HasOnlineSecurity': 1 if data.get('onlineSecurity') else 0,
        'HasTechSupport': 1 if data.get('techSupport') else 0,
        'HasOnlineBackup': 1 if data.get('onlineBackup') else 0,
        'HasDeviceProtection': 1 if data.get('deviceProtection') else 0,
        'HasStreamingTV': 1 if data.get('streamingTV') else 0,
        'HasStreamingMovies': 1 if data.get('streamingMovies') else 0,
        'HasFiberOptic': 1 if data.get('internetService') == 'Fiber optic' else 0,
        'HasDSL': 1 if data.get('internetService') == 'DSL' else 0,
        'HasPhoneService': 1 if data.get('phone') else 0,
        'HasMultipleLines': 1 if data.get('multipleLines') else 0,
        'ElectronicCheck': 1 if data.get('paymentMethod') == 'Electronic check' else 0,
        'PaperlessBilling': 1 if data.get('paperlessBilling') else 0,
        'Tenure_0_12': 1 if int(data.get('tenure', 0)) <= 12 else 0,
        'Tenure_13_24': 1 if 12 < int(data.get('tenure', 0)) <= 24 else 0,
        'Tenure_25_48': 1 if 24 < int(data.get('tenure', 0)) <= 48 else 0
    }
    return features

def generate_recommendations(data, risk_score):
    recommendations = []
    
    if data.get('contract') == 'Month-to-month':
        recommendations.append({
            'action': 'Offer Annual Contract',
            'impact': 'Critical',
            'description': 'Month-to-month contracts have 3x higher churn. Offer discount for annual commitment.',
            'potentialSavings': f'${float(data.get("monthlyCharges", 0)) * 12:.2f}/year retained'
        })
    
    if not data.get('onlineSecurity'):
        recommendations.append({
            'action': 'Add Online Security',
            'impact': 'High',
            'description': 'Customers with online security are 40% less likely to churn.',
            'potentialSavings': 'Reduces churn probability by 15-20%'
        })
    
    if not data.get('techSupport'):
        recommendations.append({
            'action': 'Add Tech Support',
            'impact': 'High',
            'description': 'Tech support improves customer satisfaction and retention.',
            'potentialSavings': 'Reduces churn probability by 10-15%'
        })
    
    if int(data.get('serviceCount', 0)) < 3:
        recommendations.append({
            'action': 'Bundle Services Package',
            'impact': 'Medium',
            'description': 'Customers with 3+ services have 50% lower churn rates.',
            'potentialSavings': f'Bundle discount of 15% on additional services'
        })
    
    if not data.get('onlineBackup') and risk_score > 50:
        recommendations.append({
            'action': 'Offer Online Backup',
            'impact': 'Medium',
            'description': 'Data backup services increase stickiness and reduce churn.',
            'potentialSavings': 'Reduces churn probability by 8-12%'
        })
    
    return recommendations

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'accuracy': model_accuracy,
        'roc_auc': roc_auc
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        features = extract_features(data)
        
        # Create feature array and scale
        input_array = np.array([[features[col] for col in feature_cols]])
        input_scaled = scaler.transform(input_array)
        
        # Predict
        churn_prob = float(model.predict_proba(input_scaled)[0][1])
        risk_score = int(churn_prob * 100)
        
        # Risk level
        if risk_score >= 70:
            risk_level = 'High'
        elif risk_score >= 40:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'
        
        recommendations = generate_recommendations(data, risk_score)
        
        return jsonify({
            'success': True,
            'prediction': {
                'churnProbability': round(churn_prob * 100, 1),
                'riskScore': risk_score,
                'riskLevel': risk_level,
                'willChurn': risk_score >= 50,
                'confidence': round(max(churn_prob, 1 - churn_prob) * 100, 1),
                'recommendations': recommendations
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        customers = request.json.get('customers', [])
        results = []
        
        for customer in customers:
            features = extract_features(customer)
            input_array = np.array([[features[col] for col in feature_cols]])
            input_scaled = scaler.transform(input_array)
            churn_prob = float(model.predict_proba(input_scaled)[0][1])
            
            results.append({
                'customerId': customer.get('customerId'),
                'churnProbability': round(churn_prob * 100, 1),
                'riskScore': int(churn_prob * 100),
                'riskLevel': 'High' if churn_prob >= 0.7 else 'Medium' if churn_prob >= 0.4 else 'Low'
            })
        
        return jsonify({
            'success': True,
            'predictions': results,
            'summary': {
                'highRisk': len([r for r in results if r['riskLevel'] == 'High']),
                'mediumRisk': len([r for r in results if r['riskLevel'] == 'Medium']),
                'lowRisk': len([r for r in results if r['riskLevel'] == 'Low'])
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)