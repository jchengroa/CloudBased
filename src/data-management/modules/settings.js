/**
 * Data Management - Settings Module
 */
(function(Handler) {
    const _ = Handler._internal;

    Handler.getBranding = async function() {
        await _.initPromise;
        
        // 1. Firebase Cloud Mode
        if (_.getMode() === 'FIREBASE') {
            try {
                const results = await window.FirebaseBridge.getData('system');
                const brand = results.find(r => r.id === 'branding');
                if (brand) {
                    localStorage.setItem(_.BRANDING_CACHE_KEY, JSON.stringify(brand));
                    return brand;
                }
            } catch(e) { console.warn("Firebase Brand fetch failed, trying cache."); }
        }
        
        // 2. PocketBase Mode
        try {
            if (_.pb) {
                const list = await _.pb.collection('system_settings').getList(1, 1, { filter: 'key="branding"' });
                if (list.items.length > 0) {
                    const data = list.items[0].value;
                    localStorage.setItem(_.BRANDING_CACHE_KEY, JSON.stringify(data));
                    return data;
                }
            }
        } catch(e) {}
        
        const cached = localStorage.getItem(_.BRANDING_CACHE_KEY);
        return cached ? JSON.parse(cached) : _.staticBranding;
    };

    Handler.getBrandingSync = function() {
        const cached = localStorage.getItem(_.BRANDING_CACHE_KEY);
        return cached ? JSON.parse(cached) : _.staticBranding;
    };

    Handler.saveBranding = async function(data) {
        await _.initPromise;
        localStorage.setItem(_.BRANDING_CACHE_KEY, JSON.stringify(data));
        
        // Firebase Cloud Mode
        if (_.getMode() === 'FIREBASE') {
            return window.FirebaseBridge.upsertData('system', { id: 'branding', ...data });
        }
        
        // PocketBase Mode
        const list = await _.pb.collection('system_settings').getList(1, 1, { filter: 'key="branding"' });
        if (list.items.length > 0) {
            return _.pb.collection('system_settings').update(list.items[0].id, { value: data });
        } else {
            return _.pb.collection('system_settings').create({ key: 'branding', value: data });
        }
    };

    Handler.getGlobalSettings = async function() {
        await _.initPromise;
        
        // Firebase Cloud Mode
        if (_.getMode() === 'FIREBASE') {
            try {
                const results = await window.FirebaseBridge.getData('system');
                const settings = results.find(r => r.id === 'global_settings');
                if (settings) return settings;
            } catch(e) {}
        } else {
            // PocketBase Mode
            try {
                const list = await _.pb.collection('system_settings').getList(1, 1, { filter: 'key="global"' });
                if (list.items.length > 0) return list.items[0].value;
            } catch(e) {}
        }
        
        // Shared Default Fallback
        return { 
            showTotalItems: true, 
            showLowStock: true, 
            showSuppliersOnly: true, 
            showRecentArrivals: true, 
            showRecentShipments: true, 
            showCategoryPerformance: true, 
            showWarehouseDistribution: true, 
            globalDarkMode: false 
        };
    };

    Handler.saveGlobalSettings = async function(data) {
        await _.initPromise;
        
        // Firebase Cloud Mode
        if (_.getMode() === 'FIREBASE') {
            return window.FirebaseBridge.upsertData('system', { id: 'global_settings', ...data });
        }
        
        // PocketBase Mode
        const list = await _.pb.collection('system_settings').getList(1, 1, { filter: 'key="global"' });
        if (list.items.length > 0) {
            return _.pb.collection('system_settings').update(list.items[0].id, { value: data });
        } else {
            return _.pb.collection('system_settings').create({ key: 'global', value: data });
        }
    };

})(window.AppDataHandler);
