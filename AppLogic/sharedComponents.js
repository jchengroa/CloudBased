// SVG Icons for elegance and organization
// Enhanced to accept and spread props for flexible positioning
const Icons = {
    Search: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Plus: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Edit: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Trash: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
    Alert: (p) => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
    Sort: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="14" y2="12"></line><line x1="4" y1="18" x2="8" y2="18"></line></svg>,
    SortAZ: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m3 16 4 4 4-4"></path><path d="M7 20V4"></path><path d="M11 4h4a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h4"></path><path d="M11 12h4"></path></svg>,
    SortZA: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m3 8 4-4 4 4"></path><path d="M7 4v16"></path><path d="M11 12h4"></path><path d="M11 4h4a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h4"></path></svg>,
    TrendingUp: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>,
    TrendingDown: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>,
    ChevronDown: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"></polyline></svg>,
    Close: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Box: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    Users: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    ArrowDownCircle: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"></circle><polyline points="8 12 12 16 16 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></svg>,
    ArrowUpCircle: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>,
    AlertTriangle: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
    PieChart: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>,
    Activity: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
    Dashboard: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    List: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
    Layers: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
    Truck: (p) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
};

// Global Exposure for components
window.SearchIcon = Icons.Search;
window.SortAZIcon = Icons.SortAZ;
window.SortZAIcon = Icons.SortZA;
window.TrendingUpIcon = Icons.TrendingUp;
window.TrendingDownIcon = Icons.TrendingDown;
window.CloseIcon = Icons.Close;
window.BoxIcon = Icons.Box;
window.UsersIcon = Icons.Users;
window.ArrowDownCircleIcon = Icons.ArrowDownCircle;
window.ArrowUpCircleIcon = Icons.ArrowUpCircle;
window.AlertTriangleIcon = Icons.AlertTriangle;
window.PieChartIcon = Icons.PieChart;
window.ActivityIcon = Icons.Activity;
window.DashboardIcon = Icons.Dashboard;
window.ListIcon = Icons.List;
window.LayersIcon = Icons.Layers;
window.TruckIcon = Icons.Truck;

// Dropdown filter pill button
const SortButton = ({ options = [], currentKey, onSort }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropRef = React.useRef(null);

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
                <span>{activeOption ? activeOption.label : 'Sort By'}</span>
                <Icons.ChevronDown />
            </button>
            
            {isOpen && (
                <div className="sort-menu">
                    <div style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Organize Items</div>
                    {options.map(opt => (
                        <div
                            key={opt.key}
                            className={`sort-item ${currentKey === opt.key ? 'active' : ''}`}
                            onClick={() => { onSort(opt.key); setIsOpen(false); }}
                        >
                            <span style={{ opacity: 0.7, display: 'flex' }}>{opt.icon || <Icons.Sort />}</span>
                            <span>{opt.label}</span>
                        </div>
                    ))}
                    {currentKey && (
                        <div
                            className="sort-item"
                            onClick={() => { onSort(''); setIsOpen(false); }}
                            style={{ color: 'var(--danger)', borderTop: '1px solid var(--border-color)', marginTop: '0.4rem', paddingTop: '0.6rem' }}
                        >
                            <Icons.Trash />
                            <span>Reset Perspective</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
window.SortButton = SortButton;

const ViewSwitcher = ({ activeView, setActiveView, options }) => (
    <div className="view-switcher" style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '40px', display: 'flex', gap: '4px', border: '1px solid var(--border-color)' }}>
        {options.map(v => (
            <button
                key={v.key}
                className={`view-switcher-btn ${activeView === v.key ? 'active' : ''}`}
                onClick={() => setActiveView(v.key)}
                style={{ 
                    background: activeView === v.key ? 'var(--accent-color)' : 'transparent',
                    border: 'none',
                    color: activeView === v.key ? 'white' : 'var(--text-secondary)',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '30px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: activeView === v.key ? '0 8px 16px -4px rgba(99, 102, 241, 0.4)' : 'none'
                }}
            >
                {v.label}
            </button>
        ))}
    </div>
);
window.ViewSwitcher = ViewSwitcher;

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
    filterElement = null
}) => {
    return (
        <div className="management-toolbar">
            <div className="toolbar-left">
                {selectedCount > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="selection-count">{selectedCount} row(s) selected</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="tool-btn edit-btn"
                                onClick={onEdit}
                                disabled={selectedCount !== 1}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: selectedCount !== 1 ? 0.4 : 1 }}
                            >
                                <Icons.Edit /> Edit
                            </button>
                            <button className="tool-btn remove-btn" onClick={onRemove} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Icons.Trash /> Remove
                            </button>
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
                {selectedCount === 0 && (
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

// --- SHARED FORM ABSTRACTIONS ---
const FormInput = ({ label, type = "text", ...props }) => (
    <div className="auth-input-group">
        <label className="auth-label">{label}</label>
        <input type={type} className="auth-input" {...props} />
    </div>
);
window.FormInput = FormInput;

const FormSelect = ({ label, options = [], ...props }) => (
    <div className="auth-input-group">
        <label className="auth-label">{label}</label>
        <select className="auth-input" style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }} {...props}>
            {options.map((opt, i) => (
                <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                    {typeof opt === 'object' ? opt.label : opt}
                </option>
            ))}
        </select>
    </div>
);
window.FormSelect = FormSelect;
const FormButtons = ({ confirmLabel = "Save Changes", isDanger = false, onClose, onConfirm, isSaving }) => (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center', marginTop: '2.5rem' }}>
        <button type="button" className="auth-btn-text" onClick={onClose} style={{ padding: '0.8rem 1.5rem', background: 'transparent' }}>Cancel</button>
        <button 
            type="button"
            className={isDanger ? "tool-btn remove-btn" : "auth-btn-primary"} 
            onClick={onConfirm} 
            disabled={isSaving}
            style={{ padding: '0.8rem 2rem', minWidth: '140px', margin: 0 }}
        >
            {isSaving ? 'Processing...' : confirmLabel}
        </button>
    </div>
);
window.FormButtons = FormButtons;

// --- IMAGE UTILITY ---
// Resizes and compresses images to fit within Firestore document limits (~1MB)
window.resizeImage = (file, maxSide = 500) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSide) {
                        height *= maxSide / width;
                        width = maxSide;
                    }
                } else {
                    if (height > maxSide) {
                        width *= maxSide / height;
                        height = maxSide;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Return compressed JPEG to save significant space
                resolve(canvas.toDataURL('image/jpeg', 0.8)); 
            };
        };
    });
};
