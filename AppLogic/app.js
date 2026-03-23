/**
 * App Component
 * The central controller for CloudBased.
 * Now supports an elegant Multi-User system with Card-Based Views and Account Management.
 */

const App = () => {
    // 1. Session & Global State
    const [user, setUser] = React.useState(window.AppDataHandler.getCurrentUser());
    const [theme, setTheme] = React.useState('light');
    const [view, setView] = React.useState('inventory'); // 'inventory', 'suppliers', 'itemList'
    const [dbLoading, setDbLoading] = React.useState(true);
    const [dbError, setDbError] = React.useState(null);

    // 2. Data State
    const [inventory, setInventory] = React.useState([]);
    const [inputLogs, setInputLogs] = React.useState([]);
    const [outputLogs, setOutputLogs] = React.useState([]);
    const [suppliers, setSuppliers] = React.useState([]);
    const [uoms, setUoms] = React.useState([]);
    const [warehouses, setWarehouses] = React.useState([]);

    // 3. UI state (Modals)
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [isAccountSettingsOpen, setIsAccountSettingsOpen] = React.useState(false);
    const [promptState, setPromptState] = React.useState({ isOpen: false, title: '', type: '', items: [] });

    const openPrompt = (title, type, items = []) => setPromptState({ isOpen: true, title, type, items });
    const closePrompt = () => setPromptState({ ...promptState, isOpen: false });

    // Initial load
    React.useEffect(() => {
        if (!user) { 
            window.location.href = 'login.html';
            return; 
        }
        loadAllData();
    }, [user]);

    const loadAllData = async () => {
        setDbLoading(true);
        try {
            const [inv, inLogs, outLogs, sups, units, whs, settings] = await Promise.all([
                window.AppDataHandler.getInventory(),
                window.AppDataHandler.getInputLogs(),
                window.AppDataHandler.getOutputLogs(),
                window.AppDataHandler.getSuppliers(),
                window.AppDataHandler.getUOMs(),
                window.AppDataHandler.getWarehouses(),
                window.AppDataHandler.getSettings()
            ]);
            setInventory(inv); setInputLogs(inLogs); setOutputLogs(outLogs);
            setSuppliers(sups); setUoms(units); setWarehouses(whs);
            setTheme(settings.theme || 'light');
            setDbError(window.AppDataHandler.getDbError());
        } catch (e) {
            setDbError("System sync failed: " + e.message);
        } finally { setDbLoading(false); }
    };

    const handlePromptConfirm = async (data) => {
        try {
            const type = promptState.type;
            if (type === 'add-item') {
                const updated = [...inventory, data];
                setInventory(updated);
                await window.AppDataHandler.saveInventory(updated);
            } else if (type === 'edit-item') {
                const updated = inventory.map(i => i.id === promptState.items[0] ? data : i);
                setInventory(updated);
                await window.AppDataHandler.saveInventory(updated);
            } else if (type === 'remove-item') {
                const updated = inventory.filter(i => !promptState.items.includes(i.id));
                setInventory(updated);
                await window.AppDataHandler.saveInventory(updated);
            } else if (type === 'add-input-log') {
                const updated = [...inputLogs, data]; setInputLogs(updated); await window.AppDataHandler.saveInputLogs(updated);
                const invUpdated = inventory.map(i => i.id === data.itemCode ? { ...i, quantity: (parseFloat(i.quantity) || 0) + parseFloat(data.quantity) } : i);
                setInventory(invUpdated); await window.AppDataHandler.saveInventory(invUpdated);
            } else if (type === 'add-output-log') {
                const updated = [...outputLogs, data]; setOutputLogs(updated); await window.AppDataHandler.saveOutputLogs(updated);
                const invUpdated = inventory.map(i => i.id === data.itemCode ? { ...i, quantity: (parseFloat(i.quantity) || 0) - parseFloat(data.quantity) } : i);
                setInventory(invUpdated); await window.AppDataHandler.saveInventory(invUpdated);
            }
            closePrompt();
        } catch (err) { alert("Error saving data: " + err.message); }
    };

    if (!user) return null; // Redirect handled in useEffect

    if (dbLoading) {
        return (
            <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', letterSpacing: '-1.5px', opacity: 0.9 }} className="app-logo">CloudBased</div>
                <div style={{ padding: '2px', width: '240px', background: 'var(--hover-bg)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ width: '40%', height: '4px', background: 'var(--accent-color)', borderRadius: '12px', animation: 'load 1.8s infinite ease-in-out' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-wrapper">
            <header className="top-brand-bar">
                <div className="brand-left">
                    <div className="app-logo">CloudBased</div>
                    <nav className="nav-tabs-left">
                        <button className={`nav-btn ${view === 'inventory' ? 'active' : ''}`} onClick={() => setView('inventory')}>Inventory</button>
                        <button className={`nav-btn ${view === 'itemList' ? 'active' : ''}`} onClick={() => setView('itemList')}>Item List</button>
                        <button className={`nav-btn ${view === 'suppliers' ? 'active' : ''}`} onClick={() => setView('suppliers')}>Suppliers</button>
                    </nav>
                </div>
                
                <div className="brand-right" onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', lineHeight: 1.2 }}>{user.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', opacity: 0.8 }}>@{user.username}</span>
                    </div>
                    <img 
                        src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=40`} 
                        className="user-avatar-btn" 
                        style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--accent-color)' }} 
                    />
                </div>
            </header>

            {isProfileOpen && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setIsProfileOpen(false)}></div>
                    <div style={{ position: 'fixed', top: '75px', right: '4vw', zIndex: 1000 }}>
                        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '0.6rem', minWidth: '220px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.4rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Workspace</div>
                            </div>
                            <button style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '500' /* Removed transition: 'background 0.2s' */, display: 'flex', gap: '0.75rem', alignItems: 'center' }} 
                                onMouseEnter={e => e.target.style.background = 'var(--hover-bg)'}
                                onMouseLeave={e => e.target.style.background = 'none'}
                                onClick={() => { setIsAccountSettingsOpen(true); setIsProfileOpen(false); }}>
                                <span style={{ opacity: 0.6 }}><Icons.Edit /></span> User Settings
                            </button>
                            <button style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', transition: 'background 0.2s', display: 'flex', gap: '0.75rem', alignItems: 'center' }} 
                                onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.08)'}
                                onMouseLeave={e => e.target.style.background = 'none'}
                                onClick={() => window.AppDataHandler.logout() || location.reload()}>
                                <span style={{ opacity: 0.6 }}><Icons.Trash /></span> Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}

            <main className="app-layout">
                {view === 'inventory' && <InventoryTable openPrompt={openPrompt} inventoryData={inventory} inputLogs={inputLogs} outputLogs={outputLogs} dbError={dbError} />}
                {view === 'itemList' && <ItemList inventoryData={inventory} openPrompt={openPrompt} />}
                {view === 'suppliers' && <SupplierTable openPrompt={openPrompt} supplierData={suppliers} inventoryData={inventory} dbError={dbError} />}
            </main>

            <Prompt 
                isOpen={promptState.isOpen}
                onClose={closePrompt}
                onConfirm={handlePromptConfirm}
                title={promptState.title}
                type={promptState.type}
                items={promptState.items}
                inventoryData={inventory}
                supplierData={suppliers}
                uoms={uoms}
                warehouses={warehouses}
            />

            {isAccountSettingsOpen && (
                <UserSettings 
                    user={user} 
                    inventoryData={inventory}
                    onClose={() => setIsAccountSettingsOpen(false)} 
                    onUpdateUser={async (u) => { setUser(u); setIsAccountSettingsOpen(false); }}
                />
            )}
        </div>
    );
};

// Mount the App
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
