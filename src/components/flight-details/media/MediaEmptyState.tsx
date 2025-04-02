
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface MediaEmptyStateProps {
  filterType: 'all' | 'photos' | 'videos';
  onResetFilter?: () => void;
}

export function MediaEmptyState({ filterType, onResetFilter }: MediaEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-text-icon-02">
      <Info className="w-8 h-8 mb-3 text-text-icon-03" />
      <p className="text-sm font-medium">No media found</p>
      <p className="text-xs mt-1 text-text-icon-03">
        {filterType !== 'all' ? 
          `Try changing the filter from "${filterType}" to "all"` : 
          "No media is available for this flight"
        }
      </p>
      {filterType !== 'all' && onResetFilter && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4 text-xs h-7"
          onClick={onResetFilter}
        >
          Show All Media
        </Button>
      )}
    </div>
  );
}
