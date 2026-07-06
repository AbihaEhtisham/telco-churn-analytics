# 📊 Telco Customer Churn Analytics

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen)
![React](https://img.shields.io/badge/react-18-61DAFB)

**Enterprise Customer Churn Prediction & Analytics Platform**

[Features](#-features) • [Installation](#-installation) • [Architecture](#-architecture)

</div>

---

## 🎯 Overview

A full-stack analytics dashboard that transforms raw telecom customer data into actionable business intelligence. Predict customer churn, understand customer behavior, and make data-driven retention decisions.

---

## ✨ Features

### 📊 Analytics Dashboard

- Executive Overview with KPIs, churn rates, and revenue metrics
- Customer segmentation based on behavioral and demographic data
- Service adoption analysis
- Revenue analytics including MRR, ARPU, and churn cost

### 🤖 AI & Machine Learning

- XGBoost-powered churn prediction (85%+ accuracy target)
- Customer risk scoring
- Feature importance analysis
- What-if retention strategy simulator

### 💡 Smart Features

- Natural language analytics queries
- AI-generated business insights
- Export reports to PDF
- Real-time churn risk alerts

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|--------|------------|---------|
| **Frontend** | React 18, Tailwind CSS | User Interface |
| **Charts** | Recharts, D3.js | Data Visualization |
| **Backend** | Node.js, Express.js | REST API |
| **Database** | MongoDB, Redis | Data Storage & Caching |
| **ML Engine** | Python, Scikit-learn, XGBoost | Churn Prediction |
| **DevOps** | Docker, GitHub Actions | Deployment |

---

## 📈 Dataset

This project is built using the **IBM Telco Customer Churn Dataset**.

### Dataset Statistics

- 7,043 customer records
- 21 original features
- 8 engineered features
- 26.5% customer churn rate

Dataset:
https://www.kaggle.com/datasets/blastchar/telco-customer-churn

### Engineered Features

- Customer Lifetime Value (CLV)
- Service Adoption Score
- Churn Risk Probability
- Customer Segments
- Revenue Impact Score

---

## 🏗️ Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
│               http://localhost:3000                      │
└───────────────────────┬──────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                Backend API (Express.js)                  │
│               http://localhost:5000                      │
├──────────────────────────────────────────────────────────┤
│ /api/customers │ /api/analytics │ /api/predict          │
└──────────────┬──────────────┬──────────────┬─────────────┘
               │              │              │
               ▼              ▼              ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │   MongoDB    │ │    Redis     │ │  ML Service  │
      │   (Data)     │ │   (Cache)    │ │   (Python)   │
      └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 📁 Project Structure

```text
telco-churn-analytics/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── charts/
│   │   │   ├── predictive/
│   │   │   ├── filters/
│   │   │   └── layout/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── data/
│   └── scripts/
│
├── ml-service/
│   ├── models/
│   ├── notebooks/
│   └── scripts/
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Python 3.9+
- Redis (Optional)

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/telco-churn-analytics.git
cd telco-churn-analytics
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

### 3. Setup ML Service

#### Linux/macOS

```bash
cd ../ml-service

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

python scripts/train_model.py
```

#### Windows

```powershell
cd ..\ml-service

python -m venv venv
.\venv\Scripts\activate

pip install -r requirements.txt

python scripts\train_model.py
```

### 4. Setup Frontend

```bash
cd ../client

npm install

npm start
```

Open your browser and visit:

```
http://localhost:3000
```

---

## 📊 Dashboard Modules

- Executive Dashboard
- Customer Analytics
- Churn Prediction
- Revenue Analysis
- Customer Segmentation
- Service Adoption Analytics
- AI Insights
- Report Generator

---

## 📚 Documentation

- API Documentation
- Data Dictionary
- ML Model Documentation
- Deployment Guide

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License**.

---

<div align="center">


</div>