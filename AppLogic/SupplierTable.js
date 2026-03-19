/* 
 * Supplier Table Component
 * View for managing supplier contact info, sharing core features with inventory.
 */

const SupplierTable = ({ openPrompt, supplierData }) => {
    // local state
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [searchQuery,  setSearchQuery]  = React.useState('');
    const [sortKey,      setSortKey]      = React.useState('');

    // drop selection when data source changes
    React.useEffect(() => {
        setSelectedRows([]);
    }, [supplierData]);

    const SORT_OPTIONS = [
        { key: 'name-asc',    label: 'Supplier Name: A → Z' },
        { key: 'name-desc',   label: 'Supplier Name: Z → A' },
        { key: 'contact-asc', label: 'Contact Person: A → Z' },
        { key: 'contact-desc',label: 'Contact Person: Z → A' },
        { key: 'email-asc',   label: 'Email: A → Z' },
        { key: 'email-desc',  label: 'Email: Z → A' },
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
        if (key === 'contact-desc') return desc(i => i.contact);
        if (key === 'email-asc')    return asc (i => i.email);
        if (key === 'email-desc')   return desc(i => i.email);
        return arr;
    };

    // calculate final display list
    const filteredData = applySort(
        supplierData.filter(item => {
            const sq = searchQuery.toLowerCase();
            return (
                item.name.toLowerCase().includes(sq)    ||
                item.contact.toLowerCase().includes(sq) ||
                item.address.toLowerCase().includes(sq) ||
                item.phone.toLowerCase().includes(sq)   ||
                item.email.toLowerCase().includes(sq)
            );
        }),
        sortKey
    );

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
            <table className="inventory-table">
                <thead>
                    <tr className="management-row">
                        <th colSpan="6">
                            <div className="management-toolbar">
                                <div className="toolbar-left">
                                    {selectedRows.length > 0 ? (
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
                                        <>
                                            <SortButton sortOptions={SORT_OPTIONS} currentSortKey={sortKey} onSortChange={setSortKey} />
                                            <input
                                                type="text"
                                                className="search-bar"
                                                placeholder="Search suppliers..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </>
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
                    {filteredData.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                {searchQuery ? `No suppliers found matching "${searchQuery}".` : 'No suppliers yet.'}
                            </td>
                        </tr>
                    ) : (
                        filteredData.map((item) => {
                            const isSelected = selectedRows.includes(item.id);
                            return (
                                <tr key={item.id} className={`data-row ${isSelected ? 'selected' : ''}`} onClick={() => toggleSelection(item.id)} style={{ cursor: 'pointer' }}>
                                    <td className="checkbox-col">
                                        <input type="checkbox" checked={isSelected} readOnly />
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
