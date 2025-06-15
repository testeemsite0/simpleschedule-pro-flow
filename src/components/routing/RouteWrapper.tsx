
import React, { Suspense } from 'react';
import { ImprovedLoading } from "@/components/ui/improved-loading";

interface RouteWrapperProps {
  // Remove null | undefined from the component prop type
  component: React.LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>;
  loadingMessage: string;
}

export const RouteWrapper: React.FC<RouteWrapperProps> = ({ 
  component,
  loadingMessage 
}) => {
  // TS now knows component is always valid so we don't need to check for null

  // Simplified lazy component detection that TypeScript can understand
  const isLazyComponent = React.isValidElement(React.createElement(component)) === false && 
                         typeof component === 'object' && 
                         component !== null;

  if (isLazyComponent) {
    const LazyComponent = component as React.LazyExoticComponent<React.ComponentType<any>>;
    return (
      <Suspense fallback={
        <ImprovedLoading 
          variant="page" 
          message={loadingMessage}
          showProgress={true}
        />
      }>
        <LazyComponent />
      </Suspense>
    );
  }
  
  // Regular component (direct usage, e.g., Navigate redirects)
  const RegularComponent = component as React.ComponentType<any>;
  return <RegularComponent />;
};
