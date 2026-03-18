/**
 * ==========================================
 * PROMPT COMPONENT
 * ==========================================
 * A reusable modal overlay that 
 * handles all popup interactions.
 */

const Prompt = ({ isOpen, onClose, onConfirm, title, type, items, supplierData = [] }) => {
    // If it's not open, render nothing
    if (!isOpen) return null;

    // Handle confirming the action
    const handleConfirm = () => {
        if (onConfirm) onConfirm();
    };

    // Close the prompt only if the user clicks the dimmed overlay (outside the box)
    const handleOverlayClick = (e) => {
        if (e.target.className === 'prompt-overlay') {
            onClose();
        }
    };

    // --- Render ---
    return (
        <div className="prompt-overlay" onClick={handleOverlayClick}>
            <div className="prompt-box">

                {/* Header with Title and Close Button */}
                <div className="prompt-header">
                    <h2>{title}</h2>
                    {/* Top right exit button */}
                    <button className="prompt-close-btn" onClick={onClose} title="Close">
                        &times;
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="prompt-content">
                    {/* Conditionally render content based on what action triggered the prompt */}

                    {(type === 'remove-item' || type === 'remove-supplier') && (
                        <div className="prompt-remove-confirmation">
                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                                Are you sure you want to remove <strong>{items.length}</strong> selected {items.length === 1 ? 'item' : 'items'}?
                            </p>
                            <p style={{ marginBottom: '2rem', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                Note: This currently only simulates removal with mockup data. Watch the console log to verify!
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
                                    <input type="text" className="prompt-input" defaultValue={type === 'edit-item' ? "ITM-1001" : ""} placeholder="e.g. ITM-0000" />
                                </div>
                                <div>
                                    <label className="prompt-label">Category</label>
                                    <input type="text" className="prompt-input" defaultValue={type === 'edit-item' ? "Hardware" : ""} placeholder="e.g. Raw Materials" />
                                </div>
                            </div>
                            <div className="prompt-form-row">
                                <div style={{ flex: 1 }}>
                                    <label className="prompt-label">Item Name</label>
                                    <input type="text" className="prompt-input" defaultValue={type === 'edit-item' ? `Hex Bolts 3/8"` : ""} placeholder="e.g. Metric Hex Bolts" />
                                </div>
                            </div>
                            <div className="prompt-form-row">
                                <div>
                                    <label className="prompt-label">Quantity</label>
                                    <input type="number" className="prompt-input" defaultValue={type === 'edit-item' ? "4500" : ""} placeholder="0" />
                                </div>
                                <div>
                                    <label className="prompt-label">UOM</label>
                                    <select className="prompt-select" defaultValue="Boxes">
                                        <option value="Pieces">Pieces</option>
                                        <option value="Boxes">Boxes</option>
                                        <option value="Bags">Bags</option>
                                        <option value="Sacks">Sacks</option>
                                        <option value="Pallets">Pallets</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="prompt-label">Min. Level (MSL)</label>
                                    <input type="number" className="prompt-input" defaultValue={type === 'edit-item' ? "1000" : ""} placeholder="0" />
                                </div>
                            </div>
                            <div className="prompt-form-row">
                                <div>
                                    <label className="prompt-label">Warehouse Location</label>
                                    <select className="prompt-select" defaultValue="Main Hub (NY)">
                                        {/* Note: Update these static locations here in the future or connect to a DB mapping */}
                                        <option value="Main Hub (NY)">Main Hub (NY)</option>
                                        <option value="Malabon - M.H. Del Pilar">Malabon - M.H. Del Pilar</option>
                                        <option value="Quezon City Facility">Quezon City Facility</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="prompt-label">Supplier</label>
                                    <select className="prompt-select" defaultValue={supplierData.length > 0 ? supplierData[0].name : ""}>
                                        {supplierData.map(sup => (
                                            <option key={sup.id} value={sup.name}>{sup.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                Note: This currently only simulates saving with mockup data. Watch the console log to verify!
                            </p>

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
                                    <input type="text" className="prompt-input" defaultValue={type === 'edit-supplier' ? "Acme Industrial Supplies" : ""} placeholder="e.g. Tech Corp" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="prompt-label">Contact Person</label>
                                    <input type="text" className="prompt-input" defaultValue={type === 'edit-supplier' ? "Jane Doe" : ""} placeholder="e.g. Jane Doe" />
                                </div>
                            </div>
                            <div className="prompt-form-row">
                                <div style={{ flex: 1 }}>
                                    <label className="prompt-label">Address</label>
                                    <input type="text" className="prompt-input" defaultValue={type === 'edit-supplier' ? "24 Taft Ave, Manila" : ""} placeholder="e.g. 123 Main St, City" />
                                </div>
                            </div>
                            <div className="prompt-form-row">
                                <div>
                                    <label className="prompt-label">Phone Number</label>
                                    <input type="text" className="prompt-input" defaultValue={type === 'edit-supplier' ? "+63 917 123 1234" : ""} placeholder="e.g. +1 234 567 8900" />
                                </div>
                                <div>
                                    <label className="prompt-label">Email Address</label>
                                    <input type="email" className="prompt-input" defaultValue={type === 'edit-supplier' ? "contact@acme.com" : ""} placeholder="e.g. contact@supplier.com" />
                                </div>
                            </div>

                            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                Note: This currently only simulates saving with mockup data. Watch the console log to verify!
                            </p>

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

                    {/* Supplier Contact Details Card */}
                    {/* Exclusively triggered from clicking links inside InventoryTable */}
                    {type === 'supplier-details' && (() => {
                        const supName = items && items.length > 0 ? items[0] : "";
                        // Fallback matching logic: Grabs precisely the object mapping matching the inventory string name
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

                    {/* Failsafe Fallback Text Message */}
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
