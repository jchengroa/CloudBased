const LowStockCard = ({ inventoryData, settings }) => {
    const getMin = (item) => {
        if (settings?.isThresholdEnabled && settings?.lowStockThreshold) return parseFloat(settings.lowStockThreshold);
        return parseFloat(item.optimalStock) || 0;
    };
    const lowCount = inventoryData.filter(i => (parseFloat(i.quantity) || 0) < getMin(i)).length;
    
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
