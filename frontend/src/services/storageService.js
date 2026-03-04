/**
 * Storage Service
 * Handles all browser LocalStorage operations with error handling
 * and size monitoring for the LinkedIn Extractor app
 */

const STORAGE_PREFIX = 'linkedin_extractor_';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
const WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB

class StorageService {
    constructor() {
        this.prefix = STORAGE_PREFIX;
        this.listeners = [];
        this.checkAvailability();
    }

    /**
     * Check if localStorage is available
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.error('LocalStorage not available:', e);
            return false;
        }
    }

    /**
     * Get full key with prefix
     */
    getKey(key) {
        return this.prefix + key;
    }

    /**
     * Set item in localStorage
     */
    set(key, value) {
        try {
            const fullKey = this.getKey(key);
            const data = JSON.stringify(value);

            // Check size
            if (this.willExceedLimit(data)) {
                throw new Error('Storage limit exceeded');
            }

            localStorage.setItem(fullKey, data);
            this.updateLastModified();
            this.notifyListeners('set', key, value);
            return true;
        } catch (e) {
            console.error('Error saving to storage:', e);
            return false;
        }
    }

    /**
     * Get item from localStorage
     */
    get(key) {
        try {
            const fullKey = this.getKey(key);
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from storage:', e);
            return null;
        }
    }

    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            const fullKey = this.getKey(key);
            localStorage.removeItem(fullKey);
            this.notifyListeners('remove', key);
            return true;
        } catch (e) {
            console.error('Error removing from storage:', e);
            return false;
        }
    }

    /**
     * Clear all app data
     */
    clearAll() {
        try {
            const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
            keys.forEach(key => localStorage.removeItem(key));
            this.notifyListeners('clear');
            return true;
        } catch (e) {
            console.error('Error clearing storage:', e);
            return false;
        }
    }

    /**
     * Get current storage usage
     */
    getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith(this.prefix)) {
                total += localStorage[key].length + key.length;
            }
        }
        return {
            used: total,
            max: MAX_STORAGE_SIZE,
            percentage: Math.round((total / MAX_STORAGE_SIZE) * 100),
            isNearLimit: total > WARNING_THRESHOLD
        };
    }

    /**
     * Check if adding data will exceed limit
     */
    willExceedLimit(newData) {
        const current = this.getStorageUsage();
        return (current.used + newData.length) > MAX_STORAGE_SIZE;
    }

    /**
     * Export all data as JSON
     */
    exportAll() {
        const allData = {};
        for (let key in localStorage) {
            if (key.startsWith(this.prefix)) {
                const shortKey = key.replace(this.prefix, '');
                allData[shortKey] = this.get(shortKey);
            }
        }

        const blob = new Blob([JSON.stringify(allData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linkedin-extractor-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return true;
    }

    /**
     * Import data from JSON
     */
    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            for (let key in data) {
                this.set(key, data[key]);
            }
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    }

    /**
     * Update last modified timestamp
     */
    updateLastModified() {
        const timestamp = new Date().toISOString();
        localStorage.setItem(this.getKey('last_modified'), timestamp);
    }

    /**
     * Get last modified timestamp
     */
    getLastModified() {
        return localStorage.getItem(this.getKey('last_modified'));
    }

    /**
     * Add storage listener
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners
     */
    notifyListeners(action, key, value) {
        this.listeners.forEach(cb => cb({ action, key, value }));
    }

    /**
     * Convenience methods for profile data
     */
    saveProfile(profileData) {
        return this.set('profile', profileData);
    }

    getProfile() {
        return this.get('profile');
    }

    clearProfile() {
        return this.remove('profile');
    }
}

export default new StorageService();

