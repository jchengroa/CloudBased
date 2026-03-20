/*
 * App.js - Main Application Entry Point
 * Maintains global state (themes, tabs) and routes props to sub-components.
 */

const { useState } = React;

function App() {
    // global state
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('inventory');

    // modal overlay data
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [promptState, setPromptState] = useState({ isOpen: false, title: '', type: '', items: [] });

    // shared numeric thresholding data (loaded async on mount)
    const [lowStockThreshold, setLowStockThreshold] = useState(1000);
    const [isThresholdEnabled, setIsThresholdEnabled] = useState(true);
    const [activeWarehouseFilter, setActiveWarehouseFilter] = useState('All');

    // unified cloud data arrays
    const [inventoryData, setInventoryData] = useState([]);
    const [supplierData, setSupplierData] = useState([]);

    // transaction logs
    const [inputLogs, setInputLogs] = useState([]);
    const [outputLogs, setOutputLogs] = useState([]);

    // shared dropdown lists
    const [uoms, setUoms] = useState([]);
    const [warehouseList, setWarehouseList] = useState([]);

    // initial app load flag
    const [dataLoaded, setDataLoaded] = useState(false);
    const [dbError, setDbError] = useState(null);

    // Load Backend Data on Mount
    React.useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Settings are local, so they should be loaded first
                const settings = await window.AppDataHandler.getSettings();
                setTheme(settings.theme);
                document.documentElement.setAttribute('data-theme', settings.theme);
                setLowStockThreshold(settings.lowStockThreshold);
                setIsThresholdEnabled(settings.isThresholdEnabled);

                // These depend on Firebase
                const inv = await window.AppDataHandler.getInventory();
                const sups = await window.AppDataHandler.getSuppliers();
                const staticUoms = await window.AppDataHandler.getUOMs();
                const staticWhs = await window.AppDataHandler.getWarehouses();
                const inLogs = await window.AppDataHandler.getInputLogs();
                const outLogs = await window.AppDataHandler.getOutputLogs();

                setInventoryData(inv);
                setSupplierData(sups);
                setUoms(staticUoms);
                setWarehouseList(staticWhs);
                setInputLogs(inLogs);
                setOutputLogs(outLogs);

                setDbError(window.AppDataHandler.getDbError());
            } catch (e) {
                console.error("Critical error during data load:", e);
                setDbError(window.AppDataHandler.getDbError() || e.message);
            } finally {
                setDataLoaded(true);
            }
        };
        loadInitialData();
    }, []);

    // inject visual filter "All" into user-defined warehouse array
    const warehouses = ['All', ...warehouseList];

    // handlers
    // Flips the system theme and updates the master HTML attribute
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        window.AppDataHandler.saveSettings({ theme: newTheme, lowStockThreshold, isThresholdEnabled });
    };

    // pass-through settings controllers
    const handleSetThreshold = (newVal) => {
        setLowStockThreshold(newVal);
        window.AppDataHandler.saveSettings({ theme, lowStockThreshold: newVal, isThresholdEnabled });
    };

    const handleSetThresholdEnabled = (newVal) => {
        setIsThresholdEnabled(newVal);
        window.AppDataHandler.saveSettings({ theme, lowStockThreshold, isThresholdEnabled: newVal });
    };

    // Updates the UOM list in state and persists it to the backend
    const handleSaveUOMs = (newUoms) => {
        setUoms(newUoms);
        window.AppDataHandler.saveUOMs(newUoms);
    };

    // Updates the warehouse list in state and persists it to Firestore
    const handleSaveWarehouses = (newWarehouses) => {
        setWarehouseList(newWarehouses);
        window.AppDataHandler.saveWarehouses(newWarehouses);
    };

    // Opens the prompt with dynamic data parameters
    // title: string identifying prompt header
    // type: internal string dictating logic flow ('add-item', 'supplier-details', etc.)
    // items: array of selected row IDs or strings needed for mapping
    const openPrompt = (title, type = '', items = []) => {
        setPromptState({ isOpen: true, title, type, items });
    };

    // Closes the prompt
    const closePrompt = () => {
        setPromptState({ ...promptState, isOpen: false });
    };

    // dynamic form submission router
    const handlePromptConfirm = (payload) => {
        let updatedInventory, updatedSuppliers, updatedLogs;

        switch (promptState.type) {
            case 'remove-item':
                updatedInventory = inventoryData.filter(item => !promptState.items.includes(item.id));
                setInventoryData(updatedInventory);
                window.AppDataHandler.saveInventory(updatedInventory);
                break;

            case 'remove-supplier':
                updatedSuppliers = supplierData.filter(sup => !promptState.items.includes(sup.id));
                setSupplierData(updatedSuppliers);
                window.AppDataHandler.saveSuppliers(updatedSuppliers);
                break;

            case 'add-item':
                updatedInventory = [...inventoryData, payload];
                setInventoryData(updatedInventory);
                window.AppDataHandler.saveInventory(updatedInventory);
                break;

            case 'edit-item':
                updatedInventory = inventoryData.map(item =>
                    item.id === promptState.items[0] ? payload : item
                );
                setInventoryData(updatedInventory);
                window.AppDataHandler.saveInventory(updatedInventory);
                break;

            case 'add-supplier':
                updatedSuppliers = [...supplierData, payload];
                setSupplierData(updatedSuppliers);
                window.AppDataHandler.saveSuppliers(updatedSuppliers);
                break;

            case 'edit-supplier':
                updatedSuppliers = supplierData.map(sup =>
                    sup.id === promptState.items[0] ? payload : sup
                );
                setSupplierData(updatedSuppliers);
                window.AppDataHandler.saveSuppliers(updatedSuppliers);
                break;

            case 'add-input-log':
                payload = { ...payload, id: `in-${Date.now()}` };
                updatedLogs = [...inputLogs, payload];
                setInputLogs(updatedLogs);
                window.AppDataHandler.saveInputLogs(updatedLogs);

                // auto increment
                updatedInventory = inventoryData.map(item => {
                    if (item.id === payload.itemCode) return { ...item, quantity: Math.round(((parseFloat(item.quantity) || 0) + (parseFloat(payload.quantity) || 0)) * 1e10) / 1e10 };
                    return item;
                });
                setInventoryData(updatedInventory);
                window.AppDataHandler.saveInventory(updatedInventory);
                break;

            case 'edit-input-log':
                {
                    const oldLog = inputLogs.find(l => l.id === promptState.items[0]);
                    updatedLogs = inputLogs.map(l => l.id === promptState.items[0] ? { ...payload, id: l.id } : l);
                    setInputLogs(updatedLogs);
                    window.AppDataHandler.saveInputLogs(updatedLogs);

                    if (oldLog) {
                        const oldQty = parseFloat(oldLog.quantity) || 0;
                        const newQty = parseFloat(payload.quantity) || 0;
                        updatedInventory = inventoryData.map(item => {
                            let q = parseFloat(item.quantity) || 0;
                            if (item.id === oldLog.itemCode) q = Math.round((q - oldQty) * 1e10) / 1e10;
                            if (item.id === payload.itemCode) q = Math.round((q + newQty) * 1e10) / 1e10;
                            return item.id === oldLog.itemCode || item.id === payload.itemCode ? { ...item, quantity: q } : item;
                        });
                        setInventoryData(updatedInventory);
                        window.AppDataHandler.saveInventory(updatedInventory);
                    }
                }
                break;

            case 'remove-input-log':
                {
                    const logsToRemove = inputLogs.filter(l => promptState.items.includes(l.id));
                    updatedLogs = inputLogs.filter(l => !promptState.items.includes(l.id));
                    setInputLogs(updatedLogs);
                    window.AppDataHandler.saveInputLogs(updatedLogs);

                    updatedInventory = [...inventoryData];
                    logsToRemove.forEach(log => {
                        const qty = parseFloat(log.quantity) || 0;
                        updatedInventory = updatedInventory.map(item => {
                            if (item.id === log.itemCode) return { ...item, quantity: Math.round(((parseFloat(item.quantity) || 0) - qty) * 1e10) / 1e10 };
                            return item;
                        });
                    });
                    setInventoryData(updatedInventory);
                    window.AppDataHandler.saveInventory(updatedInventory);
                }
                break;

            case 'add-output-log':
                payload = { ...payload, id: `out-${Date.now()}` };
                updatedLogs = [...outputLogs, payload];
                setOutputLogs(updatedLogs);
                window.AppDataHandler.saveOutputLogs(updatedLogs);

                // auto decrement
                updatedInventory = inventoryData.map(item => {
                    if (item.id === payload.itemCode) return { ...item, quantity: Math.round(((parseFloat(item.quantity) || 0) - (parseFloat(payload.quantity) || 0)) * 1e10) / 1e10 };
                    return item;
                });
                setInventoryData(updatedInventory);
                window.AppDataHandler.saveInventory(updatedInventory);
                break;

            case 'edit-output-log':
                {
                    const oldLog = outputLogs.find(l => l.id === promptState.items[0]);
                    updatedLogs = outputLogs.map(l => l.id === promptState.items[0] ? { ...payload, id: l.id } : l);
                    setOutputLogs(updatedLogs);
                    window.AppDataHandler.saveOutputLogs(updatedLogs);

                    if (oldLog) {
                        const oldQty = parseFloat(oldLog.quantity) || 0;
                        const newQty = parseFloat(payload.quantity) || 0;
                        updatedInventory = inventoryData.map(item => {
                            let q = parseFloat(item.quantity) || 0;
                            if (item.id === oldLog.itemCode) q = Math.round((q + oldQty) * 1e10) / 1e10;
                            if (item.id === payload.itemCode) q = Math.round((q - newQty) * 1e10) / 1e10;
                            return item.id === oldLog.itemCode || item.id === payload.itemCode ? { ...item, quantity: q } : item;
                        });
                        setInventoryData(updatedInventory);
                        window.AppDataHandler.saveInventory(updatedInventory);
                    }
                }
                break;

            case 'remove-output-log':
                {
                    const logsToRemove = outputLogs.filter(l => promptState.items.includes(l.id));
                    updatedLogs = outputLogs.filter(l => !promptState.items.includes(l.id));
                    setOutputLogs(updatedLogs);
                    window.AppDataHandler.saveOutputLogs(updatedLogs);

                    updatedInventory = [...inventoryData];
                    logsToRemove.forEach(log => {
                        const qty = parseFloat(log.quantity) || 0;
                        updatedInventory = updatedInventory.map(item => {
                            if (item.id === log.itemCode) return { ...item, quantity: Math.round(((parseFloat(item.quantity) || 0) + qty) * 1e10) / 1e10 };
                            return item;
                        });
                    });
                    setInventoryData(updatedInventory);
                    window.AppDataHandler.saveInventory(updatedInventory);
                }
                break;
        }
        closePrompt();
    };

    // render
    if (!dataLoaded) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-color)',
                color: 'var(--text-secondary)',
                fontSize: '1.1rem',
                fontWeight: '500',
                letterSpacing: '0.03em'
            }}>
                Cloud Face is loading resources...
            </div> // lmao
        );
    }

    return (
        <div className="app-wrapper">
            {/* Topmost Brand Bar (Navigation Bar) */}
            <div className="top-brand-bar">
                <div className="brand-left">
                    <img src="Resources/icon.png" alt="Icon" className="brand-icon" />
                    <div className="app-logo">CloudBased</div>

                    {/* Integrated Navigation Links */}
                    <div className="nav-tabs-left" style={{ marginLeft: '1rem' }}>
                        <button
                            className={`nav-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                            onClick={() => setActiveTab('inventory')}
                        >
                            Inventory
                        </button>
                        <button
                            className={`nav-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('suppliers')}
                        >
                            Suppliers
                        </button>
                    </div>
                </div>
                <div className="brand-right" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} style={{ position: 'relative' }}>
                    <button
                        className={`user-avatar-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        title="User Settings"
                    >
                        U
                    </button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', transition: 'transform 0.2s', transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>

                    {/* Styled Dropdown Menu */}
                    {isUserDropdownOpen && (
                        <>
                            {/* Backdrop to close when clicking outside */}
                            <div
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                                onClick={(e) => { e.stopPropagation(); setIsUserDropdownOpen(false); }}
                            />
                            <div className="user-dropdown">
                                <div
                                    className={`user-dropdown-item ${activeTab === 'settings' ? 'active' : ''}`}
                                    onClick={() => { setActiveTab('settings'); setIsUserDropdownOpen(false); }}
                                >
                                    User Settings
                                </div>
                                <div
                                    className="user-dropdown-item"
                                    onClick={() => { window.open("https://docs.google.com/document/d/1AoBQg_2qeGFfdUL3JeSW7lP2VdIIPpO6pFgqCEiyC68/edit?usp=sharing", "_blank"); setIsUserDropdownOpen(false); }}
                                >
                                    Database Help
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="app-layout">
                {/* Filter Bar */}
                {activeTab === 'inventory' && (
                    <div className="filter-bar">
                        {warehouses.map(wh => (
                            <button
                                key={wh}
                                className={`filter-card ${activeWarehouseFilter === wh ? 'active' : ''}`}
                                onClick={() => setActiveWarehouseFilter(wh)}
                            >
                                {wh}
                            </button>
                        ))}
                    </div>
                )}

                {/* Main Content Router */}
                <main className="main-content">
                    {activeTab === 'inventory' && <InventoryTable openPrompt={openPrompt} inventoryData={inventoryData} inputLogs={inputLogs} outputLogs={outputLogs} lowStockThreshold={lowStockThreshold} isThresholdEnabled={isThresholdEnabled} activeWarehouseFilter={activeWarehouseFilter} dbError={dbError} />}
                    {activeTab === 'suppliers' && <SupplierTable openPrompt={openPrompt} supplierData={supplierData} dbError={dbError} />}
                    {activeTab === 'settings' && <UserSettings theme={theme} toggleTheme={toggleTheme} threshold={lowStockThreshold} setThreshold={handleSetThreshold} isThresholdEnabled={isThresholdEnabled} setIsThresholdEnabled={handleSetThresholdEnabled} uoms={uoms} onSaveUOMs={handleSaveUOMs} warehouses={warehouseList} onSaveWarehouses={handleSaveWarehouses} inventoryData={inventoryData} />}
                </main>

                {/* Global Prompt Overlay */}
                <Prompt
                    isOpen={promptState.isOpen}
                    title={promptState.title}
                    type={promptState.type}
                    items={promptState.items}
                    onClose={closePrompt}
                    onConfirm={handlePromptConfirm}
                    inventoryData={inventoryData}
                    supplierData={supplierData}
                    inputLogs={inputLogs}
                    outputLogs={outputLogs}
                    uoms={uoms}
                    warehouses={warehouseList}
                />
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
