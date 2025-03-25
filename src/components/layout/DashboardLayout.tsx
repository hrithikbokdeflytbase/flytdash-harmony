
import React from 'react';
import Header from './Header';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background-bg">
      <Header title={title} />
      
      {/* Simple navigation bar */}
      <div className="bg-background-level-2 border-b border-outline-primary">
        <div className="max-w-screen-2xl mx-auto px-400 py-200 flex space-x-600">
          <Link 
            to="/" 
            className={cn(
              "text-text-icon-02 hover:text-text-icon-01 fb-body1-medium transition-colors",
              window.location.pathname === "/" && "text-primary-100 border-b-2 border-primary-100"
            )}
          >
            Dashboard
          </Link>
          <Link 
            to="/all-logs" 
            className={cn(
              "text-text-icon-02 hover:text-text-icon-01 fb-body1-medium transition-colors",
              window.location.pathname === "/all-logs" && "text-primary-100 border-b-2 border-primary-100"
            )}
          >
            All Logs
          </Link>
        </div>
      </div>
      
      <main className="min-h-screen pt-16">
        <div className="p-400 md:p-600 max-w-screen-2xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
