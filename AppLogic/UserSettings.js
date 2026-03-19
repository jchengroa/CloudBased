/**
 * ==========================================
 * USER SETTINGS COMPONENT
 * ==========================================
 * Isolated view for application configurations
 * such as the global light/dark theme toggle.
 */

const UserSettings = ({ theme, toggleTheme, threshold, setThreshold, isThresholdEnabled, setIsThresholdEnabled, uoms = [], onSaveUOMs, warehouses = [], onSaveWarehouses }) => {

    // --- Local State for Threshold Input ---
    const [inputValue, setInputValue] = React.useState(threshold.toString());
    const [errorMsg, setErrorMsg] = React.useState("");

    // --- Local State for UOM Editor ---
    const [newUom, setNewUom] = React.useState("");
    const [uomError, setUomError] = React.useState("");

    // --- Local State for Warehouse Editor ---
    const [newWarehouse, setNewWarehouse] = React.useState("");
    const [warehouseError, setWarehouseError] = React.useState("");

    // --- Local State for Firebase Config Editor ---
    const [fbConfig, setFbConfig] = React.useState(() => window.AppDataHandler.getFirebaseConfig());

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

    // --- Handlers ---
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

    // --- Render ---
    return (
        <div className="list-box settings-tab">

            <h2>Settings</h2>

            {/* Application Theme Setting Block */}
            <div className="setting-item">
                <div className="setting-info">
                    <h3>Themes</h3>
                    <p>Switch between different light and dark themes.</p>
                </div>

                {/* Inherits styling from the main toolbar buttons for consistency */}
                <button className="tool-btn edit-btn" onClick={toggleTheme} style={{ width: '200px' }}>
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </button>
            </div>

            {/* Low Stock Threshold Setting Block */}
            <div className="setting-item setting-column" style={{ marginTop: '1.5rem' }}>
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

                {/* Standard text autocorrect/error message beneath the field */}
                {errorMsg && isThresholdEnabled && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {errorMsg}
                    </div>
                )}
            </div>

            {/* Units of Measure (UOM) Setting Block */}
            <div className="setting-item setting-column" style={{ marginTop: '1.5rem' }}>
                <div className="setting-item-inner">
                    <div className="setting-info">
                        <h3>Units of Measure (UOM)</h3>
                        <p>Change the Units of Measure used in the application.</p>
                    </div>
                </div>

                {/* Existing UOM Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    {uoms.map(uom => (
                        <div key={uom} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.3rem 0.75rem', borderRadius: '999px',
                            background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                            fontSize: '0.9rem', color: 'var(--text-primary)'
                        }}>
                            <span>{uom}</span>
                            <button
                                onClick={() => handleRemoveUom(uom)}
                                title={`Remove ${uom}`}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-secondary)', fontSize: '1rem',
                                    lineHeight: 1, padding: '0 2px'
                                }}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add New UOM Row */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        className="search-bar"
                        style={{ width: '200px', fontSize: '0.95rem' }}
                        placeholder="e.g. Liters"
                        value={newUom}
                        onChange={(e) => { setNewUom(e.target.value); setUomError(""); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddUom()}
                    />
                    <button className="tool-btn add-btn" onClick={handleAddUom}>+ Add</button>
                </div>
                {uomError && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {uomError}
                    </div>
                )}
            </div>

            {/* Warehouses Setting Block */}
            <div className="setting-item setting-column" style={{ marginTop: '1.5rem' }}>
                <div className="setting-item-inner">
                    <div className="setting-info">
                        <h3>Warehouses</h3>
                        <p>Manage the warehouse locations available for filtering and item assignment.</p>
                    </div>
                </div>

                {/* Existing Warehouse Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                    {warehouses.map(wh => (
                        <div key={wh} style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.3rem 0.75rem', borderRadius: '999px',
                            background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                            fontSize: '0.9rem', color: 'var(--text-primary)'
                        }}>
                            <span>{wh}</span>
                            <button
                                onClick={() => handleRemoveWarehouse(wh)}
                                title={`Remove ${wh}`}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-secondary)', fontSize: '1rem',
                                    lineHeight: 1, padding: '0 2px'
                                }}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add New Warehouse Row */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        className="search-bar"
                        style={{ width: '200px', fontSize: '0.95rem' }}
                        placeholder="e.g. North Warehouse"
                        value={newWarehouse}
                        onChange={(e) => { setNewWarehouse(e.target.value); setWarehouseError(""); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddWarehouse()}
                    />
                    <button className="tool-btn add-btn" onClick={handleAddWarehouse}>+ Add</button>
                </div>
                {warehouseError && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {warehouseError}
                    </div>
                )}
            </div>

            {/* Reset App Data Block */}
            <div className="setting-item" style={{ marginTop: '1.5rem' }}>
                <div className="setting-info">
                    <h3>Reset App Data</h3>
                    <p>Clears all saved data from local storage. The app will reload and revert to its default values.</p>
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

            {/* Firebase Configuration Block */}
            <div className="setting-item setting-column" style={{ marginTop: '1.5rem' }}>
                <div className="setting-item-inner">
                    <div className="setting-info">
                        <h3>Database Configuration</h3>
                        <p>Update these fields if you want switch to a different database. Changes take effect after reloading. </p>
                        <p style={{ marginTop: '0.5rem' }}>Note: This project is using Firebase as its database, the hardcoded values are from Cheng Roa's firebase project.</p>
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
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ width: '160px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
                            <input
                                type="text"
                                name={key}
                                className="search-bar"
                                style={{ flex: 1, fontSize: '0.85rem', fontFamily: 'monospace' }}
                                value={fbConfig[key] || ''}
                                onChange={handleFbConfigChange}
                            />
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button className="tool-btn add-btn" onClick={handleSaveFbConfig} style={{ padding: '0.5rem 1.5rem' }}>
                        Save &amp; Reload
                    </button>
                    <button className="tool-btn edit-btn" onClick={handleResetFbConfig} style={{ padding: '0.5rem 1.5rem' }}>
                        Reset to Default
                    </button>
                </div>
            </div>

            {/* Application Info Block */}
            <div className="setting-item" style={{ marginTop: '1.5rem' }}>
                <div className="setting-info">
                    <h3>CloudBased</h3>
                    <p>  -ˋˏ ._. ˎˊ  </p>
                    <p>Version: 0.4.2  |  Last Updated: March 19, 2026</p>
                    <p>Created by: Cheng Roa and Tejada</p>
                </div>
            </div>

        </div>
    );
};
