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
    dbError,
    user,
    lowStockThreshold,
    isThresholdEnabled
}) => {
    const { StatusBadge } = window;
    const [selectedRows, setSelectedRows]   = React.useState([]);
    const [searchQuery,  setSearchQuery]    = React.useState('');
    const [activeView,   setActiveView]     = React.useState('overview');
    const [activeWarehouseFilter, setActiveWarehouseFilter] = React.useState('All');

    React.useEffect(() => {
        setSelectedRows([]);
        setSearchQuery('');
    }, [activeView, inventoryData]);

    const isOverview = activeView === 'overview';
    const isInput    = activeView === 'input';

    const baseProcessed = React.useMemo(() => {
        let base = [];
        if (isOverview) {
            base = inventoryData.map(i => {
                const stock = parseFloat(i.quantity) || 0;
                const threshold = (isThresholdEnabled && lowStockThreshold) ? parseFloat(lowStockThreshold) : (parseFloat(i.optimalStock) || 0);
                return {
                    ...i,
                    status: stock < threshold ? 'Reorder' : 'Okay'
                };
            });
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
            const matchesSearch = (i.name || i.productName || i.itemName || '').toLowerCase().includes(sq) || (i.id || i.itemCode || '').toLowerCase().includes(sq);
            const matchesWarehouse = activeWarehouseFilter === 'All' || i.warehouse === activeWarehouseFilter;
            return matchesSearch && matchesWarehouse;
        });

        return filtered;
    }, [isOverview, isInput, inventoryData, inputLogs, outputLogs, searchQuery, activeWarehouseFilter]);

    const { sortedData: processed, requestSort, SortIndicator } = window.useSorting(baseProcessed, isOverview ? 'name' : 'date', isOverview ? 'asc' : 'desc');

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
                sortOptions={[]}
                filterElement={null}
                user={user}
                restrictionScope={isOverview ? 'Items' : 'Logs'}
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
                    <tr className="header-row">
                        <th className="checkbox-col" style={{ textAlign: 'center' }} onClick={() => {
                            if (selectedRows.length === processed.length && processed.length > 0) {
                                setSelectedRows([]);
                            } else {
                                setSelectedRows(processed.map(p => p.id));
                            }
                        }}>
                             <input 
                                type="checkbox" 
                                checked={selectedRows.length === processed.length && processed.length > 0} 
                                style={{ pointerEvents: 'none' }}
                                readOnly
                            />
                        </th>
                        {isOverview ? (
                            <>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('id')}>Item Code <SortIndicator columnKey="id" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('name')}>Product Name <SortIndicator columnKey="name" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('category')}>Category <SortIndicator columnKey="category" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('quantity')}>Stock on Hand <SortIndicator columnKey="quantity" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('optimalStock')}>Optimal Stock <SortIndicator columnKey="optimalStock" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('status')}>Status <SortIndicator columnKey="status" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('isRestocked')}>Restocked? <SortIndicator columnKey="isRestocked" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('warehouse')}>Warehouse <SortIndicator columnKey="warehouse" /></th>
                            </>
                        ) : (
                            <>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('transactionId')}>TXN ID <SortIndicator columnKey="transactionId" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('itemCode')}>Item Code <SortIndicator columnKey="itemCode" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('quantity')}>Qty Moved <SortIndicator columnKey="quantity" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('date')}>Date <SortIndicator columnKey="date" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('supplier')}>Handler / Supplier <SortIndicator columnKey="supplier" /></th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('batchLot')}>Batch / LOT <SortIndicator columnKey="batchLot" /></th>
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
                                        <td><StatusBadge type="simple" value={item.category} /></td>
                                        <td style={{ fontWeight: '700' }}>{item.quantity} <span style={{ fontSize: '0.7em', opacity: 0.6 }}>{item.uom}</span></td>
                                        <td style={{ color: (isThresholdEnabled && lowStockThreshold) ? 'var(--accent-color)' : 'inherit' }}>
                                            {(isThresholdEnabled && lowStockThreshold) ? lowStockThreshold : (item.optimalStock || 0)}
                                            {(isThresholdEnabled && lowStockThreshold) && <span style={{ fontSize: '0.65rem', display: 'block', opacity: 0.7 }}>(Global)</span>}
                                        </td>
                                        <td><StatusBadge type="stock" value={item.status} /></td>
                                        <td><StatusBadge type="stock" value={item.isRestocked === 'Yes' ? 'Restocked' : (item.isRestocked === 'I' ? 'Restock (I)' : 'To Restock')} /></td>
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
