-- पहले से मौजूद टेबल को ड्रॉप करना (अगर है तो)
DROP TABLE IF EXISTS bookings CASCADE;

-- बुकिंग टेबल बनाने के लिए SQL क्वेरी
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(255) NOT NULL,
    service_title VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    requirements TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- इंडेक्स बनाना जिससे सर्च तेज़ हो
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_phone ON bookings(phone);
CREATE INDEX idx_bookings_status ON bookings(status);

-- एडमिन पैनल के लिए व्यू बनाना
CREATE VIEW admin_bookings_view AS
SELECT 
    id,
    service_id,
    service_title,
    full_name,
    phone,
    email,
    requirements,
    status,
    created_at,
    updated_at
FROM bookings
ORDER BY created_at DESC;

-- बुकिंग स्टेटस अपडेट करने के लिए फंक्शन
CREATE OR REPLACE FUNCTION update_booking_status(booking_id INT, new_status VARCHAR(50))
RETURNS VOID AS $$
BEGIN
    UPDATE bookings
    SET 
        status = new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = booking_id;
END;
$$ LANGUAGE plpgsql;

-- उदाहरण: बुकिंग स्टेटस अपडेट करना
-- SELECT update_booking_status(1, 'completed');