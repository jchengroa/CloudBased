/**
 * Prompt Modal Component
 * Unified dialog system for CRUD operations and detail views, 
 * styled with a premium 'elegant' aesthetic.
 */

const Prompt = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    type,
    items,
    inventoryData = [],
    supplierData  = [],
    inputLogs     = [],
    outputLogs    = [],
    uoms          = [],
    warehouses    = []
}) => {
    const [formData, setFormData] = React.useState({});
    const [error, setError] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) { setFormData({}); setIsSaving(false); return; }

        // Initialize based on type
        if ((type === 'edit-item' || type === 'remove-item') && items.length === 1) {
            const found = inventoryData.find(i => i.id === items[0]);
            if (found) setFormData({ ...found });
        } else if (type === 'add-item') {
            setFormData({
                id: `ITM-${Math.floor(1000 + Math.random() * 9000)}`,
                name: '', category: '', quantity: '', optimalStock: '', 
                uom: uoms[0] || 'Pieces', warehouse: warehouses[0] || 'Main', supplier: '',
                imageUrl: '', description: '', isRestocked: 'No'
            });
        } else if (type === 'add-supplier') {
            setFormData({
                id: `SUP-${Math.floor(100 + Math.random() * 900)}`,
                name: '', contact: '', address: '', phone: '', email: ''
            });
        } else if (type === 'edit-supplier' && items.length === 1) {
            const found = supplierData.find(s => s.id === items[0]);
            if (found) setFormData({ ...found });
        } else if (type === 'add-input-log' || type === 'add-output-log') {
            const first = inventoryData[0];
            setFormData({
                transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
                itemCode: first ? first.id : '',
                itemName: first ? first.name : '',
                quantity: '',
                uom: first ? first.uom : (uoms[0] || 'Pieces'),
                date: new Date().toISOString().split('T')[0],
                supplier: '', batchLot: ''
            });
        }
        setError('');
    }, [isOpen, type, items, inventoryData, supplierData, uoms, warehouses]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type: t } = e.target;
        setFormData(prev => ({ ...prev, [name]: t === 'number' ? (value === '' ? '' : parseFloat(value)) : value }));
        setError('');
    };

    const handleConfirm = async () => {
        setIsSaving(true);
        let errorMsg = '';
        
        // Only run validation for Add and Edit operations. Remove/Delete should bypass this.
        if (type.startsWith('add') || type.startsWith('edit')) {
            if (type.includes('item')) errorMsg = Validation.validateItem(formData, inventoryData, type.includes('edit'), items[0]);
            else if (type.includes('supplier')) errorMsg = Validation.validateSupplier(formData, supplierData, type.includes('edit'), items[0]);
            else if (type.includes('log')) errorMsg = Validation.validateLog(formData, inputLogs, outputLogs, type.includes('edit'), items[0]);
        }

        if (errorMsg) { setError(errorMsg); setIsSaving(false); return; }
        
        await onConfirm(formData);
        setIsSaving(false);
    };



    return (
        <div className="prompt-overlay" onClick={e => e.target.className === 'prompt-overlay' && onClose()}>
            <div className="prompt-box" style={{ maxWidth: type.includes('details') ? '500px' : '650px' }}>
                <div className="prompt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{title}</h2>
                    <button className="prompt-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: '0.4rem' }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.5}>
                        <Icons.Close />
                    </button>
                </div>

                <div className="prompt-content">
                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '500' }}>
                           {error}
                        </div>
                    )}

                    {type.includes('remove') && (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Are you sure you want to delete <strong>{items.length}</strong> selected record(s)?</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>This action is permanent and cannot be undone.</p>
                            <FormButtons confirmLabel="Yes, Delete" isDanger={true} onClose={onClose} onConfirm={handleConfirm} isSaving={isSaving} />
                        </div>
                    )}

                    {(type === 'add-item' || type === 'edit-item') && (
                        <div className="auth-form">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormInput label="Item Code" name="id" value={formData.id || ''} onChange={handleChange} />
                                <FormInput label="Product Name" name="name" value={formData.name || ''} onChange={handleChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormInput label="Category" name="category" value={formData.category || ''} onChange={handleChange} />
                                <FormSelect label="Warehouse" name="warehouse" value={formData.warehouse || ''} onChange={handleChange} options={warehouses.map(w => ({label: w, value: w}))} />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <FormInput type="number" label="Stock On Hand" name="quantity" value={formData.quantity ?? ''} onChange={handleChange} />
                                <FormSelect label="Unit of Measure" name="uom" value={formData.uom || ''} onChange={handleChange} options={uoms.map(u => ({label: u, value: u}))} />
                                <FormInput type="number" label="Optimal Stock" name="optimalStock" value={formData.optimalStock ?? ''} onChange={handleChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="auth-input-group">
                                    <label className="auth-label">Status (Auto-Calculated)</label>
                                    <input type="text" className="auth-input" readOnly disabled value={(parseFloat(formData.quantity) || 0) < (parseFloat(formData.optimalStock) || 0) ? 'Reorder' : 'Okay'} style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                </div>
                                <FormSelect label="Restocked?" name="isRestocked" value={formData.isRestocked || 'No'} onChange={handleChange} options={[{label: 'Yes', value: 'Yes'}, {label: 'No', value: 'No'}, {label: 'I (In-Process)', value: 'I'}]} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                <FormSelect label="Supplier (Optional)" name="supplier" value={formData.supplier || ''} onChange={handleChange} options={[{label: '-- None --', value: ''}, ...supplierData.map(s => ({label: s.name, value: s.id}))]} />
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label">Item Description</label>
                                <textarea 
                                    name="description" 
                                    className="auth-input" 
                                    style={{ height: '80px', paddingTop: '0.8rem', resize: 'none' }} 
                                    placeholder="Enter a brief description of the product..." 
                                    value={formData.description || ''} 
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label">Product Image (Upload)</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="auth-input" 
                                        style={{ padding: '0.65rem', height: 'auto', flex: 1 }} 
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const resized = await window.resizeImage(file, 500);
                                                setFormData(prev => ({ ...prev, imageUrl: resized }));
                                            }
                                        }} 
                                    />
                                    {formData.imageUrl && (
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                        >
                                            Remove 
                                        </button>
                                    )}
                                </div>
                                {formData.imageUrl && formData.imageUrl.length > 500 && <span style={{fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.25rem'}}>✓ Product image attached</span>}
                            </div>
                            <FormButtons confirmLabel={type === 'add-item' ? "Add Item" : "Save Changes"} onClose={onClose} onConfirm={handleConfirm} isSaving={isSaving} />
                        </div>
                    )}

                    {(type === 'add-supplier' || type === 'edit-supplier') && (
                        <div className="auth-form">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormInput label="Supplier ID" name="id" value={formData.id || ''} onChange={handleChange} />
                                <FormInput label="Name" name="name" value={formData.name || ''} onChange={handleChange} />
                            </div>
                            <FormInput label="Contact Person" name="contact" value={formData.contact || ''} onChange={handleChange} />
                            <FormInput label="Address" name="address" value={formData.address || ''} onChange={handleChange} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormInput label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                                <FormInput type="email" label="Email" name="email" value={formData.email || ''} onChange={handleChange} />
                            </div>
                            <FormButtons confirmLabel={type === 'add-supplier' ? "Add Supplier" : "Save Changes"} onClose={onClose} onConfirm={handleConfirm} isSaving={isSaving} />
                        </div>
                    )}

                    {type.includes('log') && (
                        <div className="auth-form">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormInput label="Transaction ID" name="transactionId" value={formData.transactionId || ''} onChange={handleChange} />
                                <FormInput type="date" label="Date" name="date" value={formData.date || ''} onChange={handleChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                                <FormSelect label="Item Selection" name="itemCode" value={formData.itemCode || ''} onChange={e => {
                                    const found = inventoryData.find(i => i.id === e.target.value);
                                    setFormData(prev => ({ ...prev, itemCode: e.target.value, itemName: found?.name || '', uom: found?.uom || (uoms[0] || 'Pieces') }));
                                }} options={[{label: '-- Select Item --', value: ''}, ...inventoryData.map(i => ({label: `${i.id} - ${i.name}`, value: i.id}))]} />
                                <FormInput type="number" label="Quantity" name="quantity" value={formData.quantity ?? ''} onChange={handleChange} />
                            </div>
                            <FormButtons confirmLabel="Log Transaction" onClose={onClose} onConfirm={handleConfirm} isSaving={isSaving} />
                        </div>
                    )}

                    {type === 'supplier-details' && (() => {
                        const sup = supplierData.find(s => s.name === items[0]) || { name: items[0], contact: '—', email: '—', phone: '—', address: '—' };
                        return (
                            <div style={{ padding: '0.5rem 0' }}>
                                <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{sup.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>Trusted Partner since 2024</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem 2rem' }}>
                                    <label style={{ fontWeight: '700', opacity: 0.5 }}>Contact</label><div style={{ fontWeight: '600' }}>{sup.contact}</div>
                                    <label style={{ fontWeight: '700', opacity: 0.5 }}>Email</label><div className="supplier-link">{sup.email}</div>
                                    <label style={{ fontWeight: '700', opacity: 0.5 }}>Phone</label><div>{sup.phone}</div>
                                    <label style={{ fontWeight: '700', opacity: 0.5 }}>Office</label><div>{sup.address}</div>
                                </div>
                            </div>
                        );
                    })()}
                    {type === 'message' && (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                           <div style={{ opacity: 0.3, marginBottom: '1.5rem' }}><Icons.Alert size={48} /></div>
                           <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '500', marginBottom: '2rem' }}>{items[0]}</p>
                           <button className="auth-btn-primary" onClick={onClose} style={{ width: 'auto', padding: '0.6rem 2rem' }}>Got it</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
