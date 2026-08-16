/**
 * Google Drive Integration Module
 * Handles backup, restore, and real-time sync with Google Drive
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class GoogleDriveManager {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  /**
   * Get or refresh access token
   */
  async getAccessToken(refreshToken) {
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw new Error('Failed to refresh Google Drive access token');
    }
  }

  /**
   * Create a file in Google Drive
   */
  async createFile(accessToken, fileName, mimeType, content) {
    try {
      const metadata = {
        name: fileName,
        mimeType: mimeType,
        parents: [this.folderId]
      };

      const response = await axios.post(
        'https://www.googleapis.com/drive/v3/files?uploadType=multipart',
        {
          metadata: metadata,
          content: content
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to create file in Google Drive:', error);
      throw error;
    }
  }

  /**
   * Update a file in Google Drive
   */
  async updateFile(accessToken, fileId, content) {
    try {
      const response = await axios.patch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?uploadType=media`,
        content,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to update file in Google Drive:', error);
      throw error;
    }
  }

  /**
   * Read a file from Google Drive
   */
  async readFile(accessToken, fileId) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to read file from Google Drive:', error);
      throw error;
    }
  }

  /**
   * List files in Google Drive folder
   */
  async listFiles(accessToken, query = '') {
    try {
      const q = query ? `${query} and '${this.folderId}' in parents` : `'${this.folderId}' in parents`;

      const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data.files || [];
    } catch (error) {
      console.error('Failed to list files in Google Drive:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(accessToken, fileId) {
    try {
      await axios.delete(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Failed to delete file from Google Drive:', error);
      throw error;
    }
  }

  /**
   * Backup all data to Google Drive
   */
  async backupData(accessToken, data, backupName = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = backupName || `hema-news-backup-${timestamp}.json`;

      const fileData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: data
      };

      const response = await this.createFile(
        accessToken,
        fileName,
        'application/json',
        JSON.stringify(fileData, null, 2)
      );

      console.log(`✓ Backup created: ${fileName} (ID: ${response.id})`);

      return {
        success: true,
        fileId: response.id,
        fileName: fileName,
        timestamp: fileData.timestamp
      };
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore data from Google Drive backup
   */
  async restoreData(accessToken, fileId) {
    try {
      const fileContent = await this.readFile(accessToken, fileId);
      return fileContent.data;
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  /**
   * Create a shared link for a file
   */
  async createShareLink(accessToken, fileId) {
    try {
      const response = await axios.patch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink,webContentLink`,
        {
          'kind': 'drive#permission',
          'type': 'anyone',
          'role': 'reader'
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to create share link:', error);
      throw error;
    }
  }

  /**
   * Setup folder structure in Google Drive
   */
  async setupFolderStructure(accessToken) {
    const folders = [
      'backups',
      'exports',
      'imports',
      'archives',
      'reports'
    ];

    try {
      for (const folderName of folders) {
        const existingFolders = await this.listFiles(
          accessToken,
          `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`
        );

        if (existingFolders.length === 0) {
          await this.createFile(
            accessToken,
            folderName,
            'application/vnd.google-apps.folder',
            null
          );
        }
      }

      return { success: true, message: 'Folder structure initialized' };
    } catch (error) {
      console.error('Failed to setup folder structure:', error);
      throw error;
    }
  }
}

module.exports = GoogleDriveManager;
