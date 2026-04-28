/**
 * Data Management - Settings Module (Local Mode)
 */
(function(Handler) {
    const _ = Handler._internal;

    // Helper to get/set local system settings (using the same logic as inventoryDataManager for consistency)
    const getSystemSettingValue = async (key, defaultValue = null) => {
        if (!_.collectionCache.system_settings) _.collectionCache.system_settings = { data: [], timestamp: 0 };
        const items = _.collectionCache.system_settings.data;
        const item = items.find(i => i.key === key);
        return item ? (item.value ?? defaultValue) : defaultValue;
    };

    const saveSystemSettingValue = async (key, value) => {
        if (!_.collectionCache.system_settings) _.collectionCache.system_settings = { data: [], timestamp: 0 };
        const items = _.collectionCache.system_settings.data;
        const index = items.findIndex(i => i.key === key);
        if (index !== -1) {
            items[index].value = value;
            items[index].updated = new Date().toISOString();
        } else {
            items.push({ key, value, id: 'sys-' + Math.random().toString(36).substr(2, 9), created: new Date().toISOString() });
        }
        _.collectionCache.system_settings.timestamp = Date.now();
        _.savePersistentCache();
    };

    Handler.getBranding = async function() {
        await _.initPromise;
        const data = await getSystemSettingValue('branding', _.staticBranding);
        localStorage.setItem(_.BRANDING_CACHE_KEY, JSON.stringify(data));
        return data;
    };

    Handler.getBrandingSync = function() {
        const cached = localStorage.getItem(_.BRANDING_CACHE_KEY);
        return cached ? JSON.parse(cached) : _.staticBranding;
    };

    Handler.saveBranding = async function(data) {
        await _.initPromise;
        localStorage.setItem(_.BRANDING_CACHE_KEY, JSON.stringify(data));
        await saveSystemSettingValue('branding', data);
    };

    Handler.getGlobalSettings = async function() {
        await _.initPromise;
        
        const defaults = { 
            showTotalItems: true, 
            showLowStock: true, 
            showSuppliersOnly: true, 
            showRecentArrivals: true, 
            showRecentShipments: true, 
            showCriticalReplenishment: true,
            showPredictiveReplenish: true,
            showInnoAssistant: true,
            showCategoryPerformance: true, 
            showWarehouseHealth: true, 
            globalDarkMode: false 
        };
        
        return await getSystemSettingValue('global', defaults);
    };

    Handler.saveGlobalSettings = async function(data) {
        await _.initPromise;
        await saveSystemSettingValue('global', data);
    };

})(window.AppDataHandler);
