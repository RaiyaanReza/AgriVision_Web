import { Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/layout';
import Home from './pages/Home';
import Prediction from './pages/Prediction';
import History from './pages/History';
import AgriBot from './pages/AgriBot';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 md:pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/history" element={<History />} />
          <Route path="/chat" element={<AgriBot />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
