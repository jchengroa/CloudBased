/**
 * AppDataHandler
 * Multi-user access to a SHARED business database.
 * 
 * FIX: Reverted collections back to the root level.
 * In a real-world multi-user IMS, all users need to access the SAME inventory,
 * rather than each having an isolated, empty workspace. This also automatically 
 * resolves the "Missing or insufficient permissions" error by matching the existing 
 * Firestore rules that already allowed access to the root collections.
 */

window.AppDataHandler = (function () {

    const CONFIG_KEY = 'cloudbased_firebase_config';
    let db = null;
    let auth = null;
    let dbError = null;

    // 1. Recover Session SYNCHRONOUSLY
    let currentUser = null;
    try {
        const savedUser = localStorage.getItem('cloudbased_session');
        if (savedUser) currentUser = JSON.parse(savedUser);
    } catch (e) { }

    async function fetchJson(path) {
        try {
            const response = await fetch(path);
            if (response.ok) return await response.json();
        } catch (e) { }
        return null;
    }

    // 2. Initialize Firebase
    const initPromise = (async () => {
        try {
            const savedConfig = localStorage.getItem(CONFIG_KEY);
            const activeConfig = savedConfig ? JSON.parse(savedConfig) : await fetchJson('AppData/defaultDatabase.json');

            if (!activeConfig || Object.keys(activeConfig).length === 0) {
                dbError = "Firestore configuration missing.";
                return;
            }

            if (!firebase.apps.length) firebase.initializeApp(activeConfig);
            db = firebase.firestore();
            auth = firebase.auth();

            // Wait for Firebase to securely restore the Auth Token from IndexedDB
            // before we allow any database reads to proceed, preventing rule denials.
            await new Promise(resolve => {
                const unsubscribe = auth.onAuthStateChanged(user => {
                    unsubscribe();
                    
                    if (user && !currentUser) {
                        db.collection('users').doc(user.uid).get().then(doc => {
                            if (doc.exists) {
                                let data = doc.data();
                                // MIGRATION: Treat as Auditor if no role exists
                                if (!data.role) data.role = 'Auditor';
                                
                                currentUser = { ...data, uid: user.uid };
                                localStorage.setItem('cloudbased_session', JSON.stringify(currentUser));
                                
                                // Optional background update, fail silently if rules block it
                                if (doc.data() && !doc.data().role) {
                                    db.collection('users').doc(user.uid).set({ role: 'Auditor' }, { merge: true }).catch(() => {});
                                }
                            }
                        }).catch(console.error);
                    }
                    resolve();
                });
            });

        } catch (e) {
            dbError = "Firebase Init failed: " + e.message;
        }
    })();

    async function getData(collection) {
        try {
            await initPromise;
            const snapshot = await db.collection(collection).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            if (e.message.includes('permission')) {
                throw new Error(`Missing or insufficient permissions reading ${collection}. Please check your database rules.`);
            }
            throw e;
        }
    }

    async function saveData(collection, items) {
        await initPromise;
        const coll = db.collection(collection);
        const existing = await coll.get();
        const batch = db.batch();
        
        // Clear all existing to do a full sync
        existing.docs.forEach(doc => batch.delete(doc.ref));
        
        items.forEach(item => {
            const { id, ...fields } = item;
            const docId = id ? String(id) : coll.doc().id;
            batch.set(coll.doc(docId), fields);
        });
        
        await batch.commit();
    }

    return {
        // --- AUTHENTICATION ---
        login: async function (username, password) {
            await initPromise;
            // Lookup email by username
            const snap = await db.collection('users').where('username', '==', username).get();
            if (snap.empty) throw new Error("Incorrect username or password.");
            
            const userData = snap.docs[0].data();
            const credential = await auth.signInWithEmailAndPassword(userData.email, password);
            
            // Standardizing role data for the session
            const userProfile = { 
                id: snap.docs[0].id,
                ...userData, 
                role: userData.role || 'Auditor', 
                uid: credential.user.uid 
            };
            
            // Background update to persist role only if missing - avoid failing if rules block it
            if (!userData.role) {
                db.collection('users').doc(userProfile.id).set({ role: 'Auditor' }, { merge: true })
                  .catch(e => console.warn("Background role update blocked:", e.message));
            }

            currentUser = userProfile;
            localStorage.setItem('cloudbased_session', JSON.stringify(currentUser));
            return currentUser;
        },

        signup: async function (userData) {
            await initPromise;
            const check = await db.collection('users').where('username', '==', userData.username).get();
            if (!check.empty) throw new Error("Username already taken.");

            const credential = await auth.createUserWithEmailAndPassword(userData.email, userData.password);
            const profile = {
                uid:      credential.user.uid,
                name:     userData.name,
                username: userData.username,
                email:    userData.email,
                role:     'Auditor', // Standardizing default role for new signups
                createdAt: new Date().toISOString(),
                settings: { theme: 'light', lowStockThreshold: 1000, isThresholdEnabled: true }
            };

            await db.collection('users').doc(credential.user.uid).set(profile);
            
            currentUser = profile;
            localStorage.setItem('cloudbased_session', JSON.stringify(currentUser));
            return currentUser;
        },

        logout: function () {
            if (auth) auth.signOut();
            currentUser = null;
            localStorage.removeItem('cloudbased_session');
            location.reload();
        },

        getCurrentUser: () => currentUser,

        updateProfile: async function (data) {
            await initPromise;
            await db.collection('users').doc(currentUser.uid).update({
                name: data.name,
                profilePicture: data.profilePicture
            });
            // Removed redundant Auth update for photoURL since base64 data exceeds Auth limits.
            // Profile picture is persisted safely in the Firestore 'users' document.
            if (auth.currentUser) {
                await auth.currentUser.updateProfile({ displayName: data.name });
            }
            currentUser = { ...currentUser, ...data };
            localStorage.setItem('cloudbased_session', JSON.stringify(currentUser));
            return currentUser;
        },

        changePassword: async function (oldPass, newPass) {
            await initPromise;
            const user = auth.currentUser;
            const cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
            await user.reauthenticateWithCredential(cred);
            await user.updatePassword(newPass);
        },

        sendPasswordResetEmail: async function (identifier) {
            await initPromise;
            let emailToSend = identifier;
            // Support both username and email as the identifier
            if (!identifier.includes('@')) {
                const snap = await db.collection('users').where('username', '==', identifier).get();
                if (snap.empty) throw new Error("User not found.");
                emailToSend = snap.docs[0].data().email;
            }
            await auth.sendPasswordResetEmail(emailToSend);
        },

        confirmPasswordReset: async function (code, newPassword) {
            await initPromise;
            await auth.confirmPasswordReset(code, newPassword);
        },

        // --- SHARED ROOT COLLECTIONS ---
        getInventory:   () => getData('inventory'),
        getInputLogs:   () => getData('inputLogs'),
        getOutputLogs:  () => getData('outputLogs'),
        getSuppliers:   () => getData('suppliers'),

        saveInventory:  (d) => saveData('inventory', d),
        saveInputLogs:  (d) => saveData('inputLogs', d),
        saveOutputLogs: (d) => saveData('outputLogs', d),
        saveSuppliers:  (d) => saveData('suppliers', d),

        // --- SYSTEM CONSTANTS ---
        getUsers: async function() {
            await initPromise;
            // Only admins should call this in a secure environment; if rules block, it will throw
            const usersRef = await db.collection('users').get();
            return usersRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },

        updateUserAccess: async function(uid, role, permissions) {
            await initPromise;
            await db.collection('users').doc(uid).update({ role, permissions });
        },

        getBranding: async function() {
            await initPromise;
            try {
                const doc = await db.collection('settings').doc('branding').get();
                if (doc.exists) return doc.data();
            } catch(e) {}
            return { companyName: 'CloudBased', logoUrl: '' };
        },

        saveBranding: async function(data) {
            await initPromise;
            await db.collection('settings').doc('branding').set(data, { merge: true });
        },

        getGlobalSettings: async function() {
            await initPromise;
            try {
                const doc = await db.collection('settings').doc('global').get();
                if (doc.exists) return doc.data();
            } catch(e) {}
            return { showTotalItems: true, showLowStock: true, showSuppliersOnly: true, showRecentArrivals: true, showRecentShipments: true, showCategoryPerformance: true, showWarehouseDistribution: true };
        },

        saveGlobalSettings: async function(data) {
            await initPromise;
            await db.collection('settings').doc('global').set(data, { merge: true });
        },
        getUOMs: async function () {
            const defaults = ["Pieces", "Boxes", "Bags"];
            try {
                await initPromise;
                const doc = await db.collection('uoms').doc('list').get();
                if (doc.exists) return doc.data().values;
                await db.collection('uoms').doc('list').set({ values: defaults }).catch(e => console.warn("Could not set default UOMs:", e));
                return defaults;
            } catch (e) { 
                console.warn("Graceful fallback: reading uoms failed, using defaults. Error: " + e.message); 
                return defaults; 
            }
        },

        saveUOMs: async function(values) {
            await initPromise;
            await db.collection('uoms').doc('list').set({ values }).catch(e => console.error("saveUOMs error:", e));
        },

        getWarehouses: async function () {
            const defaults = ["Main Warehouse"];
            try {
                await initPromise;
                const doc = await db.collection('warehouses').doc('list').get();
                if (doc.exists) return doc.data().values;
                await db.collection('warehouses').doc('list').set({ values: defaults }).catch(e => console.warn("Could not set default Warehouses:", e));
                return defaults;
            } catch (e) { 
                console.warn("Graceful fallback: reading warehouses failed, using defaults. Error: " + e.message); 
                return defaults; 
            }
        },

        saveWarehouses: async function(values) {
            await initPromise;
            await db.collection('warehouses').doc('list').set({ values }).catch(e => console.error("saveWarehouses error:", e));
        },

        // --- USER SETTINGS ---
        getSettings: async function () {
            const defaults = { theme: 'light', lowStockThreshold: 1000, isThresholdEnabled: true };
            try {
                await initPromise;
                if (currentUser) {
                    const doc = await db.collection('users').doc(currentUser.uid).get();
                    if (doc.exists && doc.data().settings) return doc.data().settings;
                }
                return defaults;
            } catch (e) { 
                console.warn("Graceful fallback: reading settings failed, using defaults. Error: " + e.message);
                return defaults; 
            }
        },

        saveSettings: async function (settings) {
            await initPromise;
            if (currentUser) await db.collection('users').doc(currentUser.uid).update({ settings });
        },

        getDbError: () => dbError,
        getFirebaseConfig: () => {
            const saved = localStorage.getItem(CONFIG_KEY);
            return saved ? JSON.parse(saved) : null;
        }
    };
})();
