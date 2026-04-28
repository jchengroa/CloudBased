/**
 * Assets Component
 * Unified workspace for product overview, arrivals, and shipments.
 */

const Assets = ({
    openPrompt,
    inventoryData = [],
    inputLogs = [],
    outputLogs = [],
    supplierData = [],
    customerData = [],
    dbError,
    user,
    lowStockThreshold,
    isThresholdEnabled,
    warehouses = [],
    canUndo,
    canRedo,
    onUndo,
    onRedo
}) => {
    const {
        StatusBadge = () => null,
        TableMessage = () => null,
        SortButton = () => null,
        WarehousePills = () => null,
        ViewSwitcher = () => null,
        ActionBar = () => null,
        AppDataHandler,
        formatStockQuantity = (value) => `${value ?? 0}`
    } = window;
    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    const renderIcon = (name, props = {}) => {
        const Icon = Icons[name] || (() => null);
        return <Icon {...props} />;
    };
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeView, setActiveView] = React.useState('overview');
    const [overviewDisplay, setOverviewDisplay] = React.useState('card');
    const [activeWarehouseFilter, setActiveWarehouseFilter] = React.useState('All');
    const [activeAssetFamily, setActiveAssetFamily] = React.useState('All');
    
    // Automation engine — passive, read-only
    const automation = window.useAutomationEngine
        ? window.useAutomationEngine(inventoryData, supplierData, customerData, outputLogs, user.settings, inputLogs)
        : null;

    const getItemAutomationStatus = React.useCallback((itemId) => {
        if (!automation) return null;
        const id = String(itemId);
        if (automation.criticalItems.some(i => String(i.id) === id)) return { label: 'Urgent', color: '#ef4444', icon: 'Zap' };
        if (automation.staleRestocks.some(i => String(i.id) === id)) return { label: 'Follow-up', color: '#ef4444', icon: 'Clock' };
        if (automation.predictiveItems.some(i => String(i.id) === id)) return { label: 'Forecast Risk', color: '#8b5cf6', icon: 'TrendingDown' };
        if (automation.dataIssues.some(i => String(i.id) === id)) return { label: 'Setup Gap', color: '#f59e0b', icon: 'Settings' };
        if (automation.dormantStock.some(i => String(i.id) === id)) return { label: 'Dormant', color: '#64748b', icon: 'Archive' };
        return null;
    }, [automation]);

    const AutomationRibbon = window.AutomationRibbon || (() => null);

    const isOverview = activeView === 'overview';
    const isInput = activeView === 'input';
    const isTableMode = isOverview && overviewDisplay === 'table';
    const isInventoryDataView = isOverview;

    const hasRes = (action) => {
        if (!user || user.role === 'Administrator') return false;
        return (user.restrictions || []).includes(action);
    };

    const canEditInventory = !hasRes('EditItems');
    const canRemoveInventory = !hasRes('RemoveItems');
    const canAddInventory = !hasRes('AddItems');
    const canEditLogs = !hasRes('EditLogs');
    const canRemoveLogs = !hasRes('RemoveLogs');
    const canAddLogs = !hasRes('AddLogs');

    const getAssetFamily = React.useCallback((item) => {
        const text = `${item.category || ''} ${item.name || ''} ${item.description || ''}`.toLowerCase();
        if (/(pack|box|bottle|bag|label|wrap|container|carton|jar|cup|cap|seal)/.test(text)) return 'Packaging';
        if (/(raw|ingredient|material|flour|sugar|butter|oil|yeast|powder|mix|cocoa|milk|salt)/.test(text)) return 'Raw Materials';
        if (/(supply|clean|sanit|glove|tool|maintenance|consumable|utility)/.test(text)) return 'Supply';
        return 'Products';
    }, []);

    React.useEffect(() => {
        setSelectedRows([]);
        setSearchQuery('');
    }, [activeView, overviewDisplay, inventoryData, inputLogs, outputLogs]);

    const availableWarehouses = React.useMemo(() => {
        const knownWarehouses = [
            ...warehouses,
            ...inventoryData.map((item) => item.warehouse).filter(Boolean)
        ];
        return ['All', ...Array.from(new Set(knownWarehouses)).sort((a, b) => a.localeCompare(b))];
    }, [warehouses, inventoryData]);

    const inventoryById = React.useMemo(() => {
        return inventoryData.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
    }, [inventoryData]);

    const getItemStatus = React.useCallback((item) => {
        const stock = parseFloat(item.quantity) || 0;
        const threshold = (isThresholdEnabled && lowStockThreshold)
            ? parseFloat(lowStockThreshold)
            : (parseFloat(item.optimalStock) || 0);

        return stock < threshold ? 'Reorder' : 'Okay';
    }, [isThresholdEnabled, lowStockThreshold]);

    const assetRecords = React.useMemo(() => {
        const sq = searchQuery.toLowerCase();
        return inventoryData
            .map((item) => ({ ...item, status: getItemStatus(item), assetFamily: getAssetFamily(item) }))
            .filter((item) => {
                const matchesSearch =
                    (item.name || '').toLowerCase().includes(sq) ||
                    (item.id || '').toLowerCase().includes(sq) ||
                    (item.category || '').toLowerCase().includes(sq) ||
                    (item.description || '').toLowerCase().includes(sq);
                const matchesWarehouse = activeWarehouseFilter === 'All' || item.warehouse === activeWarehouseFilter;
                const matchesAssetFamily = activeAssetFamily === 'All' || item.assetFamily === activeAssetFamily;
                return matchesSearch && matchesWarehouse && matchesAssetFamily;
            });
    }, [inventoryData, searchQuery, activeWarehouseFilter, activeAssetFamily, getItemStatus, getAssetFamily]);

    const transactionRecords = React.useMemo(() => {
        const logs = isInput ? inputLogs : outputLogs;
        const sq = searchQuery.toLowerCase();
        return logs
            .map((log) => {
                const item = inventoryById[log.itemCode];
                return {
                    ...log,
                    warehouse: item ? item.warehouse : 'Unassigned',
                    itemName: log.itemName || item?.name || 'Unknown Item',
                    assetFamily: getAssetFamily(item || {})
                };
            })
            .filter((log) => {
                const matchesSearch =
                    (log.itemName || '').toLowerCase().includes(sq) ||
                    (log.itemCode || '').toLowerCase().includes(sq) ||
                    (log.transactionId || '').toLowerCase().includes(sq);
                const matchesWarehouse = activeWarehouseFilter === 'All' || log.warehouse === activeWarehouseFilter;
                const matchesAssetFamily = activeAssetFamily === 'All' || log.assetFamily === activeAssetFamily;
                return matchesSearch && matchesWarehouse && matchesAssetFamily;
            });
    }, [isInput, inputLogs, outputLogs, inventoryById, searchQuery, activeWarehouseFilter, activeAssetFamily, getAssetFamily]);

    const assetFamilyOptions = ['All', 'Products', 'Raw Materials', 'Packaging', 'Supply'];

    const {
        sortedData: processed,
        requestSort,
        sortConfig,
        SortIndicator
    } = window.useSorting(
        isOverview ? assetRecords : transactionRecords,
        '',
        isOverview ? 'asc' : 'desc'
    );

    const toggleRow = (id) => {
        setSelectedRows((prev) => prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]);
    };

    const assetSummary = React.useMemo(() => {
        const lowStockItems = assetRecords.filter((item) => item.status === 'Reorder').length;
        const totalStock = assetRecords.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
        const activeCategories = new Set(assetRecords.map((item) => item.category).filter(Boolean)).size;
        return {
            totalAssets: assetRecords.length,
            lowStockItems,
            totalStock,
            activeCategories
        };
    }, [assetRecords]);

    const overviewSortOptions = [
        { key: 'name', label: 'Product Name', icon: renderIcon('Box', { size: 16 }) },
        { key: 'id', label: 'Item Code', icon: renderIcon('FileText', { size: 16 }) },
        { key: 'category', label: 'Category', icon: renderIcon('Layers', { size: 16 }) },
        { key: 'quantity', label: 'Stock', icon: renderIcon('Activity', { size: 16 }) },
        { key: 'status', label: 'Status', icon: renderIcon('AlertTriangle', { size: 16 }) },
        { key: 'warehouse', label: 'Warehouse', icon: renderIcon('Layers', { size: 16 }) }
    ];

    const transactionSortOptions = [
        { key: 'transactionId', label: 'TXN ID', icon: renderIcon('FileText', { size: 16 }) },
        { key: 'itemCode', label: 'Item Code', icon: renderIcon('Box', { size: 16 }) },
        { key: 'quantity', label: 'Qty Moved', icon: renderIcon('Activity', { size: 16 }) },
        { key: 'date', label: 'Date', icon: renderIcon('Calendar', { size: 16 }) },
        { key: 'user', label: 'Recorded By', icon: renderIcon('User', { size: 16 }) },
    ];

    const renderActionBar = () => {
        const selectedCount = isTableMode || !isOverview || activeView !== 'overview' ? selectedRows.length : 0;
        const canEdit = isInventoryDataView ? canEditInventory : canEditLogs;
        const canRemove = isInventoryDataView ? canRemoveInventory : canRemoveLogs;
        const canAdd = isInventoryDataView ? canAddInventory : canAddLogs;

        return (
            <div className="hub-action-bar">
                {/* 1. Selection State Overlay */}
                {selectedCount > 0 ? (
                    <div className="hub-selection-row">
                        <span className="selection-count">{selectedCount} row(s) selected</span>
                        <div className="hub-selection-actions">
                            {canEdit && (
                                <button
                                    className="tool-btn edit-btn"
                                    onClick={() => openPrompt(
                                        isInventoryDataView ? 'Edit Item' : (isInput ? 'Edit Input Log' : 'Edit Output Log'),
                                        isInventoryDataView ? 'edit-item' : 'edit-log',
                                        selectedRows
                                    )}
                                    disabled={selectedCount !== 1}
                                    style={{ opacity: selectedCount !== 1 ? 0.4 : 1 }}
                                >
                                    <Icons.Edit size={16} /> Edit
                                </button>
                            )}
                            {canRemove && (
                                <button
                                    className="tool-btn remove-btn"
                                    onClick={() => openPrompt(
                                        isInventoryDataView ? 'Delete Data' : (isInput ? 'Delete Input Logs' : 'Delete Output Logs'),
                                        isInventoryDataView ? 'remove-item' : 'remove-log',
                                        selectedRows
                                    )}
                                >
                                    <Icons.Trash size={16} /> Remove
                                </button>
                            )}
                            <button className="tool-btn" onClick={() => setSelectedRows([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="hub-action-row">
                        <div className="hub-action-left">
                            {/* View Tabs */}
                            <div className="hub-action-tabs">
                                <button
                                    className={`hub-tab-item ${activeView === 'overview' ? 'active' : ''}`}
                                    onClick={() => setActiveView('overview')}
                                >
                                    <Icons.Grid size={16} /> Overview
                                </button>
                                <button
                                    className={`hub-tab-item ${activeView === 'input' ? 'active' : ''}`}
                                    onClick={() => setActiveView('input')}
                                >
                                    <Icons.ArrowDownCircle size={16} /> Arrivals
                                </button>
                                <button
                                    className={`hub-tab-item ${activeView === 'output' ? 'active' : ''}`}
                                    onClick={() => setActiveView('output')}
                                >
                                    <Icons.ArrowUpCircle size={16} /> Shipments
                                </button>
                            </div>

                            <div className="hub-action-divider" />

                            <SortButton
                                options={isOverview ? overviewSortOptions : transactionSortOptions}
                                currentKey={sortConfig.key}
                                currentDirection={sortConfig.direction}
                                onSort={requestSort}
                            />

                            <div className="hub-action-search">
                                <Icons.Search size={18} className="hub-action-search-icon" />
                                <input
                                    type="text"
                                    className="search-bar hub-search-input"
                                    placeholder={isOverview ? 'Search assets...' : 'Search logs...'}
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="hub-action-right">
                            {/* Undo/Redo Stack Implementation */}
                            <div className="hub-history-controls" style={{ display: 'flex', gap: '0.25rem', marginRight: '0.5rem' }}>
                                <button
                                    className="tool-btn history-btn"
                                    onClick={onUndo}
                                    disabled={!canUndo}
                                    title="Undo action"
                                    style={{ opacity: canUndo ? 1 : 0.35 }}
                                >
                                    <Icons.Undo size={18} />
                                </button>
                                <button
                                    className="tool-btn history-btn"
                                    onClick={onRedo}
                                    disabled={!canRedo}
                                    title="Redo action"
                                    style={{ opacity: canRedo ? 1 : 0.35 }}
                                >
                                    <Icons.Redo size={18} />
                                </button>
                            </div>

                            <div className="hub-action-divider" />

                            {/* View Switchers */}
                            {isOverview && (
                                <div style={{ display: 'flex', gap: '0.35rem', marginRight: '0.5rem' }}>
                                    <button
                                        className={`display-toggle ${overviewDisplay === 'card' ? 'active' : ''}`}
                                        onClick={() => setOverviewDisplay('card')}
                                    >
                                        <Icons.Grid size={18} />
                                    </button>
                                    <button
                                        className={`display-toggle ${overviewDisplay === 'table' ? 'active' : ''}`}
                                        onClick={() => setOverviewDisplay('table')}
                                    >
                                        <Icons.List size={18} />
                                    </button>
                                </div>
                            )}

                            {canAdd && (
                                <button
                                    className="tool-btn add-btn hub-action-add"
                                    onClick={() => openPrompt(
                                        isInventoryDataView ? 'New Item' : 'New Log',
                                        isInventoryDataView ? 'add-item' : (isInput ? 'add-input-log' : 'add-output-log')
                                    )}
                                >
                                    <Icons.Plus size={16} /> {isInventoryDataView ? 'Product' : 'Log Txn'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderOverviewCards = () => (
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
            {processed.length === 0 ? (
                <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>No assets matched this filter.</div>
                    <div style={{ marginTop: '0.5rem' }}>Try a different keyword, warehouse, or add a new product.</div>
                </div>
            ) : (
                <div className="item-card-grid assets-card-grid" style={{ padding: '0.5rem 0 0' }}>
                    {processed.map((item) => {
                        const stockOnHand = parseFloat(item.quantity) || 0;
                        const effectiveOptimal = (isThresholdEnabled && lowStockThreshold)
                            ? parseFloat(lowStockThreshold)
                            : (parseFloat(item.optimalStock) || 0);
                        const imageSrc = item.imageUrl && typeof item.imageUrl === 'string' && !item.imageUrl.startsWith('data:')
                            ? window.AppDataHandler.getFileUrl(item, item.imageUrl)
                            : (item.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'P')}&background=random&size=200`);

                        return (
                            <div
                                key={item.id}
                                className="item-card"
                                onClick={() => openPrompt('Product Insights', 'product-stats', [item.id])}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="item-image-wrapper">
                                    <img src={imageSrc} alt={item.name} className="item-image" />
                                    <div className="item-status-overlay" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        <StatusBadge type="stock" value={item.status} />
                                        {getItemAutomationStatus(item.id) && (
                                            <div style={{ background: getItemAutomationStatus(item.id).color, color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.62rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                {renderIcon(getItemAutomationStatus(item.id).icon, { size: 10 })}
                                                {getItemAutomationStatus(item.id).label}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="item-details-box">
                                    <div className="item-header">
                                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</h3>
                                        <div className="item-code-tag">{item.id || 'N/A'} - {item.category || 'Category'}</div>
                                    </div>

                                    <p className="item-desc">{item.description || 'No description available.'}</p>

                                    <div className="card-item-labels" style={{ marginTop: '0.9rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {getAssetFamily(item) === 'Products' ? (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    padding: '0.25rem 0.6rem',
                                                    background: 'rgba(99, 102, 241, 0.08)',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(99, 102, 241, 0.15)',
                                                    cursor: item.customer ? 'pointer' : 'default'
                                                }}
                                                onClick={(e) => {
                                                    if (!item.customer) return;
                                                    e.stopPropagation();
                                                    const c = customerData.find(c => c.id === item.customer);
                                                    if (c) openPrompt('Partner Details', 'customer-details', [c.name]);
                                                }}
                                            >
                                                <Icons.Users size={12} style={{ color: 'var(--accent-color)' }} />
                                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                                                    {item.customer ? (customerData.find(c => c.id === item.customer)?.name || 'Linked Customer') : 'Open distribution'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    padding: '0.25rem 0.6rem',
                                                    background: 'var(--hover-bg)',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--border-color)',
                                                    cursor: item.supplier ? 'pointer' : 'default'
                                                }}
                                                onClick={(e) => {
                                                    if (!item.supplier) return;
                                                    e.stopPropagation();
                                                    const s = supplierData.find(s => s.id === item.supplier);
                                                    if (s) openPrompt('Partner Details', 'supplier-details', [s.name]);
                                                }}
                                            >
                                                <Icons.Truck size={12} style={{ color: 'var(--text-secondary)' }} />
                                                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                    {item.supplier ? (supplierData.find(s => s.id === item.supplier)?.name || 'Linked Supplier') : 'Sourcing pending'}
                                                </span>
                                            </div>
                                        )}
                                        <StatusBadge type="simple" value={item.category} />
                                        <span className="assets-inline-chip">{item.warehouse || 'Unassigned'}</span>
                                    </div>

                                    <div className="item-stock-row">
                                        <div>
                                            <div className="stock-label">Stock on Hand</div>
                                            <div className="stock-val">{formatStockQuantity(stockOnHand)} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{item.uom}</span></div>
                                        </div>
                                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '0.75rem' }}>
                                            <div className="stock-label">Optimal Level</div>
                                            <div className="stock-val" style={{ color: (isThresholdEnabled && lowStockThreshold) ? 'var(--accent-color)' : 'inherit' }}>
                                                {formatStockQuantity(effectiveOptimal)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.6rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                                        {!hasRes('EditItems') && (
                                            <button
                                                className="action-icon-btn"
                                                title="Edit Item"
                                                onClick={(e) => { e.stopPropagation(); openPrompt('Edit Inventory Item', 'edit-item', [item.id]); }}
                                            >
                                                <Icons.Edit size={16} />
                                            </button>
                                        )}
                                        {!hasRes('RemoveItems') && (
                                            <button
                                                className="action-icon-btn danger-hover"
                                                title="Delete Item"
                                                onClick={(e) => { e.stopPropagation(); openPrompt('Delete Item', 'remove-item', [item.id]); }}
                                            >
                                                <Icons.Trash size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderOverviewTable = () => (
        <table className="inventory-table">
            <thead>
                <tr className="header-row">
                    <th className="checkbox-col" onClick={() => {
                        if (selectedRows.length === processed.length && processed.length > 0) setSelectedRows([]);
                        else setSelectedRows(processed.map(r => r.id));
                    }}>
                        <input type="checkbox" checked={selectedRows.length === processed.length && processed.length > 0} readOnly />
                    </th>
                    <th onClick={() => requestSort('id')}>Item Code <SortIndicator columnKey="id" /></th>
                    <th onClick={() => requestSort('name')}>Product Name <SortIndicator columnKey="name" /></th>
                    <th onClick={() => requestSort('category')}>Category <SortIndicator columnKey="category" /></th>
                    <th onClick={() => requestSort('quantity')}>Stock <SortIndicator columnKey="quantity" /></th>
                    <th>Partner Relationship</th>
                    <th onClick={() => requestSort('status')}>Status <SortIndicator columnKey="status" /></th>
                    <th onClick={() => requestSort('warehouse')}>Warehouse <SortIndicator columnKey="warehouse" /></th>
                </tr>
            </thead>
            <tbody>
                <TableMessage colSpan="8" dbError={dbError} isEmpty={processed.length === 0} emptyMessage="No matching records found." />
                {processed.map((item) => {
                    const isSelected = selectedRows.includes(item.id);
                    return (
                        <tr key={item.id} className={`data-row ${isSelected ? 'selected' : ''}`} onClick={() => toggleRow(item.id)}>
                            <td className="checkbox-col"><input type="checkbox" checked={isSelected} readOnly /></td>
                            <td className="item-id">{item.id}</td>
                            <td style={{ fontWeight: '600' }}>
                                <button type="button" onClick={(e) => { e.stopPropagation(); openPrompt('Product Insights', 'product-stats', [item.id]); }} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--accent-color)', fontWeight: '700', cursor: 'pointer' }}>
                                    {item.name}
                                </button>
                            </td>
                            <td><StatusBadge type="simple" value={item.category} /></td>
                            <td style={{ fontWeight: '700' }}>{formatStockQuantity(item.quantity)} <span style={{ fontSize: '0.7em', opacity: 0.6 }}>{item.uom}</span></td>
                            <td>
                                {getAssetFamily(item) === 'Products' ? (
                                    item.customer ? (
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                                            onClick={(e) => { e.stopPropagation(); const c = customerData.find(c => c.id === item.customer); if (c) openPrompt('Partner Details', 'customer-details', [c.name]); }}
                                        >
                                            <Icons.Users size={14} style={{ color: 'var(--accent-color)', opacity: 0.8 }} />
                                            <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{customerData.find(c => c.id === item.customer)?.name || 'Linked Customer'}</span>
                                        </div>
                                    ) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No Customer</span>
                                ) : (
                                    item.supplier ? (
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                                            onClick={(e) => { e.stopPropagation(); const s = supplierData.find(s => s.id === item.supplier); if (s) openPrompt('Partner Details', 'supplier-details', [s.name]); }}
                                        >
                                            <Icons.Truck size={14} style={{ color: 'var(--text-secondary)' }} />
                                            <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{supplierData.find(s => s.id === item.supplier)?.name || 'Linked Supplier'}</span>
                                        </div>
                                    ) : <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No Supplier</span>
                                )}
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <StatusBadge type="stock" value={item.status} />
                                    {getItemAutomationStatus(item.id) && (
                                        <div title={getItemAutomationStatus(item.id).label} style={{ color: getItemAutomationStatus(item.id).color }}>
                                            {renderIcon(getItemAutomationStatus(item.id).icon, { size: 14 })}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td>{item.warehouse}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    return (
        <div className="list-box assets-workspace">
            <div className="assets-hero">
                <div>
                    <div className="assets-eyebrow">Assets Hub</div>
                    <h1 className="assets-title">Assets</h1>
                    <p className="assets-copy">Overview for product discovery, plus arrivals and shipments in one workspace.</p>

                    {/* High-Hierarchy Global Filters */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
                        {/* 1. Location Filters (Warehouses) */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginRight: '0.5rem', opacity: 0.6 }}>Locations</span>
                            {availableWarehouses.map(w => (
                                <button
                                    key={w}
                                    onClick={() => setActiveWarehouseFilter(w)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '20px',
                                        border: '1px solid ' + (activeWarehouseFilter === w ? 'var(--accent-color)' : 'var(--border-color)'),
                                        background: activeWarehouseFilter === w ? 'var(--accent-color)' : 'transparent',
                                        color: activeWarehouseFilter === w ? 'white' : 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: activeWarehouseFilter === w ? '0 4px 12px rgba(99,102,241,0.2)' : 'none'
                                    }}
                                >
                                    {w === 'All' ? 'All Locations' : w}
                                </button>
                            ))}
                        </div>

                        {/* 2. Type Filters (Asset Families) & Sort */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginRight: '0.5rem', opacity: 0.6 }}>Filter by</span>
                            {assetFamilyOptions.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setActiveAssetFamily(t)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '20px',
                                        border: '1px solid ' + (activeAssetFamily === t ? 'var(--accent-color)' : 'var(--border-color)'),
                                        background: activeAssetFamily === t ? 'var(--accent-color)' : 'transparent',
                                        color: activeAssetFamily === t ? 'white' : 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t === 'All' ? 'All Types' : t}
                                </button>
                            ))}

                        </div>
                    </div>
                </div>
                <div className="assets-summary-grid">
                    <div className="assets-summary-card">
                        <span className="assets-summary-label">Products</span>
                        <strong>{assetSummary.totalAssets}</strong>
                    </div>
                    <div className="assets-summary-card">
                        <span className="assets-summary-label">Low Stock</span>
                        <strong>{assetSummary.lowStockItems}</strong>
                    </div>
                    <div className="assets-summary-card">
                        <span className="assets-summary-label">Categories</span>
                        <strong>{assetSummary.activeCategories}</strong>
                    </div>
                    <div className="assets-summary-card">
                        <span className="assets-summary-label">Units on Hand</span>
                        <strong>{formatStockQuantity(assetSummary.totalStock)}</strong>
                    </div>
                </div>
            </div>

            {/* The single powerful Action Bar */}
            {renderActionBar()}

            {/* Automation Ribbon — passive, collapsible, dismissible */}
            {isOverview && automation && (
                <div style={{ padding: '0 2rem' }}>
                    <AutomationRibbon automation={automation} context="assets" openPrompt={openPrompt} />
                </div>
            )}

            {isOverview ? (
                isTableMode ? renderOverviewTable() : renderOverviewCards()
            ) : (
                <table className="inventory-table">
                    <thead>
                        <tr className="header-row">
                            <th
                                className="checkbox-col"
                                style={{ textAlign: 'center' }}
                                onClick={() => {
                                    if (selectedRows.length === processed.length && processed.length > 0) {
                                        setSelectedRows([]);
                                    } else {
                                        setSelectedRows(processed.map((record) => record.transactionId));
                                    }
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedRows.length === processed.length && processed.length > 0}
                                    style={{ pointerEvents: 'none' }}
                                    readOnly
                                />
                            </th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('transactionId')}>TXN ID <SortIndicator columnKey="transactionId" /></th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('itemCode')}>Item Code <SortIndicator columnKey="itemCode" /></th>
                            <th>Product</th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('quantity')}>Qty Moved <SortIndicator columnKey="quantity" /></th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('date')}>Date <SortIndicator columnKey="date" /></th>
                            <th style={{ cursor: 'pointer' }} onClick={() => requestSort('user')}>Recorded By <SortIndicator columnKey="user" /></th>
                            <th>Batch / Lot No.</th>
                        </tr>
                    </thead>
                    <tbody>
                        <TableMessage colSpan="8" dbError={dbError} isEmpty={processed.length === 0} emptyMessage="No matching records found." />
                        {processed.map((item) => {
                            const rowId = item.transactionId;
                            const isSelected = selectedRows.includes(rowId);
                            return (
                                <tr key={rowId} className={`data-row ${isSelected ? 'selected' : ''}`} onClick={() => toggleRow(rowId)}>
                                    <td className="checkbox-col"><input type="checkbox" checked={isSelected} readOnly /></td>
                                    <td className="item-id">{item.transactionId}</td>
                                    <td className="item-id" style={{ opacity: 0.7 }}>{item.itemCode}</td>
                                    <td style={{ fontWeight: '600' }}>{item.itemName}</td>
                                    <td style={{ fontWeight: '700' }}>{isInput ? '+' : '-'}{formatStockQuantity(item.quantity)}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.date}</td>
                                    <td style={{ fontSize: '0.85rem' }}>{item.user || item.userName || 'System'}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{item.batchNo || item.batch || item.lotNumber || '—'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const ItemList = ({ inventoryData = [], openPrompt, lowStockThreshold, isThresholdEnabled, user, supplierData = [], customerData = [], outputLogs = [], inputLogs = [] }) => {
    const { SortButton, StatusBadge, AppDataHandler } = window;
    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};

    const automation = window.useAutomationEngine
        ? window.useAutomationEngine(inventoryData, supplierData, customerData, outputLogs, user?.settings || {}, inputLogs)
        : null;

    const getItemAutomationStatus = (itemId) => {
        if (!automation) return null;
        const id = String(itemId);
        if (automation.criticalItems.some(i => String(i.id) === id)) return { label: 'Urgent', color: '#ef4444', icon: 'Zap' };
        if (automation.staleRestocks.some(i => String(i.id) === id)) return { label: 'Follow-up', color: '#ef4444', icon: 'Clock' };
        if (automation.predictiveItems.some(i => String(i.id) === id)) return { label: 'Forecast', color: '#8b5cf6', icon: 'TrendingDown' };
        if (automation.dataIssues.some(i => String(i.id) === id)) return { label: 'Setup', color: '#f59e0b', icon: 'Settings' };
        if (automation.dormantStock.some(i => String(i.id) === id)) return { label: 'Dormant', color: '#64748b', icon: 'Archive' };
        return null;
    };

    const renderIcon = (name, props = {}) => {
        const Icon = Icons[name] || (() => null);
        return <Icon {...props} />;
    };

    const { getFileUrl } = AppDataHandler;

    const hasRes = (action) => {
        if (!user || user.role === 'Administrator') return false;
        return (user.restrictions || []).includes(action);
    };

    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState('All');

    const categories = ['All', ...new Set(inventoryData.map((i) => i.category).filter(Boolean))].sort();

    const baseFiltered = React.useMemo(() => {
        return inventoryData.filter((item) => {
            const sq = searchQuery.toLowerCase();
            const matchesSearch = item.name.toLowerCase().includes(sq) || (item.id || '').toLowerCase().includes(sq);
            const matchesCat = filterCategory === 'All' || item.category === filterCategory;
            return matchesSearch && matchesCat;
        });
    }, [inventoryData, searchQuery, filterCategory]);

    const { sortedData: filtered, requestSort, sortConfig } = window.useSorting(baseFiltered, '', 'asc');

    const SORT_OPTIONS = [
        { key: 'name', label: 'Product Name', icon: <Icons.Box style={{ width: 16, height: 16 }} /> },
        { key: 'quantity', label: 'Stock on Hand', icon: <Icons.Activity style={{ width: 16, height: 16 }} /> },
        { key: 'status', label: 'Stock Status', icon: <Icons.AlertTriangle style={{ width: 16, height: 16 }} /> },
        { key: 'isRestocked', label: 'Restock Progress', icon: <Icons.Truck style={{ width: 16, height: 16 }} /> }
    ];

    return (
        <div className="item-list-container">
            <div className="list-controls" style={{ padding: '2.2rem 2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                <div className="auth-input-wrapper" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Icons.Search style={{ position: 'absolute', left: '1rem', opacity: 0.5, pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="auth-input"
                        style={{ paddingLeft: '3rem', margin: 0, width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    className="auth-input"
                    style={{ width: '200px', margin: 0 }}
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <SortButton options={SORT_OPTIONS} currentKey={sortConfig.key} currentDirection={sortConfig.direction} onSort={requestSort} />

                {!hasRes('AddItems') && (
                    <button
                        className="auth-btn-primary"
                        style={{ padding: '0.6rem 1.25rem', margin: 0, width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                        onClick={() => openPrompt('New Item', 'add-item')}
                    >
                        <Icons.Plus size={18} /> Add Product
                    </button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>Box</div>
                    <p>No products found matching your criteria.</p>
                </div>
            ) : (
                <div className="item-card-grid">
                    {filtered.map((item) => {
                        const stockOnHand = parseFloat(item.quantity) || 0;
                        const effectiveOptimal = (isThresholdEnabled && lowStockThreshold) ? parseFloat(lowStockThreshold) : (parseFloat(item.optimalStock) || 0);
                        const isLow = stockOnHand < effectiveOptimal;
                        const status = isLow ? 'Reorder' : 'Okay';

                        return (
                            <div key={item.id} className="item-card" onClick={() => openPrompt('Product Insights', 'product-stats', [item.id])} style={{ cursor: 'pointer' }}>
                                <div className="item-image-wrapper">
                                    <img
                                        src={item.imageUrl && typeof item.imageUrl === 'string' && !item.imageUrl.startsWith('data:')
                                            ? getFileUrl(item, item.imageUrl)
                                            : (item.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'P')}&background=random&size=200`)}
                                        alt={item.name}
                                        className="item-image"
                                    />
                                    <div className="item-status-overlay" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                        <StatusBadge type="stock" value={status} />
                                        {getItemAutomationStatus(item.id) && (
                                            <div style={{ background: getItemAutomationStatus(item.id).color, color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.62rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {renderIcon(getItemAutomationStatus(item.id).icon, { size: 10 })}
                                                {getItemAutomationStatus(item.id).label}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="item-details-box">
                                    <div className="item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</h3>
                                            <div className="item-code-tag">{item.id || 'N/A'} - {item.category || 'Category'}</div>
                                        </div>
                                        {!hasRes('EditItems') && (
                                            <button
                                                title="Edit Item"
                                                onClick={(e) => { e.stopPropagation(); openPrompt('Edit Inventory Item', 'edit-item', [item.id]); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.5, padding: '0.2rem', display: 'flex' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--accent-color)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = 'var(--text-secondary)'; }}
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

window.ItemList = ItemList;
window.Assets = Assets;
window.Inventory = Assets;
window.InventoryTable = Assets;
