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
    
    // Lifted Inventory Data to app level for global status calculations 
    const [inventoryData, setInventoryData] = useState([
        { id: "MBN-001", name: "Zantham Gum", category: "Food Ingridient", quantity: "150 Sacks", warehouse: "Malabon - M.H. Del Pilar", supplier: "Titan Forge Inc." },
        // Added a 1500 unit item so the default 1000 threshold functions properly
        { id: "MBN-002", name: "Citric Acid", category: "Food Ingridient", quantity: "1500 Sacks", warehouse: "Malabon - M.H. Del Pilar", supplier: "Acme Industrial Supplies" }
    ]);

    // Lifted Supplier Data for global prompt access
    const [supplierData, setSupplierData] = useState([
        { id: "SUP-01", name: "Acme Industrial Supplies", contact: "Jane Doe", address: "24 Taft Ave, Manila", phone: "+63 917 123 1234", email: "contact@acme.com" },
    ]);

    // --- Handlers ---
    // Flips the system theme and updates the master HTML attribute
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
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
    // Currently redirects output to the development console to simulate database writes
    const handlePromptConfirm = () => {
        if (promptState.type === 'remove-item' || promptState.type === 'remove-supplier') {
            console.log(`Mockup: Removing ${promptState.items.length} item(s)...`);
            // Future logic: Slice items out of inventoryData or supplierData map here.
        } else if (promptState.type === 'edit-item' || promptState.type === 'add-item') {
            console.log(`Mockup: Saving item details...`);
            // Future logic: Construct object from prompt payload and inject into inventoryData
        } else if (promptState.type === 'edit-supplier' || promptState.type === 'add-supplier') {
            console.log(`Mockup: Saving supplier details...`);
            // Future logic: Push or modify object inside loaded supplierData
        }
        closePrompt();
    };

    // --- Render ---
    return (
        <div className="app-layout">

            {/* Top Navigation Bar */}
            <nav className="tab-navigation">
                <div className="nav-tabs-left">
                    <div className="app-logo">CloudBased</div>
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

                {/* Right Aligned Avatar */}
                <div className="nav-tabs-right">
                    <button
                        className={`user-avatar-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                        title="User Settings"
                    >
                        U
                    </button>
                </div>
            </nav>

            {/* Main Content Router */}
            <main className="main-content">
                {activeTab === 'inventory' && <InventoryTable openPrompt={openPrompt} inventoryData={inventoryData} lowStockThreshold={lowStockThreshold} isThresholdEnabled={isThresholdEnabled} />}
                {activeTab === 'suppliers' && <SupplierTable openPrompt={openPrompt} supplierData={supplierData} />}
                {activeTab === 'settings' && <UserSettings theme={theme} toggleTheme={toggleTheme} threshold={lowStockThreshold} setThreshold={setLowStockThreshold} isThresholdEnabled={isThresholdEnabled} setIsThresholdEnabled={setIsThresholdEnabled} />}
            </main>

            {/* Global Prompt Overlay */}
            <Prompt
                isOpen={promptState.isOpen}
                title={promptState.title}
                type={promptState.type}
                items={promptState.items}
                onClose={closePrompt}
                onConfirm={handlePromptConfirm}
                supplierData={supplierData}
            />

        </div>
    );
}

// --- App Initialization ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
