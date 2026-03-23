/**
 * Inventory Table Component
 * A unified table shell for Overview and Transaction Logs.
 * Uses the new 'Stock on Hand' vs 'Optimal Stock' system.
 */

const InventoryTable = ({
    openPrompt,
    inventoryData = [],
    inputLogs = [],
    outputLogs = [],
    dbError
}) => {

    const [selectedRows, setSelectedRows]   = React.useState([]);
    const [searchQuery,  setSearchQuery]    = React.useState('');
    const [activeView,   setActiveView]     = React.useState('overview');
    const [sortKey,      setSortKey]        = React.useState('');
    const [activeWarehouseFilter, setActiveWarehouseFilter] = React.useState('All');

    React.useEffect(() => {
        setSelectedRows([]);
        setSearchQuery('');
        setSortKey('');
    }, [activeView, inventoryData]);

    const isOverview = activeView === 'overview';
    const isInput    = activeView === 'input';

    const SORT_OPTIONS = isOverview ? [
        { key: 'name-asc',  label: 'Name A-Z', icon: <window.SortAZIcon /> },
        { key: 'name-desc', label: 'Name Z-A', icon: <window.SortZAIcon /> },
        { key: 'qty-low',   label: 'Stock: Low → High', icon: <window.TrendingDownIcon /> },
        { key: 'qty-high',  label: 'Stock: High → Low', icon: <window.TrendingUpIcon /> }
    ] : [
        { key: 'date-new',  label: 'Newest Log', icon: <window.ArrowDownCircleIcon /> },
        { key: 'date-old',  label: 'Oldest Log', icon: <window.ArrowUpCircleIcon /> },
        { key: 'qty-high',  label: 'Quantity: High', icon: <window.TrendingUpIcon /> },
        { key: 'qty-low',   label: 'Quantity: Low', icon: <window.TrendingDownIcon /> }
    ];

    const processed = React.useMemo(() => {
        let base = [];
        if (isOverview) {
            base = inventoryData.map(i => ({
                ...i,
                status: (parseFloat(i.quantity) || 0) < (parseFloat(i.optimalStock) || 0) ? 'Reorder' : 'Okay'
            }));
        } else {
            // Logs don't have warehouse property natively, lookup from inventory
            const logs = isInput ? inputLogs : outputLogs;
            base = logs.map(log => {
                const item = inventoryData.find(i => i.id === log.itemCode);
                return { ...log, warehouse: item ? item.warehouse : 'Unassigned' };
            });
        }

        const sq = searchQuery.toLowerCase();
        let filtered = base.filter(i => {
            const matchesSearch = (i.name || i.itemName || '').toLowerCase().includes(sq) || (i.id || i.itemCode || '').toLowerCase().includes(sq);
            const matchesWarehouse = activeWarehouseFilter === 'All' || i.warehouse === activeWarehouseFilter;
            return matchesSearch && matchesWarehouse;
        });

        if (sortKey) {
            filtered.sort((a, b) => {
                if (sortKey === 'name-asc') return (a.name || '').localeCompare(b.name || '');
                if (sortKey === 'name-desc') return (b.name || '').localeCompare(a.name || '');
                if (sortKey === 'qty-low') return (parseFloat(a.quantity) || 0) - (parseFloat(b.quantity) || 0);
                if (sortKey === 'qty-high') return (parseFloat(b.quantity) || 0) - (parseFloat(a.quantity) || 0);
                if (sortKey === 'date-new') return new Date(b.date || 0) - new Date(a.date || 0);
                if (sortKey === 'date-old') return new Date(a.date || 0) - new Date(b.date || 0);
                return 0;
            });
        }
        return filtered;
    }, [isOverview, isInput, inventoryData, inputLogs, outputLogs, searchQuery, activeWarehouseFilter, sortKey]);

    const toggleRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    
    // Extract unique warehouses for filter dropdown
    const availableWarehouses = ['All', ...new Set(inventoryData.map(i => i.warehouse).filter(Boolean))].sort();

    return (
        <div className="list-box">
            {availableWarehouses.length > 0 && (
                <div className="location-pills">
                    {availableWarehouses.map(w => (
                        <button 
                            key={w} 
                            className={`location-pill ${activeWarehouseFilter === w ? 'active' : ''}`}
                            onClick={() => setActiveWarehouseFilter(w)}
                        >
                            {w === 'All' ? 'All Locations' : w}
                        </button>
                    ))}
                </div>
            )}
            <TableToolbar
                selectedCount={selectedRows.length}
                onEdit={() => openPrompt(isOverview ? 'Edit Item' : 'Edit Log', isOverview ? 'edit-item' : 'edit-log', selectedRows)}
                onRemove={() => openPrompt('Delete Data', isOverview ? 'remove-item' : 'remove-log', selectedRows)}
                onAdd={() => openPrompt(isOverview ? 'New Item' : 'New Log', isOverview ? 'add-item' : (isInput ? 'add-input-log' : 'add-output-log'))}
                addLabel={isOverview ? 'Add Product' : 'Log Transaction'}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortOptions={SORT_OPTIONS}
                currentSortKey={sortKey}
                onSortChange={setSortKey}
                filterElement={null}
                viewSwitcher={(
                    <window.ViewSwitcher 
                        activeView={activeView} 
                        setActiveView={setActiveView} 
                        options={[
                            { key: 'overview', label: 'Overview' },
                            { key: 'input',    label: 'Arrivals' },
                            { key: 'output',   label: 'Shipments' }
                        ]} 
                    />
                )}
            />

            <table className="inventory-table">
                <thead>
                    <tr className="header-row" style={{ cursor: 'pointer' }} onClick={() => {
                        if (selectedRows.length === processed.length && processed.length > 0) {
                            setSelectedRows([]);
                        } else {
                            setSelectedRows(processed.map(p => p.id));
                        }
                    }}>
                        <th className="checkbox-col" style={{ textAlign: 'center' }}>
                             <input 
                                type="checkbox" 
                                checked={selectedRows.length === processed.length && processed.length > 0} 
                                style={{ pointerEvents: 'none' }}
                                readOnly
                            />
                        </th>
                        {isOverview ? (
                            <>
                                <th>Item Code</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Stock on Hand</th>
                                <th>Optimal Stock</th>
                                <th>Status</th>
                                <th>Restocked?</th>
                                <th>Warehouse</th>
                            </>
                        ) : (
                            <>
                                <th>TXN ID</th>
                                <th>Item Code</th>
                                <th>Qty Moved</th>
                                <th>Date</th>
                                <th>Handler / Supplier</th>
                                <th>Batch / LOT</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    <TableMessage colSpan="10" dbError={dbError} isEmpty={processed.length === 0} emptyMessage="No matching records found." />
                    {processed.map(item => {
                        const isSelected = selectedRows.includes(item.id);
                        return (
                            <tr key={item.id} className={`data-row ${isSelected ? 'selected' : ''}`} onClick={() => toggleRow(item.id)}>
                                <td className="checkbox-col"><input type="checkbox" checked={isSelected} readOnly /></td>
                                {isOverview ? (
                                    <>
                                        <td className="item-id">{item.id}</td>
                                        <td style={{ fontWeight: '600' }}>{item.name}</td>
                                        <td><span className="status-badge" style={{ background: 'var(--hover-bg)' }}>{item.category}</span></td>
                                        <td style={{ fontWeight: '700' }}>{item.quantity} <span style={{ fontSize: '0.7em', opacity: 0.6 }}>{item.uom}</span></td>
                                        <td>{item.optimalStock || 0}</td>
                                        <td><span className={`status-badge ${item.status === 'Reorder' ? 'reorder' : 'okay'}`}>{item.status}</span></td>
                                        <td><span className="status-badge" style={{ 
                                            background: item.isRestocked === 'Yes' ? 'rgba(16, 185, 129, 0.1)' : (item.isRestocked === 'I' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)'), 
                                            color: item.isRestocked === 'Yes' ? 'var(--success)' : (item.isRestocked === 'I' ? 'var(--accent-color)' : 'var(--danger)') 
                                        }}>{item.isRestocked || 'No'}</span></td>
                                        <td>{item.warehouse}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="item-id">{item.transactionId}</td>
                                        <td className="item-id" style={{ opacity: 0.7 }}>{item.itemCode}</td>
                                        <td style={{ fontWeight: '700' }}>{isInput ? '+' : '−'}{item.quantity}</td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.date}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{item.supplier || '—'}</td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.batchLot || '—'}</td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
