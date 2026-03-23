/*
 * User Settings Component
 * Isolated tab for configuring app preferences like theme and stock thresholds.
 */

const UserSettings = ({ theme, toggleTheme, threshold, setThreshold, isThresholdEnabled, setIsThresholdEnabled, uoms = [], onSaveUOMs, warehouses = [], onSaveWarehouses, inventoryData = [] }) => {

    // local field states
    const [inputValue, setInputValue] = React.useState(threshold.toString());
    const [errorMsg, setErrorMsg] = React.useState("");

    const [newUom, setNewUom] = React.useState("");
    const [uomError, setUomError] = React.useState("");

    const [newWarehouse, setNewWarehouse] = React.useState("");
    const [warehouseError, setWarehouseError] = React.useState("");

    const [fbConfig, setFbConfig] = React.useState(() => window.AppDataHandler.getFirebaseConfig());
    const [isApiKeyVisible, setIsApiKeyVisible] = React.useState(false);

    const handleFbConfigChange = (e) => {
        const { name, value } = e.target;
        setFbConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveFbConfig = () => {
        window.AppDataHandler.saveFirebaseConfig(fbConfig);
        window.location.reload();
    };

    const handleResetFbConfig = () => {
        localStorage.removeItem('cloudbased_firebase_config');
        window.location.reload();
    };

    // form event handlers
    const handleThresholdChange = (e) => {
        let val = e.target.value;
        setInputValue(val); // Always update text field to let user verify

        // Allow empty field to be evaluated cleanly
        if (val === '') {
            setErrorMsg("");
            return;
        }

        let num = parseInt(val, 10);
        if (isNaN(num)) return;

        if (num < 0) {
            num = 0;
            setInputValue("0");
            setErrorMsg("Threshold cannot be less than 0!");
        } else if (num > 99999) {
            num = 99999;
            setInputValue("99999");
            setErrorMsg(`Exceeded maximum threshold!`);
        } else {
            setErrorMsg("");
        }

        // Saves immediately upon passing checks
        setThreshold(num);
    };

    const handleThresholdBlur = () => {
        if (inputValue === '') {
            setInputValue("0");
            setThreshold(0);
            setErrorMsg("Please input a numerical value properly!");
        }
    };

    const handleAddUom = () => {
        const trimmed = newUom.trim();
        if (!trimmed) { setUomError("Please enter a UOM name."); return; }
        if (uoms.map(u => u.toLowerCase()).includes(trimmed.toLowerCase())) { setUomError(`"${trimmed}" already exists.`); return; }
        onSaveUOMs([...uoms, trimmed]);
        setNewUom(""); setUomError("");
    };

    const handleRemoveUom = (uomToRemove) => {
        onSaveUOMs(uoms.filter(u => u !== uomToRemove));
    };

    const handleAddWarehouse = () => {
        const trimmed = newWarehouse.trim();
        if (!trimmed) { setWarehouseError("Please enter a warehouse name."); return; }
        if (warehouses.map(w => w.toLowerCase()).includes(trimmed.toLowerCase())) { setWarehouseError(`"${trimmed}" already exists.`); return; }
        onSaveWarehouses([...warehouses, trimmed]);
        setNewWarehouse(""); setWarehouseError("");
    };

    const handleRemoveWarehouse = (whToRemove) => {
        onSaveWarehouses(warehouses.filter(w => w !== whToRemove));
    };

    // view markup
    return (
        <div className="list-box settings-tab">

            <h2>User Settings</h2>

            {/* --- Section 1: General Preferences --- */}
            <div className="settings-section-header">Appearance</div>

            <div className="setting-item">
                <div className="setting-info">
                    <h3>Themes</h3>
                    <p>Switch between different light and dark themes.</p>
                </div>
                <button className="tool-btn edit-btn" onClick={toggleTheme} style={{ width: '200px' }}>
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </button>
            </div>


            {/* --- Section 2: Inventory Rules & Masters --- */}
            <div className="settings-section-header">Inventory Framework</div>

            <div className="setting-item setting-column">
                <div className="setting-item-inner">
                    <div className="setting-info">
                        <h3>Global Stock Threshold</h3>
                        <p>Items with quantities at or below this limit will automatically be flagged as "Low Stock".</p>
                    </div>
                    <div className="threshold-controls">
                        <button
                            className="tool-btn edit-btn"
                            onClick={() => setIsThresholdEnabled(!isThresholdEnabled)}
                            style={{ width: '100px' }}
                        >
                            {isThresholdEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <input
                            type="number"
                            className="search-bar"
                            style={{ width: '120px', textAlign: 'center', fontSize: '1.1rem', opacity: isThresholdEnabled ? 1 : 0.5 }}
                            value={inputValue}
                            onChange={handleThresholdChange}
                            onBlur={handleThresholdBlur}
                            disabled={!isThresholdEnabled}
                        />
                    </div>
                </div>
                {errorMsg && isThresholdEnabled && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {errorMsg}
                    </div>
                )}
            </div>

            <div className="setting-item setting-column" style={{ marginTop: '1rem' }}>
                <div className="setting-item-inner">
                    <div className="setting-info">
                        <h3>Units of Measure (UOM)</h3>
                        <p>Change the Units of Measure used in the application.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    {uoms.map(uom => (
                        <div key={uom} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.3rem 0.75rem', borderRadius: '999px',
                            background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                            fontSize: '0.9rem', color: 'var(--text-primary)'
                        }}>
                            <span>{uom}</span>
                            <button onClick={() => handleRemoveUom(uom)} title={`Remove ${uom}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1, padding: '0 2px' }}>
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'center' }}>
                    <input type="text" className="search-bar" style={{ width: '200px', fontSize: '0.95rem' }} placeholder="e.g. Liters" value={newUom} onChange={(e) => { setNewUom(e.target.value); setUomError(""); }} onKeyDown={(e) => e.key === 'Enter' && handleAddUom()} />
                    <button className="tool-btn add-btn" onClick={handleAddUom}>+ Add</button>
                </div>
                {uomError && <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{uomError}</div>}
            </div>

            <div className="setting-item setting-column" style={{ marginTop: '1rem' }}>
                <div className="setting-item-inner">
                    <div className="setting-info">
                        <h3>Warehouses</h3>
                        <p>Manage the warehouse locations available for filtering and item assignment.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    {warehouses.map(wh => (
                        <div key={wh} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.3rem 0.75rem', borderRadius: '999px',
                            background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                            fontSize: '0.9rem', color: 'var(--text-primary)'
                        }}>
                            <span>{wh}</span>
                            <button onClick={() => handleRemoveWarehouse(wh)} title={`Remove ${wh}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1, padding: '0 2px' }}>
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'center' }}>
                    <input type="text" className="search-bar" style={{ width: '200px', fontSize: '0.95rem' }} placeholder="e.g. North Warehouse" value={newWarehouse} onChange={(e) => { setNewWarehouse(e.target.value); setWarehouseError(""); }} onKeyDown={(e) => e.key === 'Enter' && handleAddWarehouse()} />
                    <button className="tool-btn add-btn" onClick={handleAddWarehouse}>+ Add</button>
                </div>
                {warehouseError && <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{warehouseError}</div>}
            </div>


            {/* --- Section 3: Connectivity & Integrations --- */}
            <div className="settings-section-header">Data &amp; Connectivity</div>

            <div className="setting-item setting-column">
                <div className="setting-item-inner">
                    <div className="setting-info">
                        <h3>Database Configuration</h3>
                        <p>Update these fields to switch to a different Firebase Firestore database. </p>
                        <p style={{ marginTop: '0.5rem' }}>Note: The default database values are stored in defaultDatabase.json and initially loaded from the system if no custom config is present.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem' }}>
                    {[
                        { key: 'apiKey', label: 'API Key' },
                        { key: 'authDomain', label: 'Auth Domain' },
                        { key: 'projectId', label: 'Project ID' },
                        { key: 'storageBucket', label: 'Storage Bucket' },
                        { key: 'messagingSenderId', label: 'Messaging Sender ID' },
                        { key: 'appId', label: 'App ID' },
                    ].map(({ key, label }) => (
                        <div key={key} className="db-config-row">
                            <span className="db-config-label">{label}</span>
                            <div className="password-input-wrapper">
                                <input
                                    type={key === 'apiKey' && !isApiKeyVisible ? 'password' : 'text'}
                                    name={key}
                                    className="search-bar"
                                    style={{ width: '100%', fontSize: '0.85rem', fontFamily: 'monospace', paddingRight: key === 'apiKey' ? '50px' : '1.2rem' }}
                                    value={fbConfig[key] || ''}
                                    onChange={handleFbConfigChange}
                                />
                                {key === 'apiKey' && (
                                    <button type="button" className="password-toggle-btn" onClick={() => setIsApiKeyVisible(!isApiKeyVisible)} title={isApiKeyVisible ? "Hide API Key" : "Show API Key"}>
                                        {isApiKeyVisible ? 'HIDE' : 'SHOW'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button className="tool-btn add-btn" onClick={handleSaveFbConfig} style={{ padding: '0.5rem 1.5rem' }}>Save &amp; Reload</button>
                    <button className="tool-btn edit-btn" onClick={handleResetFbConfig} style={{ padding: '0.5rem 1.5rem' }}>Reset to Default</button>
                </div>
            </div>

            <div className="setting-item setting-column" style={{ marginTop: '1rem' }}>
                <div className="setting-item-inner">
                    <div className="setting-info">
                        <h3>Export Data</h3>
                        <p>Download database data in ERPNext-compatible formats.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Item Master</div>
                        </div>
                        <button className="tool-btn add-btn" onClick={() => window.ExportTool.exportItemMaster(inventoryData)}>↓ Download .CSV</button>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border-color)', opacity: 0.3 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Stock Reconciliation</div>
                        </div>
                        <button className="tool-btn add-btn" onClick={() => window.ExportTool.exportStockRecon(inventoryData)}>↓ Download .CSV</button>
                    </div>
                </div>
            </div>


            {/* --- Section 4: System Management --- */}
            <div className="settings-section-header">System Operations</div>

            <div className="setting-item">
                <div className="setting-info">
                    <h3>Clear Local Storage</h3>
                    <p>Wipe all local storage data stored in browser. This will NOT delete cloud database records.</p>
                </div>
                <button
                    className="tool-btn remove-btn"
                    style={{ width: '200px' }}
                    onClick={() => {
                        window.AppDataHandler.clearAllData();
                        window.location.reload();
                    }}
                >
                    Clear Local Storage
                </button>
            </div>


            {/* --- Footer / Credits --- */}
            <div style={{ marginTop: '5rem', padding: '2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', opacity: 0.6 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>CloudBased</div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>  -ˋˏ ._. ˎˊ  </p>
                <p style={{ fontSize: '0.85rem' }}>Version: 0.6.2  |  Last Updated: March 23, 2026</p>
                <p style={{ fontSize: '0.85rem' }}>Created by: Cheng Roa and Tejada</p>
            </div>

        </div>
    );
};
