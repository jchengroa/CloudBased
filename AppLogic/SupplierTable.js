/**
 * ==========================================
 * SUPPLIER TABLE COMPONENT
 * ==========================================
 * Dedicated view for managing supplier contact
 * information, extending the core table functionality.
 */

const SupplierTable = ({ openPrompt, supplierData }) => {
    // --- Local State ---
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Clear selection when data changes
    React.useEffect(() => {
        setSelectedRows([]);
    }, [supplierData]);

    // --- Computed Data ---
    const filteredData = supplierData.filter(item => {
        const sq = searchQuery.toLowerCase();
        return (
            item.name.toLowerCase().includes(sq) ||
            item.contact.toLowerCase().includes(sq) ||
            item.address.toLowerCase().includes(sq) ||
            item.phone.toLowerCase().includes(sq) ||
            item.email.toLowerCase().includes(sq)
        );
    });

    // --- Handlers ---
    const toggleSelection = (id) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id)); // Remove
        } else {
            setSelectedRows([...selectedRows, id]); // Add
        }
    };

    const toggleAll = () => {
        if (selectedRows.length === filteredData.length && filteredData.length > 0) {
            setSelectedRows([]); // Clear
        } else {
            setSelectedRows(filteredData.map(item => item.id)); // Select All
        }
    };

    // --- Render ---
    return (
        <div className="list-box">
            <table className="inventory-table">
                <thead>

                    {/* Management Toolbar */}
                    <tr className="management-row">
                        <th colSpan="6">
                            <div className="management-toolbar">
                                <div className="toolbar-left">
                                    {selectedRows.length > 0 ? (
                                        // Bulk Actions
                                        <>
                                            <span className="selection-count">{selectedRows.length} item(s) selected</span>
                                            <button 
                                                className="tool-btn edit-btn" 
                                                onClick={() => openPrompt('Edit Supplier', 'edit-supplier', selectedRows)}
                                                disabled={selectedRows.length !== 1}
                                                style={{ opacity: selectedRows.length !== 1 ? 0.5 : 1, cursor: selectedRows.length !== 1 ? 'not-allowed' : 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button className="tool-btn remove-btn" onClick={() => openPrompt('Remove Supplier', 'remove-supplier', selectedRows)}>Remove</button>
                                        </>
                                    ) : (
                                        // Default Search 
                                        <input 
                                            type="text" 
                                            className="search-bar" 
                                            placeholder="Search suppliers..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    )}
                                </div>
                                <div className="toolbar-right">
                                    {selectedRows.length === 0 && (
                                        <button className="tool-btn add-btn" onClick={() => openPrompt('Add Supplier', 'add-supplier')}>+ Add Supplier</button>
                                    )}
                                </div>
                            </div>
                        </th>
                    </tr>

                    {/* Adjusted Column Headers */}
                    <tr className="header-row" onClick={toggleAll} style={{ cursor: 'pointer' }}>
                        <th className="checkbox-col">
                            <input
                                type="checkbox"
                                checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                                onChange={toggleAll}
                            />
                        </th>
                        <th style={{ width: '20%' }}>Supplier Name</th>
                        <th style={{ width: '20%' }}>Contact Person</th>
                        <th style={{ width: '25%' }}>Address</th>
                        <th style={{ width: '15%' }}>Phone Number</th>
                        <th style={{ width: '20%' }}>Email Address</th>
                    </tr>
                </thead>

                {/* Main Data Body */}
                <tbody>
                    {filteredData.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                No suppliers found matching "{searchQuery}".
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
                                <td className="item-id">{item.name}</td>
                                <td>{item.contact}</td>
                                <td>{item.address}</td>
                                <td>{item.phone}</td>
                                <td>
                                    <span className="supplier-link">{item.email}</span>
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
