
import React from 'react';
import { 
  Home, 
  FileText, 
  BarChart2, 
  Settings, 
  Map, 
  Layers, 
  Cpu, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false,
  hasSubmenu = false
}: { 
  icon: React.ElementType; 
  label: string; 
  active?: boolean;
  hasSubmenu?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-300 py-200 rounded-150 transition-all duration-200 cursor-pointer",
        active 
          ? "bg-surface-states-selected-n text-primary-100" 
          : "hover:bg-surface-states-hover text-text-icon-02 hover:text-text-icon-01"
      )}
    >
      <div className="flex items-center space-x-300">
        <Icon className="w-5 h-5" />
        <span className="fb-body1-medium">{label}</span>
      </div>
      {hasSubmenu && <ChevronRight className="w-4 h-4" />}
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  // Handle clicks outside the sidebar on mobile to close it
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest('[data-sidebar]')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-others-scrim z-20 lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        data-sidebar
        className={cn(
          "fixed top-16 bottom-0 left-0 w-64 bg-background-level-1 border-r border-outline-primary z-30",
          "transition-transform duration-300 ease-in-out transform-gpu",
          "lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex-1 overflow-y-auto py-400 px-200 space-y-200">
          <div className="px-300 py-200">
            <h2 className="fb-body4-medium uppercase text-text-icon-02 tracking-wider">Main</h2>
          </div>
          
          <SidebarItem icon={Home} label="Dashboard" />
          <SidebarItem icon={FileText} label="Report Generator" active={true} />
          <SidebarItem icon={BarChart2} label="Analytics" />
          
          <div className="mt-600 mb-300 px-300 py-200">
            <h2 className="fb-body4-medium uppercase text-text-icon-02 tracking-wider">Operations</h2>
          </div>
          
          <SidebarItem icon={Map} label="Flight Planning" hasSubmenu />
          <SidebarItem icon={Layers} label="Data Management" hasSubmenu />
          <SidebarItem icon={Cpu} label="Drone Fleet" hasSubmenu />
          <SidebarItem icon={AlertCircle} label="Alerts" />
          
          <div className="mt-600 mb-300 px-300 py-200">
            <h2 className="fb-body4-medium uppercase text-text-icon-02 tracking-wider">System</h2>
          </div>
          
          <SidebarItem icon={Settings} label="Settings" />
        </div>
        
        <div className="p-400 border-t border-outline-primary">
          <div className="flybase-card p-300 bg-opacity-50">
            <div className="flex items-center space-x-300">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-container-info">
                <Cpu className="w-4 h-4 text-info-200" />
              </div>
              <div className="flex-1">
                <p className="fb-body1-medium text-text-icon-01">System Status</p>
                <div className="flex items-center space-x-200">
                  <span className="w-2 h-2 rounded-full bg-success-200"></span>
                  <span className="fb-body5-regular text-text-icon-02">All systems operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
