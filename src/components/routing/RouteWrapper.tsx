
import React, { Suspense } from 'react';
import { ImprovedLoading } from "@/components/ui/improved-loading";

interface RouteWrapperProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  loadingMessage: string;
}

export const RouteWrapper: React.FC<RouteWrapperProps> = ({ 
  component: Component, 
  loadingMessage 
}) => {
  return (
    <Suspense fallback={
      <ImprovedLoading 
        variant="page" 
        message={loadingMessage}
        showProgress={true}
      />
    }>
      <Component />
    </Suspense>
  );
};
