
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  rows?: number;
  variant?: 'default' | 'card' | 'table' | 'form';
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 3,
  variant = 'default',
  className
}) => {
  if (variant === 'card') {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-0">
          <div className="p-6 pb-0">
            <Skeleton className="h-7 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />
          </div>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (variant === 'table') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-4 py-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4 ml-auto" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/5 ml-auto" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    );
  }
  
  if (variant === 'form') {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-10 w-36 mt-4 ml-auto" />
      </div>
    );
  }
  
  // Default loading state
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-6 w-3/4" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Carregando...',
  className
}) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-6", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Erro",
  message,
  onRetry,
  className
}) => {
  return (
    <Alert variant="destructive" className={cn("", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
        {onRetry && (
          <button 
            onClick={onRetry}
            className="ml-2 underline font-medium hover:text-primary"
          >
            Tentar novamente
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};

interface InfoStateProps {
  title?: string;
  message: string;
  className?: string;
}

export const InfoState: React.FC<InfoStateProps> = ({
  title,
  message,
  className
}) => {
  return (
    <Alert className={cn("bg-muted", className)}>
      <Info className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription className="mt-1">{message}</AlertDescription>
    </Alert>
  );
};

export const FullPageLoadingState: React.FC<{ message?: string }> = ({ 
  message = "Carregando dados..."
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6 space-y-4 text-center">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex flex-col items-center justify-center gap-2 mt-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};
