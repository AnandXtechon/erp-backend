CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Clocked Out' CHECK (
        status IN ('Clocked In', 'On Break', 'Clocked Out')
    ),
    current_job_id INTEGER REFERENCES jobs(id),
	current_job_name VARCHAR(200),
    hourly_rate DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timesheets (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    job_id INTEGER REFERENCES jobs(id),
	job_name VARCHAR(200),
    work_date DATE NOT NULL,
    clock_in TIME NOT NULL,
    clock_out TIME NOT NULL,
    break_duration INTERVAL DEFAULT INTERVAL '0 hours',
    total_hours DECIMAL(4,2) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (clock_out - clock_in - break_duration)) / 3600
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO employees (
    name, position, status, current_job_id, current_job_name, hourly_rate
) VALUES (
    'Mike Johnson', 'Senior Technician', 'Clocked In', 1, 'HVAC System Upgrade', 35.00
);
INSERT INTO employees (
    name, position, status, current_job_id, current_job_name, hourly_rate
) VALUES (
    'Sarah Lee', 'Technician', 'Clocked Out', 2, 'Office Duct Cleaning', 28.50
);
INSERT INTO employees (
    name, position, status, current_job_id, current_job_name, hourly_rate
) VALUES (
    'Alex Carter', 'Field Engineer', 'Clocked In', 3, 'HVAC Emergency Repair', 32.00
);
INSERT INTO employees (
    name, position, status, current_job_id, current_job_name, hourly_rate
) VALUES (
    'Rita Gomez', 'Inspector', 'Clocked Out', 5, 'Quarterly Equipment Inspection', 30.00
);
INSERT INTO employees (
    name, position, status, current_job_id, current_job_name, hourly_rate
) VALUES (
    'Logan Pierce', 'HVAC Engineer', 'Clocked In', 6, 'Data Center Cooling System Upgrade', 36.00
);
-- Mike Johnson timesheet
INSERT INTO timesheets (
    employee_id, job_id, job_name, work_date, clock_in, clock_out, break_duration
) VALUES (
    1, 1, 'HVAC System Upgrade', '2024-06-14', '08:00', '16:30', INTERVAL '0.5 hour'
);

-- Sarah Lee timesheet
INSERT INTO timesheets (
    employee_id, job_id, job_name, work_date, clock_in, clock_out, break_duration
) VALUES (
    2, 2, 'Office Duct Cleaning', '2024-06-13', '09:00', '17:00', INTERVAL '1 hour'
);

-- Alex Carter timesheet
INSERT INTO timesheets (
    employee_id, job_id, job_name, work_date, clock_in, clock_out, break_duration
) VALUES (
    3, 3, 'HVAC Emergency Repair', '2024-06-15', '07:30', '15:00', INTERVAL '0.5 hour'
);

-- Rita Gomez timesheet
INSERT INTO timesheets (
    employee_id, job_id, job_name, work_date, clock_in, clock_out, break_duration
) VALUES (
    4, 5, 'Quarterly Equipment Inspection', '2024-06-05', '08:30', '17:00', INTERVAL '1 hour'
);

-- Logan Pierce timesheet
INSERT INTO timesheets (
    employee_id, job_id, job_name, work_date, clock_in, clock_out, break_duration
) VALUES (
    5, 6, 'Data Center Cooling System Upgrade', '2024-06-16', '08:00', '18:00', INTERVAL '1 hour'
);
