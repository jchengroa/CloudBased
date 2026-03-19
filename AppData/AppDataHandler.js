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

    // Hardcoded fallback config — used when no custom config has been saved in localStorage
    const DEFAULT_CONFIG = {
        apiKey: "AIzaSyDoYkXBa66IQlOeJ1FaXQyiZcNbNAmtPWQ",
        authDomain: "cloudbasedims.firebaseapp.com",
        projectId: "cloudbasedims",
        storageBucket: "cloudbasedims.firebasestorage.app",
        messagingSenderId: "471198836966",
        appId: "1:471198836966:web:e56577eefe5e3a213c3327"
    };

    // Load config from localStorage if the user has saved a custom one, otherwise use the default
    const CONFIG_KEY = 'cloudbased_firebase_config';
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    const firebaseConfig = savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;

    // firebase connection establishment
    // We capture this as a promise so fetch methods can await it,
    // ensuring 'if request.auth != null' rules are satisfied before the first query hits.
    let authPromise = null;

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        authPromise = firebase.auth().signInAnonymously().catch(e => {
            console.error("Firebase Auth Error: Access to Firestore may be restricted.", e);
        });
    } else {
        authPromise = Promise.resolve();
    }

    const db = firebase.firestore();

    // Prefix for localStorage keys — only used for user settings
    const storagePrefix = 'cloudbased_tmp_';

    // Fetches a local JSON file, returns parsed content or null on failure
    async function fetchJson(path) {
        try {
            const response = await fetch(path);
            if (response.ok) return await response.json();
        } catch (e) { }
        return null;
    }

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

        // Returns the active Firebase config (user-saved or hardcoded default)
        getFirebaseConfig: function () {
            const saved = localStorage.getItem(CONFIG_KEY);
            return saved ? JSON.parse(saved) : { ...DEFAULT_CONFIG };
        },

        // Saves a new Firebase config to localStorage.
        // The page must be reloaded afterward for Firebase to re-initialize with the new values.
        saveFirebaseConfig: function (newConfig) {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
        }
    };
})();
