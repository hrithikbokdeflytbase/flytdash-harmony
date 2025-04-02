
import React from 'react';
import { ImageIcon, Film } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface MediaFiltersProps {
  filterType: 'all' | 'photos' | 'videos';
  setFilterType: (value: 'all' | 'photos' | 'videos') => void;
  totalCount: number;
  photoCount: number;
  videoCount: number;
}

export function MediaFilters({ 
  filterType, 
  setFilterType, 
  totalCount, 
  photoCount, 
  videoCount 
}: MediaFiltersProps) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <ToggleGroup 
          type="single" 
          value={filterType} 
          onValueChange={(value) => value && setFilterType(value as 'all' | 'photos' | 'videos')}
        >
          <ToggleGroupItem value="all" aria-label="Show all media" className="h-7 text-xs">
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="photos" aria-label="Show photos only" className="h-7 text-xs flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> 
            Photos
          </ToggleGroupItem>
          <ToggleGroupItem value="videos" aria-label="Show videos only" className="h-7 text-xs flex items-center gap-1">
            <Film className="w-3 h-3" /> 
            Videos
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="text-[12px] text-text-icon-02 mt-1.5">
        {filterType === 'all' && `${totalCount || 0} items (${photoCount} photos, ${videoCount} videos)`}
        {filterType === 'photos' && `${photoCount} photos`}
        {filterType === 'videos' && `${videoCount} videos`}
      </div>
    </div>
  );
}
