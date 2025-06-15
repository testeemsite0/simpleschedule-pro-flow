
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
  // Simple check: if Component has a $$typeof property, it's likely a lazy component
  // We use a safer approach by checking the component's constructor name and properties
  const isLazyComponent = Component && 
    typeof Component === 'object' && 
    Component.constructor && 
    Component.constructor.name === 'Object' &&
    '_payload' in Component;
  
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
