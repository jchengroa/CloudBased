/**
 * ==========================================
 * APP DATA HANDLER
 * ==========================================
 * Controller handling data flow between the "save files" (backend) 
 * and the application logic (frontend).
 * 
 * For now, temporary data is hardcoded here instead of scattered across UI components.
 */

window.AppDataHandler = (function () {

    // Helper to simulate "temporary JSON files" using localStorage
    const storagePrefix = 'cloudbased_tmp_';

    // Prioritized data fetcher
    // 1. Check localStorage (Session edits)
    // 2. Try fetching primary file (e.g., settings.json)
    // 3. Try fetching fallback file (e.g., defaultsettings.json) 
    async function fetchData(primaryPath, fallbackPath = null, defaultData = []) {
        // --- 1. SESSION CACHE ---
        const fileName = primaryPath.split('/').pop().split('.')[0];
        const cached = localStorage.getItem(storagePrefix + fileName);
        if (cached) {
            try { return JSON.parse(cached); } catch (e) {}
        }

        // --- 2. PRIMARY FILE (e.g. settings.json) ---
        try {
            const response = await fetch(primaryPath);
            if (response.ok) return await response.json();
        } catch (error) {}

        // --- 3. FALLBACK FILE (e.g. defaultsettings.json) ---
        if (fallbackPath) {
            try {
                const response = await fetch(fallbackPath);
                if (response.ok) return await response.json();
            } catch (error) {}
        }

        return defaultData;
    }

    async function saveData(filePath, data) {
        const fileName = filePath.split('/').pop().split('.')[0];
        localStorage.setItem(storagePrefix + fileName, JSON.stringify(data));
    }

    return {
        // --- Fetch Methods ---
        getInventory: async function () {
            // Priority: inventory.json -> empty array
            return await fetchData('AppData/inventory.json', null, []);
        },

        getSuppliers: async function () {
            // Priority: suppliers.json -> empty array
            return await fetchData('AppData/suppliers.json', null, []);
        },

        getUOMs: async function () {
            // Priority: uoms.json -> defaultuoms.json -> piece array
            return await fetchData('AppData/uoms.json', 'AppData/defaultuoms.json', ["Pieces", "Boxes", "Bags"]);
        },

        getWarehouses: async function () {
            // Priority: warehouses.json -> default warehouse
            return await fetchData('AppData/warehouses.json', null, ["Main Warehouse"]);
        },

        getSettings: async function () {
            // Priority: settings.json -> defaultsettings.json -> default object
            return await fetchData('AppData/settings.json', 'AppData/defaultsettings.json', { theme: "light", lowStockThreshold: 1000, isThresholdEnabled: true });
        },

        // --- Save / Update Methods ---
        saveInventory: async function (newData) {
            saveData('AppData/inventory.json', newData);
        },

        saveSuppliers: async function (newData) {
            saveData('AppData/suppliers.json', newData);
        },

        saveUOMs: async function (newData) {
            saveData('AppData/uoms.json', newData);
        },

        saveWarehouses: async function (newData) {
            saveData('AppData/warehouses.json', newData);
        },

        saveSettings: async function (newSettings) {
            saveData('AppData/settings.json', newSettings);
        }
    };
})();
