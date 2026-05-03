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
        this.available = this.checkAvailability();
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
        if (!this.available) return false;

        try {
            const fullKey = this.getKey(key);
            const data = JSON.stringify(value);

            // Check size
            if (this.willExceedLimit(key, data)) {
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
        if (!this.available) return null;

        try {
            const fullKey = this.getKey(key);
            const data = localStorage.getItem(fullKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from storage:', e);
            this.remove(key);
            return null;
        }
    }

    /**
     * Remove item from localStorage
     */
    remove(key) {
        if (!this.available) return false;

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
        if (!this.available) return false;

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
    getStorageUsage(excludeKey = null) {
        if (!this.available) {
            return {
                used: 0,
                max: MAX_STORAGE_SIZE,
                percentage: 0,
                isNearLimit: false
            };
        }

        const excludedFullKey = excludeKey ? this.getKey(excludeKey) : null;
        let total = 0;
        Object.keys(localStorage).forEach(key => {
            if (key !== excludedFullKey && key.startsWith(this.prefix)) {
                total += localStorage[key].length + key.length;
            }
        });

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
    willExceedLimit(key, newData) {
        const current = this.getStorageUsage(key);
        return (current.used + newData.length) > MAX_STORAGE_SIZE;
    }

    /**
     * Export all data as JSON
     */
    exportAll() {
        if (!this.available) return false;

        const allData = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.prefix)) {
                const shortKey = key.replace(this.prefix, '');
                allData[shortKey] = this.get(shortKey);
            }
        });

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
        if (!this.available) return false;

        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            if (!data || typeof data !== 'object' || Array.isArray(data)) {
                throw new Error('Imported data must be a JSON object');
            }

            Object.keys(data).forEach(key => {
                this.set(key, data[key]);
            });
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
        if (!this.available) return;

        const timestamp = new Date().toISOString();
        localStorage.setItem(this.getKey('last_modified'), timestamp);
    }

    /**
     * Get last modified timestamp
     */
    getLastModified() {
        if (!this.available) return null;

        return localStorage.getItem(this.getKey('last_modified'));
    }

    /**
     * Add storage listener
     */
    addListener(callback) {
        if (typeof callback !== 'function') return () => {};

        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    /**
     * Notify all listeners
     */
    notifyListeners(action, key, value) {
        this.listeners.forEach(cb => {
            try {
                cb({ action, key, value });
            } catch (e) {
                console.error('Storage listener failed:', e);
            }
        });
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

