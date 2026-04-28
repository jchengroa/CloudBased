/**
 * Shared Component: DashboardGrid
 * Handles 2D grid layout with reordering and resizing capabilities.
 */
const DashboardGrid = ({ 
    items = [], 
    layout = { order: [], sizes: {} }, 
    isEditMode = false, 
    onLayoutChange,
    onToggleVisibility,
    viewKey = 'default'
}) => {
    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    const { order = [], sizes = {} } = layout;
    const [draggedIndex, setDraggedIndex] = React.useState(null);
    const containerRef = React.useRef(null);
    const [columns, setColumns] = React.useState(2);

    // Dynamic Column Calculation
    React.useEffect(() => {
        const observer = new ResizeObserver(entries => {
            const width = entries[0].contentRect.width;
            if (width < 650) setColumns(1);
            else if (width < 1400) setColumns(2);
            else if (width < 2200) setColumns(3);
            else setColumns(4);
        });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const visibleItems = order
        .map((id) => items.find((item) => item.id === id))
        .filter((item) => item && item.visible);

    const handleResize = (id, newSize) => {
        onLayoutChange(prev => ({ 
            ...prev, 
            sizes: { ...(prev.sizes || {}), [id]: newSize } 
        }));
    };

    const onDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragEnter = (index) => {
        if (draggedIndex === null || draggedIndex === index) return;
        onLayoutChange(prev => {
            const newOrder = [...(prev.order || [])];
            const draggedItem = newOrder[draggedIndex];
            newOrder.splice(draggedIndex, 1);
            newOrder.splice(index, 0, draggedItem);
            setDraggedIndex(index);
            return { ...prev, order: newOrder };
        });
    };

    const onDragEnd = () => setDraggedIndex(null);

    return (
        <div ref={containerRef} style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${columns}, 1fr)`, 
            gap: '1.5rem',
            width: '100%',
            transition: 'grid-template-columns 0.4s ease'
        }}>
            {visibleItems.length === 0 && (
                <div className="dashboard-empty-state" style={{ gridColumn: '1 / -1' }}>
                    No widgets are visible for this view. Use rearrange mode to show the ones you want.
                </div>
            )}

            {order.map((id, index) => {
                const item = items.find(it => it.id === id);
                if (!item || !item.visible) return null;

                const isResizable = item.isResizable !== false;
                const size = item.fixedSize || sizes[id] || 2; 
                
                // Responsive Column Span Logic
                let gridColumn = '';
                if (columns === 1) {
                    gridColumn = 'span 1';
                } else {
                    if (size === 1) gridColumn = 'span 1';
                    else if (size === 2) gridColumn = `span ${Math.min(columns, 2)}`;
                    else if (size === 'full') gridColumn = `span ${columns}`;
                    
                    // Default to span 2 for legacy size 2 if columns > 2, 
                    // unless it's intended to be full row.
                    // dashboard.js items like 'assistant' use fixedSize: 2.
                    // If we want 'assistant' to be full width always, it should use 'full' or we detect it.
                    if (id === 'assistant' || id === 'metrics') gridColumn = `span ${columns}`;
                }

                return (
                    <div 
                        key={`${viewKey}-${id}`} 
                        draggable={isEditMode}
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragEnter={() => onDragEnter(index)}
                        onDragEnd={onDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        style={{ 
                            gridColumn,
                            position: 'relative',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            animation: 'dashboardViewEnter 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
                            border: isEditMode ? '1px dashed var(--accent-color)' : '1px solid transparent',
                            borderRadius: '24px',
                            padding: isEditMode ? '1.5rem' : '0',
                            background: isEditMode ? 'var(--hover-bg)' : 'transparent',
                            transform: isEditMode ? (draggedIndex === index ? 'scale(1.02)' : 'scale(1)') : 'scale(1)',
                            opacity: draggedIndex === index ? 0.3 : 1,
                            cursor: isEditMode ? 'grab' : 'default',
                            zIndex: isEditMode ? (draggedIndex === index ? 100 : 10) : 1
                        }}
                    >
                        {isEditMode && (
                            <div style={{ 
                                position: 'absolute', top: '-12px', right: '12px', zIndex: 110, 
                                display: 'flex', gap: '0.4rem' 
                            }}>
                                {isResizable && (
                                    <>
                                        {size === 2 ? (
                                            <button onClick={(e) => { e.stopPropagation(); handleResize(id, 1); }} className="grid-control-btn" title="Condense">
                                                <Icons.Minimize size={14} />
                                            </button>
                                        ) : (
                                            <button onClick={(e) => { e.stopPropagation(); handleResize(id, 2); }} className="grid-control-btn" title="Expand">
                                                <Icons.Maximize size={14} />
                                            </button>
                                        )}
                                        <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }}></div>
                                    </>
                                )}
                                <button 
                                    className="grid-control-btn" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onToggleVisibility) onToggleVisibility(id);
                                    }}
                                    style={{ background: 'var(--danger)', color: 'white', border: 'none' }}
                                    title="Hide Widget"
                                >
                                    <Icons.EyeOff size={14} /> 
                                </button>
                            </div>
                        )}
                        <div style={{ pointerEvents: isEditMode ? 'none' : 'auto', height: '100%' }}>
                            {item.component}
                        </div>
                    </div>
                );
            })}
            
            <style>{`
                .grid-control-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-primary);
                    transition: all 0.2s;
                }
                .grid-control-btn:hover {
                    opacity: 0.9;
                    transform: scale(1.1);
                }
                .dashboard-empty-state {
                    min-height: 220px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 2rem;
                    border: 1px dashed var(--border-color);
                    border-radius: 24px;
                    color: var(--text-secondary);
                    background: var(--hover-bg);
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};
window.DashboardGrid = DashboardGrid;
window.DashboardGrid = DashboardGrid;
