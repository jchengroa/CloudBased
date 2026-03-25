/**
 * Shared Component: DashboardGrid
 * Handles 2D grid layout with reordering and resizing capabilities.
 */
const DashboardGrid = ({ 
    items = [], 
    layout = { order: [], sizes: {} }, 
    isEditMode = false, 
    onLayoutChange 
}) => {
    const { order = [], sizes = {} } = layout;

    const handleMove = (index, direction) => {
        const newOrder = [...order];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newOrder.length) return;
        
        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
        onLayoutChange({ ...layout, order: newOrder });
    };

    const handleResize = (id, newSize) => {
        onLayoutChange({ 
            ...layout, 
            sizes: { ...sizes, [id]: newSize } 
        });
    };

    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            width: '100%',
            transition: 'all 0.4s ease'
        }}>
            {order.map((id, index) => {
                const item = items.find(it => it.id === id);
                if (!item || !item.visible) return null;

                const isResizable = item.isResizable !== false;
                const size = item.fixedSize || sizes[id] || 2; 
                const gridColumn = size === 1 ? 'span 1' : 'span 2';

                return (
                    <div 
                        key={id} 
                        style={{ 
                            gridColumn,
                            position: 'relative',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            animation: 'slideUp 0.4s ease-out',
                            border: isEditMode ? '2px dashed var(--accent-color)' : '2px solid transparent',
                            borderRadius: '24px',
                            padding: isEditMode ? '1.5rem' : '0',
                            background: isEditMode ? 'var(--hover-bg)' : 'transparent',
                            transform: isEditMode ? 'scale(0.99)' : 'scale(1)',
                            zIndex: isEditMode ? 10 : 1
                        }}
                    >
                        {isEditMode && (
                            <div style={{ 
                                position: 'absolute', top: '-15px', right: '20px', zIndex: 100, 
                                display: 'flex', gap: '0.4rem' 
                            }}>
                                {/* Resize Controls */}
                                {isResizable && (
                                    <>
                                        {size === 2 ? (
                                            <button onClick={() => handleResize(id, 1)} className="grid-control-btn" title="Condense">
                                                <window.Icons.Minimize size={14} />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleResize(id, 2)} className="grid-control-btn" title="Expand">
                                                <window.Icons.Maximize size={14} />
                                            </button>
                                        )}
                                        <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }}></div>
                                    </>
                                )}

                                {/* Reorder Controls */}
                                <button 
                                    onClick={() => handleMove(index, -1)} 
                                    disabled={index === 0} 
                                    className="grid-control-btn"
                                    style={{ opacity: index === 0 ? 0.3 : 1 }}
                                >
                                    <window.Icons.ArrowUpCircle size={14} />
                                </button>
                                <button 
                                    onClick={() => handleMove(index, 1)} 
                                    disabled={index === order.length - 1} 
                                    className="grid-control-btn"
                                    style={{ opacity: index === order.length - 1 ? 0.3 : 1 }}
                                >
                                    <window.Icons.ArrowDownCircle size={14} />
                                </button>
                            </div>
                        )}
                        {item.component}
                    </div>
                );
            })}
            
            <style>{`
                .grid-control-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-primary);
                    transition: all 0.2s;
                }
                .grid-control-btn:hover {
                    background: var(--accent-color);
                    color: #fff;
                    transform: scale(1.1);
                }
                @media (max-width: 900px) {
                    [style*="span 1"] { grid-column: span 2 !important; }
                }
            `}</style>
        </div>
    );
};
window.DashboardGrid = DashboardGrid;
