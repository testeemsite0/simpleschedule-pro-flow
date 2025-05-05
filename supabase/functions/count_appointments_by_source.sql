
CREATE OR REPLACE FUNCTION public.count_appointments_by_source()
RETURNS TABLE (source text, count bigint) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.source,
    COUNT(*)::bigint
  FROM 
    appointments a
  GROUP BY 
    a.source;
END;
$$;
