
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon: Icon,
  className,
  children
}) => {
  return (
    <div className={cn(
      "h-[35px] bg-background-level-2 flex items-center justify-between px-400 border-t border-b border-outline-primary",
      className
    )}>
      <div className="flex items-center gap-200">
        {Icon && <Icon className="w-4 h-4 text-text-icon-02" />}
        <h3 className="fb-body1-medium text-text-icon-01">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default SectionHeader;
