
CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;

-- Main students table
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(20) PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    class VARCHAR(20) NOT NULL,  -- 'Form 1', 'Form 2', 'Form 3'
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    house VARCHAR(50) NOT NULL,   -- 'Acacia', 'Baobab', 'Palm'
    primary_contact VARCHAR(20) NOT NULL,
    secondary_contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_class (class),
    INDEX idx_house (house),
    INDEX idx_gender (gender),
    INDEX idx_name (student_name(20))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data
INSERT INTO students (id, student_name, class, gender, house, primary_contact, secondary_contact) VALUES
('STU-001', 'Juan Dela Cruz', 'Form 1', 'Male', 'Acacia', '+639171234567', '+639271234567'),
('STU-002', 'Maria Reyes', 'Form 1', 'Female', 'Baobab', '+639182345678', NULL),
('STU-003', 'Pedro Santos', 'Form 2', 'Male', 'Palm', '+639193456789', '+639283456789'),
('STU-004', 'Ana Lim', 'Form 2', 'Female', 'Acacia', '+639204567890', NULL),
('STU-005', 'Carlo Cruz', 'Form 3', 'Male', 'Baobab', '+639215678901', '+639295678901'),
('STU-006', 'Rica Gonzales', 'Form 3', 'Female', 'Palm', '+639226789012', '+639306789012'),
('STU-007', 'Mark Villanueva', 'Form 1', 'Male', 'Acacia', '+639237890123', NULL),
('STU-008', 'Lea Aquino', 'Form 2', 'Female', 'Baobab', '+639248901234', '+639318901234'),
('STU-009', 'Jose Mendoza', 'Form 3', 'Male', 'Palm', '+639259012345', NULL),
('STU-010', 'Isabella Torres', 'Form 1', 'Female', 'Acacia', '+639260123456', '+639271234567');

-- Create view for student summary
CREATE VIEW student_summary AS
SELECT 
    id,
    student_name,
    class,
    gender,
    house,
    primary_contact,
    secondary_contact
FROM students
ORDER BY class, student_name;