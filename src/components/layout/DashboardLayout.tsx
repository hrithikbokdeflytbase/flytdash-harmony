
import React from 'react';
import Header from './Header';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, FileText } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div className="min-h-screen bg-background-bg">
      <Header title={title} />
      
      {/* Segmented Navigation */}
      <div className="bg-background-level-2 border-b border-outline-primary sticky top-16 z-10">
        <div className="max-w-screen-2xl mx-auto px-400 py-300">
          <Tabs value={currentPath === "/" ? "/" : "/all-logs"} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-10 p-0.5 rounded-md bg-background-level-3/80 border border-outline-primary">
              <TabsTrigger value="/" asChild className="data-[state=active]:bg-background-level-2 data-[state=active]:shadow-none transition-colors">
                <Link to="/" className="flex items-center justify-center gap-2 h-full">
                  <Home className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              </TabsTrigger>
              <TabsTrigger value="/all-logs" asChild className="data-[state=active]:bg-background-level-2 data-[state=active]:shadow-none transition-colors">
                <Link to="/all-logs" className="flex items-center justify-center gap-2 h-full">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">All Logs</span>
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
