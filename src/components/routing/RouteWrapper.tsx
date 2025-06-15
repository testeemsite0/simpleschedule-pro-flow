
import React, { Suspense } from 'react';
import { ImprovedLoading } from "@/components/ui/improved-loading";

interface RouteWrapperProps {
  component: React.LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>;
  loadingMessage: string;
}

export const RouteWrapper: React.FC<RouteWrapperProps> = ({ 
  component: Component, 
  loadingMessage 
}) => {
  // Early return if Component is null or undefined
  if (!Component) {
    return null;
  }
  
  // Check if the component is lazy-loaded by checking for React.lazy characteristics
  // Lazy components have a $$typeof symbol and _payload property
  const isLazyComponent = typeof Component === 'object' && 
    ('$$typeof' in Component || '_payload' in Component);
  
  if (isLazyComponent) {
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
  }
  
  // For regular components (like redirects), render directly
  return <Component />;
};
