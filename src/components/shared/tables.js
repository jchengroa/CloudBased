// Dropdown filter pill button
const SortButton = ({ options = [], currentKey, currentDirection = 'asc', onSort }) => {
    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    const [isOpen, setIsOpen] = React.useState(false);
    const dropRef = React.useRef(null);
    const renderSafeIcon = (icon) => {
        if (!React.isValidElement(icon)) return null;
        const iconType = icon.type;
        const isRenderableType = typeof iconType === 'string' || typeof iconType === 'function';
        return isRenderableType ? icon : null;
    };

    if (!options || options.length === 0) return null;

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeOption = options.find((o) => o.key === currentKey);

    return (
        <div className="sort-wrapper" ref={dropRef} style={{ position: 'relative' }}>
            <button
                className={`sort-btn ${currentKey ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: '700',
                    background: currentKey ? 'rgba(99, 102, 241, 0.15)' : 'var(--hover-bg)',
                    border: '1px solid',
                    borderColor: currentKey ? 'var(--accent-color)' : 'var(--border-color)',
                    padding: '0.6rem',
                    minWidth: '44px',
                    borderRadius: '12px',
                    color: currentKey ? 'var(--accent-color)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                title={activeOption ? `Sorted by: ${activeOption.label}` : 'Sort Properties'}
            >
                <Icons.Layers size={18} style={{ opacity: currentKey ? 1 : 0.6 }} />
                {activeOption && <span style={{ fontSize: '0.85rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeOption.label}</span>}
                <Icons.ChevronDown size={14} style={{ opacity: 0.5 }} />
            </button>

            {isOpen && (
                <div className="sort-menu" style={{ zIndex: 100 }}>
                    <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        Sort By Property
                    </div>
                    {options.map((opt) => {
                        const isActive = currentKey === opt.key;
                        return (
                            <div
                                key={opt.key}
                                className={`sort-item ${isActive ? 'active' : ''}`}
                                onClick={() => { onSort(opt.key); setIsOpen(false); }}
                            >
                                <span>{opt.label}</span>
                                {isActive && (
                                    <span style={{ marginLeft: 'auto', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        {currentDirection === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                    <div
                        className="sort-item"
                        onClick={() => { onSort(''); setIsOpen(false); }}
                        style={{ color: currentKey ? 'var(--danger)' : 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', marginTop: '0.4rem', paddingTop: '0.6rem', opacity: currentKey ? 1 : 0.4 }}
                    >
                        <Icons.Trash size={14} />
                        <span>Reset Sort</span>
                    </div>
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
    restrictionScope = "Items"
}) => {
    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    const hasRes = (action) => {
        if (!user || user.role === 'Administrator') return false;
        return (user.restrictions || []).includes(`${action}${restrictionScope}`);
    };

    const canAdd = !hasRes('Add');
    const canEdit = !hasRes('Edit');
    const canRemove = !hasRes('Remove');

    const isSearchActive = searchQuery && searchQuery.length > 0;
    const useHubToolbar = selectedCount === 0 && !!viewSwitcher && !!filterElement;
    const searchControl = (
        <div className="toolbar-search-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Icons.Search 
                size={18}
                style={{ 
                    position: 'absolute', 
                    left: '0.85rem', 
                    opacity: 0.5, 
                    color: isSearchActive ? 'var(--accent-color)' : 'inherit',
                    pointerEvents: 'none',
                    zIndex: 2
                }} 
            />
            <input
                type="text"
                className="search-bar"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                    paddingLeft: '2.5rem', 
                    width: '100%',
                    background: 'var(--hover-bg)',
                    borderColor: isSearchActive ? 'var(--accent-color)' : 'var(--border-color)',
                    borderRadius: '12px',
                    height: '42px',
                    transition: 'border-color 0.2s'
                }}
            />
        </div>
    );

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
                ) : useHubToolbar ? (
                    <div className="toolbar-hub-layout">
                        <div className="toolbar-hub-top">
                            <div className="toolbar-view-slot">{viewSwitcher}</div>
                            <div className="toolbar-filter-slot">{filterElement}</div>
                        </div>
                        <div className="toolbar-hub-bottom">
                            <div className="toolbar-hub-bottom-left">
                                <SortButton options={sortOptions} currentKey={currentSortKey} currentDirection={currentSortDirection} onSort={onSortChange} />
                                {searchControl}
                            </div>
                            {canAdd && (
                                <button className="tool-btn add-btn toolbar-hub-add" onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Icons.Plus /> {addLabel}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="toolbar-controls-row">
                        <SortButton options={sortOptions} currentKey={currentSortKey} onSort={onSortChange} />
                        {filterElement ? <div className="toolbar-filter-slot">{filterElement}</div> : null}
                        {searchControl}
                        {viewSwitcher ? <div className="toolbar-view-slot">{viewSwitcher}</div> : null}
                    </div>
                )}
            </div>
            <div className="toolbar-right">
                {!useHubToolbar && selectedCount === 0 && canAdd && (
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
                    <Icons.Alert size={64} color="var(--danger)" style={{ margin: '0 auto 1.25rem' }} />
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
    const style = { padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' };

    if (type === 'role') {
        if (value === 'Administrator') { style.background = 'rgba(16, 185, 129, 0.15)'; style.color = 'rgb(4, 120, 87)'; }
        else if (value === 'Manager') { style.background = 'rgba(59, 130, 246, 0.15)'; style.color = 'rgb(29, 78, 216)'; }
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
