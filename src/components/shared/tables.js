// Dropdown filter pill button
const SortButton = ({ options = [], currentKey, onSort }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropRef = React.useRef(null);

    if (!options || options.length === 0) return null;

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeOption = options.find(o => o.key === currentKey);

    return (
        <div className="sort-wrapper" ref={dropRef} style={{ position: 'relative' }}>
            <button
                className={`sort-btn ${currentKey ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    fontWeight: '600',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                <Icons.Sort />
                <span>{activeOption ? activeOption.label : 'Sort Properties'}</span>
                <Icons.ChevronDown />
            </button>
            
            {isOpen && (
                <div className="sort-menu">
                    <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Sort By Property</div>
                    {options.map(opt => (
                        <div
                            key={opt.key}
                            className={`sort-item ${currentKey === opt.key ? 'active' : ''}`}
                            onClick={() => { onSort(opt.key); setIsOpen(false); }}
                        >
                            <span style={{ opacity: 0.7, display: 'flex' }}>{opt.icon || <Icons.Sort />}</span>
                            <span>{opt.label}</span>
                            {currentKey === opt.key && <span style={{ marginLeft: 'auto', opacity: 0.5 }}>✓</span>}
                        </div>
                    ))}
                    {currentKey && (
                        <div
                            className="sort-item"
                            onClick={() => { onSort(''); setIsOpen(false); }}
                            style={{ color: 'var(--danger)', borderTop: '1px solid var(--border-color)', marginTop: '0.4rem', paddingTop: '0.6rem' }}
                        >
                            <Icons.Trash />
                            <span>Reset Sort</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
window.SortButton = SortButton;

const TableToolbar = ({
    selectedCount,
    onEdit,
    onRemove,
    onAdd,
    addLabel = "Add Item",
    searchQuery,
    setSearchQuery,
    searchPlaceholder = "Search...",
    sortOptions,
    currentSortKey,
    onSortChange,
    viewSwitcher = null,
    filterElement = null,
    user,
    restrictionScope = "Items" // Items, Logs, Suppliers
}) => {
    const hasRes = (action) => {
        if (!user || user.role === 'Administrator') return false;
        return (user.restrictions || []).includes(`${action}${restrictionScope}`);
    };

    const canAdd    = !hasRes('Add');
    const canEdit   = !hasRes('Edit');
    const canRemove = !hasRes('Remove');

    return (
        <div className="management-toolbar">
            <div className="toolbar-left">
                {selectedCount > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="selection-count">{selectedCount} row(s) selected</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {canEdit && (
                                <button
                                    className="tool-btn edit-btn"
                                    onClick={onEdit}
                                    disabled={selectedCount !== 1}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: selectedCount !== 1 ? 0.4 : 1 }}
                                >
                                    <Icons.Edit /> Edit
                                </button>
                            )}
                            {canRemove && (
                                <button className="tool-btn remove-btn" onClick={onRemove} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Icons.Trash /> Remove
                                </button>
                            )}
                            {!canEdit && !canRemove && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', opacity: 0.6 }}>Modified access restricted</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <SortButton options={sortOptions} currentKey={currentSortKey} onSort={onSortChange} />
                        {filterElement}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                            <Icons.Search style={{ position: 'absolute', left: '1rem', opacity: 0.5, pointerEvents: 'none' }} />
                            <input 
                                type="text"
                                className="search-bar"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '2.5rem', width: '260px' }}
                            />
                        </div>
                        {viewSwitcher}
                    </div>
                )}
            </div>
            <div className="toolbar-right">
                {selectedCount === 0 && canAdd && (
                    <button className="tool-btn add-btn" onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icons.Plus /> {addLabel}
                    </button>
                )}
            </div>
        </div>
    );
};
window.TableToolbar = TableToolbar;

const TableMessage = ({ colSpan, dbError, isEmpty, emptyMessage }) => {
    if (dbError) {
        return (
            <tr>
                <td colSpan={colSpan} style={{ textAlign: 'center', padding: '6rem 3rem' }}>
                    <Icons.Alert />
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Connection Interrupted</div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>{dbError}</div>
                </td>
            </tr>
        );
    }

    if (isEmpty) {
        return (
            <tr>
                <td colSpan={colSpan} style={{ textAlign: 'center', padding: '5rem 3rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '500', fontStyle: 'italic' }}>{emptyMessage}</div>
                </td>
            </tr>
        );
    }

    return null;
};
window.TableMessage = TableMessage;

const StatusBadge = ({ type, value }) => {
    let style = { padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' };
    
    if (type === 'role') {
        if(value === 'Administrator') { style.background = 'rgba(16, 185, 129, 0.15)'; style.color = 'rgb(4, 120, 87)'; }
        else if(value === 'Manager') { style.background = 'rgba(59, 130, 246, 0.15)'; style.color = 'rgb(29, 78, 216)'; }
        else { style.background = 'rgba(245, 158, 11, 0.15)'; style.color = 'rgb(180, 83, 9)'; }
    } else if (type === 'stock') {
        const isReorder = value === 'Reorder' || value === 'To Restock';
        const isInProcess = value === 'I' || value === 'In Progress' || value === 'Restocking (I)';
        
        if (isReorder) { style.background = 'rgba(239, 68, 68, 0.1)'; style.color = 'var(--danger)'; }
        else if (isInProcess) { style.background = 'rgba(99, 102, 241, 0.1)'; style.color = 'var(--accent-color)'; }
        else { style.background = 'rgba(16, 185, 129, 0.1)'; style.color = 'var(--success)'; }
    } else if (type === 'simple') {
        style.background = 'var(--hover-bg)';
        style.color = 'var(--text-secondary)';
    }

    return <span style={style}>{value}</span>;
};
window.StatusBadge = StatusBadge;

