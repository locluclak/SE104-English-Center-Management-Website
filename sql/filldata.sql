DELETE FROM PERSON;
DELETE FROM STAFF;
DELETE FROM STUDENT;

-- Insert into PERSON table
INSERT INTO PERSON (NAME, EMAIL, PHONE_NUMBER, DATE_OF_BIRTH, ROLE, PASSWORD)
VALUES 
('Alice Johnson', 'alice@example.com', '123-456-7890', '2000-05-15', 'STUDENT', 'hashedpassword1'),
('Bob Smith', 'bob@example.com', '234-567-8901', '1985-09-20', 'STAFF', 'hashedpassword2'),
('Charlie Davis', 'charlie@example.com', '345-678-9012', '1995-02-10', 'STUDENT', 'hashedpassword3'),
('Diana Reed', 'diana@example.com', '456-789-0123', '1978-11-03', 'STAFF', 'hashedpassword4'),
('Edward Blake', 'edward@example.com', '567-890-1234', '1998-04-12', 'STUDENT', 'hashedpassword5'),
('Fiona Grey', 'fiona@example.com', '678-901-2345', '1982-12-05', 'STAFF', 'hashedpassword6'),
('George King', 'george@example.com', '789-012-3456', '2001-07-30', 'STUDENT', 'hashedpassword7'),
('Helen Wood', 'helen@example.com', '890-123-4567', '1975-03-18', 'STAFF', 'hashedpassword8'),
('Ian Sharp', 'ian@example.com', '901-234-5678', '1990-06-25', 'STUDENT', 'hashedpassword9'),
('Julia Stone', 'julia@example.com', '012-345-6789', '1987-01-09', 'STAFF', 'hashedpassword10');

-- Insert into STUDENT table
INSERT INTO STUDENT (ID, ENROLL_DATE)
VALUES 
(1, '2019-09-01'),
(3, '2021-01-15'),
(5, '2020-09-01'),
(7, '2022-01-10'),
(9, '2023-03-05');

-- Insert into STAFF table
INSERT INTO STAFF (ID, HIRE_DAY, STAFF_TYPE)
VALUES 
(2, '2010-06-10', 'TEACHER'),
(4, '2015-08-25', 'ADMIN'),
(6, '2012-02-14', 'ACCOUNTANT'),
(8, '2008-11-30', 'TEACHER'),
(10, '2017-04-20', 'ADMIN');