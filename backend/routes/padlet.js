const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

const router = express.Router();

// HELPER FUNCTION: tạo đường dẫn tương đối, an toàn cho URL
const getRelativePath = (file) => {
  if (!file) return null;
  return path.join(file.destination, file.filename).replace(/\\/g, "/");
};

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
}).fields([
  { name: 'attachments' },
  { name: 'audio', maxCount: 1 }
]);

// === ROUTES ===

// 1. Tạo padlet mới
router.post('/create', upload, async (req, res) => {
  console.log("FILES:", req.files);
  console.log("BODY:", req.body);

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

    const allFiles = [];
    const attachments = req.files?.attachments || [];
    const audio = req.files?.audio || [];

    attachments.forEach(file => {
      allFiles.push({ ...file, mediaType: 'attachment' });
    });

    audio.forEach(file => {
      allFiles.push({ ...file, mediaType: 'audio' });
    });

    if (allFiles.length > 0) {
      const fileInserts = allFiles.map(file => [
        padletId,
        file.originalname,
        file.mimetype,
        getRelativePath(file),
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

// 2. Lấy danh sách ghi chú
router.get('/notes/:ownerId', async (req, res) => {
  const { ownerId } = req.params;

  try {
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

// 3. Cập nhật ghi chú
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
      try {
        removeAttachments = JSON.parse(removeAttachment);
      } catch (e) {
        console.warn("Could not parse removeAttachment JSON:", removeAttachment);
      }
    }

    if (Array.isArray(removeAttachments) && removeAttachments.length > 0) {
      const [filesToDelete] = await db.query(
        'SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ? AND FILENAME IN (?)',
        [padletId, removeAttachments]
      );
      for (const file of filesToDelete) {
        if (fs.existsSync(file.FILEPATH)) {
          fs.unlink(file.FILEPATH, (err) => {
            if (err) console.error(`Failed to delete file: ${file.FILEPATH}`, err);
          });
        }
      }
      await db.query('DELETE FROM MEDIAFILE WHERE NOTEID = ? AND FILENAME IN (?)', [padletId, removeAttachments]);
    }

    const allNewFiles = [];
    const attachments = req.files?.attachments || [];
    const audio = req.files?.audio || [];

    attachments.forEach(file => {
      allNewFiles.push({ ...file, mediaType: 'attachment' });
    });

    audio.forEach(file => {
      allNewFiles.push({ ...file, mediaType: 'audio' });
    });

    if (allNewFiles.length > 0) {
      const fileInserts = allNewFiles.map(file => [
        padletId,
        file.originalname,
        file.mimetype,
        getRelativePath(file),
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

// 4. Xoá ghi chú
router.delete('/delete/:padletId', async (req, res) => {
  const { padletId } = req.params;
  try {
    const [filesToDelete] = await db.query('SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ?', [padletId]);

    for (const file of filesToDelete) {
      if (fs.existsSync(file.FILEPATH)) {
        fs.unlink(file.FILEPATH, (err) => {
          if (err) console.error(`Failed to delete file: ${file.FILEPATH}`, err);
        });
      }
    }

    await db.query('DELETE FROM PADLET WHERE ID = ?', [padletId]);

    res.status(200).json({ message: 'Padlet note and its files deleted successfully.' });
  } catch (error) {
    console.error('Error deleting padlet note:', error);
    res.status(500).json({ error: 'An error occurred while deleting the padlet note.' });
  }
});

module.exports = router;
