const SuppliersOnlyCard = ({ supplierData }) => {
    const totalCount = supplierData.length;
    return (
        <div className="dashboard-card">
            <div className="dash-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>
                    <window.UsersIcon stroke="#10b981" /> Suppliers
                </div>
            </div>
            <div className="dash-card-value">{totalCount}</div>
            <div className="dash-card-subtitle">Active partners</div>
        </div>
    );
};
window.SuppliersOnlyCard = SuppliersOnlyCard;
