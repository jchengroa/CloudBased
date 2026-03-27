/**
 * Data Management - Data Store Module
 */
(function(Handler) {
    const _ = Handler._internal;

    const getData = (collection) => _.getDataInternal(collection);

    async function saveData(collection, items) {
        await _.initPromise;
        const coll = _.db.collection(collection);
        const existing = await coll.get();
        const batch = _.db.batch();
        
        existing.docs.forEach(doc => batch.delete(doc.ref));
        
        items.forEach(item => {
            const { id, ...fields } = item;
            const docId = id ? String(id) : coll.doc().id;
            batch.set(coll.doc(docId), fields);
        });
        
        if (_.collectionCache[collection]) {
            const newTimestamp = Date.now();
            _.collectionCache[collection] = { data: items, timestamp: newTimestamp };
            _.savePersistentCache();
            batch.set(_.db.collection('system').doc('lastUpdated'), { [collection]: newTimestamp }, { merge: true });
        }
        
        await batch.commit();
    }

    Handler.getInventory =   () => getData('inventory');
    Handler.getInputLogs =   () => getData('inputLogs');
    Handler.getOutputLogs =  () => getData('outputLogs');
    Handler.getSuppliers =   () => getData('suppliers');

    Handler.saveInventory =  (d) => saveData('inventory', d);
    Handler.saveInputLogs =  (d) => saveData('inputLogs', d);
    Handler.saveOutputLogs = (d) => saveData('outputLogs', d);
    Handler.saveSuppliers =  (d) => saveData('suppliers', d);

    Handler.getUOMs = async function () {
        const defaults = ["Pieces", "Boxes", "Bags"];
        try {
            await _.initPromise;
            const doc = await _.db.collection('uoms').doc('list').get();
            if (doc.exists) return doc.data().values;
            await _.db.collection('uoms').doc('list').set({ values: defaults }).catch(e => console.warn("Could not set default UOMs:", e));
            return defaults;
        } catch (e) { 
            console.warn("Graceful fallback: reading uoms failed, using defaults."); 
            return defaults; 
        }
    };

    Handler.saveUOMs = async function(values) {
        await _.initPromise;
        await _.db.collection('uoms').doc('list').set({ values }).catch(e => console.error("saveUOMs error:", e));
    };

    Handler.getWarehouses = async function () {
        const defaults = ["Main Warehouse"];
        try {
            await _.initPromise;
            const doc = await _.db.collection('warehouses').doc('list').get();
            if (doc.exists) return doc.data().values;
            await _.db.collection('warehouses').doc('list').set({ values: defaults }).catch(e => console.warn("Could not set default Warehouses:", e));
            return defaults;
        } catch (e) { 
            console.warn("Graceful fallback: reading warehouses failed, using defaults."); 
            return defaults; 
        }
    };

    Handler.saveWarehouses = async function(values) {
        await _.initPromise;
        await _.db.collection('warehouses').doc('list').set({ values }).catch(e => console.error("saveWarehouses error:", e));
    };

    Handler.getSettings = async function () {
        const defaults = { theme: 'light', lowStockThreshold: 1000, isThresholdEnabled: false };
        try {
            await _.initPromise;
            if (_.currentUser) {
                const doc = await _.db.collection('users').doc(_.currentUser.uid).get();
                if (doc.exists && doc.data().settings) return doc.data().settings;
            }
            return defaults;
        } catch (e) { 
            console.warn("Graceful fallback: reading settings failed, using defaults.");
            return defaults; 
        }
    };

    Handler.saveSettings = async function (settings) {
        await _.initPromise;
        if (_.currentUser) await _.db.collection('users').doc(_.currentUser.uid).update({ settings });
    };

})(window.AppDataHandler);
