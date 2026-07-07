import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Overview from './pages/Overview';
import Customers from './pages/Customers';
import ChurnAnalysis from './pages/ChurnAnalysis';
import Revenue from './pages/Revenue';
import Demographics from './pages/Demographics';
import Predictions from './pages/Predictions';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/churn" element={<ChurnAnalysis />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/demographics" element={<Demographics />} />
          <Route path="/predictions" element={<Predictions />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;