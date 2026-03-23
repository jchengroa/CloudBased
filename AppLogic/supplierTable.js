/* 
 * Supplier Table Component
 * View for managing supplier contact info, sharing core features with inventory.
 */

const SupplierTable = ({ openPrompt, supplierData, inventoryData = [], dbError }) => {
    // local state
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [searchQuery,  setSearchQuery]  = React.useState('');
    const [sortKey,      setSortKey]      = React.useState('');
    const [activeWarehouseFilter, setActiveWarehouseFilter] = React.useState('All');

    // drop selection when data source changes
    React.useEffect(() => {
        setSelectedRows([]);
    }, [supplierData]);

    const SORT_OPTIONS = [
        { key: 'name-asc',    label: 'Supplier Name A-Z', icon: <SortAZIcon /> },
        { key: 'name-desc',   label: 'Supplier Name Z-A', icon: <SortZAIcon /> },
        { key: 'contact-asc', label: 'Contact Person A-Z', icon: <SortAZIcon /> },
        { key: 'email-asc',   label: 'Email A-Z',          icon: <SortAZIcon /> },
    ];

    // sort application
    const applySort = (data, key) => {
        if (!key) return data;
        const arr = [...data];
        const asc  = (f) => arr.sort((a, b) => (f(a) || '').localeCompare(f(b) || ''));
        const desc = (f) => arr.sort((a, b) => (f(b) || '').localeCompare(f(a) || ''));
        
        if (key === 'name-asc')     return asc (i => i.name);
        if (key === 'name-desc')    return desc(i => i.name);
        if (key === 'contact-asc')  return asc (i => i.contact);
        if (key === 'email-asc')    return asc (i => i.email);
        return arr;
    };

    // calculate final display list
    const filteredData = applySort(
        supplierData.filter(item => {
            const sq = searchQuery.toLowerCase();
            
            // Filter by warehouse association if chosen
            if (activeWarehouseFilter !== 'All') {
                const hasItemInWarehouse = inventoryData.some(inv => inv.supplier === item.id && inv.warehouse === activeWarehouseFilter);
                if (!hasItemInWarehouse) return false;
            }

            return (
                (item.name || '').toLowerCase().includes(sq)    ||
                (item.contact || '').toLowerCase().includes(sq) ||
                (item.address || '').toLowerCase().includes(sq) ||
                (item.phone || '').toLowerCase().includes(sq)   ||
                (item.email || '').toLowerCase().includes(sq)
            );
        }),
        sortKey
    );

    // Extract unique warehouses present in inventory for filter pills
    const availableWarehouses = ['All', ...new Set(inventoryData.map(i => i.warehouse).filter(Boolean))].sort();

    // --- Handlers ---
    const toggleSelection = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedRows.length === filteredData.length && filteredData.length > 0) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredData.map(item => item.id));
        }
    };

    return (
        <div className="list-box">
            {availableWarehouses.length > 1 && (
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
            <div style={{ padding: '0 1.5rem' }}>
                <TableToolbar
                    selectedCount={selectedRows.length}
                    onEdit={() => openPrompt('Edit Supplier', 'edit-supplier', selectedRows)}
                    onRemove={() => openPrompt('Delete Supplier', 'remove-supplier', selectedRows)}
                    onAdd={() => openPrompt('Add Supplier', 'add-supplier')}
                    addLabel="Add Supplier"
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchPlaceholder="Search suppliers..."
                    sortOptions={SORT_OPTIONS}
                    currentSortKey={sortKey}
                    onSortChange={setSortKey}
                />
            </div>

            <table className="inventory-table" style={{ marginTop: '1rem' }}>
                <thead>
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

                <tbody>
                    <TableMessage 
                        colSpan="6" 
                        dbError={dbError} 
                        isEmpty={filteredData.length === 0} 
                        emptyMessage={searchQuery ? `No suppliers found matching "${searchQuery}".` : 'No suppliers yet.'} 
                    />
                    {filteredData.length > 0 && (
                        filteredData.map((item) => {
                            const isSelected = selectedRows.includes(item.id);
                            return (
                                <tr 
                                    key={item.id} 
                                    className={`data-row ${isSelected ? 'selected' : ''}`} 
                                    onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }} 
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td className="checkbox-col">
                                        <input type="checkbox" checked={isSelected} readOnly />
                                    </td>
                                    <td className="item-id" style={{ fontWeight: '600' }}>{item.name}</td>
                                    <td style={{ fontWeight: '500' }}>{item.contact}</td>
                                    <td style={{ fontSize: '0.9rem', opacity: 0.8 }}>{item.address}</td>
                                    <td style={{ fontSize: '0.9rem', opacity: 0.8 }}>{item.phone}</td>
                                    <td>
                                        <span className="supplier-link" style={{ fontSize: '0.9rem' }}>{item.email}</span>
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
window.SupplierTable = SupplierTable;
