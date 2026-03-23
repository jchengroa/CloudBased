const LowStockCard = ({ inventoryData, settings }) => {
    const getMin = (item) => item.minLevel ? parseInt(item.minLevel) : (settings?.lowStockThreshold || 1000);
    const lowCount = inventoryData.filter(i => parseInt(i.quantity) < getMin(i)).length;
    
    return (
        <div className="dashboard-card">
            <div className="dash-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>
                    <window.AlertTriangleIcon stroke="var(--danger)" /> Low Stock
                </div>
            </div>
            <div className="dash-card-value">{lowCount}</div>
            <div className="dash-card-subtitle" style={{ color: 'var(--danger)' }}>{lowCount} critical</div>
        </div>
    );
};
window.LowStockCard = LowStockCard;
