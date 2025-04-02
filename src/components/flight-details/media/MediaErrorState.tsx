
import React from 'react';
import { RefreshCcw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface MediaErrorStateProps {
  error: string;
  onRetry: () => void;
  isLoading: boolean;
  isMinimal?: boolean;
}

export function MediaErrorState({ error, onRetry, isLoading, isMinimal = false }: MediaErrorStateProps) {
  if (isMinimal) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-icon-02">
        <AlertCircle className="w-8 h-8 mb-3 text-destructive" />
        <p className="text-sm font-medium">Error loading media</p>
        <p className="text-xs mt-1 text-text-icon-03">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4 text-xs h-7"
          onClick={onRetry}
        >
          <RefreshCcw className="w-3 h-3 mr-1" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle className="flex items-center">
        <AlertCircle className="w-4 h-4 mr-2" /> Error Loading Media
      </AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{error}</p>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onRetry}
          className="self-start mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCcw className="w-4 h-4 mr-2" />
          )}
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
