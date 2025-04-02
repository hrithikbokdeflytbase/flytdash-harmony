
import React from 'react';
import { Loader2 } from 'lucide-react';

export function MediaLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
      <p className="text-sm font-medium text-text-icon-02">Loading flight media</p>
      <p className="text-xs mt-1 text-text-icon-03">Please wait while we fetch the media items...</p>
    </div>
  );
}
