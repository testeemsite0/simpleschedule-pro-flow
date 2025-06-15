
import React, { useState, useEffect } from 'react';

interface PlanFeaturesDisplayProps {
  planId: string;
  featuresMap: { [id: string]: string };
  fetchPlanFeatures: (planId: string) => Promise<string[]>;
}

export function PlanFeaturesDisplay({ planId, featuresMap, fetchPlanFeatures }: PlanFeaturesDisplayProps) {
  const [featureIds, setFeatureIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchPlanFeatures(planId).then((ids) => {
      if (isMounted) {
        setFeatureIds(ids);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [planId, fetchPlanFeatures]);

  if (loading) return <span className="text-xs text-muted-foreground">Carregando...</span>;

  if (!featureIds.length) return <span className="text-xs text-muted-foreground">Nenhuma funcionalidade configurada</span>;

  return (
    <ul className="list-disc pl-5">
      {featureIds.map((fid) => (
        <li key={fid} className="text-sm">
          {featuresMap[fid] || '???'}
        </li>
      ))}
    </ul>
  );
}
