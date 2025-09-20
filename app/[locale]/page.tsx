'use client';

import { useState, useEffect } from 'react';
import { Employee, DailySales } from '@/lib/types';
import EmployeeLogin from '@/components/EmployeeLogin';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [salesData, setSalesData] = useState<DailySales | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Restore logged-in employee from localStorage on component mount
  useEffect(() => {
    const savedEmployee = localStorage.getItem('currentEmployee');
    if (savedEmployee) {
      try {
        const employee = JSON.parse(savedEmployee);
        setCurrentEmployee(employee);
      } catch (error) {
        console.error('Error parsing saved employee:', error);
        localStorage.removeItem('currentEmployee');
      }
    }
  }, []);

  const loadInitialData = async () => {
    try {
      // Load employees
      const employeesResponse = await fetch('/api/employees');
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);
      }

      // Load sales data
      const salesResponse = await fetch('/api/sales');
      if (salesResponse.ok) {
        const salesDataResponse = await salesResponse.json();
        setSalesData(salesDataResponse);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setCurrentEmployee(employee);
    // Save selected employee to localStorage
    localStorage.setItem('currentEmployee', JSON.stringify(employee));
  };

  const handleLogout = () => {
    setCurrentEmployee(null);
    // Clear saved employee from localStorage
    localStorage.removeItem('currentEmployee');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4 shadow-[0_0_20px_#00ff00]"></div>
          <p className="text-green-300 font-mono text-glow">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <EmployeeLogin 
        employees={employees} 
        onEmployeeSelect={handleEmployeeSelect} 
      />
    );
  }

  if (!salesData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-mono text-glow animate-pulse">ERROR: خطأ في تحميل البيانات</p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      initialEmployees={employees}
      initialSalesData={salesData}
      currentEmployee={currentEmployee}
      onLogout={handleLogout}
    />
  );
}
