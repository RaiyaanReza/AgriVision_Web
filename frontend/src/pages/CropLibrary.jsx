import React from "react";
import { Card } from "../components/ui/Card";

const CropLibrary = () => {
  const dummyCrops = [
    "Tomato",
    "Potato",
    "Rice",
    "Corn",
    "Cabbage",
    "Cauliflower",
  ];

  return (
    <div className="container mx-auto px-4 pt-28 pb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Crop Knowledge Base
      </h1>
      <p className="mb-8 text-gray-700 dark:text-gray-300">
        Learn about common crops and how to identify and treat their diseases.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {dummyCrops.map((crop) => (
          <Card
            key={crop}
            className="p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              {/* Icon placeholder */}
              <span className="text-2xl text-green-600 dark:text-green-300">
                {crop[0]}
              </span>
            </div>
            <h3 className="font-semibold text-lg dark:text-white">{crop}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CropLibrary;
