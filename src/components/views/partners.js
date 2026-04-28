/*
 * Partners Component
 * Keeps supplier CRUD intact while introducing customer-ready visuals and linking flows.
 */

const Partners = ({
    openPrompt,
    supplierData = [],
    customerData = [],
    inventoryData = [],
    inputLogs = [],
    outputLogs = [],
    dbError,
    user,
    warehouses = [],
    canUndo,
    canRedo,
    onUndo,
    onRedo
}) => {
    const {
        formatStockQuantity = (value) => `${value ?? 0}`,
        SortButton = () => null,
        WarehousePills = () => null,
        ViewSwitcher = () => null,
        ActionBar = () => null,
        TableMessage = () => null
    } = window;
    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    const renderIcon = (name, props = {}) => {
        const Icon = Icons[name] || (() => null);
        return <Icon {...props} />;
    };
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeWarehouseFilter, setActiveWarehouseFilter] = React.useState('All');
    const [activePartnerView, setActivePartnerView] = React.useState('suppliers');
    const [displayMode, setDisplayMode] = React.useState('card');
    const [activeFocusFilter, setActiveFocusFilter] = React.useState('All');

    const isSuppliers = activePartnerView === 'suppliers';
    const partnerData = isSuppliers ? supplierData : customerData;
    
    // Automation engine — passive, read-only
    const automation = window.useAutomationEngine
        ? window.useAutomationEngine(inventoryData, supplierData, customerData, outputLogs, user.settings, inputLogs)
        : null;

    const getPartnerAutomationStatus = React.useCallback((partnerId) => {
        if (!automation) return null;
        const id = String(partnerId);
        if (isSuppliers) {
            const group = (automation.supplierGroups || []).find(g => String(g.supplier.id) === id);
            if (group) return { label: `${group.items.length} reorder(s)`, color: '#ef4444', icon: 'Zap' };
        } else {
            const dispatch = (automation.dispatchQueue || []).find(d => String(d.customer.id) === id);
            if (dispatch) return { label: `${dispatch.products.length} ready to ship`, color: '#6366f1', icon: 'Package' };
        }
        return null;
    }, [automation, isSuppliers]);

    const AutomationRibbon = window.AutomationRibbon || (() => null);

    const hasRes = (action) => {
        if (!user || user.role === 'Administrator') return false;
        return (user.restrictions || []).includes(`${action}Suppliers`); // We'll keep the same permission for now
    };

    const canEdit = !hasRes('Edit');
    const canRemove = !hasRes('Remove');
    const canAdd = !hasRes('Add');

    const getAssetFamily = React.useCallback((item) => {
        const text = `${item.category || ''} ${item.name || ''}`.toLowerCase();
        if (/(pack|box|bottle|bag|label|wrap|container|carton|jar|cup|cap|seal)/.test(text)) return 'Packaging';
        if (/(raw|ingredient|material|flour|sugar|butter|oil|yeast|powder|mix|cocoa|milk|salt)/.test(text)) return 'Raw Materials';
        if (/(supply|clean|sanit|glove|tool|maintenance|consumable|utility)/.test(text)) return 'Supply';
        return 'Products';
    }, []);

    React.useEffect(() => {
        setSelectedRows([]);
        setSearchQuery('');
        setActiveFocusFilter('All');
        setActiveWarehouseFilter('All');
    }, [supplierData, customerData, activePartnerView, displayMode]);

    const availableWarehouses = React.useMemo(() => {
        const knownWarehouses = [
            ...warehouses,
            ...inventoryData.map((item) => item.warehouse).filter(Boolean)
        ];
        return ['All', ...Array.from(new Set(knownWarehouses)).sort((a, b) => a.localeCompare(b))];
    }, [warehouses, inventoryData]);

    const inventoryRelationships = React.useMemo(() => {
        const supplierWarehouseMap = {};
        const customerWarehouseMap = {};
        const supplierFocusMap = {};
        const customerFocusMap = {};
        const inventoryById = {};

        inventoryData.forEach((item) => {
            const supplierId = String(item.supplier || '');
            const customerId = String(item.customer || '');
            const warehouse = item.warehouse;
            const family = getAssetFamily(item);

            inventoryById[item.id] = item;

            if (supplierId) {
                if (!supplierWarehouseMap[supplierId]) supplierWarehouseMap[supplierId] = new Set();
                if (!supplierFocusMap[supplierId]) supplierFocusMap[supplierId] = new Set();
                if (warehouse) supplierWarehouseMap[supplierId].add(warehouse);
                supplierFocusMap[supplierId].add(family);
            }

            if (customerId) {
                if (!customerWarehouseMap[customerId]) customerWarehouseMap[customerId] = new Set();
                if (!customerFocusMap[customerId]) customerFocusMap[customerId] = new Set();
                if (warehouse) customerWarehouseMap[customerId].add(warehouse);
                customerFocusMap[customerId].add(family);
            }
        });

        return {
            inventoryById,
            supplierWarehouseMap,
            customerWarehouseMap,
            supplierFocusMap,
            customerFocusMap
        };
    }, [inventoryData, getAssetFamily]);

    const filteredPartners = React.useMemo(() => {
        const warehouseMap = isSuppliers ? inventoryRelationships.supplierWarehouseMap : inventoryRelationships.customerWarehouseMap;
        const focusMap = isSuppliers ? inventoryRelationships.supplierFocusMap : inventoryRelationships.customerFocusMap;

        return partnerData.filter((item) => {
            const sq = searchQuery.toLowerCase();
            const itemId = String(item.id);

            if (activeWarehouseFilter !== 'All') {
                const warehouseSet = warehouseMap[itemId];
                if (!warehouseSet || !warehouseSet.has(activeWarehouseFilter)) return false;
            }

            if (activeFocusFilter !== 'All') {
                const focusSet = focusMap[itemId];
                if (!focusSet || !focusSet.has(activeFocusFilter)) return false;
            }

            return (
                (item.name || '').toLowerCase().includes(sq) ||
                (item.contact || '').toLowerCase().includes(sq) ||
                (item.address || '').toLowerCase().includes(sq) ||
                (item.phone || '').toLowerCase().includes(sq) ||
                (item.email || '').toLowerCase().includes(sq)
            );
        });
    }, [partnerData, isSuppliers, searchQuery, activeWarehouseFilter, activeFocusFilter, inventoryRelationships]);

    const shipmentsPerPartner = React.useMemo(() => {
        return outputLogs.reduce((acc, log) => {
            const item = inventoryRelationships.inventoryById[log.itemCode];
            if (item && item.customer) {
                acc[item.customer] = (acc[item.customer] || 0) + (parseFloat(log.quantity) || 0);
            }
            return acc;
        }, {});
    }, [outputLogs, inventoryRelationships]);

    const focusOptions = isSuppliers
        ? ['All', 'Raw Materials', 'Packaging', 'Supply']
        : ['All', 'Products'];

    const partnerSortOptions = [
        { key: 'name', label: 'Name', icon: renderIcon('User', { size: 16 }) },
        { key: 'contact', label: 'Contact', icon: renderIcon('User', { size: 16 }) },
        { key: 'email', label: 'Email', icon: renderIcon('Link', { size: 16 }) },
        { key: 'phone', label: 'Phone', icon: renderIcon('FileText', { size: 16 }) },
    ];

    const { sortedData: filteredData, requestSort, SortIndicator, sortConfig } = window.useSorting(filteredPartners, '', 'asc');

    const toggleSelection = (id) => {
        setSelectedRows((prev) => prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedRows.length === filteredData.length && filteredData.length > 0) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredData.map((item) => item.id));
        }
    };

    const renderPartnerCards = () => (
        <div className="partners-customer-panel">
            {filteredData.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No {activePartnerView} found for the selected filters.
                </div>
            ) : (
                <div className="partners-customer-grid">
                    {filteredData.map((item) => {
                        const partnerField = isSuppliers ? 'supplier' : 'customer';
                        const linkedItems = inventoryData.filter((inv) => inv[partnerField] === item.id);
                        const distributionCount = isSuppliers ? 0 : (shipmentsPerPartner[item.id] || 0);

                        return (
                            <div key={item.id} className={`partners-customer-card ${!isSuppliers ? 'customer-theme' : ''}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>{item.name}</div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.25rem' }}>{item.contact || 'No contact person yet'}</div>
                                        </div>
                                        {getPartnerAutomationStatus(item.id) && (
                                            <div style={{ background: getPartnerAutomationStatus(item.id).color, color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                {renderIcon(getPartnerAutomationStatus(item.id).icon, { size: 12 })}
                                                {getPartnerAutomationStatus(item.id).label}
                                            </div>
                                        )}
                                    </div>

                                {/* Stats box: only Linked Items + Total In/Out, evenly spaced */}
                                <div style={{ display: 'flex', gap: '0', background: 'var(--hover-bg)', borderRadius: '12px', padding: '0.85rem 1rem', marginTop: '1rem' }}>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div className="partners-metric-label">Linked Items</div>
                                        <strong style={{ fontSize: '1.1rem' }}>{linkedItems.length}</strong>
                                    </div>
                                    <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 0.5rem' }} />
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div className="partners-metric-label">{isSuppliers ? 'Total In' : 'Total Out'}</div>
                                        <strong style={{ fontSize: '1.1rem' }}>{formatStockQuantity(isSuppliers ? linkedItems.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0), 0) : distributionCount)}</strong>
                                    </div>
                                </div>

                                {/* Email and Phone as labeled rows */}
                                <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
                                        <span className="partners-metric-label" style={{ minWidth: '3.5rem' }}>Email</span>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{item.email || '—'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
                                        <span className="partners-metric-label" style={{ minWidth: '3.5rem' }}>Phone</span>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.phone || '—'}</span>
                                    </div>
                                </div>

                                {/* Address */}
                                <div style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.6 }}>
                                    {item.address || 'No address recorded yet.'}
                                </div>

                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button
                                            className="action-icon-btn"
                                            onClick={(e) => { e.stopPropagation(); openPrompt(isSuppliers ? 'Edit Supplier Partner' : 'Edit Customer Partner', isSuppliers ? 'edit-supplier' : 'edit-customer', [item.id]); }}
                                            title="Edit Details"
                                        >
                                            <Icons.Edit size={16} />
                                        </button>
                                        <button
                                            className="action-icon-btn danger-hover"
                                            onClick={(e) => { e.stopPropagation(); openPrompt(isSuppliers ? 'Remove Partner' : 'Remove Customer', isSuppliers ? 'remove-supplier' : 'remove-customer', [item.id]); }}
                                            title="Delete Record"
                                        >
                                            <Icons.Trash size={16} />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); openPrompt(`Link ${isSuppliers ? 'Supplier' : 'Customer'} Items`, isSuppliers ? 'link-supplier-items' : 'link-customer-items', [item.id]); }}
                                        style={{
                                            background: isSuppliers ? 'var(--hover-bg)' : 'rgba(99, 102, 241, 0.08)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '999px',
                                            padding: '0.4rem 0.9rem',
                                            color: 'var(--accent-color)',
                                            fontWeight: '700',
                                            fontSize: '0.82rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {isSuppliers ? 'Link Items' : 'Link Items'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderActionBar = () => {
        const selectedCount = selectedRows.length;

        return (
            <div className="hub-action-bar">
                {selectedCount > 0 ? (
                    <div className="hub-selection-row">
                        <span className="selection-count">{selectedCount} row(s) selected</span>
                        <div className="hub-selection-actions">
                            {canEdit && (
                                <button
                                    className="tool-btn edit-btn"
                                    onClick={() => openPrompt(
                                        isSuppliers ? 'Edit Supplier Partner' : 'Edit Customer Partner',
                                        isSuppliers ? 'edit-supplier' : 'edit-customer',
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
                                        isSuppliers ? 'Delete Supplier Partner' : 'Delete Customer Partner',
                                        isSuppliers ? 'remove-supplier' : 'remove-customer',
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
                            <div className="hub-action-tabs">
                                <button
                                    className={`hub-tab-item ${activePartnerView === 'suppliers' ? 'active' : ''}`}
                                    onClick={() => setActivePartnerView('suppliers')}
                                >
                                    Suppliers
                                </button>
                                <button
                                    className={`hub-tab-item ${activePartnerView === 'customers' ? 'active' : ''}`}
                                    onClick={() => setActivePartnerView('customers')}
                                >
                                    Customers
                                </button>
                            </div>

                            <div className="hub-action-divider" />

                            <SortButton
                                options={partnerSortOptions}
                                currentKey={sortConfig.key}
                                currentDirection={sortConfig.direction}
                                onSort={requestSort}
                            />

                            <div className="hub-action-search">
                                <Icons.Search size={18} className="hub-action-search-icon" />
                                <input
                                    type="text"
                                    className="search-bar hub-search-input"
                                    placeholder={`Search ${activePartnerView}...`}
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="hub-action-right">
                            {/* Undo/Redo Stack */}
                            <div style={{ display: 'flex', gap: '0.25rem', marginRight: '0.5rem' }}>
                                <button
                                    className="history-btn"
                                    onClick={onUndo}
                                    disabled={!canUndo}
                                    style={{ opacity: canUndo ? 1 : 0.35 }}
                                >
                                    <Icons.Undo size={18} />
                                </button>
                                <button
                                    className="history-btn"
                                    onClick={onRedo}
                                    disabled={!canRedo}
                                    style={{ opacity: canRedo ? 1 : 0.35 }}
                                >
                                    <Icons.Redo size={18} />
                                </button>
                            </div>

                            <div className="hub-action-divider" />

                            <div style={{ display: 'flex', gap: '0.35rem', marginRight: '0.5rem' }}>
                                <button
                                    className={`display-toggle ${displayMode === 'card' ? 'active' : ''}`}
                                    onClick={() => setDisplayMode('card')}
                                >
                                    <Icons.Grid size={18} />
                                </button>
                                <button
                                    className={`display-toggle ${displayMode === 'table' ? 'active' : ''}`}
                                    onClick={() => setDisplayMode('table')}
                                >
                                    <Icons.List size={18} />
                                </button>
                            </div>

                            {canAdd && (
                                <button
                                    className="tool-btn add-btn hub-action-add"
                                    onClick={() => openPrompt(isSuppliers ? 'Add Supplier Partner' : 'Add Customer Partner', isSuppliers ? 'add-supplier' : 'add-customer')}
                                >
                                    <Icons.Plus size={16} /> Partner
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="list-box partners-workspace">
            <div className="partners-hero">
                <div>
                    <div className="assets-eyebrow">Partners Hub</div>
                    <h1 className="assets-title">Partners</h1>
                    <p className="assets-copy">Manage your ecosystem of suppliers for raw materials and customers for your finished products.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
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
                                        transition: 'all 0.2s',
                                        boxShadow: activeWarehouseFilter === w ? '0 4px 12px rgba(99,102,241,0.2)' : 'none'
                                    }}
                                >
                                    {w === 'All' ? 'All Locations' : w}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginRight: '0.5rem', opacity: 0.6 }}>Focus Area</span>
                            {focusOptions.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setActiveFocusFilter(t)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '20px',
                                        border: '1px solid ' + (activeFocusFilter === t ? 'var(--accent-color)' : 'var(--border-color)'),
                                        background: activeFocusFilter === t ? 'var(--accent-color)' : 'transparent',
                                        color: activeFocusFilter === t ? 'white' : 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t === 'All' ? 'All Focus Area' : t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar (Search, Tabs, Add Button) */}
            {renderActionBar()}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                {/* Manual spacing removed as tabs are now within the ActionBar */}
            </div>

            {/* Automation Ribbon — passive, collapsible, dismissible */}
            {automation && (
                <div style={{ padding: '0 2rem 0' }}>
                    <AutomationRibbon
                        automation={automation}
                        context={isSuppliers ? 'partners-suppliers' : 'partners-customers'}
                        openPrompt={openPrompt}
                    />
                </div>
            )}

            {displayMode === 'card' ? renderPartnerCards() : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                        <thead>
                            <tr className="header-row">
                                <th className="checkbox-col" onClick={toggleAll} style={{ textAlign: 'center' }}>
                                    <input type="checkbox" checked={selectedRows.length === filteredData.length && filteredData.length > 0} readOnly />
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => requestSort('name')}>Name <SortIndicator columnKey="name" /></th>
                                <th>Contact</th>
                                <th>Linked Items</th>
                                <th>Email</th>
                                <th>Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            <TableMessage
                                colSpan="6"
                                isEmpty={filteredData.length === 0}
                                emptyMessage={`No ${activePartnerView} found matching your criteria.`}
                            />
                            {filteredData.map(item => {
                                const partnerField = isSuppliers ? 'supplier' : 'customer';
                                const linked = inventoryData.filter(inv => inv[partnerField] === item.id);
                                const isSelected = selectedRows.includes(item.id);
                                return (
                                    <tr
                                        key={item.id}
                                        className={`data-row ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleSelection(item.id)}
                                    >
                                        <td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
                                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(item.id)} />
                                        </td>
                                        <td style={{ fontWeight: 700 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {item.name}
                                                {getPartnerAutomationStatus(item.id) && (
                                                    <div title={getPartnerAutomationStatus(item.id).label} style={{ color: getPartnerAutomationStatus(item.id).color }}>
                                                        {renderIcon(getPartnerAutomationStatus(item.id).icon, { size: 14 })}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>{item.contact || '-'}</td>
                                        <td>{linked.length} items</td>
                                        <td>{item.email || '-'}</td>
                                        <td>{item.phone || '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

window.Partners = Partners;
window.Supplier = Partners;
window.SupplierTable = Partners;
