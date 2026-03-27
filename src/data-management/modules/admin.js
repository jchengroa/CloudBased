/**
 * Data Management - Admin Module
 */
(function(Handler) {
    const _ = Handler._internal;

    const getData = (collection) => _.getDataInternal(collection);

    Handler.getActivityLogs = () => getData('activityLogs');

    Handler.addActivityLog = async function(log) {
        await _.initPromise;
        const logEntry = {
            timestamp: Date.now(),
            user: _.currentUser ? _.currentUser.name : 'System',
            ...log
        };
        await _.db.collection('activityLogs').add(logEntry);
        await _.db.collection('system').doc('lastUpdated').set({ activityLogs: logEntry.timestamp }, { merge: true });
    };

    Handler.clearActivityLogs = async function() {
        await _.initPromise;
        const snapshot = await _.db.collection('activityLogs').get();
        const batch = _.db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        const now = Date.now();
        batch.set(_.db.collection('system').doc('lastUpdated'), { activityLogs: now }, { merge: true });
        await batch.commit();
        _.collectionCache.activityLogs = { data: [], timestamp: now };
        _.savePersistentCache();
    };

    Handler.getUsers = async function() {
        return getData('users');
    };

    Handler.updateUserAccess = async function(uid, role, restrictions) {
        await _.initPromise;
        const now = Date.now();
        await _.db.collection('users').doc(uid).update({ role, restrictions });
        await _.db.collection('system').doc('lastUpdated').set({ users: now }, { merge: true });
        // Individual update doesn't have the whole collection, so we wipe cache to force re-fetch
        _.collectionCache.users = { data: null, timestamp: 0 };
        _.savePersistentCache();
    };

    Handler.adminCreateUser = async function(userData) {
        await _.initPromise;
        const usernameLower = userData.username.toLowerCase();
        const check = await _.db.collection('users').get();
        if (check.docs.some(d => d.data().username?.toLowerCase() === usernameLower)) {
            throw new Error("Username already taken.");
        }

        const secondaryAppName = "adminAction_" + Date.now();
        const secondaryApp = firebase.initializeApp(_.activeConfig, secondaryAppName);
        
        let emailToUse = userData.email || `${userData.username.toLowerCase()}@cloudbased.internal`;

        try {
            const credential = await secondaryApp.auth().createUserWithEmailAndPassword(emailToUse, userData.password);
            const profile = {
                uid:       credential.user.uid,
                name:      userData.name,
                username:  userData.username,
                email:     userData.email || '',
                role:      userData.role || 'Auditor',
                restrictions: userData.role === 'Auditor' ? (userData.restrictions || _.ALL_AUDITOR_RESTRICTIONS) : [],
                createdAt: new Date().toISOString(),
                settings: { theme: 'light', lowStockThreshold: 1000, isThresholdEnabled: false }
            };

            const now = Date.now();
            await _.db.collection('users').doc(credential.user.uid).set(profile);
            await _.db.collection('system').doc('lastUpdated').set({ users: now }, { merge: true });
            _.collectionCache.users = { data: null, timestamp: 0 };
            _.savePersistentCache();
            
            await secondaryApp.delete();
            return profile;
        } catch(e) {
            if (secondaryApp) await secondaryApp.delete();
            if (e.code === 'auth/email-already-in-use') {
                if (!userData.email) {
                    throw new Error(`The internal email '${emailToUse}' is already taken.`);
                } else {
                    throw new Error(`The email '${userData.email}' is already associated with another account.`);
                }
            }
            throw e;
        }
    };

    Handler.deleteSharedUser = async function(uid) {
        await _.initPromise;
        await _.db.collection('users').doc(uid).delete();
        await _.db.collection('system').doc('lastUpdated').set({ users: Date.now() }, { merge: true });
        _.collectionCache.users = { data: null, timestamp: 0 };
        _.savePersistentCache();
    };

})(window.AppDataHandler);
