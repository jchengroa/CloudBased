/**
 * Admin Dashboard - Global Settings Tab
 */
const GlobalSettingsTab = ({ globalSettings, onUpdateGlobalSettings }) => {
    const [settings, setSettings] = React.useState({
        showTotalItems: true,
        showLowStock: true,
        showSuppliersOnly: true,
        showRecentArrivals: true,
        showRecentShipments: true,
        showCriticalReplenishment: true,
        showPredictiveReplenish: true,
        showInnoAssistant: true,
        showCategoryPerformance: true,
        showWarehouseDistribution: true,
        ...globalSettings
    });
    const [isSaving, setIsSaving] = React.useState(false);
    const [isNuking, setIsNuking] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const toggleSetting = (key) => {
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await window.AppDataHandler.saveGlobalSettings(settings);
            onUpdateGlobalSettings(settings);
            await window.AppDataHandler.addActivityLog({
                title: 'Updated Global Settings',
                details: 'Modified dashboard widget visibility and system configuration.',
                category: 'system'
            });
            setMessage('Global Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch(e) {
            alert(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleNukeData = async () => {
        const confirm1 = confirm("⚠️ DANGER ZONE: You are about to DELETE ALL inventory, logs, and supplier data. This cannot be undone. Are you absolutely sure?");
        if (!confirm1) return;
        
        const confirm2 = prompt("To confirm, please type 'NUKE' in all caps:");
        if (confirm2 !== 'NUKE') return alert("Aborted. Confirmation text did not match.");

        setIsNuking(true);
        try {
            // Strictly nuke inventory, inputLogs, outputLogs, and suppliers
            await Promise.all([
                window.AppDataHandler.saveInventory([]),
                window.AppDataHandler.saveInputLogs([]),
                window.AppDataHandler.saveOutputLogs([]),
                window.AppDataHandler.saveSuppliers([])
            ]);
            
            await window.AppDataHandler.addActivityLog({
                title: 'System Factory Reset',
                details: 'Successfully executed a full database wipe of inventory, logs, and suppliers.',
                category: 'system'
            });
            alert("SUCCESS: The database has been reset. All inventory codes, transaction logs, and supplier profiles have been permanently removed.");
            location.reload(); // Refresh to ensure app state is clean
        } catch (e) {
            alert("Nuke failed: " + e.message);
        } finally {
            setIsNuking(false);
        }
    };

    const SettingRow = ({ label, desc, stateKey }) => (
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ paddingRight: '1rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{desc}</div>
            </div>
            <div style={{ background: settings[stateKey] ? 'var(--accent-color)' : 'var(--border-color)', width: '48px', height: '26px', borderRadius: '24px', position: 'relative', transition: 'background 0.3s' }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: settings[stateKey] ? '25px' : '3px', transition: '0.3s' }}></div>
            </div>
            <input type="checkbox" checked={settings[stateKey]} onChange={() => toggleSetting(stateKey)} style={{ display: 'none' }} />
        </label>
    );

    return (
        <div className="admin-tab-content fade-in" style={{ maxWidth: '800px' }}>
            {message && <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 'bold' }}>{message}</div>}

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icons.Settings size={20} /> Dashboard Widget Configuration
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Select which widgets are visible to users on the main dashboard globally.</p>
                </div>
                
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <SettingRow label="Total Items Overview" desc="Displays aggregate inventory metrics and total valuations." stateKey="showTotalItems" />
                    <SettingRow label="Low Stock Alerts" desc="Highlights items falling below their Minimum Stock Levels." stateKey="showLowStock" />
                    <SettingRow label="Suppliers Analytics" desc="Overview of top suppliers by volume." stateKey="showSuppliersOnly" />
                    <SettingRow label="Recent Arrivals Log" desc="List of inputs processed across selected warehouses." stateKey="showRecentArrivals" />
                    <SettingRow label="Recent Shipments Log" desc="List of outputs and fulfillments." stateKey="showRecentShipments" />
                    <SettingRow label="Critical Replenishment Alerts" desc="Highlights urgent items that need restocking based on MSL or Global Thresholds." stateKey="showCriticalReplenishment" />
                    <SettingRow label="Predictive Replenishment Engine" desc="Forecasts run-out dates and enables Google Calendar sync." stateKey="showPredictiveReplenish" />
                    <SettingRow label="InnoAssistant AI Command Center" desc="Cognitive intake processing powered by TensorFlow & Compromise." stateKey="showInnoAssistant" />
                    <SettingRow label="Category Performance" desc="Distribution pie or bar charts by category." stateKey="showCategoryPerformance" />
                    <SettingRow label="Warehouse Distribution" desc="Stock breakdown per active warehouse location." stateKey="showWarehouseDistribution" />
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--card-bg)', textAlign: 'right' }}>
                    <button 
                        className="auth-btn-primary" 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        style={{ width: 'auto', padding: '0.8rem 2.5rem', margin: 0 }}
                    >
                        {isSaving ? 'Processing...' : 'Save Configuration'}
                    </button>
                </div>
            </div>

            {/* NUKE FEATURE SECTION */}
            <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ background: 'var(--danger)', color: 'white', padding: '0.6rem', borderRadius: '10px' }}>
                        <Icons.Trash size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--danger)' }}>System Factory Reset</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Permanently delete all business data. This action is irreversible.</p>
                    </div>
                </div>
                
                <div style={{ background: 'var(--card-bg)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Following data will be erased:</div>
                    <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <li>Inventory Items & Stock Levels</li>
                        <li>Arrivals (Input Logs)</li>
                        <li>Shipments (Output Logs)</li>
                        <li>Suppliers & Contact Records</li>
                    </ul>
                </div>

                <button 
                    onClick={handleNukeData}
                    disabled={isNuking}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'var(--danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                    }}
                >
                    {isNuking ? 'NUKING SYSTEM...' : 'ERASE ALL BUSINESS DATA'}
                </button>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
                <FirebaseConfigurator />
            </div>
        </div>
    );
};

