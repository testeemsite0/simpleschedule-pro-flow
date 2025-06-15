
import React, { Suspense } from 'react';
import { ImprovedLoading } from "@/components/ui/improved-loading";

interface RouteWrapperProps {
  component: React.LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>;
  loadingMessage: string;
}

export const RouteWrapper: React.FC<RouteWrapperProps> = ({ 
  component, 
  loadingMessage 
}) => {
  // Type guard: Bail if null or undefined, covers all runtime and TS checks
  if (!component) {
    return null;
  }

  // At this point, TS should infer component is not null or undefined
  const Component = component as React.ComponentType<any>;

  // Check lazy-loaded (React.lazy) using its branded symbol and runtime shape
  const isLazyComponent = typeof component === 'object' && component !== null &&
    ('$$typeof' in component || '_payload' in component);

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
  
  // Regular component (direct usage, e.g., Navigate redirects)
  return <Component />;
};
