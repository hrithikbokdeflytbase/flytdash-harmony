
import React from 'react';
import { X, Download, Clock, Check, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaItem } from '@/services/mediaService';

interface MediaPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: MediaItem | null;
  onJumpToTimestamp: () => void;
  hasTimelineControl: boolean;
}

export function MediaPreviewDialog({
  isOpen,
  onOpenChange,
  selectedItem,
  onJumpToTimestamp,
  hasTimelineControl
}: MediaPreviewDialogProps) {
  if (!selectedItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-lg border-none sm:rounded-xl">
        <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-background/40 backdrop-blur hover:bg-background/60 p-2 transition-colors">
          <X className="h-5 w-5 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <div className="flex flex-col w-full h-full">
          <div className="relative flex-1 bg-black min-h-[50vh] flex items-center justify-center">
            {selectedItem.type === 'photo' ? (
              <img 
                src={selectedItem.url} 
                alt={selectedItem.title || selectedItem.id} 
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  // Show error if image fails to load
                  (e.target as HTMLImageElement).src = 'https://placehold.co/800x450?text=Image+Failed+to+Load';
                }}
              />
            ) : (
              <video 
                src={selectedItem.url} 
                controls 
                className="max-w-full max-h-[70vh]"
                autoPlay
                onError={(e) => {
                  // Show error message if video fails to load
                  const target = e.target as HTMLVideoElement;
                  target.outerHTML = `
                    <div class="flex flex-col items-center justify-center p-8 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <p class="mt-4">Failed to load video</p>
                    </div>
                  `;
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          
          <div className="p-4 border-t flex flex-col gap-3 bg-background">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-medium">
                  {selectedItem.title || `Flight Media ${selectedItem.id}`}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="flex items-center gap-1 text-[10px] py-0 px-1.5">
                    {selectedItem.type === 'photo' ? (
                      <>Photo</>
                    ) : (
                      <>Video {selectedItem.duration && `(${selectedItem.duration}s)`}</>
                    )}
                  </Badge>
                  
                  <Badge variant="outline" className="flex items-center gap-1 text-[10px] py-0 px-1.5">
                    <Clock className="w-3 h-3" /> {selectedItem.timestamp}
                  </Badge>
                  
                  {selectedItem.fileSize && (
                    <Badge variant="outline" className="flex items-center gap-1 text-[10px] py-0 px-1.5">
                      {selectedItem.fileSize}
                    </Badge>
                  )}
                  
                  {selectedItem.uploadStatus && (
                    <Badge 
                      variant={
                        selectedItem.uploadStatus === 'success' ? 'success' : 
                        selectedItem.uploadStatus === 'processing' ? 'processing' : 'failed'
                      } 
                      className="flex items-center gap-1"
                    >
                      {selectedItem.uploadStatus === 'success' && <Check className="w-2 h-2" />}
                      {selectedItem.uploadStatus === 'processing' && <Loader2 className="w-2 h-2 animate-spin" />}
                      {selectedItem.uploadStatus === 'failed' && <X className="w-2 h-2" />}
                      {selectedItem.uploadStatus.charAt(0).toUpperCase() + selectedItem.uploadStatus.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
                
              <div className="flex gap-2">
                {/* Action buttons */}
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Download
                </Button>
                  
                {hasTimelineControl && (
                  <Button 
                    size="sm"
                    className="h-7 text-xs"
                    onClick={onJumpToTimestamp}
                  >
                    <Clock className="mr-1 w-3 h-3" />
                    Jump to Timeline
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
