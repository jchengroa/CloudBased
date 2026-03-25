/**
 * Admin Dashboard - Global Settings Tab
 * Integrated Branding & Management controls.
 */
const GlobalSettingsTab = ({ globalSettings, onUpdateGlobalSettings, branding, onUpdateBranding }) => {
    // 1. Branding & Styling State
    const [logoUrl, setLogoUrl] = React.useState(branding?.logoUrl || '');
    const [companyName, setCompanyName] = React.useState(branding?.companyName || 'System');
    const [accentColor, setAccentColor] = React.useState(branding?.accentColor || '#4f46e5');
    const fileInputRef = React.useRef(null);

    // 2. Widget & System Settings
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
        globalDarkMode: false,
        ...globalSettings
    });

    const [isSaving, setIsSaving] = React.useState(false);
    const [isNuking, setIsNuking] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const toggleSetting = (key) => setSettings({ ...settings, [key]: !settings[key] });

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            // A. Save Global Settings
            await window.AppDataHandler.saveGlobalSettings(settings);
            onUpdateGlobalSettings(settings);

            // B. Save Branding
            const brandingData = { logoUrl, companyName: companyName || 'System', accentColor };
            await window.AppDataHandler.saveBranding(brandingData);
            onUpdateBranding(brandingData);

            // C. Activity Log
            await window.AppDataHandler.addActivityLog({
                title: 'System Reconfigured',
                details: 'Updated global branding, module visibility, and system defaults.',
                category: 'system'
            });

            // Immediately apply global accent if needed (optional overlay)
            document.documentElement.style.setProperty('--accent-color', accentColor);
            
            setMessage('All modifications saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch(e) {
            alert(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const resized = await window.resizeImage(file, 400); 
            setLogoUrl(resized);
        } catch(e) { alert("Failed to process image."); }
    };

    const handleNukeData = async () => {
        const confirm1 = confirm("⚠️ DANGER ZONE: You are about to DELETE ALL inventory, logs, and supplier data. This cannot be undone. Are you absolutely sure?");
        if (!confirm1) return;
        const confirm2 = prompt("To confirm, please type 'NUKE' in all caps:");
        if (confirm2 !== 'NUKE') return alert("Aborted. Confirmation text did not match.");
        setIsNuking(true);
        try {
            await Promise.all([
                window.AppDataHandler.saveInventory([]),
                window.AppDataHandler.saveInputLogs([]),
                window.AppDataHandler.saveOutputLogs([]),
                window.AppDataHandler.saveSuppliers([])
            ]);
            alert("Database has been reset.");
            location.reload();
        } catch (e) { alert("Nuke failed: " + e.message); } finally { setIsNuking(false); }
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
            <input type="checkbox" checked={!!settings[stateKey]} onChange={() => toggleSetting(stateKey)} style={{ display: 'none' }} />
        </label>
    );

    return (
        <div className="admin-tab-content fade-in" style={{ maxWidth: '800px' }}>
            {message && <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 'bold' }}>{message}</div>}

            {/* BLOCK 1: Branding & Global Styling */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Icons.Image size={20} /> Branding & Core Defaults
                    </h3>
                    <button 
                        onClick={handleSaveAll} 
                        disabled={isSaving}
                        className="auth-btn-primary"
                        style={{ width: 'auto', padding: '0.5rem 1.5rem', margin: 0, fontSize: '0.8rem' }}
                    >
                        {isSaving ? 'Saving...' : 'Save Branding'}
                    </button>
                </div>
                
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Logo Section */}
                    <div>
                        <label className="auth-label" style={{ fontWeight: '700', fontSize: '0.9rem' }}>Company Logo</label>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.75rem' }}>
                            <div style={{ 
                                width: '80px', height: '80px', background: 'var(--bg-color)', border: '2px solid var(--border-color)', borderRadius: '16px', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
                            }}>
                                {logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Icons.Image size={28} opacity={0.3} />}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input className="auth-input" style={{ margin: 0 }} placeholder="URL" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
                                    <button onClick={() => fileInputRef.current.click()} style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 1rem', cursor: 'pointer' }}>
                                        <Icons.UploadCloud size={18} />
                                    </button>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Best at 200x200px. URL or File Upload supported.</span>
                            </div>
                        </div>
                    </div>

                    {/* Accent Color Section */}
                    <div>
                        <label className="auth-label" style={{ fontWeight: '700', fontSize: '0.9rem' }}>System Accent Color</label>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
                            {['#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'].map(c => (
                                <button key={c} onClick={() => setAccentColor(c)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: accentColor === c ? '2px solid var(--text-primary)' : 'none', cursor: 'pointer' }} />
                            ))}
                            <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>Sets the default for all new users.</span>
                        </div>
                    </div>

                    {/* Company Name & Dark Mode */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="auth-label" style={{ fontWeight: '700', fontSize: '0.9rem' }}>Company Name</label>
                            <input className="auth-input" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ marginTop: '0.5rem' }} />
                        </div>
                        <div>
                            <label className="auth-label" style={{ fontWeight: '700', fontSize: '0.9rem' }}>Default Display Theme</label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button 
                                    onClick={() => setSettings({ ...settings, globalDarkMode: false })}
                                    style={{ 
                                        width: '100%', padding: '0.75rem', 
                                        borderRadius: '12px', border: '1px solid var(--border-color)',
                                        background: settings.globalDarkMode ? 'var(--card-bg)' : 'var(--accent-color)',
                                        color: settings.globalDarkMode ? 'var(--text-primary)' : '#fff',
                                        fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Icons.Sun size={16} /> Light
                                </button>
                                <button 
                                    onClick={() => setSettings({ ...settings, globalDarkMode: true })}
                                    style={{ 
                                        width: '100%', padding: '0.75rem', 
                                        borderRadius: '12px', border: '1px solid var(--border-color)',
                                        background: !settings.globalDarkMode ? 'var(--card-bg)' : 'var(--accent-color)',
                                        color: !settings.globalDarkMode ? 'var(--text-primary)' : '#fff',
                                        fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Icons.Moon size={16} /> Dark
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOCK 2: Dashboard Modules */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Dashboard Module Visibility</h3>
                    <button 
                        onClick={handleSaveAll} 
                        disabled={isSaving}
                        className="auth-btn-primary"
                        style={{ width: 'auto', padding: '0.5rem 1.5rem', margin: 0, fontSize: '0.8rem' }}
                    >
                         Update Modules
                    </button>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <SettingRow label="Total Items Overview" desc="Metric cards for aggregates." stateKey="showTotalItems" />
                    <SettingRow label="Low Stock Alerts" desc="Critical inventory indicator." stateKey="showLowStock" />
                    <SettingRow label="Suppliers Analytics" desc="Overview of procurement sources." stateKey="showSuppliersOnly" />
                    <SettingRow label="Recent Arrival Logs" desc="Historical list of inputs." stateKey="showRecentArrivals" />
                    <SettingRow label="Recent Shipment Logs" desc="Historical list of outputs." stateKey="showRecentShipments" />
                    <SettingRow label="Critical Replenishment" desc="Focus on items needing stock-up." stateKey="showCriticalReplenishment" />
                    <SettingRow label="Forecast Engine" desc="Predictive analytics for run-out dates." stateKey="showPredictiveReplenish" />
                    <SettingRow label="InnoAssistant (AI)" desc="TensorFlow powered intake center." stateKey="showInnoAssistant" />
                    <SettingRow label="Category Statistics" desc="Bar chart for inventory by type." stateKey="showCategoryPerformance" />
                    <SettingRow label="Warehouse Health" desc="Stock integrity across locations." stateKey="showWarehouseHealth" />
                </div>
            </div>

            {/* BLOCK 3: Save Button */}
            <div style={{ padding: '0 0 3rem 0', textAlign: 'right' }}>
                <button 
                    className="auth-btn-primary" 
                    onClick={handleSaveAll} 
                    disabled={isSaving} 
                    style={{ width: 'auto', padding: '1rem 3rem', margin: 0, boxShadow: '0 10px 15px -3px var(--accent-color-transparent)' }}
                >
                    {isSaving ? 'Synchronizing...' : 'Save All Changes'}
                </button>
            </div>

            {/* NUKE & FIREBASE */}
            <div style={{ opacity: 0.8 }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ background: 'var(--danger)', color: 'white', padding: '0.6rem', borderRadius: '10px' }}><Icons.Trash size={18} /></div>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--danger)', margin: 0 }}>Factory Data Reset</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 1rem 0' }}>Permanently wipe all business records from the database.</p>
                            
                            <div style={{ background: 'var(--card-bg)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Following data will be erased:</div>
                                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: 0 }}>
                                    <li>Inventory Items & Stock Levels</li>
                                    <li>Arrivals (Input Logs)</li>
                                    <li>Shipments (Output Logs)</li>
                                    <li>Suppliers & Contact Records</li>
                                </ul>
                            </div>

                            <button onClick={handleNukeData} disabled={isNuking} style={{ background: 'var(--danger)', border: 'none', color: 'white', borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isNuking ? 'Executing Sync...' : 'ERASE ALL BUSINESS DATA'}
                            </button>
                        </div>
                    </div>
                </div>
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
                const response = await fetch('assets/data/defaultDatabase.json');
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

    const handleReset = async () => {
        try {
            const response = await fetch('assets/data/defaultDatabase.json');
            const defaultData = response.ok ? await response.json() : {};
            setConfig(defaultData);
            window.AppDataHandler.resetFirebaseConfig();
            setStatus('Reset to default values. Please reload to apply.');
        } catch(e) { alert("Reset failed."); }
    };

    const inputStyle = { width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', color: 'var(--text-primary)', marginBottom: '1rem' };

    return (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Icons.Shield size={20} /> Firebase Backend Configuration
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>Update your Firestore and Authentication endpoints here.</p>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
                {status && <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '700' }}>{status}</div>}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ gridColumn: 'span 2', position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', opacity: 0.7 }}>API Key</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showKey ? 'text' : 'password'} 
                                style={{ ...inputStyle, paddingRight: '3rem', marginBottom: 0 }} 
                                value={config.apiKey} 
                                onChange={e => setConfig({...config, apiKey: e.target.value})} 
                            />
                            <button 
                                onClick={() => setShowKey(!showKey)}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, color: 'var(--text-primary)' }}
                            >
                                {showKey ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />} 
                            </button>
                        </div>
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
                    <button className="nav-btn" onClick={handleSave} style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-color)' }}>Save Configuration</button>
                    <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>Reset to Factory Defaults</button>
                </div>
            </div>
        </div>
    );
};
window.AdminGlobalSettingsTab = GlobalSettingsTab;
