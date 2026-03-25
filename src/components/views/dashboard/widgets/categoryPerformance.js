const CategoryPerformance = ({ inventoryData, settings }) => {
    const getMin = (item) => parseFloat(item.optimalStock) || (settings?.lowStockThreshold || 1000);
    
    // Group by category
    const categories = {};
    inventoryData.forEach(item => {
        const cat = item.category || 'Uncategorized';
        if (!categories[cat]) categories[cat] = { total: 0, low: 0 };
        categories[cat].total++;
        if ((parseFloat(item.quantity) || 0) < getMin(item)) {
            categories[cat].low++;
        }
    });

    const categoryList = Object.keys(categories).map(name => {
        const data = categories[name];
        const health = data.total === 0 ? 0 : Math.round(((data.total - data.low) / data.total) * 100);
        let color = '#10b981'; // green
        if (health < 100 && health >= 50) color = '#f59e0b'; // orange
        if (health < 50) color = '#ef4444'; // red

        return { name, ...data, health, color };
    }).sort((a, b) => b.total - a.total); // Sort by total items

    return (
        <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}>
                    <window.PieChartIcon stroke="var(--accent-color)" /> Category Performance
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Stock health by category</div>
            </div>
            <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {categoryList.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No categories found.</div>
                ) : categoryList.map((cat, i) => (
                    <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{cat.name}</div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat.total} item{cat.total !== 1 ? 's' : ''}</span>
                                <span style={{ fontWeight: '700', color: cat.color }}>{cat.health}%</span>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--hover-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${cat.health}%`, height: '100%', background: cat.color, transition: 'width 0.5s ease-out' }}></div>
                        </div>
                        {cat.low > 0 && (
                            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: '500' }}>
                                {cat.low} low stock item{cat.low !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
window.CategoryPerformance = CategoryPerformance;
