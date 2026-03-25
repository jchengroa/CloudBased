/**
 * Item List View
 * A premium card-based display for the product catalog.
 */

const ItemList = ({ inventoryData = [], openPrompt, lowStockThreshold, isThresholdEnabled, user }) => {
    const { 
        PlusIcon, 
        SearchIcon, 
        BoxIcon, 
        ActivityIcon, 
        AlertTriangleIcon, 
        TruckIcon,
        SortButton,
        StatusBadge
    } = window;

    const hasRes = (action) => {
        if (!user || user.role === 'Administrator') return false;
        return (user.restrictions || []).includes(action);
    };
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState('All');

    // Categories for filter
    const categories = ['All', ...new Set(inventoryData.map(i => i.category).filter(Boolean))].sort();

    // Base filtered results (without sorting yet)
    const baseFiltered = React.useMemo(() => {
        return inventoryData.filter(item => {
            const sq = searchQuery.toLowerCase();
            const matchesSearch = item.name.toLowerCase().includes(sq) || (item.id || '').toLowerCase().includes(sq);
            const matchesCat = filterCategory === 'All' || item.category === filterCategory;
            return matchesSearch && matchesCat;
        });
    }, [inventoryData, searchQuery, filterCategory]);

    const { sortedData: filtered, requestSort, sortConfig, SortIndicator } = window.useSorting(baseFiltered, 'name', 'asc');

    const SORT_OPTIONS = [
        { key: 'name', label: 'Product Name', icon: <BoxIcon style={{width:16, height:16}} /> },
        { key: 'quantity', label: 'Stock on Hand', icon: <ActivityIcon style={{width:16, height:16}} /> },
        { key: 'status', label: 'Stock Status', icon: <AlertTriangleIcon style={{width:16, height:16}} /> },
        { key: 'isRestocked', label: 'Restock Progress', icon: <TruckIcon style={{width:16, height:16}} /> }
    ];

    return (
        <div className="item-list-container">
            <div className="list-controls" style={{ padding: '2.2rem 2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                <div className="auth-input-wrapper" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <SearchIcon style={{ position: 'absolute', left: '1rem', opacity: 0.5, pointerEvents: 'none' }} />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="auth-input" 
                        style={{ paddingLeft: '3rem', margin: 0, width: '100%' }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <select 
                    className="auth-input" 
                    style={{ width: '200px', margin: 0 }}
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <SortButton 
                    options={SORT_OPTIONS}
                    currentKey={sortConfig.key}
                    onSort={requestSort}
                />

                {!hasRes('AddItems') && (
                    <button 
                        className="auth-btn-primary" 
                        style={{ padding: '0.6rem 1.25rem', margin: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }} 
                        onClick={() => openPrompt('New Item', 'add-item')}
                    >
                        <PlusIcon size={18} /> Add Product
                    </button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>📦</div>
                    <p>No products found matching your criteria.</p>
                </div>
            ) : (
                <div className="item-card-grid">
                    {filtered.map(item => {
                        const stockOnHand = parseFloat(item.quantity) || 0;
                        const effectiveOptimal = (isThresholdEnabled && lowStockThreshold) ? parseFloat(lowStockThreshold) : (parseFloat(item.optimalStock) || 0);
                        const isLow = stockOnHand < effectiveOptimal;
                        const status = isLow ? 'Reorder' : 'Okay';
                        const statusClass = isLow ? 'reorder' : 'okay';

                        return (
                            <div key={item.id} className="item-card" onClick={() => openPrompt('Product Insights', 'product-stats', [item.id])} style={{ cursor: 'pointer' }}>
                                <div className="item-image-wrapper">
                                    <img 
                                        src={item.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&size=200`} 
                                        alt={item.name} 
                                        className="item-image"
                                    />
                                    <div className="item-status-overlay" style={{ display: 'flex', gap: '0.4rem' }}>
                                        <StatusBadge type="stock" value={status} />
                                        <StatusBadge type="stock" value={item.isRestocked === 'Yes' ? 'Restocked' : (item.isRestocked === 'I' ? 'Restocking (I)' : 'To Restock')} />
                                    </div>
                                </div>
                                <div className="item-details-box">
                                    <div className="item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</h3>
                                            <div className="item-code-tag">{item.id || 'N/A'} • {item.category || 'Category'}</div>
                                        </div>
                                        {!hasRes('EditItems') && (
                                            <button 
                                                title="Edit Item"
                                                onClick={(e) => { e.stopPropagation(); openPrompt('Edit Inventory Item', 'edit-item', [item.id]); }} 
                                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.5, padding: '0.2rem', display: 'flex' }}
                                                onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--accent-color)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                                            </button>
                                        )}
                                    </div>
                                    <p className="item-desc">{item.description || 'No description available for this product.'}</p>
                                    
                                    <div className="item-stock-row">
                                        <div>
                                            <div className="stock-label">Stock on Hand</div>
                                            <div className="stock-val">{stockOnHand} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.uom}</span></div>
                                        </div>
                                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '0.75rem' }}>
                                            <div className="stock-label">Optimal Stock</div>
                                            <div className="stock-val" style={{ color: (isThresholdEnabled && lowStockThreshold) ? 'var(--accent-color)' : 'inherit' }}>
                                                {effectiveOptimal}
                                                {(isThresholdEnabled && lowStockThreshold) && <span style={{ fontSize: '0.65rem', display: 'block', opacity: 0.7 }}>(Global)</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
