
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  className?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove, className }) => {
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-100 px-200 py-100 bg-background-level-2 rounded-full",
        "text-text-icon-01 text-sm shadow-sm",
        "border border-outline-primary transition-all",
        "hover:bg-background-level-1",
        className
      )}
    >
      <span>{label}</span>
      <button 
        onClick={onRemove}
        className="rounded-full p-50 hover:bg-background-level-5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3 text-text-icon-02" />
      </button>
    </div>
  );
};

export default FilterChip;
