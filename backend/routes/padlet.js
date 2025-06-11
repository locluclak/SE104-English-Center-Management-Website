const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage, 
    limits: { fileSize: 20 * 1024 * 1024 } // Limit file size to 20 MB
});

// Create a padlet note with attachments
router.post('/create', upload.array('attachments'), async (req, res) => {
    const { name, content, ownerId } = req.body;

    if (!name || !content || !ownerId) {
        return res.status(400).json({ error: 'Name, content, and ownerId are required.' });
    }

    try {
        // Insert padlet note into the database
        const [result] = await db.execute(
            'INSERT INTO PADLET (NAME, CONTENT, CREATETIME, OWNERID) VALUES (?, ?, NOW(), ?)',
            [name, content, ownerId]
        );

        const padletId = result.insertId;

        // Save attached files into the MEDIAFILE table
        if (req.files && req.files.length > 0) {
            const fileInserts = req.files.map(file => [
                padletId,
                file.originalname,
                file.mimetype,
                file.path,
            ]);

            await db.query(
                'INSERT INTO MEDIAFILE (NOTEID, FILENAME, TYPE, FILEPATH) VALUES ?',
                [fileInserts]
            );
        }

        res.status(201).json({ message: 'Padlet note created successfully.', padletId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the padlet note.' });
    }
});

// Get all padlet notes and their attachments for a specific person
router.get('/notes/:ownerId', async (req, res) => {
    const { ownerId } = req.params;

    try {
        // Query to fetch padlet notes and their attachments for the given ownerId
        const [padlets] = await db.query(
            `SELECT p.ID AS padletId, p.NAME AS padletName, p.CONTENT AS padletContent, p.CREATETIME AS createTime, 
                    JSON_ARRAYAGG(m.FILENAME) AS attachmentNames
             FROM PADLET p
             LEFT JOIN MEDIAFILE m ON p.ID = m.NOTEID
             WHERE p.OWNERID = ?
             GROUP BY p.ID`,
            [ownerId]
        );

        res.status(200).json({ padlets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching padlet notes.' });
    }
});

// Edit a padlet note, including adding and removing attachments
router.put('/edit/:padletId', upload.array('attachments'), async (req, res) => {
    const { padletId } = req.params;
    const { name, content, removeAttachment } = req.body;
    console.log("hi");
    try {
        // Update the padlet note's name and content
        if (name || content) {
            await db.execute(
                'UPDATE PADLET SET NAME = COALESCE(?, NAME), CONTENT = COALESCE(?, CONTENT) WHERE ID = ?',
                [name, content, padletId]
            );
        }
        let removeAttachments = []
        removeAttachments = JSON.parse(removeAttachment);

        // Remove specified attachments
        if (removeAttachments && Array.isArray(removeAttachments)) {
            try {
                const [filesToDelete] = await db.query(
                    'SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ? AND FILENAME IN (?)',
                    [padletId, removeAttachments]
                );
 
                if (filesToDelete.length > 0) {
                    // Delete files from the filesystem
                    for (const file of filesToDelete) {
                        console.log(`File: ${file.FILEPATH}`);

                        try {
                            fs.unlinkSync(file.FILEPATH);
                            console.log(`File deleted: ${file.FILEPATH}`);
                        } catch (err) {
                            console.error(`Failed to delete file: ${file.FILEPATH}`, err);
                        }
                    }

                    // Remove file records from the database
                    await db.query(
                        'DELETE FROM MEDIAFILE WHERE NOTEID = ? AND FILENAME IN (?)',
                        [padletId, removeAttachments]
                    );
                } else {
                    console.warn('No files found to delete for the specified filenames.');
                }
            } catch (error) {
                console.error('Error while removing attachments:', error);
            }
        }

        // Add new attachments
        if (req.files && req.files.length > 0) {
            const fileInserts = req.files.map(file => [
                padletId,
                file.originalname,
                file.mimetype,
                file.path,
            ]);

            await db.query(
                'INSERT INTO MEDIAFILE (NOTEID, FILENAME, TYPE, FILEPATH) VALUES ?',
                [fileInserts]
            );
        }

        res.status(200).json({ message: 'Padlet note updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the padlet note.' });
    }
});

// Delete a padlet note and all its associated files
router.delete('/delete/:padletId', async (req, res) => {
    const { padletId } = req.params;

    try {
        // Fetch all file paths associated with the padlet note
        const [filesToDelete] = await db.query(
            'SELECT FILEPATH FROM MEDIAFILE WHERE NOTEID = ?',
            [padletId]
        );

        // Delete files from the filesystem
        if (filesToDelete.length > 0) {
            for (const file of filesToDelete) {
                try {
                    fs.unlinkSync(file.FILEPATH);
                    console.log(`File deleted: ${file.FILEPATH}`);
                } catch (err) {
                    console.error(`Failed to delete file: ${file.FILEPATH}`, err);
                }
            }
        }

        // Delete the padlet note and its associated files from the database
        await db.query('DELETE FROM PADLET WHERE ID = ?', [padletId]);

        res.status(200).json({ message: 'Padlet note and its files deleted successfully.' });
    } catch (error) {
        console.error('Error while deleting padlet note:', error);
        res.status(500).json({ error: 'An error occurred while deleting the padlet note.' });
    }
});

module.exports = router;