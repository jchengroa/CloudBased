/**
 * Data Management - Module Init
 * Handles PocketBase initialization and shared state.
 */
window.AppDataHandler = (function() {
    const CONFIG_KEY = 'cloudbased_pocketbase_url';
    const MODE_KEY = 'cloudbased_db_mode';
    const BRANDING_CACHE_KEY = 'cloudbased_branding_cache';
    const MIGRATION_KEY = 'cloudbased_v2.2_migrated';
    const ALL_AUDITOR_RESTRICTIONS = ['AddItems', 'EditItems', 'RemoveItems', 'AddLogs', 'EditLogs', 'RemoveLogs', 'AddSuppliers', 'EditSuppliers', 'RemoveSuppliers'];
    
    // Internal state shared across modules
    const _internal = {
        pb: null,
        dbError: null,
        currentUser: (function() {
            try {
                const saved = localStorage.getItem('cloudbased_session');
                return saved ? JSON.parse(saved) : null;
            } catch (e) { return null; }
        })(),
        activeUrl: 'http://127.0.0.1:8090',
        masterConfigUrl: null,
        collectionCache: {
            inventory: { data: null, timestamp: 0 },
            inputLogs: { data: null, timestamp: 0 },
            outputLogs: { data: null, timestamp: 0 },
            suppliers: { data: null, timestamp: 0 },
            activityLogs: { data: null, timestamp: 0 },
            users: { data: null, timestamp: 0 }
        },
        PERSISTENT_CACHE_KEY: 'cloudbased_collection_cache',
        staticBranding: { companyName: 'System', logoUrl: '' },
        initPromise: null,
        brandingFetch: null,
        CONFIG_KEY,
        BRANDING_CACHE_KEY,
        MODE_KEY,
        ALL_AUDITOR_RESTRICTIONS,
        
        getMode: () => localStorage.getItem(MODE_KEY) || 'VPS',
        
        loadPersistentCache: function() {
            try {
                // One-time cache buster to clear old Firebase data
                if (!localStorage.getItem(MIGRATION_KEY)) {
                    localStorage.removeItem(this.PERSISTENT_CACHE_KEY);
                    localStorage.removeItem('cloudbased_firebase_config');
                    localStorage.setItem(MIGRATION_KEY, 'true');
                    return;
                }

                const saved = localStorage.getItem(this.PERSISTENT_CACHE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    Object.keys(parsed).forEach(k => {
                       if (this.collectionCache[k]) this.collectionCache[k] = parsed[k];
                    });
                }
            } catch (e) { console.warn("Failed to load local cache", e); }
        },
        savePersistentCache: function() {
            try {
                localStorage.setItem(this.PERSISTENT_CACHE_KEY, JSON.stringify(this.collectionCache));
            } catch (e) { }
        },
        
        fetchJson: async function(path) {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to load ${path}`);
            return response.json();
        },
        
        getDataInternal: async function(collection) {
            await this.initPromise;
            
            // Firebase Mode Branch
            if (this.getMode() === 'FIREBASE') {
                return window.FirebaseBridge.getData(collection);
            }

            // PocketBase Mode
            const pbCollection = collection === 'inputLogs' ? 'logs_input' : 
                                 collection === 'outputLogs' ? 'logs_output' : 
                                 collection === 'activityLogs' ? 'activity_logs' : 
                                 collection;

            if (this.collectionCache[collection]) {
                const list = await this.pb.collection('system_settings').getList(1, 1, { filter: 'key="lastUpdated"' });
                const systemRec = list.items.length > 0 ? list.items[0] : null;
                const latestTimestamp = systemRec ? (systemRec.value[collection] || 0) : 0;
                
                if (this.collectionCache[collection].data && this.collectionCache[collection].timestamp >= latestTimestamp) {
                    return this.collectionCache[collection].data;
                }
                
                const data = await this.pb.collection(pbCollection).getFullList();
                const formatted = data.map(rec => ({ 
                    ...rec, 
                    id: rec.itemCode || rec.id,
                    timestamp: new Date(rec.created).getTime() 
                }));
                
                this.collectionCache[collection] = { data: formatted, timestamp: Date.now() };
                this.savePersistentCache();
                return formatted;
            }
            
            const data = await this.pb.collection(pbCollection).getFullList();
            return data.map(rec => ({ 
                ...rec, 
                id: rec.itemCode || rec.id,
                timestamp: new Date(rec.created).getTime()
            }));
        }
    };

    _internal.brandingFetch = (async () => {
        try {
            const data = await _internal.fetchJson('assets/data/branding.json');
            if (data) _internal.staticBranding = data;
        } catch (e) {
            console.warn("Could not load branding.json, using fallback.");
        }
    })();

    _internal.loadPersistentCache();

    _internal.initPromise = (async () => {
        try {
            const mode = _internal.getMode();

            if (mode === 'FIREBASE') {
                const fbUser = await window.FirebaseBridge.init();
                if (fbUser) {
                    const profileData = await window.FirebaseBridge.getProfile(fbUser.uid);
                    _internal.currentUser = {
                        ...profileData,
                        uid: fbUser.uid,
                        email: fbUser.email,
                        role: profileData?.role || 'Administrator',
                        restrictions: profileData?.restrictions || []
                    };
                    localStorage.setItem('cloudbased_session', JSON.stringify(_internal.currentUser));
                }
                return;
            }

            // PocketBase Initialization
            const savedUrl = localStorage.getItem(CONFIG_KEY);
            try {
                const response = await fetch('assets/data/pocketbase_config.json');
                const master = response.ok ? await response.json() : null;
                if (master && master.pocketbaseUrl) {
                    _internal.masterConfigUrl = master.pocketbaseUrl;
                }
            } catch(e) { }

            _internal.activeUrl = savedUrl || _internal.masterConfigUrl || 'http://127.0.0.1:8090';
            _internal.pb = new PocketBase(_internal.activeUrl);
            _internal.pb.autoCancellation(false);

            if (_internal.pb.authStore.isValid) {
                const userRec = _internal.pb.authStore.model;
                _internal.currentUser = { 
                    ...userRec, 
                    uid: userRec.id,
                    restrictions: userRec.restrictions || (userRec.role === 'Auditor' ? ALL_AUDITOR_RESTRICTIONS : [])
                };
                localStorage.setItem('cloudbased_session', JSON.stringify(_internal.currentUser));
            } else {
                localStorage.removeItem('cloudbased_session');
            }
        } catch (e) {
            _internal.dbError = "Hander Init failed: " + e.message;
        }
    })();

    return {
        _internal,
        getCloudMode: () => _internal.getMode(),
        setCloudMode: (mode) => {
            localStorage.setItem(MODE_KEY, mode);
            window.location.reload();
        },
        getDbError: () => _internal.dbError,
        getCurrentUser: () => _internal.currentUser,
        getAllAuditorRestrictions: () => [...ALL_AUDITOR_RESTRICTIONS],
        getPocketBaseUrl: () => {
            return localStorage.getItem(CONFIG_KEY) || _internal.masterConfigUrl || 'http://127.0.0.1:8090';
        },
        savePocketBaseUrl: (url) => {
            localStorage.setItem(CONFIG_KEY, url);
        },
        resetPocketBaseUrl: () => {
            localStorage.removeItem(CONFIG_KEY);
        }
    };
})();
