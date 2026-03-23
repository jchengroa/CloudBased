const RecentArrivalsList = ({ inputLogs, inventoryData }) => {
    // Top 5 recent arrivals
    const sortedLogs = [...inputLogs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const enrichLog = (log) => {
        const item = inventoryData.find(i => i.id === log.itemCode) || {};
        return {
            ...log,
            itemName: item.name || 'Unknown Item',
            uom: log.uom || item.uom || 'units'
        };
    };

    return (
        <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.2rem', background: 'rgba(16, 185, 129, 0.05)', borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: '700', fontSize: '1rem' }}>
                    <window.ArrowDownCircleIcon /> Recent Arrivals
                </div>
                <div style={{ color: '#059669', opacity: 0.8, fontSize: '0.8rem', marginTop: '0.2rem' }}>Latest incoming shipments</div>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {sortedLogs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No recent arrivals.</div>
                ) : (
                    sortedLogs.map((log, i) => {
                        const data = enrichLog(log);
                        return (
                            <div key={i} style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{data.itemName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {data.itemCode} • {data.supplier || 'No Supplier'}
                                    </div>
                                    {data.batch && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.8, marginTop: '2px' }}>Batch: {data.batch}</div>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', color: '#10b981' }}>+{data.quantity} {data.uom}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{new Date(data.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
window.RecentArrivalsList = RecentArrivalsList;
