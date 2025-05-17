import React from "react";
import StatsSection from "../components/StatsSection";

const StatsPage = () => {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-6">Library Statistics</h1>
      <StatsSection />
    </div>
  );
};

export default StatsPage;
