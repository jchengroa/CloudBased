/**
 * ==========================================
 * APP.JS - Main Application Entry Point
 * ==========================================
 * This file handles global state (themes, tabs)
 * and acts as the router for the sub-components.
 */

const { useState } = React;

function App() {
    // --- Global State ---
    const [theme, setTheme] = useState('dark');
    const [activeTab, setActiveTab] = useState('inventory');

    // --- Prompt/Modal State ---
    const [promptState, setPromptState] = useState({ isOpen: false, title: '', type: '', items: [] });

    // --- Inventory & Threshold State ---
    const [lowStockThreshold, setLowStockThreshold] = useState(1000);
    const [isThresholdEnabled, setIsThresholdEnabled] = useState(true);
    const [activeWarehouseFilter, setActiveWarehouseFilter] = useState('All');

    // Lifted Inventory and Supplier Data 
    const [inventoryData, setInventoryData] = useState([]);
    const [supplierData, setSupplierData] = useState([]);

    // Static Form Definitions
    const [uoms, setUoms] = useState([]);
    const [warehouseList, setWarehouseList] = useState([]);

    // Application Loading State
    const [dataLoaded, setDataLoaded] = useState(false);

    // Load Backend Data on Mount
    React.useEffect(() => {
        const loadInitialData = async () => {
            const inv = await window.AppDataHandler.getInventory();
            const sups = await window.AppDataHandler.getSuppliers();
            const staticUoms = await window.AppDataHandler.getUOMs();
            const staticWhs = await window.AppDataHandler.getWarehouses();
            const settings = await window.AppDataHandler.getSettings();

            setInventoryData(inv);
            setSupplierData(sups);
            setUoms(staticUoms);
            setWarehouseList(staticWhs);
            setTheme(settings.theme);
            document.documentElement.setAttribute('data-theme', settings.theme);
            setLowStockThreshold(settings.lowStockThreshold);
            setIsThresholdEnabled(settings.isThresholdEnabled);
            setDataLoaded(true);
        };
        loadInitialData();
    }, []);

    // Filter Bar uses the backend-defined warehouse list plus a generic All catch-all
    const warehouses = ['All', ...warehouseList];

    // --- Handlers ---
    // Flips the system theme and updates the master HTML attribute
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        window.AppDataHandler.saveSettings({ theme: newTheme, lowStockThreshold, isThresholdEnabled });
    };

    // Threshold Setting Wrappers to automatically save to backend
    const handleSetThreshold = (newVal) => {
        setLowStockThreshold(newVal);
        window.AppDataHandler.saveSettings({ theme, lowStockThreshold: newVal, isThresholdEnabled });
    };

    const handleSetThresholdEnabled = (newVal) => {
        setIsThresholdEnabled(newVal);
        window.AppDataHandler.saveSettings({ theme, lowStockThreshold, isThresholdEnabled: newVal });
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

    // Generalized method for Prompt confirming an action
    // Now implements actual state updates and calls the backend save methods
    const handlePromptConfirm = (payload) => {
        if (promptState.type === 'remove-item') {
            const updatedInventory = inventoryData.filter(item => !promptState.items.includes(item.id));
            setInventoryData(updatedInventory);
            window.AppDataHandler.saveInventory(updatedInventory);
        } else if (promptState.type === 'remove-supplier') {
            const updatedSuppliers = supplierData.filter(sup => !promptState.items.includes(sup.id));
            setSupplierData(updatedSuppliers);
            window.AppDataHandler.saveSuppliers(updatedSuppliers);
        } else if (promptState.type === 'add-item') {
            const updatedInventory = [...inventoryData, payload];
            setInventoryData(updatedInventory);
            window.AppDataHandler.saveInventory(updatedInventory);
        } else if (promptState.type === 'edit-item') {
            const updatedInventory = inventoryData.map(item => 
                item.id === payload.id ? payload : item
            );
            setInventoryData(updatedInventory);
            window.AppDataHandler.saveInventory(updatedInventory);
        } else if (promptState.type === 'add-supplier') {
            const updatedSuppliers = [...supplierData, payload];
            setSupplierData(updatedSuppliers);
            window.AppDataHandler.saveSuppliers(updatedSuppliers);
        } else if (promptState.type === 'edit-supplier') {
            const updatedSuppliers = supplierData.map(sup => 
                sup.id === payload.id ? payload : sup
            );
            setSupplierData(updatedSuppliers);
            window.AppDataHandler.saveSuppliers(updatedSuppliers);
        }
        closePrompt();
    };

    // --- Render ---
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
                <div className="brand-right" onClick={() => setActiveTab('settings')}>
                    <button
                        className={`user-avatar-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        title="User Settings"
                    >
                        U
                    </button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>

            <div className="app-layout">
                {/* Filter Bar (replaces the old Navigation Bar) */}
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
                    {!dataLoaded ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            <h2>Loading Data...</h2>
                            <p>Fetching resources from the backend...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'inventory' && <InventoryTable openPrompt={openPrompt} inventoryData={inventoryData} lowStockThreshold={lowStockThreshold} isThresholdEnabled={isThresholdEnabled} activeWarehouseFilter={activeWarehouseFilter} />}
                            {activeTab === 'suppliers' && <SupplierTable openPrompt={openPrompt} supplierData={supplierData} />}
                            {activeTab === 'settings' && <UserSettings theme={theme} toggleTheme={toggleTheme} threshold={lowStockThreshold} setThreshold={handleSetThreshold} isThresholdEnabled={isThresholdEnabled} setIsThresholdEnabled={handleSetThresholdEnabled} />}
                        </>
                    )}
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
                    uoms={uoms}
                    warehouses={warehouseList}
                />
            </div>
        </div>
    );
}

// --- App Initialization ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
