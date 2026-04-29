import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

const Home = lazy(() => import("./pages/Home"));
const Prediction = lazy(() => import("./pages/Prediction"));
const History = lazy(() => import("./pages/History"));
const AgriBot = lazy(() => import("./pages/AgriBot"));
const About = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CropLibrary = lazy(() => import("./pages/CropLibrary"));
const Settings = lazy(() => import("./pages/Settings"));

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center flex-col items-center h-screen">
          <LoadingSpinner size="lg" />
          <p className="mt-4">Loading AgriVision...</p>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="predict" element={<Prediction />} />
          <Route path="history" element={<History />} />
          <Route path="chat" element={<AgriBot />} />
          <Route path="crops" element={<CropLibrary />} />
          <Route path="about" element={<About />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
