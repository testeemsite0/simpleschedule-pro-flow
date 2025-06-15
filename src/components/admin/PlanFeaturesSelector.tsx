
import React from "react";
import { SystemFeature } from "@/hooks/useSystemFeatures";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PlanFeaturesSelectorProps {
  features: SystemFeature[];
  selectedFeatureIds: string[];
  onChange: (featureIds: string[]) => void;
  loading?: boolean;
}

export function PlanFeaturesSelector({
  features,
  selectedFeatureIds,
  onChange,
  loading,
}: PlanFeaturesSelectorProps) {
  if (loading) {
    return <div>Carregando recursos...</div>;
  }

  const handleToggle = (featureId: string) => {
    if (selectedFeatureIds.includes(featureId)) {
      onChange(selectedFeatureIds.filter((id) => id !== featureId));
    } else {
      onChange([...selectedFeatureIds, featureId]);
    }
  };

  return (
    <div className="grid gap-2">
      {features.map((feature) => (
        <label
          key={feature.id}
          className="flex items-center space-x-2 cursor-pointer select-none"
        >
          <Checkbox
            checked={selectedFeatureIds.includes(feature.id)}
            onCheckedChange={() => handleToggle(feature.id)}
            id={`feature-${feature.id}`}
          />
          <span className="font-medium">{feature.label}</span>
          {feature.description && (
            <span className="text-xs text-muted-foreground">
              {feature.description}
            </span>
          )}
        </label>
      ))}
    </div>
  );
}
