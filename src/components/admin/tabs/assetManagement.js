/**
 * Admin Dashboard - Asset Management Tab
 * Manages Units of Measure (UoM) and Warehouses.
 */
const AssetManagementTab = ({ onUpdate }) => {
    const [uoms, setUoms] = React.useState([]);
    const [warehouses, setWarehouses] = React.useState([]);
    const [newUom, setNewUom] = React.useState('');
    const [newWarehouse, setNewWarehouse] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        const load = async () => {
            try {
                const [u, w] = await Promise.all([
                    window.AppDataHandler.getUOMs(),
                    window.AppDataHandler.getWarehouses()
                ]);
                setUoms(u || []);
                setWarehouses(w || []);
            } catch(e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const handleAddUom = async () => {
        if (!newUom.trim()) return;
        const updated = [...uoms, newUom.trim()];
        setUoms(updated);
        setNewUom('');
        await saveAssets(updated, warehouses);
    };

    const handleRemoveUom = async (index) => {
        const updated = uoms.filter((_, i) => i !== index);
        setUoms(updated);
        await saveAssets(updated, warehouses);
    };

    const handleAddWarehouse = async () => {
        if (!newWarehouse.trim()) return;
        const updated = [...warehouses, newWarehouse.trim()];
        setWarehouses(updated);
        setNewWarehouse('');
        await saveAssets(uoms, updated);
    };

    const handleRemoveWarehouse = async (index) => {
        const updated = warehouses.filter((_, i) => i !== index);
        setWarehouses(updated);
        await saveAssets(uoms, updated);
    };

    const saveAssets = async (u, w) => {
        setIsSaving(true);
        try {
            await Promise.all([
                window.AppDataHandler.saveUOMs(u),
                window.AppDataHandler.saveWarehouses(w)
            ]);
            onUpdate(); // Notify parent to refresh data globally
        } catch(e) {
            alert("Error saving assets: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const PillCard = ({ title, items, newItem, setNewItem, onAdd, onRemove, icon }) => (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--hover-bg)', padding: '0.5rem', borderRadius: '10px', color: 'var(--accent-color)' }}>{icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>{title}</h3>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem', minHeight: '80px', alignContent: 'flex-start' }}>
                {items.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', opacity: 0.6, fontStyle: 'italic' }}>No values defined.</div>
                ) : (
                    items.map((item, idx) => (
                        <div key={idx} className="fade-in" style={{ 
                            background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', 
                            padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem', 
                            fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' 
                        }}>
                            {item}
                            <button onClick={() => onRemove(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 2, display: 'flex', borderRadius: '4px' }} onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={e => e.target.style.background = 'none'}>
                                <Icons.Trash size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                    className="auth-input" 
                    style={{ margin: 0, fontSize: '0.9rem' }} 
                    placeholder={`New ${title.slice(0, -1)}...`} 
                    value={newItem} 
                    onChange={e => setNewItem(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && onAdd()}
                />
                <button 
                    onClick={onAdd}
                    style={{ background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '10px', padding: '0 1rem', cursor: 'pointer', fontWeight: '700' }}
                >
                    <Icons.Plus size={20} />
                </button>
            </div>
        </div>
    );

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>Loading core assets...</div>;

    return (
        <div className="admin-tab-content fade-in">
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Configure universal dropdown values used throughout the system.</p>
                {isSaving && <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: '700', animation: 'pulse 1s infinite' }}>Saving Sync...</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                <PillCard 
                    title="Units of Measure" 
                    items={uoms} 
                    newItem={newUom} 
                    setNewItem={setNewUom} 
                    onAdd={handleAddUom} 
                    onRemove={handleRemoveUom}
                    icon={<Icons.Box size={18} />}
                />
                
                <PillCard 
                    title="Warehouse Locations" 
                    items={warehouses} 
                    newItem={newWarehouse} 
                    setNewItem={setNewWarehouse} 
                    onAdd={handleAddWarehouse} 
                    onRemove={handleRemoveWarehouse}
                    icon={<Icons.Home size={18} />}
                />
            </div>

            <div style={{ marginTop: '2rem', background: 'var(--hover-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    <Icons.Shield size={16} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Updates here will be reflected across all dropdowns in the Inventory and Logs modules. Ensure consistency in naming.</span>
                </div>
            </div>
        </div>
    );
};
window.AdminAssetManagementTab = AssetManagementTab;
