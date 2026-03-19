/*
 * Inventory Table Component
 * A unified table shell for Overview, Input Logs, and Output Logs.
 */

const InventoryTable = ({
    openPrompt,
    inventoryData,
    inputLogs,
    outputLogs,
    lowStockThreshold,
    isThresholdEnabled,
    activeWarehouseFilter
}) => {

    // local state
    const [selectedRows, setSelectedRows]   = React.useState([]);
    const [searchQuery,  setSearchQuery]    = React.useState('');
    const [activeView,   setActiveView]     = React.useState('overview');
    const [sortKey,      setSortKey]        = React.useState('');

    // clear selections and sort on view or filter change
    React.useEffect(() => {
        setSelectedRows([]);
        setSearchQuery('');
        setSortKey('');
    }, [activeView, inventoryData, activeWarehouseFilter]);

    // dynamic sort options based on view
    const uniqueWarehouses = [...new Set(inventoryData.map(i => i.warehouse).filter(Boolean))].sort();

    const OVERVIEW_SORT_OPTIONS = [
        { key: 'id-asc',    label: 'Item ID: A → Z' },
        { key: 'id-desc',   label: 'Item ID: Z → A' },
        { key: 'name-asc',  label: 'Item Name: A → Z' },
        { key: 'name-desc', label: 'Item Name: Z → A' },
        { key: 'cat-asc',   label: 'Category: A → Z' },
        { key: 'cat-desc',  label: 'Category: Z → A' },
        { key: 'qty-asc',   label: 'Quantity: Low → High' },
        { key: 'qty-desc',  label: 'Quantity: High → Low' },
        { key: 'status',    label: 'Status: Low Stock First' },
        { key: 'sup-asc',   label: 'Supplier: A → Z' },
        { key: 'sup-desc',  label: 'Supplier: Z → A' },
        ...uniqueWarehouses.map(wh => ({ key: `wh:${wh}`, label: `Warehouse: ${wh} First` })),
    ];

    const LOG_SORT_OPTIONS = [
        { key: 'txn-asc',   label: 'Transaction ID: A → Z' },
        { key: 'txn-desc',  label: 'Transaction ID: Z → A' },
        { key: 'name-asc',  label: 'Item Name: A → Z' },
        { key: 'name-desc', label: 'Item Name: Z → A' },
        { key: 'qty-asc',   label: 'Quantity: Low → High' },
        { key: 'qty-desc',  label: 'Quantity: High → Low' },
        { key: 'date-asc',  label: 'Date: Oldest First' },
        { key: 'date-desc', label: 'Date: Newest First' },
        { key: 'sup-asc',   label: 'Supplier: A → Z' },
        { key: 'sup-desc',  label: 'Supplier: Z → A' },
    ];

    const currentSortOptions = activeView === 'overview' ? OVERVIEW_SORT_OPTIONS : LOG_SORT_OPTIONS;

    // sort application
    const applySort = (data, key) => {
        if (!key) return data;
        const arr = [...data];
        const localeAsc  = (a, b) => (a || '').localeCompare(b || '');
        const localeDesc = (a, b) => (b || '').localeCompare(a || '');

        if (key === 'id-asc')    return arr.sort((a, b) => localeAsc(a.id, b.id));
        if (key === 'id-desc')   return arr.sort((a, b) => localeDesc(a.id, b.id));
        if (key === 'txn-asc')   return arr.sort((a, b) => localeAsc(a.transactionId, b.transactionId));
        if (key === 'txn-desc')  return arr.sort((a, b) => localeDesc(a.transactionId, b.transactionId));
        if (key === 'name-asc')  return arr.sort((a, b) => localeAsc(a.name, b.name));
        if (key === 'name-desc') return arr.sort((a, b) => localeDesc(a.name, b.name));
        if (key === 'cat-asc')   return arr.sort((a, b) => localeAsc(a.category, b.category));
        if (key === 'cat-desc')  return arr.sort((a, b) => localeDesc(a.category, b.category));
        if (key === 'qty-asc')   return arr.sort((a, b) => (parseFloat(a.quantity) || 0) - (parseFloat(b.quantity) || 0));
        if (key === 'qty-desc')  return arr.sort((a, b) => (parseFloat(b.quantity) || 0) - (parseFloat(a.quantity) || 0));
        if (key === 'status')    return arr.sort((a, b) => ((a.status === 'Low Stock' ? 0 : 1) - (b.status === 'Low Stock' ? 0 : 1)));
        if (key === 'date-asc')  return arr.sort((a, b) => new Date(a.date) - new Date(b.date));
        if (key === 'date-desc') return arr.sort((a, b) => new Date(b.date) - new Date(a.date));
        if (key === 'sup-asc')   return arr.sort((a, b) => localeAsc(a.supplier, b.supplier));
        if (key === 'sup-desc')  return arr.sort((a, b) => localeDesc(a.supplier, b.supplier));
        
        if (key.startsWith('wh:')) {
            const target = key.slice(3);
            return arr.sort((a, b) => {
                if (a.warehouse === target && b.warehouse !== target) return -1;
                if (b.warehouse === target && a.warehouse !== target) return  1;
                return (a.warehouse || '').localeCompare(b.warehouse || '');
            });
        }
        return arr;
    };

    // view-specific computed data
    const isOverview = activeView === 'overview';
    const isInput    = activeView === 'input';
    
    // items allowed by warehouse filter
    const warehouseFilteredInventory = activeWarehouseFilter === 'All' 
        ? inventoryData 
        : inventoryData.filter(i => i.warehouse === activeWarehouseFilter);
    const validItemCodes = new Set(warehouseFilteredInventory.map(i => i.id));

    let processedData = [];
    if (isOverview) {
        processedData = warehouseFilteredInventory.map(item => ({
            ...item,
            status: (isThresholdEnabled && (parseFloat(item.quantity) || 0) <= lowStockThreshold) ? 'Low Stock' : 'In Stock'
        }));
    } else {
        const sourceLogs = isInput ? inputLogs : outputLogs;
        processedData = activeWarehouseFilter === 'All' ? sourceLogs : sourceLogs.filter(l => validItemCodes.has(l.itemCode));
    }

    // search and sort
    const sq = searchQuery.toLowerCase();
    const filteredData = applySort(processedData.filter(item => {
        if (isOverview) {
            return (item.id.toLowerCase().includes(sq) || item.name.toLowerCase().includes(sq) || item.category.toLowerCase().includes(sq) || item.status.toLowerCase().includes(sq) || item.warehouse.toLowerCase().includes(sq) || (item.supplier || '').toLowerCase().includes(sq));
        } else {
            return ((item.transactionId || '').toLowerCase().includes(sq) || (item.itemCode || '').toLowerCase().includes(sq) || (item.itemName || '').toLowerCase().includes(sq) || (item.supplier || '').toLowerCase().includes(sq) || (item.batchLot || '').toLowerCase().includes(sq) || (item.date || '').toLowerCase().includes(sq));
        }
    }), sortKey);

    const toggleRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    const toggleAll = () => setSelectedRows(selectedRows.length === filteredData.length && filteredData.length > 0 ? [] : filteredData.map(i => i.id));

    // view-specific toolbar configurations
    const addPromptTitle = isOverview ? 'Add Item' : (isInput ? 'Add Input Entry' : 'Add Output Entry');
    const addPromptType  = isOverview ? 'add-item' : (isInput ? 'add-input-log' : 'add-output-log');
    const editPromptTitle= isOverview ? 'Edit Item' : (isInput ? 'Edit Input Entry' : 'Edit Output Entry');
    const editPromptType = isOverview ? 'edit-item' : (isInput ? 'edit-input-log' : 'edit-output-log');
    const removePromptType = isOverview ? 'remove-item' : (isInput ? 'remove-input-log' : 'remove-output-log');
    const removeBtnLabel = isOverview ? 'Remove Item' : `Remove ${isInput ? 'Input' : 'Output'} Log`;
    const searchPlaceholder = isOverview ? 'Search items...' : `Search ${isInput ? 'input' : 'output'} log...`;

    return (
        <div className="list-box">
            <table className="inventory-table">
                <thead>
                    <tr className="management-row">
                        <th colSpan="8">
                            <div className="management-toolbar">
                                <div className="toolbar-left">
                                    {selectedRows.length > 0 ? (
                                        <>
                                            <span className="selection-count">{selectedRows.length} item(s) selected</span>
                                            <button
                                                className="tool-btn edit-btn"
                                                onClick={() => openPrompt(editPromptTitle, editPromptType, selectedRows)}
                                                disabled={selectedRows.length !== 1}
                                                style={{ opacity: selectedRows.length !== 1 ? 0.5 : 1, cursor: selectedRows.length !== 1 ? 'not-allowed' : 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button className="tool-btn remove-btn" onClick={() => openPrompt(removeBtnLabel, removePromptType, selectedRows)}>
                                                Remove
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <SortButton sortOptions={currentSortOptions} currentSortKey={sortKey} onSortChange={setSortKey} />
                                            <input
                                                type="text"
                                                className="search-bar"
                                                placeholder={searchPlaceholder}
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                            />
                                            <ViewSwitcher 
                                                activeView={activeView} 
                                                setActiveView={setActiveView} 
                                                options={[
                                                    { key: 'overview', label: 'Overview' },
                                                    { key: 'input', label: 'Input Log' },
                                                    { key: 'output', label: 'Output Log' }
                                                ]} 
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="toolbar-right">
                                    {selectedRows.length === 0 && (
                                        <button className="tool-btn add-btn" onClick={() => openPrompt(addPromptTitle, addPromptType)}>
                                            + {isOverview ? 'Add Item' : 'Add Log'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </th>
                    </tr>

                    <tr className="header-row" onClick={toggleAll} style={{ cursor: 'pointer' }}>
                        <th className="checkbox-col">
                            <input type="checkbox" checked={selectedRows.length === filteredData.length && filteredData.length > 0} onChange={toggleAll} />
                        </th>
                        {isOverview ? (
                            <>
                                <th>Item ID</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Quantity / UOM</th>
                                <th>Status</th>
                                <th>Warehouse</th>
                                <th>Supplier</th>
                            </>
                        ) : (
                            <>
                                <th>Transaction ID</th>
                                <th>Item Code</th>
                                <th>Item Name</th>
                                <th>{isInput ? 'Input Qty / UOM' : 'Output Qty / UOM'}</th>
                                <th>Date</th>
                                <th>Supplier</th>
                                <th>Batch / LOT</th>
                            </>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {filteredData.length === 0 ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                {searchQuery ? `No entries found matching "${searchQuery}".` : `No ${isOverview ? 'items' : 'log entries'} yet.`}
                            </td>
                        </tr>
                    ) : (
                        filteredData.map(item => {
                            const isSelected = selectedRows.includes(item.id);
                            return (
                                <tr
                                    key={item.id}
                                    className={`data-row ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleRow(item.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td className="checkbox-col">
                                        <input type="checkbox" checked={isSelected} readOnly />
                                    </td>
                                    
                                    {isOverview ? (
                                        <>
                                            <td className="item-id">{item.id}</td>
                                            <td>{item.name}</td>
                                            <td>{item.category}</td>
                                            <td>
                                                {item.quantity}
                                                {item.uom ? <span style={{ color: 'var(--text-secondary)', fontSize: '0.85em' }}> {item.uom}</span> : ''}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${item.status === 'In Stock' ? 'success' : 'warning'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>{item.warehouse}</td>
                                            <td>
                                                {item.supplier ? (
                                                    <span className="supplier-link" onClick={e => { e.stopPropagation(); openPrompt('Supplier Details', 'supplier-details', [item.supplier]); }}>
                                                        {item.supplier}
                                                    </span>
                                                ) : <span style={{ color: 'var(--text-secondary)' }}>N/A</span>}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="item-id">{item.transactionId}</td>
                                            <td className="item-id">{item.itemCode}</td>
                                            <td>{item.itemName}</td>
                                            <td>
                                                <span className={`qty-badge ${isInput ? 'qty-in' : 'qty-out'}`}>
                                                    {isInput ? '+' : '\u2212'}{item.quantity} {item.uom}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{item.date}</td>
                                            <td>{item.supplier || <span style={{ color: 'var(--text-secondary)' }}>N/A</span>}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{item.batchLot || '—'}</td>
                                        </>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};
