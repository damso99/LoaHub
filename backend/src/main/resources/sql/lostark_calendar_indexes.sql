CREATE INDEX IF NOT EXISTS idx_lostark_calendar_start_time
    ON public.lostark_calendar_schedules (start_time_kst);

CREATE INDEX IF NOT EXISTS idx_lostark_calendar_type_time
    ON public.lostark_calendar_schedules (category_name, start_time_kst);
