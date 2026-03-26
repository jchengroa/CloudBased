/**
 * Data Management - Data Store Module
 */
(function(Handler) {
    const _ = Handler._internal;

    const getData = (collection) => _.getDataInternal(collection);

    async function saveData(collection, items) {
        await _.initPromise;

        // Firebase Mode Branch
        if (_.getMode() === 'FIREBASE') {
            await Promise.all(items.map(item => {
                return window.FirebaseBridge.upsertData(collection, item);
            }));
            return;
        }

        // PocketBase Mode
        const pbCollection = collection === 'inputLogs' ? 'logs_input' : 
                             collection === 'outputLogs' ? 'logs_output' : 
                             collection;

        const existing = await _.pb.collection(pbCollection).getFullList();
        await Promise.all(existing.map(rec => _.pb.collection(pbCollection).delete(rec.id)));
        
        await Promise.all(items.map(item => {
            const { id, ...fields } = item;
            return _.pb.collection(pbCollection).create({ ...fields, itemCode: id });
        }));
        
        if (_.collectionCache[collection]) {
            const newTimestamp = Date.now();
            _.collectionCache[collection] = { data: items, timestamp: newTimestamp };
            _.savePersistentCache();
            
            const list = await _.pb.collection('system_settings').getList(1, 1, { filter: 'key="lastUpdated"' });
            if (list.items.length > 0) {
                const rec = list.items[0];
                await _.pb.collection('system_settings').update(rec.id, { 
                    value: { ...rec.value, [collection]: newTimestamp } 
                });
            } else {
                await _.pb.collection('system_settings').create({ 
                    key: 'lastUpdated', 
                    value: { [collection]: newTimestamp } 
                });
            }
        }
    }

    Handler.getInventory =   () => getData('inventory');
    Handler.getInputLogs =   () => getData('logs_input');
    Handler.getOutputLogs =  () => getData('logs_output');
    Handler.getSuppliers =   () => getData('suppliers');

    Handler.saveInventory =  (d) => saveData('inventory', d);
    Handler.saveInputLogs =  (d) => saveData('inputLogs', d);
    Handler.saveOutputLogs = (d) => saveData('outputLogs', d);
    Handler.saveSuppliers =  (d) => saveData('suppliers', d);

    Handler.getUOMs = async function () {
        const defaults = ["Pieces", "Boxes", "Bags"];
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') {
            try {
                const items = await window.FirebaseBridge.getData('uoms');
                const rec = items.find(i => i.id === 'list');
                return rec ? rec.values : defaults;
            } catch (e) { return defaults; }
        }
        
        try {
            const rec = await _.pb.collection('system_settings').getOne('uoms').catch(() => null);
            if (rec) return rec.value;
            await _.pb.collection('system_settings').create({ id: 'uoms', key: 'uoms', value: defaults }).catch(() => {});
            return defaults;
        } catch (e) { 
            return defaults; 
        }
    };

    Handler.saveUOMs = async function(values) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') {
            return window.FirebaseBridge.upsertData('uoms', { id: 'list', values: values });
        }
        await _.pb.collection('system_settings').update('uoms', { value: values }).catch(async () => {
            await _.pb.collection('system_settings').create({ id: 'uoms', key: 'uoms', value: values });
        });
    };

    Handler.getWarehouses = async function () {
        const defaults = ["Main Warehouse"];
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') {
            try {
                const items = await window.FirebaseBridge.getData('warehouses');
                const rec = items.find(i => i.id === 'list');
                return rec ? rec.values : defaults;
            } catch (e) { return defaults; }
        }

        try {
            const rec = await _.pb.collection('system_settings').getOne('warehouses').catch(() => null);
            if (rec) return rec.value;
            await _.pb.collection('system_settings').create({ id: 'warehouses', key: 'warehouses', value: defaults }).catch(() => {});
            return defaults;
        } catch (e) { 
            return defaults; 
        }
    };

    Handler.saveWarehouses = async function(values) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') {
            return window.FirebaseBridge.upsertData('warehouses', { id: 'list', values: values });
        }
        await _.pb.collection('system_settings').update('warehouses', { value: values }).catch(async () => {
            await _.pb.collection('system_settings').create({ id: 'warehouses', key: 'warehouses', value: values });
        });
    };

    Handler.getSettings = async function () {
        const defaults = { theme: 'light', lowStockThreshold: 1000, isThresholdEnabled: false };
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') {
            if (!_.currentUser) return defaults;
            try {
                const profile = await window.FirebaseBridge.getProfile(_.currentUser.uid);
                return profile?.settings || defaults;
            } catch (e) { return defaults; }
        }

        try {
            if (_.currentUser) {
                const userRec = await _.pb.collection('users').getOne(_.currentUser.uid);
                if (userRec && userRec.settings) return userRec.settings;
            }
            return defaults;
        } catch (e) { 
            return defaults; 
        }
    };

    Handler.saveSettings = async function (settings) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') {
            if (_.currentUser) {
                const profile = await window.FirebaseBridge.getProfile(_.currentUser.uid);
                return window.FirebaseBridge.upsertData('users', { id: _.currentUser.uid, ...profile, settings });
            }
            return;
        }
        if (_.currentUser) await _.pb.collection('users').update(_.currentUser.uid, { settings });
    };

})(window.AppDataHandler);
