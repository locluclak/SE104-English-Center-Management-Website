const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

const router = express.Router();

// Multer cấu hình
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }
}).fields([
  { name: 'attachments' },
  { name: 'audio', maxCount: 1 }
]);

// Hàm helper xử lý media insert
const prepareFileInsert = (padletId, file, mediaType = 'attachment') => ([
  padletId,
  file.originalname,
  file.mimetype,
  file.path,
  mediaType
]);

// === CREATE ===
router.post('/create', upload, async (req, res) => {
  const { name, content, ownerId, color } = req.body;
  if (!name || !content || !ownerId) return res.status(400).json({ error: 'Thiếu trường bắt buộc' });

  try {
    const [result] = await db.execute(
      'INSERT INTO PADLET (NAME, CONTENT, CREATETIME, OWNERID, COLOR) VALUES (?, ?, NOW(), ?, ?)',
      [name, content, ownerId, color || '#ffffff']
    );

    const padletId = result.insertId;
    const files = [];

    const attachments = req.files?.attachments || [];
    const audio = req.files?.audio?.[0];

    attachments.forEach(file => files.push(prepareFileInsert(padletId, file, 'attachment')));
    if (audio) files.push(prepareFileInsert(padletId, audio, 'audio'));

    if (files.length > 0) {
      await db.query('INSERT INTO MEDIAFILE (NOTEID, FILENAME, TYPE, FILEPATH, MEDIATYPE) VALUES ?', [files]);
    }

    res.status(201).json({ message: 'Tạo ghi chú thành công', padletId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi tạo ghi chú' });
  }
});

// === GET NOTES ===
router.get('/notes/:ownerId', async (req, res) => {
  const { ownerId } = req.params;

  try {
    const [padlets] = await db.query(`
      SELECT 
        p.ID AS padletId,
        p.NAME AS padletName,
        p.CONTENT AS padletContent,
        p.COLOR AS color,
        p.CREATETIME AS createTime,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', m.ID,
            'fileName', m.FILENAME,
            'fileType', m.TYPE,
            'mediaType', m.MEDIATYPE,
            'downloadUrl', m.FILEPATH
          )
        ) AS attachmentsData
      FROM PADLET p
      LEFT JOIN MEDIAFILE m ON p.ID = m.NOTEID
      WHERE p.OWNERID = ?
      GROUP BY p.ID
      ORDER BY p.CREATETIME DESC
    `, [ownerId]);

    res.status(200).json({ padlets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi tải ghi chú' });
  }
});

// === EDIT ===
router.put('/edit/:padletId', upload, async (req, res) => {
  const { padletId } = req.params;
  const { name, content, color, removeAttachment, removeAudio } = req.body;

  try {
    await db.execute(
      'UPDATE PADLET SET NAME = COALESCE(?, NAME), CONTENT = COALESCE(?, CONTENT), COLOR = COALESCE(?, COLOR) WHERE ID = ?',
      [name, content, color, padletId]
    );

    // Xoá đính kèm
    if (removeAttachment) {
      const removeList = JSON.parse(removeAttachment);
      if (Array.isArray(removeList) && removeList.length > 0) {
        const [filesToDelete] = await db.query(
          'SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ? AND ID IN (?)',
          [padletId, removeList]
        );

        for (const file of filesToDelete) {
          try { if (fs.existsSync(file.FILEPATH)) fs.unlinkSync(file.FILEPATH); } catch (_) {}
        }

        await db.query('DELETE FROM MEDIAFILE WHERE NOTEID = ? AND ID IN (?)', [padletId, removeList]);
      }
    }

    // Xoá audio cũ nếu cần
    if (removeAudio === 'true') {
      const [audioFiles] = await db.query(
        'SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ? AND MEDIATYPE = "audio"',
        [padletId]
      );

      for (const file of audioFiles) {
        try { if (fs.existsSync(file.FILEPATH)) fs.unlinkSync(file.FILEPATH); } catch (_) {}
      }

      await db.query('DELETE FROM MEDIAFILE WHERE NOTEID = ? AND MEDIATYPE = "audio"', [padletId]);
    }

    // Thêm file mới
    const files = [];
    const attachments = req.files?.attachments || [];
    const audio = req.files?.audio?.[0];

    attachments.forEach(file => files.push(prepareFileInsert(padletId, file, 'attachment')));
    if (audio) files.push(prepareFileInsert(padletId, audio, 'audio'));

    if (files.length > 0) {
      await db.query('INSERT INTO MEDIAFILE (NOTEID, FILENAME, TYPE, FILEPATH, MEDIATYPE) VALUES ?', [files]);
    }

    res.status(200).json({ message: 'Cập nhật ghi chú thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi cập nhật ghi chú' });
  }
});

// === DELETE ===
router.delete('/delete/:padletId', async (req, res) => {
  const { padletId } = req.params;

  try {
    const [files] = await db.query('SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ?', [padletId]);

    for (const file of files) {
      try { if (fs.existsSync(file.FILEPATH)) fs.unlinkSync(file.FILEPATH); } catch (_) {}
    }

    await db.query('DELETE FROM PADLET WHERE ID = ?', [padletId]);
    res.status(200).json({ message: 'Đã xoá ghi chú và file đính kèm' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi xoá ghi chú' });
  }
});

module.exports = router;
