import React from "react";
import { Card } from "../components/ui/Card";

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 pt-28 pb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">
            Recent Scans
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            You have no recent scans. Go to the detection page to start tracking
            your crops.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">
            Local Weather
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Weather integration coming soon based on your location.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">
            Crop Alerts
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            No active alerts for diseases in your region.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
