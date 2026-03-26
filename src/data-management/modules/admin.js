/**
 * Data Management - Admin Module
 */
(function(Handler) {
    const _ = Handler._internal;

    const getData = (collection) => _.getDataInternal(collection);

    Handler.getActivityLogs = () => getData('activityLogs');

    Handler.addActivityLog = async function(log) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') {
            return window.FirebaseBridge.upsertData('activity_logs', {
                user: _.currentUser ? (_.currentUser.name || _.currentUser.username || 'System') : 'System',
                ...log
            });
        }

        const logEntry = {
            user: _.currentUser ? _.currentUser.name : 'System',
            ...log
        };
        const rec = await _.pb.collection('activity_logs').create(logEntry);
        
        const list = await _.pb.collection('system_settings').getList(1, 1, { filter: 'key="lastUpdated"' });
        if (list.items.length > 0) {
            const systemRec = list.items[0];
            await _.pb.collection('system_settings').update(systemRec.id, { 
                value: { ...systemRec.value, activityLogs: Date.now() } 
            });
        }
        _.collectionCache.activityLogs = { data: null, timestamp: 0 };
    };

    Handler.clearActivityLogs = async function() {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') {
            const snapshot = await window.FirebaseBridge.getData('activity_logs');
            await Promise.all(snapshot.map(rec => window.FirebaseBridge.deleteData('activity_logs', rec.id)));
            return;
        }

        const snapshot = await _.pb.collection('activity_logs').getFullList();
        await Promise.all(snapshot.map(rec => _.pb.collection('activity_logs').delete(rec.id)));
        
        const now = Date.now();
        const list = await _.pb.collection('system_settings').getList(1, 1, { filter: 'key="lastUpdated"' });
        if (list.items.length > 0) {
            const systemRec = list.items[0];
            await _.pb.collection('system_settings').update(systemRec.id, { 
                value: { ...systemRec.value, activityLogs: now } 
            });
        }
        
        _.collectionCache.activityLogs = { data: [], timestamp: now };
        _.savePersistentCache();
    };

    Handler.getUsers = async function() {
        if (_.getMode() === 'FIREBASE') {
            return window.FirebaseBridge.getData('users');
        }
        return getData('users');
    };

    Handler.updateUserAccess = async function(uid, role, restrictions) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') return;
        await _.pb.collection('users').update(uid, { role, restrictions });
        
        const now = Date.now();
        const list = await _.pb.collection('system_settings').getList(1, 1, { filter: 'key="lastUpdated"' });
        if (list.items.length > 0) {
            const systemRec = list.items[0];
            await _.pb.collection('system_settings').update(systemRec.id, { 
                value: { ...systemRec.value, users: now } 
            });
        }
        
        _.collectionCache.users = { data: null, timestamp: 0 };
        _.savePersistentCache();
    };

    Handler.adminCreateUser = async function(userData) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') throw new Error("User creation is handled via Firebase Console in Legacy Mode.");
        
        const profile = {
            username:  userData.username,
            email:     userData.email || `${userData.username.toLowerCase()}@local.internal`,
            password:  userData.password,
            passwordConfirm: userData.password,
            name:      userData.name,
            role:      userData.role || 'Auditor',
            restrictions: userData.role === 'Auditor' ? (userData.restrictions || _.ALL_AUDITOR_RESTRICTIONS) : [],
            settings: { theme: 'light', lowStockThreshold: 1000, isThresholdEnabled: false }
        };

        try {
            const userRec = await _.pb.collection('users').create(profile);
            
            const now = Date.now();
            const list = await _.pb.collection('system_settings').getList(1, 1, { filter: 'key="lastUpdated"' });
            if (list.items.length > 0) {
                const systemRec = list.items[0];
                await _.pb.collection('system_settings').update(systemRec.id, { 
                    value: { ...systemRec.value, users: now } 
                });
            }
            
            _.collectionCache.users = { data: null, timestamp: 0 };
            _.savePersistentCache();
            
            return { ...userRec, uid: userRec.id };
        } catch(e) {
            throw e;
        }
    };

    Handler.deleteSharedUser = async function(uid) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') return;
        await _.pb.collection('users').delete(uid);
        
        const list = await _.pb.collection('system_settings').getList(1, 1, { filter: 'key="lastUpdated"' });
        if (list.items.length > 0) {
            const systemRec = list.items[0];
            await _.pb.collection('system_settings').update(systemRec.id, { 
                value: { ...systemRec.value, users: Date.now() } 
            });
        }
        
        _.collectionCache.users = { data: null, timestamp: 0 };
        _.savePersistentCache();
    };

})(window.AppDataHandler);
