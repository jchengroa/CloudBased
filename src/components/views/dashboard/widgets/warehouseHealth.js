const WarehouseHealth = ({ inventoryData, settings }) => {
    const getMin = (item) => parseFloat(item.optimalStock) || (settings?.lowStockThreshold || 1000);
    
    // Group by warehouse
    const warehouses = {};
    inventoryData.forEach(item => {
        const w = item.warehouse || 'Unassigned';
        if (!warehouses[w]) warehouses[w] = { items: 0, totalQty: 0, low: 0, totalOptimal: 0 };
        warehouses[w].items++;
        const qty = parseFloat(item.quantity) || 0;
        warehouses[w].totalQty += qty;
        warehouses[w].totalOptimal += getMin(item);
        if (qty < getMin(item)) warehouses[w].low++;
    });

    const whList = Object.keys(warehouses).map(name => {
        const data = warehouses[name];
        const score = data.totalOptimal > 0 ? Math.min(100, Math.round((data.totalQty / data.totalOptimal) * 100)) : 100;
        
        let scoreColor = '#10b981'; // green
        if (score < 50) scoreColor = '#ef4444'; // red
        else if (score < 100) scoreColor = '#f59e0b'; // orange

        return { name, ...data, score, scoreColor };
    }).sort((a, b) => b.totalQty - a.totalQty);

    const formatNumber = num => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    return (
        <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}>
                    <window.ActivityIcon stroke="#0ea5e9" /> Warehouse Health
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Inventory Stock Integrity</div>
            </div>
            <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                {whList.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No warehouse data.</div>
                ) : whList.map((w, i) => (
                    <div key={i} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
                            {w.name}
                            {w.low > 0 && (
                                <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', color: '#ef4444', fontSize: '0.75rem', fontWeight: '600' }}>
                                    <window.AlertTriangleIcon stroke="#ef4444" width="12" height="12" /> {w.low} alert{w.low !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Items</div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{w.items}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Total Qty</div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{formatNumber(w.totalQty)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Health</div>
                                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: w.scoreColor }}>{w.score}%</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
window.WarehouseHealth = WarehouseHealth;
