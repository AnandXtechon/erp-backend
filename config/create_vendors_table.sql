CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone NUMERIC,
    email TEXT,
    address TEXT,
    state TEXT,
    country TEXT,
    city TEXT,
    pincode NUMERIC,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    payment_terms VARCHAR NOT NULL,
    tax_id VARCHAR(25),
    notes TEXT,
    total_purchase NUMERIC(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_order DATE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_by TEXT
);


CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    purchase_order_number VARCHAR(25) NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id),
    vendor_name VARCHAR(255) NOT NULL,
    order_date DATE NOT NULL,
    delivery_date DATE,
    description TEXT,
    payment_terms VARCHAR NOT NULL,
    tax_rate DECIMAL(12,2),
    total_amount NUMERIC(12, 2),
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_by TEXT,

);

CREATE TABLE IF NOT EXISTS purchase_order_line_items (
    id SERIAL PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'unit',
    rate DECIMAL(12,2) NOT NULL,
    amount DECIMAL(12,2) GENERATED ALWAYS AS (quantity * rate) STORED,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_total_amount()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE purchase_orders
    SET total_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM purchase_order_line_items
        WHERE po_id = NEW.po_id
    )
    WHERE id = NEW.po_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_vendor_total_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate total for the old vendor (in case of update or delete)
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        UPDATE vendors
        SET total_purchase = (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM purchase_orders
            WHERE vendor_name = OLD.vendor_name
        )
        WHERE name = OLD.vendor_name;
    END IF;

    -- Recalculate total for the new vendor (in case of insert or update)
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE vendors
        SET total_purchase = (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM purchase_orders
            WHERE vendor_name = NEW.vendor_name
        )
        WHERE name = NEW.vendor_name;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_vendor_total_purchase
AFTER INSERT OR UPDATE OR DELETE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION update_vendor_total_purchase();


CREATE TRIGGER trg_update_total_amount
AFTER INSERT OR UPDATE OR DELETE ON purchase_order_line_items
FOR EACH ROW
EXECUTE FUNCTION update_total_amount();


CREATE OR REPLACE FUNCTION update_updatedAt_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updatedAt
BEFORE UPDATE ON vendors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updatedAt
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updatedAt
BEFORE UPDATE ON purchase_order_line_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


