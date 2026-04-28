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
    supplierData = [],
    inputLogs = [],
    outputLogs = [],
    uoms = [],
    warehouses = [],
    user = {}
}) => {
    const [formData, setFormData] = React.useState({});
    const [error, setError] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const [linkSearch, setLinkSearch] = React.useState('');

    // Extract unique categories from inventory data for dropdown selection
    const availableCategories = React.useMemo(() => {
        const cats = new Set(inventoryData.map(item => item.category).filter(Boolean));
        return Array.from(cats).sort();
    }, [inventoryData]);

    React.useEffect(() => {
        if (!isOpen) {
            setFormData({});
            setIsSaving(false);
            return;
        }

        if ((type === 'edit-item' || type === 'remove-item') && items.length === 1) {
            const found = inventoryData.find((i) => i.id === items[0]);
            if (found) setFormData({ ...found });
        } else if (type === 'add-item') {
            setFormData({
                id: `ITM-${Math.floor(1000 + Math.random() * 9000)}`,
                name: '',
                category: '',
                quantity: '',
                optimalStock: '',
                uom: uoms[0] || 'Pieces',
                warehouse: warehouses[0] || 'Main',
                supplier: '',
                imageUrl: '',
                description: '',
                isRestocked: 'No'
            });
        } else if (type === 'add-supplier' || type === 'add-customer') {
            setFormData({ name: '', contact: '', address: '', phone: '', email: '' });
        } else if ((type === 'edit-supplier' || type === 'edit-customer') && items.length === 1) {
            const list = type.includes('supplier') ? supplierData : (window.customers || []);
            const found = list.find((s) => s.id === items[0]);
            if (found) setFormData({ ...found });
        } else if ((type === 'link-supplier-items' || type === 'link-customer-items') && items.length === 1) {
            const isSupplier = type === 'link-supplier-items';
            setFormData({
                partnerId: items[0],
                selectedItems: inventoryData
                    .filter((item) => (isSupplier ? item.supplier : item.customer) === items[0])
                    .map((item) => item.id)
            });
        } else if (type === 'edit-log' && items.length === 1) {
            const found = [...inputLogs, ...outputLogs].find((l) => l.transactionId === items[0]);
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
                supplier: '',
                batchLot: ''
            });
        }
        setError('');
        setLinkSearch('');
    }, [isOpen, type, items, inventoryData, supplierData, inputLogs, outputLogs, uoms, warehouses]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type: fieldType } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: fieldType === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }));
        setError('');
    };

    const handleConfirm = async () => {
        setIsSaving(true);
        let errorMsg = '';

        if (type.startsWith('add') || type.startsWith('edit')) {
            if (type.includes('item')) errorMsg = Validation.validateItem(formData, inventoryData, type.includes('edit'), items[0]);
            else if (type.includes('supplier')) errorMsg = Validation.validateSupplier(formData, supplierData, type.includes('edit'), items[0]);
            else if (type.includes('log')) errorMsg = Validation.validateLog(formData, inputLogs, outputLogs, type.includes('edit'), items[0]);
        }

        if (errorMsg) {
            setError(errorMsg);
            setIsSaving(false);
            return;
        }

        try {
            await onConfirm(formData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="prompt-overlay" onClick={(e) => e.target.className === 'prompt-overlay' && onClose()}>
            <div className="prompt-box" style={{ maxWidth: type.includes('details') ? '500px' : '650px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="prompt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{title}</h2>
                    <button className="prompt-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: '0.4rem' }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.5}>
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
                                <FormSelect
                                    label="Category"
                                    name="category"
                                    value={formData.category || ''}
                                    onChange={handleChange}
                                    options={[
                                        { label: '-- Select Category --', value: '' },
                                        ...availableCategories.map(cat => ({ label: cat, value: cat }))
                                    ]}
                                />
                                <FormSelect
                                    label="Warehouse"
                                    name="warehouse"
                                    value={formData.warehouse || ''}
                                    onChange={handleChange}
                                    options={warehouses.map((w) => ({ label: w, value: w }))}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <FormInput type="number" label="Stock On Hand" name="quantity" value={formData.quantity ?? ''} disabled={true} style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                                <FormSelect
                                    label="UOM"
                                    name="uom"
                                    value={formData.uom || ''}
                                    onChange={handleChange}
                                    options={uoms.map(u => ({ label: u, value: u }))}
                                />
                                <FormInput type="number" label="Optimal Stock" name="optimalStock" value={formData.optimalStock ?? ''} onChange={handleChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormSelect
                                    label="Supplier Partner"
                                    name="supplier"
                                    value={formData.supplier || ''}
                                    onChange={handleChange}
                                    disabled={(formData.category || '').toLowerCase().includes('product')}
                                    options={[{ label: '-- None (Internal/Other) --', value: '' }, ...supplierData.map(s => ({ label: s.name, value: s.id }))]}
                                />
                                <FormSelect
                                    label="Customer Partner"
                                    name="customer"
                                    value={formData.customer || ''}
                                    onChange={handleChange}
                                    disabled={!(formData.category || '').toLowerCase().includes('product')}
                                    options={[{ label: '-- No Primary Customer --', value: '' }, ...(window.customers || []).map(c => ({ label: c.name, value: c.id }))]}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                <FormSelect
                                    label="Restocked?"
                                    name="isRestocked"
                                    value={formData.isRestocked || 'No'}
                                    onChange={handleChange}
                                    options={[
                                        { label: 'Yes - Fully Stocked', value: 'Yes' },
                                        { label: 'No - Needs Stock', value: 'No' },
                                        { label: 'In Progress (I)', value: 'I' }
                                    ]}
                                />
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label">Item Description</label>
                                <textarea
                                    name="description"
                                    className="auth-input"
                                    style={{ height: '80px', resize: 'none' }}
                                    placeholder="Description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label">Product Image (File Upload)</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="auth-input"
                                        style={{ padding: '0.65rem', height: 'auto', flex: 1, margin: 0 }}
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const resized = await window.resizeImage(file, 500);
                                                setFormData((prev) => ({ ...prev, imageUrl: resized }));
                                            }
                                        }}
                                    />
                                    {(formData.imageUrl instanceof File || (typeof formData.imageUrl === 'string' && formData.imageUrl.startsWith('data:'))) && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                        >
                                            Remove File
                                        </button>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', padding: '0.9rem 1rem', borderRadius: '12px' }}>
                                    High-performance local image storage. Your current inventory schema stores images as uploaded files. Use the file picker above to persist a product image.
                                </div>
                                {(formData.imageUrl instanceof File || (typeof formData.imageUrl === 'string' && formData.imageUrl.startsWith('data:'))) && <span style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.5rem', display: 'block', fontWeight: '500' }}>Local file detected</span>}
                            </div>

                            <div className="auth-input-group">
                                <label className="auth-label">Image (Web Link)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="imageUrl"
                                        className="auth-input"
                                        placeholder="https://example.com/product-image.jpg"
                                        value={(typeof formData.imageUrl === 'string' && !formData.imageUrl.startsWith('data:')) ? formData.imageUrl : ''}
                                        onChange={handleChange}
                                        style={{ paddingRight: (typeof formData.imageUrl === 'string' && formData.imageUrl.length > 5 && !formData.imageUrl.startsWith('data:')) ? '120px' : '1rem' }}
                                    />
                                    {(typeof formData.imageUrl === 'string' && formData.imageUrl.length > 5 && !formData.imageUrl.startsWith('data:')) && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                                            style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.12)', padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Remove Link
                                        </button>
                                    )}
                                </div>
                                {(typeof formData.imageUrl === 'string' && formData.imageUrl.length > 5 && !formData.imageUrl.startsWith('data:')) ? (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.5rem', display: 'block', fontWeight: '500' }}>External link detected</span>
                                ) : (
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', padding: '0.9rem 1rem', borderRadius: '12px', marginTop: '0.75rem' }}>
                                        Alternatively, paste a web URL to any product image (JPG, PNG, WebP) to link it directly without uploading.
                                    </div>
                                )}
                            </div>
                            <FormButtons confirmLabel={type === 'add-item' ? 'Add Item' : 'Save Changes'} onClose={onClose} onConfirm={handleConfirm} isSaving={isSaving} />
                        </div>
                    )}

                    {(type === 'add-supplier' || type === 'edit-supplier' || type === 'add-customer' || type === 'edit-customer') && (
                        <div className="auth-form">
                            <FormInput label="Partner Name" name="name" value={formData.name || ''} onChange={handleChange} />
                            <FormInput label="Contact Person" name="contact" value={formData.contact || ''} onChange={handleChange} />
                            <FormInput label="Address" name="address" value={formData.address || ''} onChange={handleChange} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormInput label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                                <FormInput type="email" label="Email" name="email" value={formData.email || ''} onChange={handleChange} />
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', padding: '0.9rem 1rem', borderRadius: '12px' }}>
                                {type.includes('supplier')
                                    ? "Supplier partners cover raw materials, packaging, and supply relationships."
                                    : "Customer partners represent distribution channels, retail outlets, or direct buyers."}
                            </div>
                            <FormButtons confirmLabel={type.startsWith('add') ? `Add ${type.includes('supplier') ? 'Supplier' : 'Customer'}` : 'Save Changes'} onClose={onClose} onConfirm={handleConfirm} isSaving={isSaving} />
                        </div>
                    )}

                    {(type === 'link-supplier-items' || type === 'link-customer-items') && (() => {
                        const isSupplierMode = type === 'link-supplier-items';
                        const partnerId = formData.partnerId || items[0];
                        const partner = isSupplierMode
                            ? supplierData.find(s => s.id === partnerId)
                            : (customerData || []).find(c => c.id === partnerId);

                        const selectedItems = formData.selectedItems || [];
                        const field = isSupplierMode ? 'supplier' : 'customer';
                        const linkedItems = inventoryData.filter(item => item[field] === partnerId);

                        const toggleLinkedItem = (itemId) => {
                            setFormData(prev => ({
                                ...prev,
                                selectedItems: (prev.selectedItems || []).includes(itemId)
                                    ? prev.selectedItems.filter(id => id !== itemId)
                                    : [...(prev.selectedItems || []), itemId]
                            }));
                        };

                        const catalogPool = inventoryData.filter(item => {
                            const cat = (item.category || '').toLowerCase();
                            if (isSupplierMode) return !cat.includes('product');
                            return cat.includes('product');
                        });

                        const filteredPool = catalogPool.filter(item =>
                            item.name.toLowerCase().includes(linkSearch.toLowerCase()) ||
                            (item.id || '').toLowerCase().includes(linkSearch.toLowerCase()) ||
                            (item.category || '').toLowerCase().includes(linkSearch.toLowerCase())
                        );

                        return (
                            <div className="auth-form">
                                <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    Linking products to <strong style={{ color: 'var(--text-primary)' }}>{partner?.name || 'Partner'}</strong>.
                                    {isSupplierMode
                                        ? " Items selected here will be sourced from this partner."
                                        : " Items selected here will be distributed to this customer."}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '14px', background: 'var(--hover-bg)' }}>
                                        <div style={{ fontWeight: '800', marginBottom: '0.35rem' }}>Current Links</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{linkedItems.length} items</div>
                                    </div>
                                    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '14px', background: 'var(--hover-bg)' }}>
                                        <div style={{ fontWeight: '800', marginBottom: '0.35rem' }}>Proposed Links</div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{selectedItems.length} items</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                                        <Icons.Search style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, width: '16px' }} />
                                        <input
                                            type="text"
                                            placeholder="Search items to link..."
                                            className="auth-input"
                                            style={{ margin: 0, paddingLeft: '2.5rem', height: '42px', fontSize: '0.9rem' }}
                                            value={linkSearch}
                                            onChange={e => setLinkSearch(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="tool-btn"
                                        style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', height: '42px' }}
                                        onClick={() => setFormData(prev => ({ ...prev, selectedItems: catalogPool.map(item => item.id) }))}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        className="tool-btn"
                                        style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.18)', color: 'var(--danger)', height: '42px' }}
                                        onClick={() => setFormData(prev => ({ ...prev, selectedItems: [] }))}
                                    >
                                        Clear
                                    </button>
                                </div>

                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
                                    <div style={{ padding: '0.9rem 1rem', background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Item Catalog</span>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{filteredPool.length} visible</span>
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {filteredPool.length === 0 ? (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No products match your search.</div>
                                        ) : filteredPool.map((item) => {
                                            const isSelected = selectedItems.includes(item.id);
                                            const currentPartnerId = isSupplierMode ? item.supplier : item.customer;
                                            const assignedName = isSupplierMode
                                                ? supplierData.find(s => s.id === item.supplier)?.name
                                                : (customerData || []).find(c => c.id === item.customer)?.name;

                                            const isAssignedElsewhere = currentPartnerId && currentPartnerId !== partnerId;

                                            return (
                                                <label key={item.id} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', padding: '1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: isSelected ? 'var(--hover-bg)' : 'transparent' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleLinkedItem(item.id)}
                                                        style={{ marginTop: '0.2rem' }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{item.id} • {item.category}</div>
                                                        {assignedName && (
                                                            <div style={{ marginTop: '0.45rem' }}>
                                                                <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: isAssignedElsewhere ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isAssignedElsewhere ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                                                                    {isAssignedElsewhere ? `Linked to ${assignedName}` : 'Linked to this partner'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <FormButtons confirmLabel="Synchronize Links" onClose={onClose} onConfirm={handleConfirm} isSaving={isSaving} />
                            </div>
                        );
                    })()}

                    {type.includes('log') && (
                        <div className="auth-form">
                            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1rem' }}>
                                <FormInput label="Transaction ID" name="transactionId" value={formData.transactionId || ''} onChange={handleChange} />
                                <FormInput type="number" label="Quantity" name="quantity" value={formData.quantity ?? ''} onChange={handleChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                <FormSelect
                                    label="Item Selection"
                                    name="itemCode"
                                    value={formData.itemCode || ''}
                                    onChange={(e) => {
                                        const found = inventoryData.find((i) => i.id === e.target.value);
                                        setFormData((prev) => ({ ...prev, itemCode: e.target.value, itemName: found?.name || '', uom: found?.uom || (uoms[0] || 'Pieces') }));
                                    }}
                                    options={[{ label: '-- Select Item --', value: '' }, ...inventoryData.map((i) => ({ label: `${i.id} - ${i.name}`, value: i.id }))]}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormInput type="date" label="Transaction Date" name="date" value={formData.date || ''} onChange={handleChange} />
                                <FormInput label="Batch / Lot Number" name="batchLot" value={formData.batchLot || ''} onChange={handleChange} />
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label">Description / Notes</label>
                                <textarea
                                    name="description"
                                    className="auth-input"
                                    style={{ height: '60px', paddingTop: '0.8rem', resize: 'none', fontSize: '0.9rem' }}
                                    placeholder="Enter any relevant transaction details..."
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <FormButtons confirmLabel={type === 'edit-log' ? 'Save Changes' : 'Log Transaction'} onClose={onClose} onConfirm={handleConfirm} isSaving={isSaving} />
                        </div>
                    )}

                    {type === 'product-stats' && (() => {
                        const item = inventoryData.find((i) => i.id === items[0]) || {};
                        return (
                            <window.ProductStatSummary
                                item={item}
                                inputLogs={inputLogs}
                                outputLogs={outputLogs}
                                onEdit={(it) => {
                                    onClose();
                                    setTimeout(() => window.openPrompt('Edit Inventory Item', 'edit-item', [it.id]), 300);
                                }}
                                user={user}
                            />
                        );
                    })()}
                    {(type === 'supplier-details' || type === 'customer-details') && (() => {
                        const list = type === 'supplier-details' ? supplierData : (window.customers || customerData || []);
                        const sup = list.find((s) => s.name === items[0] || s.id === items[0]) || { name: items[0], contact: '-', email: '-', phone: '-', address: '-' };
                        const roleLabel = type === 'supplier-details' ? 'Supplier partner record' : 'Customer partner record';
                        return (
                            <div style={{ padding: '0.5rem 0' }}>
                                <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{sup.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>{roleLabel}</p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem 2rem' }}>
                                    <label style={{ fontWeight: '700', opacity: 0.5 }}>Contact</label><div style={{ fontWeight: '600' }}>{sup.contact || '—'}</div>
                                    <label style={{ fontWeight: '700', opacity: 0.5 }}>Email</label><div className="supplier-link">{sup.email || '—'}</div>
                                    <label style={{ fontWeight: '700', opacity: 0.5 }}>Phone</label><div>{sup.phone || '—'}</div>
                                    <label style={{ fontWeight: '700', opacity: 0.5 }}>Office</label><div>{sup.address || '—'}</div>
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
window.Prompt = Prompt;
