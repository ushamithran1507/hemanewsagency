/**
 * Google Drive Integration Routes
 * Handles backup, restore, sync with Google Drive
 */

const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const GoogleDriveManager = require('../utils/GoogleDriveManager');
const DatabaseManager = require('../utils/DatabaseManager');
const { AppError } = require('../middleware/errorHandler');

const gdrive = new GoogleDriveManager();
const db = new DatabaseManager();

/**
 * Get Google Drive status - GET /api/gdrive/status
 */
router.get('/status', async (req, res, next) => {
  try {
    const isConfigured = !!process.env.GOOGLE_CLIENT_ID;
    const stats = db.getStats();

    res.json({
      success: true,
      data: {
        configured: isConfigured,
        backupEnabled: process.env.USE_GOOGLE_DRIVE === 'true',
        databaseStats: stats,
        lastBackup: null  // Would be read from metadata
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create backup in Google Drive - POST /api/gdrive/backup
 */
router.post('/backup', authorize('admin'), async (req, res, next) => {
  try {
    const { backupName } = req.body;

    // Get all data
    const allData = db.exportAll();

    // If Google Drive is configured
    if (process.env.USE_GOOGLE_DRIVE === 'true' && req.user.driveRefreshToken) {
      try {
        const accessToken = await gdrive.getAccessToken(req.user.driveRefreshToken);
        const driveResult = await gdrive.backupData(accessToken, allData, backupName);

        res.json({
          success: true,
          message: 'Backup created successfully',
          data: driveResult
        });
      } catch (error) {
        console.error('Google Drive backup failed:', error);
        throw new AppError('Google Drive backup failed', 500, 'BACKUP_FAILED');
      }
    } else {
      // Local backup only
      const localBackup = db.backup(backupName);

      res.json({
        success: true,
        message: 'Local backup created successfully',
        data: {
          ...localBackup,
          storage: 'local'
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * List backups - GET /api/gdrive/backups
 */
router.get('/backups', authorize('admin'), async (req, res, next) => {
  try {
    let backups = [];

    if (process.env.USE_GOOGLE_DRIVE === 'true' && req.user.driveRefreshToken) {
      try {
        const accessToken = await gdrive.getAccessToken(req.user.driveRefreshToken);
        backups = await gdrive.listFiles(accessToken, "name contains 'hema-news-backup'");
      } catch (error) {
        console.error('Failed to list Google Drive backups:', error);
      }
    }

    res.json({
      success: true,
      data: {
        backups,
        count: backups.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Restore from backup - POST /api/gdrive/restore
 */
router.post('/restore', authorize('admin'), async (req, res, next) => {
  try {
    const { backupId, isLocalBackup } = req.body;

    if (!backupId) {
      throw new AppError('Backup ID required', 400, 'INVALID_INPUT');
    }

    let restoredData;

    if (isLocalBackup) {
      // Restore from local backup
      const localPath = `./data/${backupId}`;
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
      restoredData = data.data || data;
    } else if (process.env.USE_GOOGLE_DRIVE === 'true' && req.user.driveRefreshToken) {
      // Restore from Google Drive
      const accessToken = await gdrive.getAccessToken(req.user.driveRefreshToken);
      restoredData = await gdrive.restoreData(accessToken, backupId);
    } else {
      throw new AppError('Google Drive not configured', 400, 'GDRIVE_NOT_CONFIGURED');
    }

    // Import the data
    db.importAll(restoredData);

    res.json({
      success: true,
      message: 'Data restored successfully from backup',
      data: {
        recordsRestored: Object.keys(restoredData).length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Sync data with Google Drive - POST /api/gdrive/sync
 */
router.post('/sync', authorize('admin'), async (req, res, next) => {
  try {
    if (process.env.USE_GOOGLE_DRIVE !== 'true') {
      throw new AppError('Google Drive sync not enabled', 400, 'SYNC_DISABLED');
    }

    if (!req.user.driveRefreshToken) {
      throw new AppError('Google Drive not connected', 401, 'GDRIVE_NOT_CONNECTED');
    }

    const accessToken = await gdrive.getAccessToken(req.user.driveRefreshToken);
    const allData = db.exportAll();

    // Create timestamped sync file
    const syncFileName = `sync-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const result = await gdrive.createFile(
      accessToken,
      syncFileName,
      'application/json',
      JSON.stringify({
        type: 'sync',
        timestamp: new Date().toISOString(),
        data: allData
      }, null, 2)
    );

    res.json({
      success: true,
      message: 'Data synced with Google Drive',
      data: {
        fileId: result.id,
        fileName: syncFileName,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Export data - POST /api/gdrive/export
 */
router.post('/export', authorize('admin'), (req, res, next) => {
  try {
    const { format = 'json' } = req.body;
    const allData = db.exportAll();

    let content, mimeType, extension;

    if (format === 'csv') {
      // Convert to CSV (simplified - only customers)
      const customers = allData.customers || [];
      const csv = [
        ['ID', 'Name', 'Email', 'Mobile', 'Area', 'Status'].join(','),
        ...customers.map(c =>
          [c.id, c.name, c.email, c.mobileNumber, c.area, c.status].join(',')
        )
      ].join('\n');

      content = csv;
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      content = JSON.stringify(allData, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    }

    const filename = `hema-news-export-${new Date().toISOString().split('T')[0]}.${extension}`;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error) {
    next(error);
  }
});

/**
 * Setup Google Drive folder structure - POST /api/gdrive/setup
 */
router.post('/setup', authorize('admin'), async (req, res, next) => {
  try {
    if (process.env.USE_GOOGLE_DRIVE !== 'true') {
      throw new AppError('Google Drive not enabled', 400, 'GDRIVE_NOT_ENABLED');
    }

    if (!req.user.driveRefreshToken) {
      throw new AppError('Google Drive not connected', 401, 'GDRIVE_NOT_CONNECTED');
    }

    const accessToken = await gdrive.getAccessToken(req.user.driveRefreshToken);
    const result = await gdrive.setupFolderStructure(accessToken);

    res.json({
      success: true,
      message: 'Google Drive folder structure initialized',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get backup file content - GET /api/gdrive/backup/:fileId/content
 */
router.get('/backup/:fileId/content', authorize('admin'), async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (process.env.USE_GOOGLE_DRIVE !== 'true' || !req.user.driveRefreshToken) {
      throw new AppError('Google Drive not configured', 400, 'GDRIVE_NOT_CONFIGURED');
    }

    const accessToken = await gdrive.getAccessToken(req.user.driveRefreshToken);
    const content = await gdrive.readFile(accessToken, fileId);

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete backup - DELETE /api/gdrive/backup/:fileId
 */
router.delete('/backup/:fileId', authorize('admin'), async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (process.env.USE_GOOGLE_DRIVE !== 'true' || !req.user.driveRefreshToken) {
      throw new AppError('Google Drive not configured', 400, 'GDRIVE_NOT_CONFIGURED');
    }

    const accessToken = await gdrive.getAccessToken(req.user.driveRefreshToken);
    await gdrive.deleteFile(accessToken, fileId);

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
