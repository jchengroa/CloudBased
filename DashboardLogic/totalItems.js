const TotalItemsCard = ({ inventoryData }) => {
    const totalCount = inventoryData.length;
    return (
        <div className="dashboard-card">
            <div className="dash-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>
                    <window.BoxIcon stroke="var(--accent-color)" /> Total Items
                </div>
            </div>
            <div className="dash-card-value">{totalCount}</div>
            <div className="dash-card-subtitle">Active SKUs</div>
        </div>
    );
};
window.TotalItemsCard = TotalItemsCard;
