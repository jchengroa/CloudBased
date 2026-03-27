/**
 * Data Management - Module Init
 * Handles Firebase initialization and shared state.
 */
window.AppDataHandler = (function() {
    const CONFIG_KEY = 'cloudbased_firebase_config';
    const BRANDING_CACHE_KEY = 'cloudbased_branding_cache';
    const ALL_AUDITOR_RESTRICTIONS = ['AddItems', 'EditItems', 'RemoveItems', 'AddLogs', 'EditLogs', 'RemoveLogs', 'AddSuppliers', 'EditSuppliers', 'RemoveSuppliers'];
    
    // Internal state shared across modules
    const _internal = {
        db: null,
        auth: null,
        dbError: null,
        currentUser: null,
        activeConfig: null,
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
        ALL_AUDITOR_RESTRICTIONS,
        
        loadPersistentCache: function() {
            try {
                const saved = localStorage.getItem(this.PERSISTENT_CACHE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Merge saved onto default
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
            
            if (this.collectionCache[collection]) {
                const updateDoc = await this.db.collection('system').doc('lastUpdated').get();
                const latestTimestamp = updateDoc.exists ? (updateDoc.data()[collection] || 0) : 0;
                
                if (this.collectionCache[collection].data && this.collectionCache[collection].timestamp >= latestTimestamp) {
                    return this.collectionCache[collection].data;
                }
                
                const snapshot = await this.db.collection(collection).get();
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                this.collectionCache[collection] = { data: data, timestamp: Date.now() };
                this.savePersistentCache();
                return data;
            }
            
            const snapshot = await this.db.collection(collection).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    };

    try {
        const savedUser = localStorage.getItem('cloudbased_session');
        if (savedUser) _internal.currentUser = JSON.parse(savedUser);
    } catch (e) { }

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
            const savedConfig = localStorage.getItem(CONFIG_KEY);
            _internal.activeConfig = savedConfig ? JSON.parse(savedConfig) : await _internal.fetchJson('assets/data/defaultDatabase.json');
            
            if (!_internal.activeConfig || Object.keys(_internal.activeConfig).length === 0) {
                _internal.dbError = "Firestore configuration missing.";
                return;
            }

            if (!firebase.apps.length) firebase.initializeApp(_internal.activeConfig);
            _internal.db = firebase.firestore();
            _internal.auth = firebase.auth();

            await new Promise(resolve => {
                const unsubscribe = _internal.auth.onAuthStateChanged(user => {
                    unsubscribe();
                    if (user && !_internal.currentUser) {
                        _internal.db.collection('users').doc(user.uid).get().then(doc => {
                            if (doc.exists) {
                                let data = doc.data();
                                if (!data.role) data.role = 'Auditor';
                                
                                _internal.currentUser = { 
                                    ...data, 
                                    uid: user.uid,
                                    restrictions: data.restrictions || (data.role === 'Auditor' ? ALL_AUDITOR_RESTRICTIONS : [])
                                };
                                localStorage.setItem('cloudbased_session', JSON.stringify(_internal.currentUser));
                                if (doc.data() && !doc.data().role) {
                                    _internal.db.collection('users').doc(user.uid).set({ role: 'Auditor' }, { merge: true }).catch(() => {});
                                }
                            }
                        }).catch(console.error);
                    }
                    resolve();
                });
            });
        } catch (e) {
            _internal.dbError = "Firebase Init failed: " + e.message;
        }
    })();

    return {
        _internal,
        getDbError: () => _internal.dbError,
        getCurrentUser: () => _internal.currentUser,
        getAllAuditorRestrictions: () => [...ALL_AUDITOR_RESTRICTIONS],
        getFirebaseConfig: () => {
            const saved = localStorage.getItem(CONFIG_KEY);
            return saved ? JSON.parse(saved) : null;
        },
        saveFirebaseConfig: (config) => {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
        },
        resetFirebaseConfig: () => {
            localStorage.removeItem(CONFIG_KEY);
        }
    };
})();
