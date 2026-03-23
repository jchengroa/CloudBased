const CriticalReplenishment = ({ inventoryData, settings }) => {
    const getMin = (item) => parseFloat(item.optimalStock) || (settings?.lowStockThreshold || 1000);
    const criticalItems = inventoryData.filter(i => (parseFloat(i.quantity) || 0) < getMin(i));

    return (
        <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.2rem', background: 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontWeight: '700', fontSize: '1rem' }}>
                        <window.AlertTriangleIcon /> Critical Replenishment Required
                    </div>
                    <div style={{ color: '#e11d48', opacity: 0.8, fontSize: '0.8rem', marginTop: '0.2rem' }}>{criticalItems.length} items below minimum stock level</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#e11d48', fontWeight: '800', fontSize: '1.2rem' }}>{criticalItems.length}</div>
                    <div style={{ color: '#e11d48', fontSize: '0.75rem', opacity: 0.8 }}>alerts</div>
                </div>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {criticalItems.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>All stock levels are optimal.</div>
                ) : (
                    criticalItems.map((item, i) => (
                        <div key={i} style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{item.name || 'Unknown Item'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {item.id} • {item.category || 'Uncategorized'} • {item.warehouse || 'No Warehouse'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', color: '#ef4444' }}>{item.quantity || 0} {item.uom || 'units'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Min: {getMin(item)}</div>
                                </div>
                                <button className="auth-btn-text" style={{ padding: '0.4rem 1rem', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-color)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }} onClick={() => alert(`Contacting supplier for ${item.name}`)}>
                                    Contact
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
window.CriticalReplenishment = CriticalReplenishment;
