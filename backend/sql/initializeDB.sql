-- Delete existing database

USE ENGLISH_CENTER_DATABASE;
DROP DATABASE ENGLISH_CENTER_DATABASE;

-- Create new database
CREATE DATABASE ENGLISH_CENTER_DATABASE;
USE ENGLISH_CENTER_DATABASE;

-- Create PERSON table
CREATE TABLE PERSON (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    NAME VARCHAR(100),
    EMAIL VARCHAR(100) UNIQUE,
    PHONE_NUMBER VARCHAR(15),
    DATE_OF_BIRTH DATE,
    ROLE ENUM('STUDENT', 'STAFF') DEFAULT 'STUDENT',
    PASSWORD VARCHAR(255)
);

-- Create STUDENT table
CREATE TABLE STUDENT (
    ID INT,
    ENROLL_DATE DATE,
    PRIMARY KEY (ID),
    FOREIGN KEY (ID) REFERENCES PERSON(ID)
);

-- Create STAFF table
CREATE TABLE STAFF (
    ID INT PRIMARY KEY,
    HIRE_DAY DATE,
    STAFF_TYPE ENUM('TEACHER', 'ADMIN', 'ACCOUNTANT'),
    FOREIGN KEY (ID) REFERENCES PERSON(ID)
);

-- Create COURSE table
CREATE TABLE COURSE (
    COURSE_ID INT PRIMARY KEY AUTO_INCREMENT,
    NAME VARCHAR(100) NOT NULL,
    PRICE DECIMAL(12, 0) NOT NULL DEFAULT 0,
    DESCRIPTION TEXT,
    START_DATE DATE,
    END_DATE DATE,
    MIN_STU INT,
    MAX_STU INT,
    NUMBER_STU INT DEFAULT 0,
    TEACHER_ID INT,
    FOREIGN KEY (TEACHER_ID) REFERENCES STAFF(ID)
);

