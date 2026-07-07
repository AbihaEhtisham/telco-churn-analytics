require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Customer = require('../src/models/Customer');

const BATCH_SIZE = 1000;

async function seedDatabase() {
  try {
    console.log(' Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB');

    console.log('  Clearing existing data...');
    await Customer.deleteMany({});
    console.log(' Existing data cleared');

    const csvPath = path.join(__dirname, '..', 'data', 'Telco_Customer_Churn.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    console.log(' Reading CSV file...');
    
    const customers = [];
    let rowCount = 0;

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          
          // Calculate service count
          let serviceCount = 0;
          if (row.PhoneService === 'Yes') serviceCount++;
          if (row.MultipleLines === 'Yes') serviceCount++;
          if (row.InternetService !== 'No') serviceCount++;
          if (row.OnlineSecurity === 'Yes') serviceCount++;
          if (row.OnlineBackup === 'Yes') serviceCount++;
          if (row.DeviceProtection === 'Yes') serviceCount++;
          if (row.TechSupport === 'Yes') serviceCount++;
          if (row.StreamingTV === 'Yes') serviceCount++;
          if (row.StreamingMovies === 'Yes') serviceCount++;

          // Calculate risk score
          let riskScore = 0;
          if (row.Contract === 'Month-to-month') riskScore += 30;
          if (parseInt(row.tenure) < 12) riskScore += 25;
          if (serviceCount < 3) riskScore += 20;
          if (row.OnlineSecurity !== 'Yes') riskScore += 15;
          if (row.TechSupport !== 'Yes') riskScore += 10;

          // Determine segment
          let segment = 'New';
          if (row.Churn === 'Yes') {
            segment = 'Lost';
          } else if (parseInt(row.tenure) > 36 && serviceCount >= 5) {
            segment = 'High Value';
          } else if (parseInt(row.tenure) < 12 && row.Contract === 'Month-to-month') {
            segment = 'At Risk';
          } else if (parseInt(row.tenure) >= 12) {
            segment = 'Stable';
          }

          customers.push({
            customerId: row.customerID,
            demographics: {
              gender: row.gender,
              seniorCitizen: row.SeniorCitizen === '1',
              partner: row.Partner === 'Yes',
              dependents: row.Dependents === 'Yes'
            },
            account: {
              tenure: parseInt(row.tenure) || 0,
              contract: row.Contract,
              paperlessBilling: row.PaperlessBilling === 'Yes',
              paymentMethod: row.PaymentMethod,
              monthlyCharges: parseFloat(row.MonthlyCharges) || 0,
              totalCharges: parseFloat(row.TotalCharges) || 0
            },
            services: {
              phone: row.PhoneService === 'Yes',
              multipleLines: row.MultipleLines === 'Yes',
              internetService: row.InternetService || 'No',
              onlineSecurity: row.OnlineSecurity === 'Yes',
              onlineBackup: row.OnlineBackup === 'Yes',
              deviceProtection: row.DeviceProtection === 'Yes',
              techSupport: row.TechSupport === 'Yes',
              streamingTV: row.StreamingTV === 'Yes',
              streamingMovies: row.StreamingMovies === 'Yes'
            },
            metrics: {
              churn: row.Churn === 'Yes',
              churnRiskScore: Math.min(riskScore, 100),
              customerLifetimeValue: parseFloat(row.TotalCharges) || 0,
              serviceCount: serviceCount,
              segment: segment
            }
          });
        })
        .on('end', () => {
          console.log(`Parsed ${rowCount} customers from CSV`);
          resolve();
        })
        .on('error', reject);
    });

    // Insert in batches
    console.log(' Inserting into MongoDB...');
    for (let i = 0; i < customers.length; i += BATCH_SIZE) {
      const batch = customers.slice(i, i + BATCH_SIZE);
      await Customer.insertMany(batch);
      console.log(`   Progress: ${Math.min(i + BATCH_SIZE, customers.length)}/${customers.length}`);
    }

    // Summary
    const total = await Customer.countDocuments();
    const churned = await Customer.countDocuments({ 'metrics.churn': true });
    
    console.log('\n📈 Seed Summary:');
    console.log(`   Total Customers: ${total}`);
    console.log(`   Churned: ${churned} (${((churned/total)*100).toFixed(1)}%)`);
    console.log(`   Active: ${total - churned}`);

    await mongoose.connection.close();
    console.log('\n Database seed completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n Seed Error:', error.message);
    console.error(error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();