const FirebaseConfigurator = () => {
    const [config, setConfig] = React.useState({
        apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: ''
    });
    const [showKey, setShowKey] = React.useState(false);
    const [status, setStatus] = React.useState('');

    React.useEffect(() => {
        const fetchCurrent = async () => {
            try {
                const response = await fetch('AppData/defaultDatabase.json');
                const defaultData = response.ok ? await response.json() : {};
                const saved = window.AppDataHandler.getFirebaseConfig();
                setConfig({ ...defaultData, ...saved });
            } catch(e) {}
        };
        fetchCurrent();
    }, []);

    const handleSave = () => {
        window.AppDataHandler.saveFirebaseConfig(config);
        setStatus('Configuration saved! Please reload the page to apply changes.');
    };

    const handleReset = () => {
        window.AppDataHandler.resetFirebaseConfig();
        location.reload();
    };

    const inputStyle = { width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)', marginBottom: '1rem' };

    return (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Icons.Shield size={20} /> Configure Firebase Database
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>Update your Firestore and Auth endpoints here.</p>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
                {status && <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '700' }}>{status}</div>}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: 'span 2', position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', opacity: 0.7 }}>Firebase API Key</label>
                        <input 
                            type={showKey ? 'text' : 'password'} 
                            style={{ ...inputStyle, paddingRight: '3rem' }} 
                            value={config.apiKey} 
                            onChange={e => setConfig({...config, apiKey: e.target.value})} 
                        />
                        <button 
                            onClick={() => setShowKey(!showKey)}
                            style={{ position: 'absolute', right: '10px', top: '34px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                        >
                            {showKey ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', opacity: 0.7 }}>Project ID</label>
                        <input style={inputStyle} value={config.projectId} onChange={e => setConfig({...config, projectId: e.target.value})} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', opacity: 0.7 }}>Auth Domain</label>
                        <input style={inputStyle} value={config.authDomain} onChange={e => setConfig({...config, authDomain: e.target.value})} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', opacity: 0.7 }}>Storage Bucket</label>
                        <input style={inputStyle} value={config.storageBucket} onChange={e => setConfig({...config, storageBucket: e.target.value})} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', opacity: 0.7 }}>Messaging Sender ID</label>
                        <input style={inputStyle} value={config.messagingSenderId} onChange={e => setConfig({...config, messagingSenderId: e.target.value})} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', opacity: 0.7 }}>App ID</label>
                        <input style={inputStyle} value={config.appId} onChange={e => setConfig({...config, appId: e.target.value})} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="auth-btn-primary" onClick={handleSave} style={{ width: 'auto', padding: '0.8rem 2rem', margin: 0 }}>Save Config</button>
                    <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>Reset to Defaults</button>
                </div>
            </div>
        </div>
    );
};
window.AdminGlobalSettingsTab = GlobalSettingsTab;
