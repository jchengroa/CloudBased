/**
 * Data Management - Data Store Module (Local Mode)
 */
(function(Handler) {
    const _ = Handler._internal;

    const ITEM_META_KEY = 'itemMeta';
    const INPUT_LOG_META_KEY = 'inputLogMeta';
    const OUTPUT_LOG_META_KEY = 'outputLogMeta';

    // Helper to get/set local system settings
    const getSystemSettingValue = async (key, defaultValue = null) => {
        if (!_.collectionCache.system_settings) _.collectionCache.system_settings = { data: [], timestamp: 0 };
        const items = _.collectionCache.system_settings.data;
        const item = items.find(i => i.key === key);
        return item ? (item.value ?? defaultValue) : defaultValue;
    };

    const saveSystemSettingValue = async (key, value) => {
        if (!_.collectionCache.system_settings) _.collectionCache.system_settings = { data: [], timestamp: 0 };
        const items = _.collectionCache.system_settings.data;
        const index = items.findIndex(i => i.key === key);
        if (index !== -1) {
            items[index].value = value;
            items[index].updated = new Date().toISOString();
        } else {
            items.push({ key, value, id: 'sys-' + Math.random().toString(36).substr(2, 9), created: new Date().toISOString() });
        }
        _.collectionCache.system_settings.timestamp = Date.now();
        _.savePersistentCache();
    };

    const getItemMetaMap = async () => (await getSystemSettingValue(ITEM_META_KEY, {})) || {};
    const getLogMetaMap = async (key) => (await getSystemSettingValue(key, {})) || {};

    const COLLECTION_CONFIG = {
        inventory: {
            pbCollection: 'inventory',
            keyField: 'itemCode',
            fromRecord: (rec, itemMetaMap = {}) => ({
                ...rec,
                pbId: rec.id,
                id: rec.itemCode || rec.id,
                image: rec.imageUrl || '',
                warehouse: itemMetaMap[rec.itemCode || rec.id]?.warehouse || '',
                supplier: itemMetaMap[rec.itemCode || rec.id]?.supplier || rec.supplier || '',
                customer: itemMetaMap[rec.itemCode || rec.id]?.customer || rec.customer || '',
                timestamp: rec.timestamp || new Date(rec.created || Date.now()).getTime()
            }),
            toPayload: (item, existingRec) => ({
                id: existingRec?.id || 'inv-' + Math.random().toString(36).substr(2, 9),
                name: item.name || '',
                category: item.category || '',
                description: item.description || '',
                uom: item.uom || '',
                itemCode: item.id || item.itemCode || '',
                quantity: parseFloat(item.quantity) || 0,
                optimalStock: parseFloat(item.optimalStock) || 0,
                isRestocked: ['Yes', 'I', 'No'].includes(item.isRestocked) ? item.isRestocked : 'No',
                supplier: item.supplier || '',
                customer: item.customer || '',
                imageUrl: item.imageUrl || existingRec?.imageUrl || '',
                created: existingRec?.created || new Date().toISOString()
            })
        },
        inputLogs: {
            pbCollection: 'logs_input',
            keyField: 'transactionId',
            fromRecord: (rec, metaMap = {}) => ({
                ...rec,
                pbId: rec.id,
                id: rec.id,
                transactionId: rec.transactionId || rec.id,
                userName: rec.user || '',
                supplier: metaMap[rec.transactionId || rec.id]?.supplier || rec.supplier || '',
                batchLot: metaMap[rec.transactionId || rec.id]?.batchLot || rec.batchLot || '',
                description: metaMap[rec.transactionId || rec.id]?.description || rec.description || '',
                date: rec.date ? new Date(rec.date).toISOString().split('T')[0] : new Date(rec.created || Date.now()).toISOString().split('T')[0],
                timestamp: rec.timestamp || new Date(rec.created || Date.now()).getTime()
            }),
            toPayload: (item, existingRec) => ({
                id: existingRec?.id || 'log-i-' + Math.random().toString(36).substr(2, 9),
                transactionId: item.transactionId || '',
                itemCode: item.itemCode || '',
                date: item.date || new Date().toISOString(),
                user: item.user || item.userName || _.currentUser?.name || _.currentUser?.username || 'System',
                quantity: parseFloat(item.quantity) || 0,
                batch: item.batchLot || item.batch || '',
                created: existingRec?.created || new Date().toISOString()
            })
        },
        outputLogs: {
            pbCollection: 'logs_output',
            keyField: 'transactionId',
            fromRecord: (rec, metaMap = {}) => ({
                ...rec,
                pbId: rec.id,
                id: rec.id,
                transactionId: rec.transactionId || rec.id,
                userName: rec.user || '',
                supplier: metaMap[rec.transactionId || rec.id]?.supplier || rec.supplier || '',
                batchLot: metaMap[rec.transactionId || rec.id]?.batchLot || rec.batchLot || '',
                description: metaMap[rec.transactionId || rec.id]?.description || rec.description || '',
                date: rec.date ? new Date(rec.date).toISOString().split('T')[0] : new Date(rec.created || Date.now()).toISOString().split('T')[0],
                timestamp: rec.timestamp || new Date(rec.created || Date.now()).getTime()
            }),
            toPayload: (item, existingRec) => ({
                id: existingRec?.id || 'log-o-' + Math.random().toString(36).substr(2, 9),
                transactionId: item.transactionId || '',
                itemCode: item.itemCode || '',
                date: item.date || new Date().toISOString(),
                user: item.user || item.userName || _.currentUser?.name || _.currentUser?.username || 'System',
                quantity: parseFloat(item.quantity) || 0,
                batch: item.batchLot || item.batch || '',
                created: existingRec?.created || new Date().toISOString()
            })
        },
        suppliers: {
            pbCollection: 'suppliers',
            keyField: 'name',
            fromRecord: (rec) => ({
                ...rec,
                pbId: rec.id,
                id: rec.id,
                timestamp: rec.timestamp || new Date(rec.created || Date.now()).getTime()
            }),
            toPayload: (item, existingRec) => ({
                id: existingRec?.id || 'sup-' + Math.random().toString(36).substr(2, 9),
                name: item.name || '',
                contact: item.contact || item.contactPerson || '',
                address: item.address || '',
                phone: item.phone || '',
                email: item.email || '',
                created: existingRec?.created || new Date().toISOString()
            })
        },
        customers: {
            pbCollection: 'customers',
            keyField: 'name',
            fromRecord: (rec) => ({
                ...rec,
                pbId: rec.id,
                id: rec.id,
                timestamp: rec.timestamp || new Date(rec.created || Date.now()).getTime()
            }),
            toPayload: (item, existingRec) => ({
                id: existingRec?.id || 'cus-' + Math.random().toString(36).substr(2, 9),
                name: item.name || '',
                contact: item.contact || item.contactPerson || '',
                address: item.address || '',
                phone: item.phone || '',
                email: item.email || '',
                created: existingRec?.created || new Date().toISOString()
            })
        }
    };

    const getConfig = (collection) => {
        const config = COLLECTION_CONFIG[collection];
        if (!config) throw new Error(`Unsupported collection mapping: ${collection}`);
        return config;
    };

    const getData = async (collection) => {
        await _.initPromise;
        const config = getConfig(collection);

        if (!_.collectionCache[collection]) {
            _.collectionCache[collection] = { data: [], timestamp: 0 };
        }

        const metaMap = collection === 'inventory'
            ? await getItemMetaMap()
            : collection === 'inputLogs'
                ? await getLogMetaMap(INPUT_LOG_META_KEY)
                : collection === 'outputLogs'
                    ? await getLogMetaMap(OUTPUT_LOG_META_KEY)
                    : {};

        return _.collectionCache[collection].data.map(rec => config.fromRecord(rec, metaMap));
    };

    const updateLastUpdated = async (collection, timestamp) => {
        const current = await getSystemSettingValue('lastUpdated', {});
        await saveSystemSettingValue('lastUpdated', { ...current, [collection]: timestamp });
        _.setLastUpdatedValue(collection, timestamp);
    };

    async function saveData(collection, items, options = {}) {
        const finalOptions = typeof options === 'boolean' ? { allowDelete: options } : options;
        await _.initPromise;
        const config = getConfig(collection);
        const incomingItems = Array.isArray(items) ? items : [];
        
        if (!_.collectionCache[collection]) {
            _.collectionCache[collection] = { data: [], timestamp: 0 };
        }
        
        const existingRecords = _.collectionCache[collection].data;
        const existingByKey = new Map(
            existingRecords.map((record) => [record[config.keyField] || record.id, record])
        );

        const seenKeys = new Set();
        const nextData = [];

        for (const item of incomingItems) {
            const keyValue = item[config.keyField] || item.id || item.transactionId;
            if (!keyValue) continue;
            seenKeys.add(keyValue);

            const existingRec = existingByKey.get(keyValue);
            const payload = config.toPayload(item, existingRec);
            nextData.push(payload);
        }

        if (!finalOptions.allowDelete) {
            // Keep existing records that weren't in the incoming list
            existingRecords.forEach(rec => {
                const key = rec[config.keyField] || rec.id;
                if (!seenKeys.has(key)) {
                    nextData.push(rec);
                }
            });
        }

        _.collectionCache[collection].data = nextData;
        _.collectionCache[collection].timestamp = Date.now();
        
        const metaPromises = [];
        if (collection === 'inventory') {
            const currentMetaMap = await getItemMetaMap();
            const nextMetaMap = {};
            incomingItems.forEach((item) => {
                const itemCode = item.id || item.itemCode;
                if (!itemCode) return;
                nextMetaMap[itemCode] = {
                    ...(currentMetaMap[itemCode] || {}),
                    warehouse: item.warehouse || '',
                    supplier: item.supplier || '',
                    customer: item.customer || ''
                };
            });
            metaPromises.push(saveSystemSettingValue(ITEM_META_KEY, nextMetaMap));
        } else if (collection === 'inputLogs' || collection === 'outputLogs') {
            const metaKey = collection === 'inputLogs' ? INPUT_LOG_META_KEY : OUTPUT_LOG_META_KEY;
            const currentMetaMap = await getLogMetaMap(metaKey);
            const nextMetaMap = {};
            incomingItems.forEach((item) => {
                const txnId = item.transactionId || item.id;
                if (!txnId) return;
                nextMetaMap[txnId] = {
                    ...(currentMetaMap[txnId] || {}),
                    supplier: item.supplier || '',
                    batchLot: item.batchLot || '',
                    description: item.description || ''
                };
            });
            metaPromises.push(saveSystemSettingValue(metaKey, nextMetaMap));
        }

        const newTimestamp = Date.now();
        await Promise.all([
            ...metaPromises,
            updateLastUpdated(collection, newTimestamp)
        ]);

        _.savePersistentCache();
        return getData(collection);
    }

    Handler.getInventory = () => getData('inventory');
    Handler.getInputLogs = () => getData('inputLogs');
    Handler.getOutputLogs = () => getData('outputLogs');
    Handler.getSuppliers = () => getData('suppliers');
    Handler.getCustomers = () => getData('customers');

    Handler.saveInventory = (data, allowDelete) => saveData('inventory', data, allowDelete);
    Handler.saveInputLogs = (data, allowDelete) => saveData('inputLogs', data, allowDelete);
    Handler.saveOutputLogs = (data, allowDelete) => saveData('outputLogs', data, allowDelete);
    Handler.saveSuppliers = (data, allowDelete) => saveData('suppliers', data, allowDelete);
    Handler.saveCustomers = (data, allowDelete) => saveData('customers', data, allowDelete);

    Handler.getUOMs = async function () {
        return await getSystemSettingValue('uoms', []);
    };

    Handler.saveUOMs = async function(values) {
        await saveSystemSettingValue('uoms', values);
    };

    Handler.getWarehouses = async function () {
        return await getSystemSettingValue('warehouses', []);
    };

    Handler.saveWarehouses = async function(values) {
        await saveSystemSettingValue('warehouses', values);
    };

    Handler.getSettings = async function () {
        const defaults = { theme: 'light', lowStockThreshold: 1000, isThresholdEnabled: false };
        if (_.currentUser) {
             return _.currentUser.settings || defaults;
        }
        return defaults;
    };

    Handler.saveSettings = async function (settings) {
        await _.initPromise;
        if (_.currentUser) {
            _.currentUser.settings = settings;
            
            // If it's a local user (not hardcoded admin), update in user collection too
            if (_.currentUser.id !== 'local-admin') {
                const users = _.collectionCache.users?.data || [];
                const index = users.findIndex(u => u.id === _.currentUser.uid);
                if (index !== -1) {
                    users[index].settings = settings;
                    _.savePersistentCache();
                }
            }

            localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));
            Handler.notify('user', _.currentUser);
            return _.currentUser;
        }
    };

    // Activity Logs implementation for local mode
    Handler.addActivityLog = async function(log) {
        if (!_.collectionCache.activityLogs) _.collectionCache.activityLogs = { data: [], timestamp: 0 };
        const newLog = {
            id: 'act-' + Math.random().toString(36).substr(2, 9),
            ...log,
            user: _.currentUser?.username || 'System',
            created: new Date().toISOString()
        };
        _.collectionCache.activityLogs.data.push(newLog);
        _.collectionCache.activityLogs.timestamp = Date.now();
        _.savePersistentCache();
    };

    Handler.getActivityLogs = () => getData('activityLogs');

})(window.AppDataHandler);
