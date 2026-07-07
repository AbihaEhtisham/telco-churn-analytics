from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import sys

app = Flask(__name__)
CORS(app)

# Load model
models_dir = os.path.join(os.path.dirname(__file__), 'models')
model_path = os.path.join(models_dir, 'churn_model.pkl')
metadata_path = os.path.join(models_dir, 'model_metadata.pkl')

model = None
feature_cols = None
model_accuracy = None

try:
    model = joblib.load(model_path)
    metadata = joblib.load(metadata_path)
    feature_cols = metadata['feature_cols']
    model_accuracy = metadata['accuracy']
    print(f" Model loaded (Accuracy: {model_accuracy:.2%})")
except Exception as e:
    print(f"  Model not found. Train first: python scripts/train_model.py")
    print(f"   Error: {e}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'accuracy': model_accuracy
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        
        # Extract features from customer data
        features = {
            'tenure': int(data.get('tenure', 0)),
            'MonthlyCharges': float(data.get('monthlyCharges', 0)),
            'TotalCharges': float(data.get('totalCharges', 0)),
            'ServiceCount': int(data.get('serviceCount', 0)),
            'IsSenior': 1 if data.get('seniorCitizen') else 0,
            'HasPartner': 1 if data.get('partner') else 0,
            'HasDependents': 1 if data.get('dependents') else 0,
            'IsMonthToMonth': 1 if data.get('contract') == 'Month-to-month' else 0,
            'HasOnlineSecurity': 1 if data.get('onlineSecurity') else 0,
            'HasTechSupport': 1 if data.get('techSupport') else 0,
            'HasFiberOptic': 1 if data.get('internetService') == 'Fiber optic' else 0
        }
        
        # Prepare input array
        input_array = np.array([[features[col] for col in feature_cols]])
        
        # Predict
        churn_prob = model.predict_proba(input_array)[0][1]
        churn_pred = bool(model.predict(input_array)[0])
        risk_score = int(churn_prob * 100)
        
        # Generate recommendations
        recommendations = []
        if features['IsMonthToMonth']:
            recommendations.append({
                'action': 'Offer Annual Contract',
                'impact': 'High',
                'description': 'Yearly contracts reduce churn by 65%'
            })
        if not features['HasOnlineSecurity']:
            recommendations.append({
                'action': 'Add Online Security',
                'impact': 'Medium',
                'description': 'Customers with online security are 40% less likely to churn'
            })
        if not features['HasTechSupport']:
            recommendations.append({
                'action': 'Add Tech Support',
                'impact': 'Medium',
                'description': 'Tech support users show higher retention'
            })
        if features['ServiceCount'] < 3:
            recommendations.append({
                'action': 'Bundle Services',
                'impact': 'High',
                'description': 'Customers with 3+ services have 50% lower churn'
            })
        
        return jsonify({
            'success': True,
            'prediction': {
                'willChurn': churn_pred,
                'churnProbability': round(churn_prob * 100, 1),
                'riskScore': risk_score,
                'riskLevel': 'High' if risk_score >= 70 else 'Medium' if risk_score >= 40 else 'Low',
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
            features = {
                'tenure': int(customer.get('tenure', 0)),
                'MonthlyCharges': float(customer.get('monthlyCharges', 0)),
                'TotalCharges': float(customer.get('totalCharges', 0)),
                'ServiceCount': int(customer.get('serviceCount', 0)),
                'IsSenior': 1 if customer.get('seniorCitizen') else 0,
                'HasPartner': 1 if customer.get('partner') else 0,
                'HasDependents': 1 if customer.get('dependents') else 0,
                'IsMonthToMonth': 1 if customer.get('contract') == 'Month-to-month' else 0,
                'HasOnlineSecurity': 1 if customer.get('onlineSecurity') else 0,
                'HasTechSupport': 1 if customer.get('techSupport') else 0,
                'HasFiberOptic': 1 if customer.get('internetService') == 'Fiber optic' else 0
            }
            
            input_array = np.array([[features[col] for col in feature_cols]])
            churn_prob = model.predict_proba(input_array)[0][1]
            
            results.append({
                'customerId': customer.get('customerId'),
                'churnProbability': round(churn_prob * 100, 1),
                'riskScore': int(churn_prob * 100)
            })
        
        return jsonify({
            'success': True,
            'predictions': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)