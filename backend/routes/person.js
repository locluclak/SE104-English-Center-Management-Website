const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing comparison

// GET /person?email=...
router.get('/', async (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ error: 'Email query parameter is required' });
    }

    try {
        const conn = await db.getConnection();
        const [rows] = await conn.query('SELECT * FROM PERSON WHERE EMAIL = ?', [email]);

        if (rows.length === 0) {
            conn.release();
            return res.status(404).json({ message: 'Person not found' });
        }

        const user = rows[0];
        delete user.PASSWORD; // Remove password field

        // If the user is STAFF, fetch their specific role
        if (user.ROLE === 'STAFF') {
            const [staffRows] = await conn.query('SELECT STAFF_TYPE FROM STAFF WHERE ID = ?', [user.ID]);
            if (staffRows.length > 0) {
                user.ROLE = staffRows[0].STAFF_TYPE; // Replace ROLE with specific staff type
            }
        }

        conn.release();
        res.json(user);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Add a new route to get all teachers
router.get('/teachers', async (req, res) => {
    try {
        const conn = await db.getConnection();
        const [rows] = await conn.query(
            `SELECT p.ID, p.NAME, p.EMAIL, p.PHONE_NUMBER, p.DATE_OF_BIRTH, s.HIRE_DAY 
             FROM PERSON p
             JOIN STAFF s ON p.ID = s.ID
             WHERE s.STAFF_TYPE = 'TEACHER'`
        );

        conn.release();
        res.json(rows);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new route to get all students
router.get('/students', async (req, res) => {
    try {
        const conn = await db.getConnection();
        const [rows] = await conn.query(
            `SELECT p.ID, p.NAME, p.EMAIL, p.PHONE_NUMBER, p.DATE_OF_BIRTH, s.ENROLL_DATE
             FROM PERSON p
             JOIN STUDENT s ON p.ID = s.ID`
        );

        conn.release();
        res.json(rows);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new route to get all accountants
router.get('/accountants', async (req, res) => {
    try {
        const conn = await db.getConnection();
        const [rows] = await conn.query(
            `SELECT p.ID, p.NAME, p.EMAIL, p.PHONE_NUMBER, p.DATE_OF_BIRTH, s.HIRE_DAY
             FROM PERSON p
             JOIN STAFF s ON p.ID = s.ID
             WHERE s.STAFF_TYPE = 'ACCOUNTANT'`
        );

        conn.release();
        res.json(rows);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API: Get all ADMINs if id belongs to SUPER ADMIN
router.get('/admins', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Missing id parameter' });
    }

    try {
        const conn = await db.getConnection();

        // Check if the id belongs to SUPER ADMIN
        const [superAdminRows] = await conn.query(
            "SELECT NAME FROM PERSON WHERE ID = ? AND NAME = 'SUPER ADMIN'",
            [id]
        );
        if (superAdminRows.length === 0) {
            conn.release();
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get all ADMINs
        const [adminRows] = await conn.query(
            `SELECT p.ID, p.NAME, p.EMAIL, p.PHONE_NUMBER, p.DATE_OF_BIRTH, s.HIRE_DAY
             FROM PERSON p
             JOIN STAFF s ON p.ID = s.ID
             WHERE s.STAFF_TYPE = 'ADMIN'`
        );

        conn.release();
        res.json(adminRows);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Update person info by ID (more specific route)
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone_number, date_of_birth } = req.body;

    if (!name && !email && !phone_number && !date_of_birth) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    try {
        const conn = await db.getConnection();

        // Build dynamic query
        const fields = [];
        const values = [];
        if (name) {
            fields.push('NAME = ?');
            values.push(name);
        }
        if (email) {
            fields.push('EMAIL = ?');
            values.push(email);
        }
        if (phone_number) {
            fields.push('PHONE_NUMBER = ?');
            values.push(phone_number);
        }
        if (date_of_birth) {
            fields.push('DATE_OF_BIRTH = ?');
            values.push(date_of_birth);
        }
        values.push(id);

        const [result] = await conn.query(
            `UPDATE PERSON SET ${fields.join(', ')} WHERE ID = ?`,
            values
        );

        conn.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Person not found' });
        }

        res.json({ message: 'Person updated successfully' });
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
    }

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction(); 
        const [personRoleRows] = await conn.query('SELECT ROLE FROM PERSON WHERE ID = ?', [id]);

        if (personRoleRows.length === 0) {
            await conn.rollback();
            conn.release();
            return res.status(404).json({ error: 'Person not found' });
        }

        const role = personRoleRows[0].ROLE;

        if (role === 'STUDENT') {
            // Xoá các bản ghi liên quan đến STUDENT trước, ví dụ: ENROLLMENT
            // await conn.query('DELETE FROM ENROLLMENT WHERE STUDENT_ID = ?', [id]); // Ví dụ
            await conn.query('DELETE FROM STUDENT WHERE ID = ?', [id]);
        } else if (role === 'STAFF') {
            // Xoá các bản ghi liên quan đến STAFF trước
            await conn.query('DELETE FROM STAFF WHERE ID = ?', [id]);
        }
        // Bạn có thể cần thêm các logic xoá khác nếu có các bảng liên quan khác

        // Cuối cùng, xoá từ bảng PERSON
        const [result] = await conn.query('DELETE FROM PERSON WHERE ID = ?', [id]);

        if (result.affectedRows === 0) {
            // Điều này không nên xảy ra nếu đã tìm thấy ở trên, nhưng là một kiểm tra an toàn
            await conn.rollback();
            conn.release();
            // Có thể người dùng đã bị xoá trong một request khác
            return res.status(404).json({ error: 'Person not found or already deleted from PERSON table' });
        }

        await conn.commit(); // Hoàn tất transaction
        conn.release();
        res.json({ message: 'Person deleted successfully' });

    } catch (err) {
        if (conn) {
            await conn.rollback(); // Hoàn tác transaction nếu có lỗi
            conn.release();
        }
        console.error('DB error on delete person:', err);
        // Kiểm tra lỗi cụ thể, ví dụ lỗi ràng buộc khoá ngoại
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451 /* MySQL error code for foreign key constraint */) {
             return res.status(409).json({ error: 'Cannot delete this person because they are referenced in other records (e.g., enrolled in a course, assigned as a teacher). Please remove those dependencies first.' });
        }
        res.status(500).json({ error: 'Internal server error while deleting person' });
    }
});


module.exports = router;
