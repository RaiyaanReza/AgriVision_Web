import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAppStore } from "../../store/useAppStore";

const Layout = () => {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen bg-agri-bg text-slate-800 dark:bg-agri-bg-dark dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700",
        }}
      />
    </div>
  );
};

export default Layout;
