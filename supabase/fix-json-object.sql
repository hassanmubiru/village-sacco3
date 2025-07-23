-- Alternative Learning Progress Dashboard View (if JSON_OBJECT doesn't work)
DROP VIEW IF EXISTS public.learning_dashboard;

CREATE VIEW public.learning_dashboard AS
SELECT 
  u.id as user_id,
  u.first_name || ' ' || u.last_name as user_name,
  COUNT(ulp.id) as total_content_accessed,
  COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END) as completed_content,
  COUNT(CASE WHEN ulp.status = 'in_progress' THEN 1 END) as in_progress_content,
  ROUND(AVG(CASE WHEN ulp.quiz_score IS NOT NULL THEN ulp.quiz_score END), 2) as average_quiz_score,
  SUM(ulp.time_spent) as total_learning_time_minutes,
  MAX(ulp.last_accessed) as last_learning_activity,
  -- Calculate completion rate by category using JSON_BUILD_OBJECT
  JSON_BUILD_OBJECT(
    'savings', COUNT(CASE WHEN fec.category = 'savings' AND ulp.status = 'completed' THEN 1 END),
    'loans', COUNT(CASE WHEN fec.category = 'loans' AND ulp.status = 'completed' THEN 1 END),
    'bitcoin', COUNT(CASE WHEN fec.category = 'bitcoin' AND ulp.status = 'completed' THEN 1 END),
    'governance', COUNT(CASE WHEN fec.category = 'governance' AND ulp.status = 'completed' THEN 1 END),
    'security', COUNT(CASE WHEN fec.category = 'security' AND ulp.status = 'completed' THEN 1 END)
  ) as category_completion
FROM public.users u
LEFT JOIN public.user_learning_progress ulp ON u.id = ulp.user_id
LEFT JOIN public.financial_education_content fec ON ulp.content_id = fec.id
GROUP BY u.id, u.first_name, u.last_name;
