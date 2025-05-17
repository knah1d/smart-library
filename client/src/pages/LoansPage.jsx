import React from "react";
import LoanSection from "../components/LoanSection";

const LoansPage = () => {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-6">Loan Management</h1>
      <LoanSection />
    </div>
  );
};

export default LoansPage;
