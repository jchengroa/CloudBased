/**
 * ==========================================
 * INVENTORY TABLE COMPONENT
 * ==========================================
 * Manages the display, selection, and primary 
 * toolbars for physical stock items.
 */

const InventoryTable = ({ openPrompt, inventoryData, lowStockThreshold, isThresholdEnabled, activeWarehouseFilter }) => {
    // --- Local State ---
    // Tracks which specific rows the user has checked off
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    
    // Clear selection when data changes (e.g., after remove or filter change)
    React.useEffect(() => {
        setSelectedRows([]);
    }, [inventoryData, activeWarehouseFilter]);

    // --- Computed Data ---
    // First, apply the warehouse filter to the incoming list
    const warehouseFilteredData = activeWarehouseFilter === 'All'
        ? inventoryData
        : inventoryData.filter(item => item.warehouse === activeWarehouseFilter);

    // Compute status badges
    const processedData = warehouseFilteredData.map(item => {
        const qtyNum = parseInt(item.quantity, 10) || 0;
        const status = (isThresholdEnabled && qtyNum <= lowStockThreshold) ? "Low Stock" : "In Stock";
        return { ...item, status };
    });

    // Engine mapping: Executes on every keystroke in the Search Bar
    // dynamically sorting processed list items in real-time, completely case-insensitive
    const filteredData = processedData.filter(item => {
        const sq = searchQuery.toLowerCase();
        return (
            item.id.toLowerCase().includes(sq) ||
            item.name.toLowerCase().includes(sq) ||
            item.category.toLowerCase().includes(sq) ||
            item.status.toLowerCase().includes(sq) ||
            item.warehouse.toLowerCase().includes(sq) ||
            item.supplier.toLowerCase().includes(sq)
            // Note: Quantity is intentionally excluded from string search parameters
        );
    });

    // --- Handlers ---
    // Toggles a single item's checkbox state
    const toggleSelection = (id) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id)); // Remove
        } else {
            setSelectedRows([...selectedRows, id]); // Add
        }
    };

    // Toggles the "Select All" checkbox in the header
    const toggleAll = () => {
        if (selectedRows.length === filteredData.length && filteredData.length > 0) {
            setSelectedRows([]); // Clear all if everything rendered is checked
        } else {
            setSelectedRows(filteredData.map(item => item.id)); // Select all rendered IDs
        }
    };

    // --- Render ---
    return (
        <div className="list-box">
            <table className="inventory-table">
                <thead>

                    {/* Management Toolbar (Search vs Edit Actions) */}
                    <tr className="management-row">
                        <th colSpan="8">
                            <div className="management-toolbar">
                                <div className="toolbar-left">
                                    {selectedRows.length > 0 ? (
                                        // Bulk Actions (visible when items are checked)
                                        <>
                                            <span className="selection-count">{selectedRows.length} item(s) selected</span>
                                            <button
                                                className="tool-btn edit-btn"
                                                onClick={() => openPrompt('Edit Item', 'edit-item', selectedRows)}
                                                disabled={selectedRows.length !== 1}
                                                style={{ opacity: selectedRows.length !== 1 ? 0.5 : 1, cursor: selectedRows.length !== 1 ? 'not-allowed' : 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button className="tool-btn remove-btn" onClick={() => openPrompt('Remove Item', 'remove-item', selectedRows)}>Remove</button>
                                        </>
                                    ) : (
                                        // Default Search State
                                        <input
                                            type="text"
                                            className="search-bar"
                                            placeholder="Search items..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    )}
                                </div>
                                <div className="toolbar-right">
                                    {selectedRows.length === 0 && (
                                        <button className="tool-btn add-btn" onClick={() => openPrompt('Add Item', 'add-item')}>+ Add Item</button>
                                    )}
                                </div>
                            </div>
                        </th>
                    </tr>

                    {/* Column Headers */}
                    <tr className="header-row" onClick={toggleAll} style={{ cursor: 'pointer' }}>
                        <th className="checkbox-col">
                            <input
                                type="checkbox"
                                checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                                onChange={toggleAll}
                            />
                        </th>
                        <th>Item ID</th>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Quantity / UOM</th>
                        <th>Status</th>
                        <th>Warehouse</th>
                        <th>Supplier</th>
                    </tr>
                </thead>

                {/* Main Data Body */}
                <tbody>
                    {filteredData.length === 0 ? (
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                No items found matching "{searchQuery}".
                            </td>
                        </tr>
                    ) : (
                        filteredData.map((item) => {
                            const isSelected = selectedRows.includes(item.id);

                            return (
                                <tr key={item.id} className={`data-row ${isSelected ? 'selected' : ''}`} onClick={() => toggleSelection(item.id)} style={{ cursor: 'pointer' }}>
                                    <td className="checkbox-col">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                        />
                                    </td>
                                    <td className="item-id">{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.category}</td>
                                    <td>{item.quantity}</td>
                                    <td>
                                        <span className={`status-badge ${item.status === 'In Stock' ? 'success' : 'warning'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>{item.warehouse}</td>
                                    <td>
                                        {item.supplier ? (
                                            <span className="supplier-link" onClick={(e) => { e.stopPropagation(); openPrompt('Supplier Details', 'supplier-details', [item.supplier]); }}>
                                                {item.supplier}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)' }}>N/A</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};
