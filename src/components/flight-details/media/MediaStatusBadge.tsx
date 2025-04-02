
import React from 'react';
import { Check, Loader2, X, RefreshCcw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MediaStatusBadgeProps {
  status: 'success' | 'processing' | 'failed';
  isRetrying?: boolean;
  onRetry?: (e: React.MouseEvent) => void;
}

export function MediaStatusBadge({ status, isRetrying, onRetry }: MediaStatusBadgeProps) {
  // If this item is currently being retried
  if (isRetrying) {
    return (
      <Badge variant="processing" size="sm" className="absolute top-2 right-2 flex items-center gap-1">
        <Loader2 className="w-2 h-2 animate-spin" /> Retrying
      </Badge>
    );
  }
  
  switch(status) {
    case 'success':
      return (
        <Badge variant="success" size="sm" className="absolute top-2 right-2 flex items-center gap-1">
          <Check className="w-2 h-2" /> Success
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="processing" size="sm" className="absolute top-2 right-2 flex items-center gap-1">
          <Loader2 className="w-2 h-2 animate-spin" /> Processing
        </Badge>
      );
    case 'failed':
      return (
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="failed" size="sm" className="flex items-center gap-1">
            <X className="w-2 h-2" /> Failed
          </Badge>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-5 px-1.5 text-[10px]"
              onClick={onRetry}
              disabled={isRetrying}
            >
              <RefreshCcw className="w-2 h-2 mr-1" /> Retry
            </Button>
          )}
        </div>
      );
    default:
      return null;
  }
}
