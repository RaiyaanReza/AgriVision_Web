import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

const Home = lazy(() => import("./pages/Home"));
const Treatments = lazy(() => import("./pages/Treatments"));
const History = lazy(() => import("./pages/History"));
const About = lazy(() => import("./pages/About"));

function App() {
  return (
    <Suspense fallback={<div className="flex justify-center flex-col items-center h-screen"><LoadingSpinner size="lg" /><p className="mt-4">Loading AgriVision...</p></div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="treatments" element={<Treatments />} />
          <Route path="history" element={<History />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
