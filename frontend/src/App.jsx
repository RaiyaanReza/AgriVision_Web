import { Routes, Route } from 'react-router-dom';
import { Navbar, Footer, MobileNav } from './components/layout';
import Home from './pages/Home';
import Prediction from './pages/Prediction';
import History from './pages/History';
import AgriBot from './pages/AgriBot';

function App() {
  return (
    <div className="min-h-screen bg-surface text-text-primary flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 md:pt-20 pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/history" element={<History />} />
          <Route path="/chat" element={<AgriBot />} />
        </Routes>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

export default App;