-- CATEGORY table
CREATE TABLE CATEGORY (
    cate_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- COURSE_CATEGORY join table
CREATE TABLE COURSE_CATEGORY (
    course_id INT,
    cate_id VARCHAR(30),
    PRIMARY KEY (course_id, cate_id),
    FOREIGN KEY (course_id) REFERENCES COURSE(course_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (cate_id) REFERENCES CATEGORY(cate_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
-- Create TUITION table
CREATE TABLE TUITION (
    T_ID INT PRIMARY KEY AUTO_INCREMENT,
    PRICE DECIMAL(12, 0) NOT NULL,
    TYPE ENUM('UNPAID', 'CARD', 'TRANSFER', 'CASH') NOT NULL,
    DESCRIPTION TEXT,
    PAID_DATE DATE DEFAULT NULL,
    STATUS ENUM('UNPAID', 'PAID', 'DEFERRED') DEFAULT 'UNPAID'
);

-- Create STUDENT_COURSE table
CREATE TABLE STUDENT_COURSE (
    STUDENT_ID INT,
    COURSE_ID INT,
    PAYMENT_ID INT,
    PRIMARY KEY (STUDENT_ID, COURSE_ID),
    FOREIGN KEY (STUDENT_ID) REFERENCES STUDENT(ID),
    FOREIGN KEY (COURSE_ID) REFERENCES COURSE(COURSE_ID) ON DELETE CASCADE,
    FOREIGN KEY (PAYMENT_ID) REFERENCES TUITION(T_ID)
);

-- Create TEACHER_COURSE table
CREATE TABLE TEACHER_COURSE (
    TEACHER_ID INT,
    COURSE_ID INT,
    ROLE ENUM('LECTURER', 'ASSISTANT') NOT NULL,
    PRIMARY KEY (TEACHER_ID, COURSE_ID),
    FOREIGN KEY (TEACHER_ID) REFERENCES STAFF(ID),
    FOREIGN KEY (COURSE_ID) REFERENCES COURSE(COURSE_ID) ON DELETE CASCADE
);

-- Create ASSIGNMENT table
CREATE TABLE ASSIGNMENT (
    AS_ID INT PRIMARY KEY AUTO_INCREMENT,
    NAME VARCHAR(100) NOT NULL,
    DESCRIPTION TEXT,
    FILE VARCHAR(255), -- file link
    START_DATE DATETIME,
    END_DATE DATETIME,
    COURSE_ID INT,
    FOREIGN KEY (COURSE_ID) REFERENCES COURSE(COURSE_ID) ON DELETE CASCADE
);

-- Create DOCUMENT table
CREATE TABLE DOCUMENT (
    DOC_ID INT PRIMARY KEY AUTO_INCREMENT,
    NAME VARCHAR(100) NOT NULL,
    DESCRIPTION TEXT,
    FILE VARCHAR(255),  -- file link
    COURSE_ID INT,
    FOREIGN KEY (COURSE_ID) REFERENCES COURSE(COURSE_ID) ON DELETE CASCADE
);

-- Create SUBMITION table
CREATE TABLE SUBMITION (
    STUDENT_ID INT,
    AS_ID INT,
    SUBMIT_DATE DATETIME,
    DESCRIPTION TEXT,
    FILE VARCHAR(255),  
    SCORE DECIMAL(5,2) DEFAULT NULL,  
    PRIMARY KEY (STUDENT_ID, AS_ID),
    FOREIGN KEY (STUDENT_ID) REFERENCES STUDENT(ID),
    FOREIGN KEY (AS_ID) REFERENCES ASSIGNMENT(AS_ID) ON DELETE CASCADE
);

-- Trigger: Increase NUMBER_STU in COURSE when a student is added to STUDENT_COURSE
DELIMITER $$
CREATE TRIGGER trg_increment_number_stu
AFTER INSERT ON STUDENT_COURSE
FOR EACH ROW
BEGIN
    UPDATE COURSE
    SET NUMBER_STU = NUMBER_STU + 1
    WHERE COURSE_ID = NEW.COURSE_ID;
END$$
DELIMITER ;

-- Trigger: Decrease NUMBER_STU in COURSE when a student is removed from STUDENT_COURSE
DELIMITER $$
CREATE TRIGGER trg_decrement_number_stu
AFTER DELETE ON STUDENT_COURSE
FOR EACH ROW
BEGIN
    UPDATE COURSE
    SET NUMBER_STU = NUMBER_STU - 1
    WHERE COURSE_ID = OLD.COURSE_ID;
END$$
DELIMITER ;

-- Trigger: Adjust NUMBER_STU in COURSE when COURSE_ID is changed in STUDENT_COURSE
DELIMITER $$
CREATE TRIGGER trg_update_number_stu
AFTER UPDATE ON STUDENT_COURSE
FOR EACH ROW
BEGIN
    IF OLD.COURSE_ID <> NEW.COURSE_ID THEN
        -- Decrease NUMBER_STU for the old course
        UPDATE COURSE
        SET NUMBER_STU = NUMBER_STU - 1
        WHERE COURSE_ID = OLD.COURSE_ID;
        -- Increase NUMBER_STU for the new course
        UPDATE COURSE
        SET NUMBER_STU = NUMBER_STU + 1
        WHERE COURSE_ID = NEW.COURSE_ID;
    END IF;
END$$
DELIMITER ;

-- Trigger: Ensure only students can be added to STUDENT_COURSE
DELIMITER $$
CREATE TRIGGER trg_check_student_role
BEFORE INSERT ON STUDENT_COURSE
FOR EACH ROW
BEGIN
    DECLARE role_value ENUM('STUDENT', 'STAFF');
    SELECT ROLE INTO role_value FROM PERSON WHERE ID = NEW.STUDENT_ID;
    IF role_value <> 'STUDENT' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only students can be added to STUDENT_COURSE';
    END IF;
END$$
DELIMITER ;

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
INSERT INTO COURSE (NAME, PRICE, DESCRIPTION, START_DATE, END_DATE, MIN_STU, MAX_STU, NUMBER_STU)
VALUES 
('English Basics', 5000000, 'Introduction to English for beginners.', '2025-06-01', '2025-08-01', 5, 20, 10),
('Advanced English', 8000000, 'Advanced English course for professionals.', '2025-01-01', '2025-09-01', 10, 25, 15),
('TOEIC Preparation', 10000000, 'Comprehensive TOEIC preparation course.', '2025-05-15', '2025-07-15', 8, 30, 20),
('Business English', 7000000, 'English for business communication.', '2025-06-10', '2025-08-10', 6, 20, 12),
('Conversational English', 6000000, 'Focus on improving speaking skills.', '2025-07-20', '2025-09-20', 5, 15, 8);

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

