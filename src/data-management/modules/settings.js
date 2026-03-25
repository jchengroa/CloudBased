/**
 * Data Management - Settings Module
 */
(function(Handler) {
    const _ = Handler._internal;

    Handler.getBranding = async function() {
        await _.brandingFetch;
        try {
            if (_.db) {
                const doc = await _.db.collection('settings').doc('branding').get();
                if (doc.exists) {
                    const data = doc.data();
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
        await _.db.collection('settings').doc('branding').set(data, { merge: true });
    };

    Handler.getGlobalSettings = async function() {
        await _.initPromise;
        try {
            const doc = await _.db.collection('settings').doc('global').get();
            if (doc.exists) return doc.data();
        } catch(e) {}
        return { showTotalItems: true, showLowStock: true, showSuppliersOnly: true, showRecentArrivals: true, showRecentShipments: true, showCategoryPerformance: true, showWarehouseDistribution: true, globalDarkMode: false };
    };

    Handler.saveGlobalSettings = async function(data) {
        await _.initPromise;
        await _.db.collection('settings').doc('global').set(data, { merge: true });
    };

})(window.AppDataHandler);
