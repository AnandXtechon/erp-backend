CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    job_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. J-2024-001
    job_title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id INTEGER REFERENCES customer(id),
	customer_name VARCHAR(200),
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) CHECK (status IN ('Ready', 'In Progress', 'Review', 'Finished')),
    assigned_to VARCHAR(255),
    category VARCHAR(100),
    location VARCHAR(255),
    start_date DATE,
    due_date DATE,
    expected_end_date DATE,
    project_value DECIMAL(10,2),
    hours_logged DECIMAL(5,2) DEFAULT 0.0,
    estimated_hours DECIMAL(5,2) DEFAULT 0.0,
    remaining_hours DECIMAL(5,2) GENERATED ALWAYS AS (estimated_hours - hours_logged) STORED,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS job_inventory_usage (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
	item_name VARCHAR(200),
    inventory_id INTEGER NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    reserved INTEGER DEFAULT 0,
    consumed INTEGER DEFAULT 0,
    remaining INTEGER GENERATED ALWAYS AS (reserved - consumed) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
