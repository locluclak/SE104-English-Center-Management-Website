const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

const router = express.Router();

// HELPER FUNCTION: Tạo đường dẫn tương đối, an toàn cho URL
// Hàm này đảm bảo đường dẫn lưu trong DB luôn dùng dấu '/'
const getRelativePath = (file) => {
    if (!file) return null;
    return path.join(file.destination, file.filename).replace(/\\/g, "/");
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/';
        // Đảm bảo thư mục 'uploads' tồn tại trước khi lưu file
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer để nhận file từ nhiều trường (attachments và audio)
const upload = multer({ 
    storage, 
    limits: { fileSize: 20 * 1024 * 1024 } // Giới hạn file 20 MB
}).fields([
    { name: 'attachments' }, // Cho các file đính kèm thông thường
    { name: 'audio', maxCount: 1 } // Cho 1 file ghi âm duy nhất
]);

// === ROUTES ===

// 1. Create a padlet note with attachments
router.post('/create', upload, async (req, res) => {
    const { name, content, ownerId } = req.body;

    if (!name || !content || !ownerId) {
        return res.status(400).json({ error: 'Name, content, and ownerId are required.' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO PADLET (NAME, CONTENT, CREATETIME, OWNERID) VALUES (?, ?, NOW(), ?)',
            [name, content, ownerId]
        );
        const padletId = result.insertId;

        // Gộp tất cả file được tải lên từ các trường khác nhau
        const allFiles = [];
        if (req.files.attachments) {
            req.files.attachments.forEach(file => allFiles.push({ ...file, mediaType: 'attachment' }));
        }
        if (req.files.audio) {
            req.files.audio.forEach(file => allFiles.push({ ...file, mediaType: 'audio' }));
        }

        if (allFiles.length > 0) {
            const fileInserts = allFiles.map(file => [
                padletId,
                file.originalname,
                file.mimetype,
                getRelativePath(file), // **FIXED**: Sử dụng getRelativePath để lưu đường dẫn đúng
                file.mediaType
            ]);

            await db.query(
                'INSERT INTO MEDIAFILE (NOTEID, FILENAME, TYPE, FILEPATH, MEDIATYPE) VALUES ?',
                [fileInserts]
            );
        }

        res.status(201).json({ message: 'Padlet note created successfully.', padletId });
    } catch (error) {
        console.error("Error creating padlet:", error);
        res.status(500).json({ error: 'An error occurred while creating the padlet note.' });
    }
});

// 2. Get all padlet notes and their attachments for a specific person
router.get('/notes/:ownerId', async (req, res) => {
    const { ownerId } = req.params;

    try {
        // Câu query này đã chuẩn, trả về JSON object cho các file đính kèm
        const [padlets] = await db.query(
            `SELECT 
                p.ID AS padletId, p.NAME AS padletName, p.CONTENT AS padletContent, 
                p.CREATETIME AS createTime, 
                IF(COUNT(m.ID) > 0,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', m.ID, 
                            'fileName', m.FILENAME, 
                            'fileType', m.TYPE, 
                            'mediaType', m.MEDIATYPE, 
                            'downloadUrl', m.FILEPATH
                        )
                    ),
                    JSON_ARRAY()
                ) AS attachmentsData
             FROM PADLET p
             LEFT JOIN MEDIAFILE m ON p.ID = m.NOTEID
             WHERE p.OWNERID = ?
             GROUP BY p.ID
             ORDER BY p.CREATETIME DESC`,
            [ownerId]
        );

        res.status(200).json({ padlets });
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: 'An error occurred while fetching padlet notes.' });
    }
});

// 3. Edit a padlet note, including adding and removing attachments
router.put('/edit/:padletId', upload, async (req, res) => {
    const { padletId } = req.params;
    const { name, content, removeAttachment } = req.body;

    try {
        if (name || content) {
            await db.execute(
                'UPDATE PADLET SET NAME = COALESCE(?, NAME), CONTENT = COALESCE(?, CONTENT) WHERE ID = ?',
                [name, content, padletId]
            );
        }
        
        let removeAttachments = [];
        if (removeAttachment) {
            try { removeAttachments = JSON.parse(removeAttachment); } catch (e) {
                console.warn("Could not parse removeAttachment JSON:", removeAttachment);
            }
        }
        
        if (Array.isArray(removeAttachments) && removeAttachments.length > 0) {
            const [filesToDelete] = await db.query(
                'SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ? AND FILENAME IN (?)',
                [padletId, removeAttachments]
            );
            for (const file of filesToDelete) {
                // fs.unlink là non-blocking, an toàn hơn unlinkSync trong request handler
                if (fs.existsSync(file.FILEPATH)) {
                    fs.unlink(file.FILEPATH, (err) => {
                        if (err) console.error(`Failed to delete file async: ${file.FILEPATH}`, err);
                    });
                }
            }
            await db.query('DELETE FROM MEDIAFILE WHERE NOTEID = ? AND FILENAME IN (?)', [padletId, removeAttachments]);
        }

        // Xử lý file mới tải lên
        const allNewFiles = [];
        if (req.files.attachments) {
            req.files.attachments.forEach(file => allNewFiles.push({ ...file, mediaType: 'attachment' }));
        }
        if (req.files.audio) {
            req.files.audio.forEach(file => allNewFiles.push({ ...file, mediaType: 'audio' }));
        }

        if (allNewFiles.length > 0) {
            const fileInserts = allNewFiles.map(file => [
                padletId,
                file.originalname,
                file.mimetype,
                getRelativePath(file), // **FIXED**: Sử dụng getRelativePath để lưu đường dẫn đúng
                file.mediaType
            ]);
            await db.query(
                'INSERT INTO MEDIAFILE (NOTEID, FILENAME, TYPE, FILEPATH, MEDIATYPE) VALUES ?',
                [fileInserts]
            );
        }

        res.status(200).json({ message: 'Padlet note updated successfully.' });
    } catch (error) {
        console.error("Error updating padlet:", error);
        res.status(500).json({ error: 'An error occurred while updating the padlet note.' });
    }
});

// 4. Delete a padlet note and all its associated files
router.delete('/delete/:padletId', async (req, res) => {
    const { padletId } = req.params;
    try {
        const [filesToDelete] = await db.query('SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ?', [padletId]);
        
        // Xóa file vật lý trước khi xóa record trong DB
        for (const file of filesToDelete) {
            if (fs.existsSync(file.FILEPATH)) {
                fs.unlink(file.FILEPATH, (err) => {
                    if (err) console.error(`Failed to delete file async: ${file.FILEPATH}`, err);
                });
            }
        }
        
        // Xóa note trong bảng PADLET, các record trong MEDIAFILE sẽ tự động bị xóa
        // nếu bạn đã thiết lập 'ON DELETE CASCADE' cho khóa ngoại.
        // Nếu không, bạn cần xóa từ MEDIAFILE trước.
        await db.query('DELETE FROM PADLET WHERE ID = ?', [padletId]);
        
        res.status(200).json({ message: 'Padlet note and its files deleted successfully.' });
    } catch (error) {
        console.error('Error deleting padlet note:', error);
        res.status(500).json({ error: 'An error occurred while deleting the padlet note.' });
    }
});

module.exports = router;