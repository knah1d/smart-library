import React from "react";
import UserSection from "../components/UserSection";

const UsersPage = () => {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UserSection />
    </div>
  );
};

export default UsersPage;
