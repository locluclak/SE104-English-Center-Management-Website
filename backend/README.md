# Testing stage
## Database initialization
```
CREATE DATABASE english_center;
USE english_center;

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  level VARCHAR(50)
);

INSERT INTO courses (title, level) VALUES
('English A1', 'Beginner'),
('English B1', 'Intermediate'),
('English C1', 'Advanced');
```

## Backend
Create .env file and replace your mysql password (**if you try this code, please do not upload your password ~.env file**)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=english_center
```