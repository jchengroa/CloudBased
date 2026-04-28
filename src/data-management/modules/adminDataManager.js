/**
 * Data Management - Admin Module (Local Mode)
 */
(function(Handler) {
    const _ = Handler._internal;
    
    const getData = (collection) => Handler.getData(collection);

    Handler.getActivityLogs = () => getData('activityLogs');

    Handler.addActivityLog = async function(log) {
        await _.initPromise;
        if (!_.collectionCache.activityLogs) _.collectionCache.activityLogs = { data: [], timestamp: 0 };
        
        const logEntry = {
            id: 'act-' + Math.random().toString(36).substr(2, 9),
            user: _.currentUser ? (_.currentUser.name || _.currentUser.username || 'System') : 'System',
            created: new Date().toISOString(),
            ...log
        };
        
        _.collectionCache.activityLogs.data.push(logEntry);
        const now = Date.now();
        _.collectionCache.activityLogs.timestamp = now;
        _.setLastUpdatedValue('activityLogs', now);
        _.savePersistentCache();
    };

    Handler.clearActivityLogs = async function() {
        await _.initPromise;
        const count = _.collectionCache.activityLogs?.data?.length || 0;
        _.collectionCache.activityLogs = { data: [], timestamp: Date.now() };
        
        await Handler.addActivityLog({
            title: 'Audit Trail Cleared',
            details: `A system administrator permanently erased ${count} historical logs.`,
            category: 'system'
        }).catch(() => {});
        
        _.savePersistentCache();
    };

    // --- USER MANAGEMENT ---
    Handler.getUsers = async function() {
        return Handler.getData('users');
    };

    Handler.updateUserAccess = async function(uid, role, restrictions = []) {
        await _.initPromise;
        const users = _.collectionCache.users?.data || [];
        const index = users.findIndex(u => u.id === uid);
        
        if (index !== -1) {
            users[index].role = role;
            users[index].restrictions = restrictions;
            _.collectionCache.users.timestamp = Date.now();
            _.savePersistentCache();
            
            await Handler.addActivityLog({
                title: 'User Privilege Modified',
                details: `Updated role to ${role} for user ${uid}.`,
                category: 'user'
            }).catch(() => {});
        }
    };

    Handler.adminUpdateUser = async function(uid, userData) {
        await _.initPromise;
        
        const users = _.collectionCache.users?.data || [];
        const index = users.findIndex(u => u.id === uid);
        
        if (index === -1 && uid !== 'local-admin') throw new Error("User not found");

        const hubState = {
            dashboard: true,
            assets: true,
            partners: true,
            admin: userData.role === 'Administrator'
        };

        if (userData.hub && typeof userData.hub === 'object') {
            Object.keys(userData.hub).forEach(k => {
                hubState[k] = !!userData.hub[k];
            });
        }

        const updates = {
            name: (userData.name || '').trim(),
            username: (userData.username || '').trim(),
            role: userData.role || 'WarehouseStaff',
            restrictions: userData.role === 'WarehouseStaff' ? (userData.restrictions || _.ALL_AUDITOR_RESTRICTIONS) : [],
            settings: userData.settings || {},
            hub: hubState 
        };

        if (userData.email !== undefined) updates.email = userData.email?.trim() || '';
        if (userData.password) updates.password = userData.password;

        let normalized;
        if (uid === 'local-admin') {
            // Limited updates for hardcoded admin
            _.currentUser.name = updates.name;
            _.currentUser.hub = updates.hub;
            normalized = _.currentUser;
        } else {
            users[index] = { ...users[index], ...updates };
            normalized = Handler.normalizeUserRecord(users[index]);
        }

        _.collectionCache.users.timestamp = Date.now();
        _.savePersistentCache();

        await Handler.addActivityLog({
            title: 'User Profile Managed',
            details: `Updated account details for ${updates.username}.`,
            category: 'user'
        }).catch(() => {});

        if (_.currentUser?.uid === uid) {
            _.currentUser = normalized;
            localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));
            Handler.notify('user', _.currentUser);
        }

        return normalized;
    };

    Handler.adminCreateUser = async function(userData) {
        await _.initPromise;
        if (!_.collectionCache.users) _.collectionCache.users = { data: [], timestamp: 0 };

        const hubState = {
            dashboard: true,
            assets: true,
            partners: true,
            admin: userData.role === 'Administrator'
        };

        if (userData.hub && typeof userData.hub === 'object') {
            Object.keys(userData.hub).forEach(k => {
                hubState[k] = !!userData.hub[k];
            });
        }

        const newUser = {
            id: 'u-' + Math.random().toString(36).substr(2, 9),
            username: (userData.username || '').trim(),
            password: userData.password,
            name: (userData.name || '').trim(),
            role: userData.role || 'WarehouseStaff',
            restrictions: userData.role === 'WarehouseStaff' ? (userData.restrictions || _.ALL_AUDITOR_RESTRICTIONS) : [],
            settings: {
                theme: userData.settings?.theme || 'light',
                lowStockThreshold: userData.settings?.lowStockThreshold || 1000,
                isThresholdEnabled: userData.settings?.isThresholdEnabled ?? false,
                hiddenDashboardWidgets: userData.settings?.hiddenDashboardWidgets || []
            },
            hub: hubState,
            created: new Date().toISOString()
        };
        newUser.email = userData.email?.trim() || '';

        _.collectionCache.users.data.push(newUser);
        _.collectionCache.users.timestamp = Date.now();
        _.savePersistentCache();
        
        await Handler.addActivityLog({
            title: 'New Member Created',
            details: `System admin registered @${userData.username} as ${userData.role}.`,
            category: 'user'
        }).catch(() => {});
        
        return Handler.normalizeUserRecord(newUser);
    };

    Handler.deleteSharedUser = async function(uid) {
        await _.initPromise;
        if (uid === 'local-admin') throw new Error("Cannot delete hardcoded admin");

        const users = _.collectionCache.users?.data || [];
        const index = users.findIndex(u => u.id === uid);
        if (index !== -1) {
            users.splice(index, 1);
            _.collectionCache.users.timestamp = Date.now();
            _.savePersistentCache();
            
            await Handler.addActivityLog({
                title: 'Account Permanently Removed',
                details: `Deleted user membership for ID: ${uid}.`,
                category: 'user'
            }).catch(() => {});
        }
    };

})(window.AppDataHandler);
