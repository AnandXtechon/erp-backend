-- Allow clock_out to be NULL so timesheet can be created at clock-in and updated at clock-out
ALTER TABLE timesheets ALTER COLUMN clock_out DROP NOT NULL;
-- (Optional) If you want break_duration to be nullable at first, uncomment below:
-- ALTER TABLE timesheets ALTER COLUMN break_duration DROP NOT NULL;
