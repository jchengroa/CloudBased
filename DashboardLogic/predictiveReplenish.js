/**
 * The Oracle - Predictive Analytics Engine
 * Calculates inventory velocity and projects run-out dates.
 * Combines forecasting with Google Calendar scheduling.
 */

const PredictiveReplenish = ({ inventoryData, outputLogs }) => {
    const [visibleItems, setVisibleItems] = React.useState(3);

    // 1. Core Logic: Projecting Run-out Dates
    const predictions = inventoryData.map(item => {
        const itemLogs = outputLogs.filter(log => log.itemCode === item.id);

        // Calculate velocity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentLogs = itemLogs.filter(log => new Date(log.date) >= thirtyDaysAgo);
        const totalOut = recentLogs.reduce((sum, log) => sum + (parseFloat(log.quantity) || 0), 0);
        const dailyBurn = totalOut / 30;

        const currentQty = parseFloat(item.quantity) || 0;
        const daysRemaining = dailyBurn > 0 ? Math.floor(currentQty / dailyBurn) : Infinity;

        // Target items running out in < 14 days
        return {
            ...item,
            dailyBurn: dailyBurn.toFixed(2),
            daysRemaining,
            predictedDate: daysRemaining !== Infinity ? new Date(Date.now() + daysRemaining * 86400000) : null
        };
    })
        .filter(p => p.daysRemaining <= 14 && p.daysRemaining >= 0 && (p.isRestocked !== 'Yes' && p.isRestocked !== 'I'))
        .sort((a, b) => a.daysRemaining - b.daysRemaining);

    // 2. Google Calendar Integration Helper
    const addToCalendar = (item) => {
        const title = encodeURIComponent(`[REFILL] ${item.name}`);
        const dateObj = item.predictedDate || new Date();
        // Set reminder 2 days before predicted stock-out
        const reminderDate = new Date(dateObj);
        reminderDate.setDate(reminderDate.getDate() - 2);

        const dateStr = reminderDate.toISOString().replace(/-|:|\.\d+/g, '').split('T')[0];
        const dateRange = `${dateStr}/${dateStr}`;

        const details = encodeURIComponent(
            `THE ORACLE PREDICTION:\n` +
            `Item: ${item.name} (${item.id})\n` +
            `Current Stock: ${item.quantity} ${item.uom}\n` +
            `Consumption Rate: ${item.dailyBurn} ${item.uom}/day\n` +
            `Predicted Stock-Out: ${dateObj.toLocaleDateString()}\n\n` +
            `Scheduled via CloudBased Oracle Engine.`
        );

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateRange}&details=${details}`;
        window.open(url, '_blank');
    };

    return (
        <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.2)', background: 'linear-gradient(145deg, var(--card-bg), rgba(139, 92, 246, 0.03))' }}>
            <div style={{ padding: '1.2rem', borderBottom: '1px solid rgba(139, 92, 246, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
                        <window.TrendingUpIcon color="#8b5cf6" /> Predictive Replenishment
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Predicted Stock-Out Forecast</div>
                </div>
                <div style={{ background: '#8b5cf6', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {predictions.length} High Risk
                </div>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
                {predictions.length === 0 ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                        <div style={{ opacity: 0.3, marginBottom: '1rem' }}><window.ActivityIcon size={48} /></div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Engine sees no immediate stock-out risks.</div>
                    </div>
                ) : (
                    <>
                        {predictions.slice(0, visibleItems).map((item, idx) => (
                            <div key={idx} style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx < visibleItems - 1 ? '1px solid var(--border-color)' : 'none', position: 'relative' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {item.name}
                                        <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>{item.id}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                                        <span>Burn Rate: <strong>{item.dailyBurn}</strong>/day</span>
                                        <span>Stock: <strong>{item.quantity}</strong></span>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: item.daysRemaining <= 3 ? '#ef4444' : '#f59e0b', fontWeight: '800', fontSize: '1rem' }}>
                                            {item.daysRemaining === 0 ? 'Out Today' : `In ${item.daysRemaining} Days`}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.8 }}>{item.predictedDate?.toLocaleDateString()}</div>
                                    </div>

                                    <button
                                        className="oracle-sync-btn"
                                        onClick={() => addToCalendar(item)}
                                        title="Schedule Reminder on Google Calendar"
                                        style={{
                                            background: 'var(--hover-bg)',
                                            border: '1px solid var(--border-color)',
                                            padding: '0.6rem',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#4285F4'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(66, 133, 244, 0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                                    >
                                        <window.LinkIcon size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {predictions.length > visibleItems && (
                            <button
                                onClick={() => setVisibleItems(prev => prev + 3)}
                                style={{ width: '100%', padding: '0.8rem', background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', borderTop: '1px solid var(--border-color)' }}
                            >
                                View all {predictions.length} predictions
                            </button>
                        )}
                    </>
                )}
            </div>

            <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <window.AlertTriangleIcon size={14} color="#8b5cf6" />
                <span>Predictions are based on last 30 days of transaction logs.</span>
            </div>
        </div>
    );
};

window.PredictiveReplenish = PredictiveReplenish;
