-- Quick query to verify all indexes on wine_recommendations table

SELECT 
  indexname,
  indexdef
FROM 
  pg_indexes
WHERE 
  tablename = 'wine_recommendations'
ORDER BY 
  indexname;














