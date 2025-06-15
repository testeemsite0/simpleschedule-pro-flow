
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SystemFeature {
  id: string;
  key: string;
  label: string;
  description: string | null;
}

export function useSystemFeatures() {
  const [features, setFeatures] = useState<SystemFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystemFeatures() {
      setLoading(true);
      const { data, error } = await supabase
        .from("system_features")
        .select("*")
        .order("label");
      if (!error) setFeatures(data || []);
      setLoading(false);
    }
    fetchSystemFeatures();
  }, []);

  return { features, loading };
}
