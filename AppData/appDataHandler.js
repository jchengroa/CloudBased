/*
 * App Data Handler
 * Acts as the data controller between Firestore and the local app state.
 *
 * Data scope:
 * - Firestore: user inventory, suppliers, UOMs, warehouses
 * - LocalStorage: device-specific theming and thresholds
 */

window.AppDataHandler = (function () {

    // firebase init configuration

    const CONFIG_KEY = 'cloudbased_firebase_config';
    let activeConfig = null; // Stores the loaded config (either from localStorage or JSON file)

    // Fetches a local JSON file, returns parsed content or null on failure
    async function fetchJson(path) {
        try {
            const response = await fetch(path);
            if (response.ok) return await response.json();
        } catch (e) { }
        return null;
    }

    // firebase connection establishment
    // We capture this as a promise so fetch methods can await it,
    // ensuring 'if request.auth != null' rules are satisfied before the first query hits.
    let dbError = null;
    let db = null;
    const authPromise = (async () => {
        try {
            const savedConfig = localStorage.getItem(CONFIG_KEY);
            if (savedConfig) {
                activeConfig = JSON.parse(savedConfig);
            } else {
                activeConfig = await fetchJson('AppData/defaultDatabase.json');
            }

            if (!activeConfig || Object.keys(activeConfig).length === 0) {
                dbError = "Configuration not found in Local Storage and defaultDatabase.json.";
                console.error("Critical: " + dbError);
                return;
            }

            if (!firebase.apps.length) {
                try {
                    firebase.initializeApp(activeConfig);
                    db = firebase.firestore();
                    return firebase.auth().signInAnonymously().catch(e => {
                        dbError = "Anonymous Authentication Failed: " + e.message;
                        console.error("Firebase Auth Error: Access to Firestore may be restricted.", e);
                    });
                } catch (e) {
                    dbError = "Firebase Initialization Failed (Possible Invalid Config): " + e.message;
                    console.error("Firebase Init Error:", e);
                }
            } else {
                db = firebase.firestore();
            }
        } catch (e) {
            dbError = "Unexpected Initialization Error: " + e.message;
            console.error(dbError, e);
        }
    })();

    // Prefix for localStorage keys — only used for user settings
    const storagePrefix = 'cloudbased_tmp_';

    // Fetches all documents from a Firestore collection.
    // Each document's Firestore ID is mapped back as the item's 'id' field.
    async function getCollection(collectionName) {
        await authPromise;
        const snapshot = await db.collection(collectionName).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Replaces the entire contents of a Firestore collection with a new data array.
    // Each item's 'id' field is used as the Firestore document ID.
    async function saveCollection(collectionName, items) {
        await authPromise;
        const collRef = db.collection(collectionName);
        const existing = await collRef.get();
        const batch = db.batch();

        // Delete all current documents
        existing.docs.forEach(doc => batch.delete(doc.ref));

        // Write all new documents
        items.forEach(item => {
            const { id, ...fields } = item;
            batch.set(collRef.doc(String(id)), fields);
        });

        await batch.commit();
    }

    return {
        // fetch utilities

        getInventory: async function () {
            // Source: Firestore 'inventory' collection
            return await getCollection('inventory');
        },

        getInputLogs: async function () {
            // Source: Firestore 'inputLogs' collection
            return await getCollection('inputLogs');
        },

        getOutputLogs: async function () {
            // Source: Firestore 'outputLogs' collection
            return await getCollection('outputLogs');
        },

        getSuppliers: async function () {
            // Source: Firestore 'suppliers' collection
            return await getCollection('suppliers');
        },

        getUOMs: async function () {
            await authPromise;
            // Source: Firestore 'uoms/list' → { values: [...] }
            // On first load (doc missing), seeds Firestore from defaultuoms.json so future reads come from the database
            const doc = await db.collection('uoms').doc('list').get();
            if (doc.exists) return doc.data().values;

            const defaults = (await fetchJson('AppData/defaultuoms.json')) ?? ["Pieces", "Boxes", "Bags"];
            await db.collection('uoms').doc('list').set({ values: defaults });
            return defaults;
        },

        getWarehouses: async function () {
            await authPromise;
            // Source: Firestore 'warehouses/list' → { values: [...] }
            // On first load (doc missing), seeds Firestore from defaultwarehouses.json so future reads come from the database
            const doc = await db.collection('warehouses').doc('list').get();
            if (doc.exists) return doc.data().values;

            const defaults = (await fetchJson('AppData/defaultwarehouses.json')) ?? ["Main Warehouse"];
            await db.collection('warehouses').doc('list').set({ values: defaults });
            return defaults;
        },

        getSettings: async function () {
            // Settings stay in localStorage — they are device-specific preferences
            // Fallback: defaultsettings.json → hardcoded fallback
            const cached = localStorage.getItem(storagePrefix + 'settings');
            if (cached) { try { return JSON.parse(cached); } catch (e) { } }
            return (await fetchJson('AppData/defaultsettings.json')) ?? { theme: "light", lowStockThreshold: 1000, isThresholdEnabled: true };
        },

        // commit utilities

        saveInventory: async function (newData) {
            await saveCollection('inventory', newData);
        },

        saveInputLogs: async function (newData) {
            await saveCollection('inputLogs', newData);
        },

        saveOutputLogs: async function (newData) {
            await saveCollection('outputLogs', newData);
        },

        saveSuppliers: async function (newData) {
            await saveCollection('suppliers', newData);
        },

        saveUOMs: async function (newData) {
            await authPromise;
            // Saved as a single document with a 'values' array
            await db.collection('uoms').doc('list').set({ values: newData });
        },

        saveWarehouses: async function (newData) {
            await authPromise;
            // Saved as a single document with a 'values' array
            await db.collection('warehouses').doc('list').set({ values: newData });
        },

        saveSettings: async function (newSettings) {
            // Settings are always localStorage-only
            localStorage.setItem(storagePrefix + 'settings', JSON.stringify(newSettings));
        },

        // client state utilities

        clearAllData: function () {
            // Clears saved user settings from localStorage.
            // Firestore data (inventory, suppliers, etc.) is shared and not affected.
            // Note: Firebase config (cloudbased_firebase_config) is intentionally preserved.
            Object.keys(localStorage)
                .filter(key => key.startsWith(storagePrefix))
                .forEach(key => localStorage.removeItem(key));
        },

        // Returns the active database initialization error if any
        getDbError: function () {
            return dbError;
        },

        // Returns the active Firebase config (user-saved or default from JSON)
        getFirebaseConfig: function () {
            return activeConfig ? { ...activeConfig } : {};
        },

        // Saves a new Firebase config to localStorage.
        // The page must be reloaded afterward for Firebase to re-initialize with the new values.
        saveFirebaseConfig: function (newConfig) {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
        }
    };
})();
