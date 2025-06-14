-- Insert sample data into PERSON table
INSERT INTO PERSON (NAME, EMAIL, PHONE_NUMBER, DATE_OF_BIRTH, ROLE, PASSWORD)
VALUES 
('Alice Johnson', 'alice@example.com', '123-456-7890', '2000-05-15', 'STUDENT', '$2b$10$aqT9n/DCyJCSvSwbTsL.VeOjvBcnjHZDQSZvv/Bd7Mm/9zgcOfAbe'),
('Bob Smith', 'bob@example.com', '234-567-8901', '1985-09-20', 'STAFF', '$2b$10$aqT9n/DCyJCSvSwbTsL.VeOjvBcnjHZDQSZvv/Bd7Mm/9zgcOfAbe'),
('Charlie Davis', 'charlie@example.com', '345-678-9012', '1995-02-10', 'STUDENT', '$2b$10$aqT9n/DCyJCSvSwbTsL.VeOjvBcnjHZDQSZvv/Bd7Mm/9zgcOfAbe'),
('SUPER ADMIN', 'root@gmail.com', '456-789-0123', '1978-11-03', 'STAFF', '$2b$10$aqT9n/DCyJCSvSwbTsL.VeOjvBcnjHZDQSZvv/Bd7Mm/9zgcOfAbe'),
('Edward Blake', 'edward@example.com', '567-890-1234', '1998-04-12', 'STUDENT', '$2b$10$aqT9n/DCyJCSvSwbTsL.VeOjvBcnjHZDQSZvv/Bd7Mm/9zgcOfAbe'),
('Fiona Grey', 'fiona@example.com', '678-901-2345', '1982-12-05', 'STAFF', '$2b$10$aqT9n/DCyJCSvSwbTsL.VeOjvBcnjHZDQSZvv/Bd7Mm/9zgcOfAbe'),
('George King', 'george@example.com', '789-012-3456', '2001-07-30', 'STUDENT', '$2b$10$aqT9n/DCyJCSvSwbTsL.VeOjvBcnjHZDQSZvv/Bd7Mm/9zgcOfAbe'),
('Helen Wood', 'helen@example.com', '890-123-4567', '1975-03-18', 'STAFF', '$2b$10$aqT9n/DCyJCSvSwbTsL.VeOjvBcnjHZDQSZvv/Bd7Mm/9zgcOfAbe'),
('Ian Sharp', 'ian@example.com', '901-234-5678', '1990-06-25', 'STUDENT', '$2b$10$aqT9n/DCyJCSvSwbTsL.VeOjvBcnjHZDQSZvv/Bd7Mm/9zgcOfAbe'),
('Julia Stone', 'julia@example.com', '012-345-6789', '1987-01-09', 'STAFF', '$2b$10$aqT9n/DCyJCSvSwbTsL.VeOjvBcnjHZDQSZvv/Bd7Mm/9zgcOfAbe');

-- Insert sample data into STUDENT table
INSERT INTO STUDENT (ID, ENROLL_DATE)
VALUES 
(1, '2019-09-01'),
(3, '2021-01-15'),
(5, '2020-09-01'),
(7, '2022-01-10'),
(9, '2023-03-05');

-- Insert sample data into STAFF table
INSERT INTO STAFF (ID, HIRE_DAY, STAFF_TYPE)
VALUES 
(2, '2010-06-10', 'TEACHER'),
(4, '2015-08-25', 'ADMIN'),
(6, '2012-02-14', 'ACCOUNTANT'),
(8, '2008-11-30', 'TEACHER'),
(10, '2017-04-20', 'ADMIN');

-- Insert sample data into COURSE table
INSERT INTO COURSE (NAME, PRICE, DESCRIPTION, START_DATE, END_DATE, MIN_STU, MAX_STU)
VALUES 
('English Basics', 5000000, 'Introduction to English for beginners.', '2025-06-01', '2025-08-01', 5, 20),
('Advanced English', 8000000, 'Advanced English course for professionals.', '2025-01-01', '2025-09-01', 10, 25),
('TOEIC Preparation', 10000000, 'Comprehensive TOEIC preparation course.', '2025-05-15', '2025-07-15', 8, 30),
('Business English', 7000000, 'English for business communication.', '2025-06-10', '2025-08-10', 6, 20),
('Conversational English', 6000000, 'Focus on improving speaking skills.', '2025-07-20', '2025-09-20', 5, 15);

INSERT INTO CATEGORY (cate_id, name, description) VALUES
('SPEAK', 'Speaking', 'Courses focused on improving spoken English and pronunciation.'),
('WRITE', 'Writing', 'Courses that enhance grammar, sentence structure, and essay writing.'),
('READ', 'Reading', 'Courses to improve reading comprehension and vocabulary.'),
('LISTEN', 'Listening', 'Courses aimed at developing listening skills through various media.'),
('GRAMMAR', 'Grammar', 'Courses focused on understanding and applying English grammar rules.'),
('PRONUNCE', 'Pronunciation', 'Specialized courses for mastering English sounds and intonation.');

-- Insert sample data into TUITION table
INSERT INTO TUITION (PRICE, TYPE, DESCRIPTION, PAID_DATE, STATUS)
VALUES 
(5000000, 'CASH', 'Payment for English Basics course.', '2025-06-01', 'PAID'),
(8000000, 'TRANSFER', 'Payment for Advanced English course.', '2025-01-05', 'PAID'),
(10000000, 'CARD', 'Payment for IELTS Preparation course.', '2025-05-20', 'PAID'),
(7000000, 'CASH', 'Payment for Business English course.', NULL, 'UNPAID'),
(6000000, 'TRANSFER', 'Payment for Conversational English course.', '2025-07-25', 'PAID');

-- Insert sample data into STUDENT_COURSE table
INSERT INTO STUDENT_COURSE (STUDENT_ID, COURSE_ID, PAYMENT_ID)
VALUES 
(1, 1, 1), -- Alice Johnson enrolled in English Basics
(3, 2, 2), -- Charlie Davis enrolled in Advanced English
(5, 3, 3), -- Edward Blake enrolled in IELTS Preparation
(7, 4, 4), -- George King enrolled in Business English
(9, 5, 5); -- Ian Sharp enrolled in Conversational English

-- Insert sample data into ASSIGNMENT table without file
INSERT INTO ASSIGNMENT (NAME, DESCRIPTION, START_DATE, END_DATE, COURSE_ID)
VALUES 
('Essay Writing', 'Write an essay on a given topic.', '2025-01-05 09:00:00', '2025-12-15 23:59:59', 1),
('Grammar Test', 'Complete the grammar test.', '2025-01-10 09:00:00', '2025-12-20 23:59:59', 2),
('Mock Test', 'Take a full-length IELTS mock test.', '2025-01-15 09:00:00', '2025-12-25 23:59:59', 3),
('Business Presentation', 'Prepare a business presentation.', '2025-01-20 09:00:00', '2025-12-30 23:59:59', 4),
('Conversational Practice', 'Record a conversation with a partner.', '2025-01-25 09:00:00', '2025-12-05 23:59:59', 5);

