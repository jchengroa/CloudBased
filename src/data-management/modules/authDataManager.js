/**
 * Data Management - Auth Module (Local Mode)
 */
(function (Handler) {
    const _ = Handler._internal;

    Handler.login = async function (username, password) {
        await _.initPromise;

        // Check against hardcoded default account
        if (username === _.DEFAULT_CREDENTIALS.username && password === _.DEFAULT_CREDENTIALS.password) {
            const userProfile = Handler.normalizeUserRecord({
                id: 'local-admin',
                username: 'default',
                name: 'System Administrator',
                role: 'Administrator',
                restrictions: []
            });

            _.currentUser = userProfile;
            localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));
            return _.currentUser;
        }

        // Check local users in cache
        const users = _.collectionCache.users?.data || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            _.currentUser = Handler.normalizeUserRecord(user);
            localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));
            return _.currentUser;
        }

        throw new Error("Invalid username or password.");
    };

    Handler.signup = async function (userData) {
        await _.initPromise;

        const newUser = {
            id: 'u-' + Math.random().toString(36).substr(2, 9),
            username: userData.username,
            password: userData.password,
            name: userData.name,
            role: 'WarehouseStaff',
            restrictions: _.ALL_AUDITOR_RESTRICTIONS,
            settings: { theme: 'light', lowStockThreshold: 1000, isThresholdEnabled: false },
            created: new Date().toISOString()
        };

        // Save to local cache
        if (!_.collectionCache.users) _.collectionCache.users = { data: [], timestamp: 0 };
        _.collectionCache.users.data.push(newUser);
        _.collectionCache.users.timestamp = Date.now();
        _.savePersistentCache();

        _.currentUser = Handler.normalizeUserRecord(newUser);
        localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));

        return _.currentUser;
    };

    Handler.logout = async function () {
        _.currentUser = null;
        localStorage.clear(); // Wipe everything on logout
        if (_.clearCache) _.clearCache();
        location.reload();
    };

    Handler.updateProfile = async function (data) {
        await _.initPromise;
        if (!_.currentUser) throw new Error("Not logged in");

        if (_.currentUser.id === 'local-admin') {
            // Default user cannot save changes
            window.Toast?.info('Session Only', 'Profile changes are temporary and will not be saved.');
            _.currentUser.name = data.name || _.currentUser.name;
            Handler.notify('user', _.currentUser);
            return _.currentUser;
        }

        const users = _.collectionCache.users?.data || [];
        const index = users.findIndex(u => u.id === _.currentUser.uid);
        if (index !== -1) {
            users[index].name = data.name;
            users[index].username = data.username || users[index].username;
            if (data.email) users[index].email = data.email;

            _.collectionCache.users.timestamp = Date.now();
            _.savePersistentCache();

            _.currentUser = Handler.normalizeUserRecord(users[index]);
            localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));
            Handler.notify('user', _.currentUser);
        }

        return _.currentUser;
    };

    Handler.changePassword = async function (oldPass, newPass) {
        await _.initPromise;
        if (!_.currentUser) throw new Error("Not logged in");

        if (_.currentUser.id === 'local-admin') {
            window.Toast?.error('Access Denied', 'The default administrator password cannot be changed.');
            throw new Error("Cannot change hardcoded admin password.");
        }

        const users = _.collectionCache.users?.data || [];
        const index = users.findIndex(u => u.id === _.currentUser.uid);
        if (index !== -1) {
            if (users[index].password !== oldPass) throw new Error("Incorrect current password.");
            users[index].password = newPass;
            _.savePersistentCache();
        }
    };

    Handler.sendPasswordResetEmail = async function (identifier) {
        throw new Error("Email features are disabled in local-only mode.");
    };

    Handler.confirmPasswordReset = async function (token, newPassword) {
        throw new Error("Email features are disabled in local-only mode.");
    };

})(window.AppDataHandler);
