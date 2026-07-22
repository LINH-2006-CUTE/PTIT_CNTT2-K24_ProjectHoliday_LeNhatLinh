import React from 'react';
import ManagerNavbar from '../components/ManagerNavbar';
import EmployeeManagement from '../components/EmployeeManagement';

export default function ManagerEmployeesPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] font-sans">
      <ManagerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <EmployeeManagement />
      </main>
    </div>
  );
}
