/**
 * ==========================================
 * PROMPT COMPONENT
 * ==========================================
 * A reusable modal overlay that 
 * handles all popup interactions.
 */

const Prompt = ({ isOpen, onClose, onConfirm, title, type, items, inventoryData = [], supplierData = [], uoms = [], warehouses = [] }) => {
    // --- Local State for Form Fields ---
    const [formData, setFormData] = React.useState({});

    // Reset form data when prompt opens or type/items change
    React.useEffect(() => {
        if (!isOpen) {
            setFormData({});
            return;
        }

        if (type === 'edit-item' && items.length === 1) {
            const itemToEdit = inventoryData.find(i => i.id === items[0]);
            if (itemToEdit) setFormData({ ...itemToEdit });
        } else if (type === 'edit-supplier' && items.length === 1) {
            const supplierToEdit = supplierData.find(s => s.id === items[0]);
            if (supplierToEdit) setFormData({ ...supplierToEdit });
        } else if (type === 'add-item') {
            setFormData({
                id: `ITM-${Math.floor(1000 + Math.random() * 9000)}`,
                name: '',
                category: '',
                quantity: '',
                uom: uoms[0] || 'Pieces',
                msl: '',
                warehouse: warehouses[0] || 'Main',
                supplier: ''
            });
        } else if (type === 'add-supplier') {
            setFormData({
                id: `SUP-${Math.floor(100 + Math.random() * 900)}`,
                name: '',
                contact: '',
                address: '',
                phone: '',
                email: ''
            });
        }
    }, [isOpen, type, items, inventoryData, supplierData, uoms, warehouses]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // For number inputs, let the raw string value persist in state so user can clear it
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' && value !== '' ? parseInt(value, 10) : value
        }));
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm(formData);
    };

    const handleOverlayClick = (e) => {
        if (e.target.className === 'prompt-overlay') {
            onClose();
        }
    };

    return (
        <div className="prompt-overlay" onClick={handleOverlayClick}>
            <div className="prompt-box">
                <div className="prompt-header">
                    <h2>{title}</h2>
                    <button className="prompt-close-btn" onClick={onClose} title="Close">
                        &times;
                    </button>
                </div>

                <div className="prompt-content">
                    {(type === 'remove-item' || type === 'remove-supplier') && (
                        <div className="prompt-remove-confirmation">
                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                                Are you sure you want to remove <strong>{items.length}</strong> selected {items.length === 1 ? 'item' : 'items'}?
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button className="tool-btn add-btn" onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                    Cancel
                                </button>
                                <button className="tool-btn remove-btn" onClick={handleConfirm} style={{ padding: '0.5rem 2rem' }}>
                                    Yes, Remove
                                </button>
                            </div>
                        </div>
                    )}

                    {(type === 'edit-item' || type === 'add-item') && (
                        <div className="prompt-form-container">
                            <div className="prompt-form-row">
                                <div>
                                    <label className="prompt-label">Item ID</label>
                                    <input type="text" name="id" className="prompt-input" value={formData.id || ''} onChange={handleChange} placeholder="e.g. ITM-0000" />
                                </div>
                                <div>
                                    <label className="prompt-label">Category</label>
                                    <input type="text" name="category" className="prompt-input" value={formData.category || ''} onChange={handleChange} placeholder="e.g. Raw Materials" />
                                </div>
                            </div>
                            <div className="prompt-form-row">
                                <div style={{ flex: 1 }}>
                                    <label className="prompt-label">Item Name</label>
                                    <input type="text" name="name" className="prompt-input" value={formData.name || ''} onChange={handleChange} placeholder="e.g. Metric Hex Bolts" />
                                </div>
                            </div>
                            <div className="prompt-form-row">
                                <div>
                                    <label className="prompt-label">Quantity</label>
                                    <input type="number" name="quantity" className="prompt-input" value={formData.quantity ?? ''} onChange={handleChange} placeholder="0" />
                                </div>
                                <div>
                                    <label className="prompt-label">UOM</label>
                                    <select name="uom" className="prompt-select" value={formData.uom || ''} onChange={handleChange}>
                                        {uoms.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="prompt-label">Min. Level (MSL)</label>
                                    <input type="number" name="msl" className="prompt-input" value={formData.msl ?? ''} onChange={handleChange} placeholder="0" />
                                </div>
                            </div>
                            <div className="prompt-form-row">
                                <div>
                                    <label className="prompt-label">Warehouse Location</label>
                                    <select name="warehouse" className="prompt-select" value={formData.warehouse || ''} onChange={handleChange}>
                                        {warehouses.map(wh => (
                                            <option key={wh} value={wh}>{wh}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="prompt-label">Supplier</label>
                                    <select name="supplier" className="prompt-select" value={formData.supplier || ''} onChange={handleChange}>
                                        {!formData.supplier && <option value="">-- Select a supplier --</option>}
                                        {supplierData.map(sup => (
                                            <option key={sup.id} value={sup.name}>{sup.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button className="tool-btn edit-btn" onClick={onClose} style={{ padding: '0.6rem 1.5rem', background: 'var(--card-bg)' }}>
                                    Cancel
                                </button>
                                <button className="tool-btn add-btn" onClick={handleConfirm} style={{ padding: '0.6rem 1.5rem', background: 'var(--text-primary)', color: 'var(--bg-color)' }}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {(type === 'edit-supplier' || type === 'add-supplier') && (
                        <div className="prompt-form-container">
                            <div className="prompt-form-row">
                                <div style={{ flex: 1 }}>
                                    <label className="prompt-label">Supplier Name</label>
                                    <input type="text" name="name" className="prompt-input" value={formData.name || ''} onChange={handleChange} placeholder="e.g. Tech Corp" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="prompt-label">Contact Person</label>
                                    <input type="text" name="contact" className="prompt-input" value={formData.contact || ''} onChange={handleChange} placeholder="e.g. Jane Doe" />
                                </div>
                            </div>
                            <div className="prompt-form-row">
                                <div style={{ flex: 1 }}>
                                    <label className="prompt-label">Address</label>
                                    <input type="text" name="address" className="prompt-input" value={formData.address || ''} onChange={handleChange} placeholder="e.g. 123 Main St, City" />
                                </div>
                            </div>
                            <div className="prompt-form-row">
                                <div>
                                    <label className="prompt-label">Phone Number</label>
                                    <input type="text" name="phone" className="prompt-input" value={formData.phone || ''} onChange={handleChange} placeholder="e.g. +1 234 567 8900" />
                                </div>
                                <div>
                                    <label className="prompt-label">Email Address</label>
                                    <input type="email" name="email" className="prompt-input" value={formData.email || ''} onChange={handleChange} placeholder="e.g. contact@supplier.com" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button className="tool-btn edit-btn" onClick={onClose} style={{ padding: '0.6rem 1.5rem', background: 'var(--card-bg)' }}>
                                    Cancel
                                </button>
                                <button className="tool-btn add-btn" onClick={handleConfirm} style={{ padding: '0.6rem 1.5rem', background: 'var(--text-primary)', color: 'var(--bg-color)' }}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {type === 'supplier-details' && (() => {
                        const supName = items && items.length > 0 ? items[0] : "";
                        const supplier = supplierData.find(s => s.name === supName) || { name: supName, contact: "N/A", email: "N/A", phone: "N/A", address: "N/A" };

                        return (
                            <div className="supplier-details-container" style={{ padding: '0.5rem 0' }}>
                                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>{supplier.name}</h2>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', width: '120px' }}>Contact</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>{supplier.contact}</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                        {supplier.email}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                        {supplier.phone}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                        {supplier.address}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {(!type || (type !== 'remove-item' && type !== 'remove-supplier' && type !== 'edit-item' && type !== 'add-item' && type !== 'edit-supplier' && type !== 'add-supplier' && type !== 'supplier-details')) && (
                        <p className="prompt-placeholder">
                            Details and inputs for "{title}" will be implemented here.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
