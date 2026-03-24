/**
 * Product Statistics Summary
 * A detailed view for a single product, including stock trends, 
 * transaction summaries, and predictive analytics.
 */
const ProductStatSummary = ({ item, inputLogs, outputLogs, onEdit, user }) => {
    const hasRes = (action) => {
        if (!user || user.role === 'Administrator') return false;
        return (user.restrictions || []).includes(action);
    };
    // 1. Data Processing
    const itemInputs = inputLogs.filter(l => l.itemCode === item.id);
    const itemOutputs = outputLogs.filter(l => l.itemCode === item.id);

    // 2. Trend Graph Calculation (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get all logs sorted by date descending (to work backwards)
    const allLogs = [...itemInputs.map(l => ({...l, type: 'in'})), ...itemOutputs.map(l => ({...l, type: 'out'}))]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Build timeline points
    const points = [];
    let currentStock = parseFloat(item.quantity) || 0;
    
    // Add today's point
    points.push({ date: new Date(), value: currentStock });

    allLogs.forEach(log => {
        if (new Date(log.date) < thirtyDaysAgo) return;
        
        // Reverse the transaction to find historical stock
        if (log.type === 'in') currentStock -= parseFloat(log.quantity) || 0;
        else currentStock += parseFloat(log.quantity) || 0;
        
        points.push({ date: new Date(log.date), value: currentStock });
    });

    // Final sorting for graph (left to right) and normalization
    const chronPoints = points.sort((a, b) => a.date - b.date);
    const maxVal = Math.max(...chronPoints.map(p => p.value), item.optimalStock || 0, 10);
    const minVal = Math.min(...chronPoints.map(p => p.value), 0);
    const range = maxVal - minVal;

    // SVG Polyline Path
    const width = 400;
    const height = 120;
    const padding = 20;
    
    const svgPoints = chronPoints.map((p, i) => {
        const x = (i / (chronPoints.length - 1 || 1)) * (width - padding * 2) + padding;
        const y = height - ((p.value - minVal) / (range || 1)) * (height - padding * 2) - padding;
        return `${x},${y}`;
    }).join(' ');

    // 3. Predictive Logic (Scoped to Item)
    const recentOut = itemOutputs.filter(log => new Date(log.date) >= thirtyDaysAgo);
    const totalOut = recentOut.reduce((sum, log) => sum + (parseFloat(log.quantity) || 0), 0);
    const dailyBurn = (totalOut / 30).toFixed(2);
    const daysRemaining = dailyBurn > 0 ? Math.floor((parseFloat(item.quantity) || 0) / dailyBurn) : Infinity;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-primary)' }}>
            
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                     <div style={{ fontSize: '0.9rem', opacity: 0.6, fontWeight: '600' }}>ITEM: {item.id}</div>
                     <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{item.name}</div>
                </div>
                {!hasRes('EditItems') && (
                    <button 
                        className="auth-btn-primary" 
                        onClick={() => onEdit(item)}
                        style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                    >
                        Edit Product
                    </button>
                )}
            </div>

            {/* Trend Graph Section */}
            <div className="dashboard-card" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Stock Levels (30D)</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Range: {minVal} - {maxVal} {item.uom}</div>
                </div>
                <div style={{ width: '100%', height: '140px', position: 'relative' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                        {/* Grid Lines */}
                        <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
                        
                        {/* Area Fill */}
                        <polygon 
                            points={`${padding},${height} ${svgPoints} ${width-padding},${height}`} 
                            fill="url(#grad)" 
                            opacity="0.1"
                        />
                        <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{stopColor: 'var(--accent-color)', stopOpacity: 1}} />
                                <stop offset="100%" style={{stopColor: 'var(--accent-color)', stopOpacity: 0}} />
                            </linearGradient>
                        </defs>

                        {/* Main Path */}
                        <polyline
                            fill="none"
                            stroke="var(--accent-color)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={svgPoints}
                        />
                        
                        {/* Target Stock Line */}
                        {item.optimalStock > 0 && (
                            <line 
                                x1={padding} 
                                y1={height - ((item.optimalStock - minVal) / (range || 1)) * (height - padding * 2) - padding} 
                                x2={width-padding} 
                                y2={height - ((item.optimalStock - minVal) / (range || 1)) * (height - padding * 2) - padding} 
                                stroke="#ef4444" 
                                strokeWidth="1" 
                                strokeDasharray="3" 
                                opacity="0.4"
                            />
                        )}
                    </svg>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="dashboard-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 }}>Total Arrivals</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{itemInputs.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981' }}>Across all logs</div>
                </div>
                <div className="dashboard-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 }}>Total Shipments</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{itemOutputs.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6366f1' }}>Across all logs</div>
                </div>
            </div>

            {/* Oracle Prediction Scoped */}
            <div style={{ 
                padding: '1.2rem', 
                borderRadius: '16px', 
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.02) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem'
            }}>
                <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    background: 'rgba(139, 92, 246, 0.2)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#8b5cf6'
                }}>
                    <window.ActivityIcon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '800', color: '#8b5cf6', fontSize: '0.9rem', marginBottom: '0.1rem' }}>Predictive Replenish</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Burn rate: <strong>{dailyBurn}</strong>/day. 
                        Estimated stock-out in <strong>{daysRemaining === Infinity ? '∞' : daysRemaining} days</strong>.
                    </div>
                </div>
                {daysRemaining <= 7 && (
                    <div style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: '800', borderRadius: '20px' }}>
                        CRITICAL
                    </div>
                )}
            </div>

        </div>
    );
};

window.ProductStatSummary = ProductStatSummary;
