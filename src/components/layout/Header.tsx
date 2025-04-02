import React from 'react';
import { User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
interface HeaderProps {
  title: string;
  className?: string;
}
const Header = ({
  title,
  className
}: HeaderProps) => {
  return <header className={cn("w-full h-16 bg-background-level-2 border-b border-outline-primary flex items-center justify-between px-400 lg:px-600", "shadow-sm fixed top-0 left-0 right-0 z-10 transition-all duration-300 ease-in-out", className)}>
      <div className="flex items-center space-x-400">
        <div className="flex items-center space-x-300">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 bg-primary-200 rounded-full flex items-center justify-center">
              <span className="text-text-icon-01 font-semibold text-lg">F</span>
            </div>
          </div>
          <span className="fb-title1-medium tracking-tight text-primary-100 hidden sm:inline-block">
            FlytBase
          </span>
        </div>
        
        <div className="hidden md:block h-6 w-px bg-outline-primary mx-200"></div>
        
        <h1 className="fb-title1-semi text-text-icon-01 hidden sm:block animate-fade-in">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center space-x-300">
        
        
        <div className="h-8 w-px bg-outline-primary mx-100 hidden sm:block"></div>
        
        <button className="flex items-center space-x-300 p-100 rounded-full hover:bg-surface-states-hover transition-colors">
          <div className="w-8 h-8 rounded-full bg-secondary-300 flex items-center justify-center">
            <User className="w-4 h-4 text-text-icon-01" />
          </div>
          <span className="text-text-icon-01 fb-body1-medium hidden sm:block">Admin</span>
        </button>
      </div>
    </header>;
};
export default Header;