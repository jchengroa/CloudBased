/** @jsx React.createElement */

const UnifiedFilterBar = ({
    // Warehouse Filter
    warehouses = [],
    activeWarehouse = 'All',
    onWarehouseChange,
    warehouseAllLabel = 'All Locations',
    
    // Type/Focus Filter
    focusOptions = [],
    activeFocus = 'All',
    onFocusChange,
    focusAllLabel = 'All Types',

    // Primary View Switcher
    viewOptions = [],
    activeView,
    onViewChange,

    // Secondary Display View (Grid/Table)
    displayModeOptions = [],
    activeDisplayMode,
    onDisplayModeChange
}) => {
    const { ViewSwitcher } = window;

    return (
        <div 
            className="unified-filter-bar" 
            style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0.5rem 1.5rem', 
                margin: '0 0 0.5rem 0',
                borderBottom: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '1rem'
            }}
        >
            {/* LEFT: Primary Navigation */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {viewOptions.length > 0 && onViewChange && (
                    <ViewSwitcher
                        activeView={activeView}
                        setActiveView={onViewChange}
                        options={viewOptions}
                    />
                )}
            </div>

            {/* CENTER / RIGHT: Compact Filters & View Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                
                {/* Secondary Filters - Subtler Styling Native Selects */}
                {warehouses.length > 0 && onWarehouseChange && (
                    <div className="filter-select-wrapper" style={{ position: 'relative' }}>
                         <select
                            value={activeWarehouse}
                            onChange={(e) => onWarehouseChange(e.target.value)}
                            style={{
                                padding: '0.45rem 2rem 0.45rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--hover-bg)', // Subtle visual hierarchy
                                color: 'var(--text-primary)',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                transition: 'all 0.2s',
                                minWidth: '140px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                         >
                            <option value="All">{warehouseAllLabel}</option>
                            {warehouses.filter((w) => w !== 'All').map((w) => (
                                <option key={w} value={w}>{w}</option>
                            ))}
                         </select>
                         <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                            ▼
                         </div>
                    </div>
                )}

                {focusOptions.length > 0 && onFocusChange && (
                    <div className="filter-select-wrapper" style={{ position: 'relative' }}>
                         <select
                            value={activeFocus}
                            onChange={(e) => onFocusChange(e.target.value)}
                            style={{
                                padding: '0.45rem 2rem 0.45rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--hover-bg)', // Subtle visual hierarchy
                                color: 'var(--text-primary)',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                transition: 'all 0.2s',
                                minWidth: '150px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                         >
                            <option value="All">{focusAllLabel}</option>
                            {focusOptions.filter((f) => f !== 'All').map((f) => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                         </select>
                         <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                            ▼
                         </div>
                    </div>
                )}

                {/* FAR RIGHT: View Toggles */}
                {displayModeOptions.length > 0 && onDisplayModeChange && (
                    <div style={{ paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
                        <ViewSwitcher
                            variant="circles"
                            activeView={activeDisplayMode}
                            setActiveView={onDisplayModeChange}
                            options={displayModeOptions}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

window.UnifiedFilterBar = UnifiedFilterBar;
