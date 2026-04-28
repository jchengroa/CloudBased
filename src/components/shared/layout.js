const ViewSwitcher = ({ activeView, setActiveView, options, className = '', variant = 'pill' }) => {
    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    const activeIndex = Math.max(options.findIndex((option) => option.key === activeView), 0);
    const isCircles = variant === 'circles';
    const renderSafeIcon = (icon, size) => {
        if (!React.isValidElement(icon)) return null;
        const iconType = icon.type;
        const isRenderableType = typeof iconType === 'string' || typeof iconType === 'function';
        if (!isRenderableType) return null;
        return React.cloneElement(icon, { size });
    };

    return (
        <div 
            className={`view-switcher ${className} switcher-variant-${variant}`.trim()} 
            style={{ 
                position: 'relative', 
                background: isCircles ? 'transparent' : 'rgba(255,255,255,0.03)', 
                padding: '4px', 
                borderRadius: '40px', 
                display: 'flex', 
                gap: isCircles ? '0.75rem' : '4px', 
                border: isCircles ? 'none' : '1px solid var(--border-color)', 
                width: 'fit-content'
            }}
        >
            {isCircles && (
                <div
                    className="view-switcher-indicator"
                    style={{
                        position: 'absolute',
                        top: '4px',
                        bottom: '4px',
                        left: `calc(${activeIndex} * (42px + 0.75rem))`, // Match the gap
                        width: '42px',
                        background: 'var(--accent-color)',
                        borderRadius: '50%',
                        boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.5)',
                        transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        zIndex: 0
                    }}
                />
            )}
            {options.map((v) => {
                const isActive = activeView === v.key;
                return (
                    <button
                        key={v.key}
                        className={`view-switcher-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveView(v.key)}
                        title={v.label}
                        style={{
                            position: 'relative',
                            zIndex: 1,
                            background: (isActive && !isCircles) ? 'var(--accent-color)' : (isCircles && !isActive ? 'var(--hover-bg)' : 'transparent'),
                            border: isCircles && !isActive ? '1px solid var(--border-color)' : 'none',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            padding: isCircles ? '0' : '0.65rem 1.4rem',
                            width: isCircles ? '42px' : 'auto',
                            height: isCircles ? '42px' : 'auto',
                            borderRadius: '50%', // Circle for circles variant, pill for others
                            ...( !isCircles && { borderRadius: '40px' } ),
                            fontSize: '0.86rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.6rem',
                            transition: 'all 0.24s ease',
                            boxShadow: (isActive && !isCircles) ? '0 8px 16px -4px rgba(99, 102, 241, 0.4)' : 'none'
                        }}
                    >
                        {v.icon ? <span style={{ display: 'flex' }}>{renderSafeIcon(v.icon, isCircles ? 18 : 16)}</span> : null}
                        {!isCircles && <span className="view-switcher-label">{v.label}</span>}
                    </button>
                );
            })}
        </div>
    );
};
window.ViewSwitcher = ViewSwitcher;

const WarehousePills = ({ warehouses = [], activeWarehouse = 'All', onChange, allLabel = 'All Locations', compact = false }) => {
    if (warehouses.length <= 1) return null;

    return (
        <div className={`location-pills warehouse-pills ${compact ? 'compact-pills' : ''}`} style={compact ? { padding: 0, gap: '0.4rem', border: 'none', background: 'transparent' } : {}}>
            {warehouses.map((warehouse) => (
                <button
                    key={warehouse}
                    className={`location-pill ${activeWarehouse === warehouse ? 'active' : ''}`}
                    onClick={() => onChange(warehouse)}
                    title={warehouse === 'All' ? allLabel : warehouse}
                    style={compact ? { padding: '0.35rem 0.85rem', fontSize: '0.75rem', borderRadius: '12px', height: 'auto' } : {}}
                >
                    <span className="location-pill-label">{warehouse === 'All' ? allLabel : warehouse}</span>
                </button>
            ))}
        </div>
    );
};
window.WarehousePills = WarehousePills;

const GenericModal = ({ isOpen, onClose, title, children, width = "500px" }) => {
    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    if (!isOpen) return null;
    return (
        <div className="prompt-overlay" onClick={onClose}>
            <div className="prompt-box" style={{ width, padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>{title}</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--hover-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '32px', height: '32px', color: 'var(--text-secondary)' }}>
                        <Icons.Close size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};
window.GenericModal = GenericModal;

const Card = ({ children, style, className = '' }) => (
    <div className={`card-component ${className}`} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', ...style }}>
        {children}
    </div>
);
window.Card = Card;

const CardHeader = ({ icon, title, subtitle, rightElement }) => (
    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)' }}>
                {icon} {title}
            </h3>
            {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem', marginBottom: 0 }}>{subtitle}</p>}
        </div>
        {rightElement && <div>{rightElement}</div>}
    </div>
);
window.CardHeader = CardHeader;

const CardBody = ({ children, style, className = '' }) => (
    <div className={`card-body ${className}`} style={{ padding: '1.5rem', ...style }}>
        {children}
    </div>
);
window.CardBody = CardBody;

const ActionBar = ({
    selectedCount = 0,
    searchQuery = '',
    onSearchChange,
    searchPlaceholder = 'Search...',
    primaryTabs = [],
    activeTab,
    onTabChange,
    primaryAction = null,
    viewSwitchers = [],
    activeView,
    onViewChange,
    sortOptions = [],
    sortConfig,
    onSort,
    selectionActions = [],
    canUndo = false,
    canRedo = false,
    onUndo,
    onRedo
}) => {
    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    return (
        <div style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-start', 
            background: 'var(--card-bg)', 
            padding: '0.9rem 1.25rem', 
            borderRadius: '16px', 
            border: '1px solid var(--border-color)', 
            margin: '0 1.5rem 1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            gap: '1rem',
            flexWrap: 'wrap'
        }}>
            {selectedCount > 0 ? (
                // Selection Mode
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{selectedCount} row(s) selected</span>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {selectionActions}
                    </div>
                </div>
            ) : (
                // Standard Mode
                <div style={{ display: 'flex', width: '100%', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* 1. Primary Navigation (Tabs left) */}
                    {primaryTabs.length > 0 && (
                        <div style={{ display: 'flex', background: 'var(--hover-bg)', borderRadius: '12px', padding: '0.25rem', flexWrap: 'wrap' }}>
                            {primaryTabs.map((v) => {
                                const IconComp = Icons[v.icon];
                                return (
                                    <button 
                                        key={v.key} 
                                        onClick={() => onTabChange(v.key)} 
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: '0.4rem', 
                                            padding: '0.5rem 1.25rem', borderRadius: '10px', 
                                            background: activeTab === v.key ? 'var(--card-bg)' : 'transparent', 
                                            color: activeTab === v.key ? 'var(--text-primary)' : 'var(--text-secondary)', 
                                            fontWeight: activeTab === v.key ? 700 : 500, 
                                            border: 'none', cursor: 'pointer', 
                                            boxShadow: activeTab === v.key ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', 
                                            transition: 'all 0.2s' 
                                        }}
                                    >
                                        {IconComp && <IconComp size={16} />} {v.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* 2. Center: Prominent Search */}
                    <div style={{ flex: 1, minWidth: '200px', maxWidth: '500px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', height: '42px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                            <Icons.Search size={18} style={{ color: 'var(--text-secondary)', marginLeft: '1rem', flexShrink: 0, opacity: 0.7 }} />
                            <input 
                                type="text" 
                                placeholder={searchPlaceholder} 
                                value={searchQuery} 
                                onChange={(e) => onSearchChange(e.target.value)} 
                                style={{ width: '100%', height: '100%', padding: '0 1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem', fontWeight: 500 }} 
                            />
                        </div>
                    </div>

                    {/* 2.5 Undo/Redo Stack controls */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--hover-bg)', borderRadius: '12px', padding: '0.25rem' }}>
                        <button 
                            onClick={onUndo} 
                            disabled={!canUndo} 
                            style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                width: '38px', height: '38px', borderRadius: '10px', 
                                background: 'transparent', border: 'none', 
                                color: canUndo ? 'var(--text-primary)' : 'var(--text-secondary)', 
                                opacity: canUndo ? 1 : 0.3,
                                cursor: canUndo ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s'
                            }}
                            title="Undo (Ctrl+Z)"
                        >
                            <Icons.RotateCcw size={18} />
                        </button>
                        <button 
                            onClick={onRedo} 
                            disabled={!canRedo} 
                            style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                width: '38px', height: '38px', borderRadius: '10px', 
                                background: 'transparent', border: 'none', 
                                color: canRedo ? 'var(--text-primary)' : 'var(--text-secondary)', 
                                opacity: canRedo ? 1 : 0.3,
                                cursor: canRedo ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s'
                            }}
                            title="Redo (Ctrl+Y)"
                        >
                            <Icons.RotateCw size={18} />
                        </button>
                    </div>

                    {/* 3. Right: Add Button, View Switcher, Sort */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
                        {primaryAction && (
                            <button onClick={primaryAction.onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-color)', color: 'white', border: 'none', height: '42px', padding: '0 1.25rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
                                {primaryAction.icon && React.createElement(Icons[primaryAction.icon] || 'span', { size: 16 })} 
                                {primaryAction.label}
                            </button>
                        )}

                        {viewSwitchers.length > 0 && (
                            <div style={{ display: 'flex', background: 'var(--hover-bg)', borderRadius: '12px', padding: '0.25rem', height: '42px' }}>
                                {viewSwitchers.map(v => {
                                    const IconComp = Icons[v.icon];
                                    return (
                                        <button 
                                            key={v.key} 
                                            onClick={() => onViewChange(v.key)} 
                                            style={{ 
                                                padding: '0 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                borderRadius: '10px', 
                                                background: activeView === v.key ? 'var(--card-bg)' : 'transparent', 
                                                color: activeView === v.key ? 'var(--text-primary)' : 'var(--text-secondary)', 
                                                border: 'none', cursor: 'pointer', 
                                                boxShadow: activeView === v.key ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' 
                                            }}
                                        >
                                            {IconComp && <IconComp size={16} />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {sortOptions.length > 0 && window.SortButton && (
                            <div style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
                                <window.SortButton options={sortOptions} currentKey={sortConfig?.key} onSort={onSort} />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
window.ActionBar = ActionBar;
