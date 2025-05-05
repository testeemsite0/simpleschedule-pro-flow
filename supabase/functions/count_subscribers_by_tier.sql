
CREATE OR REPLACE FUNCTION public.count_subscribers_by_tier()
RETURNS TABLE (subscription_tier text, count bigint) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.subscription_tier,
    COUNT(*)::bigint
  FROM 
    subscribers s
  GROUP BY 
    s.subscription_tier;
END;
$$;
