/**
 * Database Manager - Handles local data storage with JSON files
 * Can be synchronized with Google Drive
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DatabaseManager {
  constructor(dataDir = process.env.DATA_DIR || './data') {
    this.dataDir = dataDir;
    this.ensureDataDirectory();
    this.collections = {
      users: 'users.json',
      customers: 'customers.json',
      billing: 'billing.json',
      staff: 'staff.json',
      subscriptions: 'subscriptions.json',
      publications: 'publications.json',
      grievances: 'grievances.json',
      transactions: 'transactions.json',
      areas: 'areas.json',
      settings: 'settings.json'
    };

    this.initializeCollections();
  }

  /**
   * Ensure data directory exists
   */
  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Initialize all collections
   */
  initializeCollections() {
    Object.values(this.collections).forEach(file => {
      const filePath = path.join(this.dataDir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    });
  }

  /**
   * Read a collection
   */
  read(collectionName) {
    const fileName = this.collections[collectionName];
    if (!fileName) {
      throw new Error(`Collection "${collectionName}" not found`);
    }

    const filePath = path.join(this.dataDir, fileName);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Write to a collection
   */
  write(collectionName, data) {
    const fileName = this.collections[collectionName];
    if (!fileName) {
      throw new Error(`Collection "${collectionName}" not found`);
    }

    const filePath = path.join(this.dataDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Find records in collection
   */
  find(collectionName, query = {}) {
    const data = this.read(collectionName);
    return data.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  /**
   * Find single record
   */
  findOne(collectionName, query = {}) {
    const results = this.find(collectionName, query);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Insert a record
   */
  insert(collectionName, record) {
    const data = this.read(collectionName);
    const newRecord = {
      id: uuidv4(),
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newRecord);
    this.write(collectionName, data);
    return newRecord;
  }

  /**
   * Update a record
   */
  update(collectionName, id, updates) {
    const data = this.read(collectionName);
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error(`Record with ID "${id}" not found`);
    }

    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.write(collectionName, data);
    return data[index];
  }

  /**
   * Delete a record
   */
  delete(collectionName, id) {
    const data = this.read(collectionName);
    const filtered = data.filter(item => item.id !== id);

    if (filtered.length === data.length) {
      throw new Error(`Record with ID "${id}" not found`);
    }

    this.write(collectionName, filtered);
    return true;
  }

  /**
   * Count records
   */
  count(collectionName, query = {}) {
    return this.find(collectionName, query).length;
  }

  /**
   * Get all records with pagination
   */
  paginate(collectionName, page = 1, limit = 10, query = {}) {
    const data = this.find(collectionName, query);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: data.slice(start, end),
      pagination: {
        page,
        limit,
        total: data.length,
        pages: Math.ceil(data.length / limit)
      }
    };
  }

  /**
   * Export all data
   */
  exportAll() {
    const exportData = {};
    Object.keys(this.collections).forEach(key => {
      exportData[key] = this.read(key);
    });
    return exportData;
  }

  /**
   * Import all data (replace existing)
   */
  importAll(data) {
    Object.keys(data).forEach(key => {
      if (this.collections[key]) {
        this.write(key, data[key]);
      }
    });
  }

  /**
   * Backup database to JSON
   */
  backup(backupName = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = backupName || `backup-${timestamp}.json`;
    const backupPath = path.join(this.dataDir, fileName);

    const allData = this.exportAll();
    fs.writeFileSync(backupPath, JSON.stringify(allData, null, 2));

    return {
      fileName,
      path: backupPath,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Restore from backup
   */
  restore(backupPath) {
    const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    this.importAll(data);
    return { success: true, message: 'Database restored from backup' };
  }

  /**
   * Get database statistics
   */
  getStats() {
    const stats = {};
    Object.keys(this.collections).forEach(key => {
      stats[key] = this.count(key);
    });
    return stats;
  }

  /**
   * Clear all data
   */
  clear() {
    Object.keys(this.collections).forEach(key => {
      this.write(key, []);
    });
  }
}

module.exports = DatabaseManager;
