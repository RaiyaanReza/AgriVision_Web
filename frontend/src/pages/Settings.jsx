import React from "react";
import { Card } from "../components/ui/Card";

const Settings = () => {
  return (
    <div className="container mx-auto px-4 pt-28 pb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>
      <div className="max-w-2xl">
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Language
              </label>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                <option>English</option>
                <option>Bengali</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Theme
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Theme control is accessible from the top navigation bar.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
