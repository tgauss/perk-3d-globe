-- Optimized activity feed for 3D globe visualization
-- Gets diverse time distribution of activities for better visual variety
-- Includes Unix timestamp for efficient client-side processing
-- Optional: filter by program with {{program_id}} (Number). Leave blank for all programs.

WITH latest_per_participant AS (
  /* One latest action per participant to prevent spam from repeat users */
  SELECT DISTINCT ON (pa.participant_id)
         pa.id,
         pa.participant_id,
         pa.program_id,
         pa.created_at,
         pa.action_type,
         pa.title,
         COALESCE(pa.points, 0)::numeric AS points_raw,
         pa.actionable_type,
         pa.actionable_id,
         pa.metadata
  FROM public.participant_actions pa
  /* Get recent activities (last 7 days for time diversity) */
  WHERE pa.created_at >= NOW() - INTERVAL '7 days'
    [[AND pa.program_id = {{program_id}}]]
  ORDER BY pa.participant_id, pa.created_at DESC, pa.id DESC
)

SELECT
  /* Privacy-safe name + natural sentence */
  (
    CASE WHEN NULLIF(BTRIM(p.first_name),'') IS NOT NULL
         THEN INITCAP(p.first_name) || ' ' || COALESCE(NULLIF(LEFT(p.last_name,1),''),'') || '.'
         ELSE 'A member'
    END
  ) || ' ' ||
  (
    CASE ds.action_type
      WHEN 0  THEN 'joined ' || pr.name
      WHEN 1  THEN 'signed into ' || pr.name
      WHEN 3  THEN 'watched a video in ' || pr.name
      WHEN 4  THEN 'visited a link in ' || pr.name
      WHEN 5  THEN 'read an article in ' || pr.name
      WHEN 6  THEN 'completed a quiz in ' || pr.name
      WHEN 7  THEN 'submitted a survey in ' || pr.name
      WHEN 12 THEN 'viewed a social post in ' || pr.name
      WHEN 13 THEN 'claimed ' || COALESCE(rw.reward_name,'a reward') || ' in ' || pr.name
      WHEN 20 THEN 'completed a challenge in ' || pr.name
      WHEN 23 THEN 'submitted a receipt for ' ||
                   COALESCE(TO_CHAR(rec.receipt_total_amount, 'FM$999,999,990.00'), 'a purchase') ||
                   ' to ' || pr.name
      WHEN 24 THEN 'leveled up in ' || pr.name
      WHEN 25 THEN 'played a game in ' || pr.name
      WHEN 29 THEN 'finished a quiz in ' || pr.name
      WHEN 9  THEN 'recruited a new member to ' || pr.name
      ELSE COALESCE(NULLIF(BTRIM(ds.title),''), 'completed an activity in ' || pr.name)
    END
  ) AS "Activity Marquee String",

  /* Branded points string: +X Term for earns, -X Term for deductions; blank when zero */
  CASE
    WHEN ds.points_raw > 0 THEN
      '+' || TRIM(TO_CHAR(ds.points_raw, 'FM999,999,990')) || ' ' || COALESCE(NULLIF(BTRIM(pr.term_points_as),''), 'points')
    WHEN ds.points_raw < 0 THEN
      '-' || TRIM(TO_CHAR(ABS(ds.points_raw), 'FM999,999,990')) || ' ' || COALESCE(NULLIF(BTRIM(pr.term_points_as),''), 'points')
    ELSE NULL
  END AS "Branded Points",

  /* Unix timestamp (milliseconds) for efficient JS processing */
  EXTRACT(EPOCH FROM ds.created_at)::bigint * 1000 AS "Timestamp (ms)",

  /* Original timestamp for reference */
  ds.created_at AT TIME ZONE 'UTC' AS "Action Timestamp",

  /* Context columns */
  ds.action_type        AS "Action Type",
  ds.program_id         AS "Program ID",
  ds.participant_id     AS "Participant ID",
  p.current_sign_in_ip  AS "IP Address",
  loc.city              AS "City",
  loc.state             AS "State"

FROM latest_per_participant ds
JOIN public.participants p  ON p.id = ds.participant_id
JOIN public.programs    pr ON pr.id = ds.program_id

/* City/State via attribute IDs (fast). Replace 10001528/10001529 if your IDs differ. */
LEFT JOIN LATERAL (
  SELECT
    /* most recent city */
    (
      SELECT pp.value
      FROM public.participant_profiles pp
      WHERE pp.participant_id = p.id
        AND pp.profile_attribute_id = 10001528   -- City
      ORDER BY pp.updated_at DESC NULLS LAST, pp.id DESC
      LIMIT 1
    ) AS city,
    /* most recent state/region */
    (
      SELECT pp.value
      FROM public.participant_profiles pp
      WHERE pp.participant_id = p.id
        AND pp.profile_attribute_id = 10001529   -- State
      ORDER BY pp.updated_at DESC NULLS LAST, pp.id DESC
      LIMIT 1
    ) AS state
) loc ON TRUE

/* Reward name only when the action references a reward */
LEFT JOIN LATERAL (
  SELECT r.translations -> 'en' ->> 'name' AS reward_name
  FROM public.rewards r
  WHERE ds.actionable_type = 'Reward'
    AND r.id = ds.actionable_id
  LIMIT 1
) rw ON TRUE

/* Receipt total only when a receipt_id is present in metadata */
LEFT JOIN LATERAL (
  SELECT ra.total_amount::numeric AS receipt_total_amount
  FROM public.receipts rx
  JOIN public.receipt_analyses ra ON ra.receipt_id = rx.id
  WHERE (ds.metadata ->> 'receipt_id') IS NOT NULL
    AND rx.id = (ds.metadata ->> 'receipt_id')::bigint
  LIMIT 1
) rec ON TRUE

ORDER BY ds.created_at DESC
LIMIT {{limit}};
