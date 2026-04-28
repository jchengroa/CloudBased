/**
 * Data Management - Module Init
 * Handles PocketBase initialization and shared state.
 */
// Polyfill for crypto.randomUUID (required for non-secure contexts/HTTP)
if (!window.crypto.randomUUID) {
    window.crypto.randomUUID = function () {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -11e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    };
}

window.AppDataHandler = (function () {
    const CONFIG_KEY = 'cloudbased_pocketbase_url';
    const BRANDING_CACHE_KEY = 'cloudbased_branding_cache';
    const VERSION = '0.16.4';
    const ALL_AUDITOR_RESTRICTIONS = ['AddItems', 'EditItems', 'RemoveItems', 'AddLogs', 'EditLogs', 'RemoveLogs', 'AddSuppliers', 'EditSuppliers', 'RemoveSuppliers'];
    const createEmptyCollectionCache = () => ({
        inventory: { data: null, timestamp: 0 },
        inputLogs: { data: null, timestamp: 0 },
        outputLogs: { data: null, timestamp: 0 },
        suppliers: { data: null, timestamp: 0 },
        activityLogs: { data: null, timestamp: 0 },
        users: { data: null, timestamp: 0 }
    });

    // Internal state shared across modules
    const normalizeUserRecord = (userRec) => {
        if (!userRec) return null;
        const avatarFile = userRec.avatar || userRec.profilePicture || '';
        return {
            ...userRec,
            uid: userRec.id,
            avatar: avatarFile,
            profilePicture: avatarFile,
            restrictions: userRec.restrictions || (userRec.role === 'WarehouseStaff' ? ALL_AUDITOR_RESTRICTIONS : []),
            hub: userRec.hub || { dashboard: true, assets: true, partners: true }
        };
    };

    const dataUrlToFile = (dataUrl, filenamePrefix = 'upload') => {
        if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
        const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
        if (!match) return null;

        const mimeType = match[1] || 'application/octet-stream';
        const extension = mimeType.split('/')[1]?.replace('svg+xml', 'svg') || 'bin';
        const byteString = atob(match[2]);
        const byteNumbers = new Array(byteString.length);
        for (let i = 0; i < byteString.length; i += 1) {
            byteNumbers[i] = byteString.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], `${filenamePrefix}.${extension}`, { type: mimeType });
    };

    const _internal = {
        pb: null,
        dbError: null,
        currentUser: (function () {
            try {
                const saved = localStorage.getItem('cloudbased_session');
                return saved ? JSON.parse(saved) : null;
            } catch (e) { return null; }
        })(),
        // Guest Mode default credentials (matching .env)
        DEFAULT_CREDENTIALS: {
            username: 'default',
            password: 'cb_demo_2026'
        },
        lastUpdatedCache: { value: null, fetchedAt: 0 },
        collectionCache: createEmptyCollectionCache(),
        PERSISTENT_CACHE_KEY: 'cloudbased_collection_cache',
        staticBranding: { companyName: 'CloudBased Local', logoUrl: '' },
        initPromise: null,
        brandingFetch: null,
        CONFIG_KEY,
        BRANDING_CACHE_KEY,
        ALL_AUDITOR_RESTRICTIONS,
        _saveTimeout: null,
        loadPersistentCache: function () {
            try {
                const saved = localStorage.getItem(this.PERSISTENT_CACHE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed._version !== VERSION) {
                        localStorage.removeItem(this.PERSISTENT_CACHE_KEY);
                        return;
                    }
                    Object.keys(parsed).forEach(k => {
                        if (k !== '_version' && this.collectionCache[k]) this.collectionCache[k] = parsed[k];
                    });
                }
            } catch (e) { }
        },
        savePersistentCache: function () {
            if (this._saveTimeout) clearTimeout(this._saveTimeout);
            this._saveTimeout = setTimeout(() => {
                try {
                    const toSave = { ...this.collectionCache, _version: VERSION };
                    localStorage.setItem(this.PERSISTENT_CACHE_KEY, JSON.stringify(toSave));
                } catch (e) { }
                this._saveTimeout = null;
            }, 500);
        },

        fetchJson: async function (path) {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`Failed to load ${path}`);
                return response.json();
            } catch (e) {
                console.warn(`Fetch failed for ${path}:`, e);
                return null;
            }
        },
        getLastUpdatedMap: async function () {
            return this.lastUpdatedCache.value || {};
        },
        setLastUpdatedValue: function (collection, timestamp) {
            const current = this.lastUpdatedCache.value || {};
            this.lastUpdatedCache = {
                value: { ...current, [collection]: timestamp },
                fetchedAt: Date.now()
            };
        },

        getDataInternal: async function (collection) {
            // Local-only mode: always use cache or empty list
            if (this.collectionCache[collection] && this.collectionCache[collection].data) {
                return this.collectionCache[collection].data;
            }
            return [];
        }
    };

    _internal.brandingFetch = (async () => {
        const data = await _internal.fetchJson('assets/data/branding.json');
        if (data) _internal.staticBranding = data;
    })();

    _internal.loadPersistentCache();

    const publicApi = {
        _internal,
        listeners: [],
        subscribe: (fn) => {
            publicApi.listeners.push(fn);
            return () => { publicApi.listeners = publicApi.listeners.filter(l => l !== fn); };
        },
        notify: (type, data) => {
            publicApi.listeners.forEach(l => l(type, data));
        },
        getDbError: () => _internal.dbError,
        getCurrentUser: () => _internal.currentUser,
        getAllRestrictions: () => [..._internal.ALL_AUDITOR_RESTRICTIONS],
        normalizeUserRecord,
        dataUrlToFile,

        // Public API for data retrieval
        getData: (col) => _internal.getDataInternal(col),
        getUsers: () => _internal.getDataInternal('users'),
        getInventory: () => _internal.getDataInternal('inventory'),
        getBranding: () => _internal.getDataInternal('branding'),
        getBrandingSync: () => _internal.staticBranding || { companyName: 'System', logoUrl: '' },
        getGlobalSettings: () => _internal.getDataInternal('globalSettings'),
        getGlobalSettingsSync: () => {
            const lastMap = _internal.lastUpdatedCache.value || {};
            return {
                ...lastMap,
                roleHubMapping: lastMap.roleHubMapping || {
                    'Administrator': { dashboard: true, assets: true, partners: true, admin: true },
                    'Manager': { dashboard: true, assets: true, partners: true, admin: false },
                    'WarehouseStaff': { dashboard: true, assets: true, partners: true, admin: false },
                    'Sales': { dashboard: true, assets: false, partners: false, admin: false },
                    'Auditor': { dashboard: true, assets: true, partners: true, admin: false }
                }
            };
        },
        deriveHubAccessSync: (role) => {
            const mapping = window.AppDataHandler.getGlobalSettingsSync().roleHubMapping;
            return mapping[role] || { dashboard: false, assets: false, partners: false, admin: false };
        },
        updateGlobalSettings: async function (updates) {
            await _internal.initPromise;
            // Local mode: use system_settings in cache
            if (!_internal.collectionCache.system_settings) _internal.collectionCache.system_settings = { data: [], timestamp: 0 };
            const items = _internal.collectionCache.system_settings.data;
            const key = 'lastUpdated';
            let item = items.find(i => i.key === key);

            const newValue = { ...(item?.value || {}), ...updates };
            if (item) {
                item.value = newValue;
            } else {
                items.push({ key, value: newValue, id: 'sys-last-updated' });
            }

            _internal.lastUpdatedCache.value = newValue;
            _internal.lastUpdatedCache.fetchedAt = Date.now();
            _internal.savePersistentCache();
            return newValue;
        },
        getActivityLogs: () => _internal.getDataInternal('activityLogs'),
        getInputLogs: () => _internal.getDataInternal('inputLogs'),
        getOutputLogs: () => _internal.getDataInternal('outputLogs'),
        getUOMs: () => _internal.getDataInternal('uoms'),
        getWarehouses: () => _internal.getDataInternal('warehouses'),

        clearCache: () => {
            _internal.collectionCache = createEmptyCollectionCache();
            _internal.lastUpdatedCache = { value: null, fetchedAt: 0 };
            localStorage.removeItem('cloudbased_collection_cache');
            localStorage.removeItem('cloudbased_cache_owner');
        },
        getVersion: () => VERSION,
        getPocketBaseUrl: () => {
            return 'local-only';
        },
        savePocketBaseUrl: () => { },
        resetPocketBaseUrl: () => { },
        getFileUrl: (record, filename) => {
            return '';
        },
        getUserAvatarSrc: (user, fallbackName = 'User') => {
            const avatarFile = user?.avatar || user?.profilePicture;
            if (avatarFile) {
                if (typeof avatarFile === 'string' && avatarFile.startsWith('data:')) return avatarFile;
            }
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random&size=200`;
        }
    };

    // Initialize state AFTER publicApi is defined
    _internal.initPromise = (async () => {
        if (_internal.currentUser) {
            publicApi.notify('user', _internal.currentUser);
        } else {
            publicApi.notify('user', null);
        }
    })();

    return publicApi;
})();

