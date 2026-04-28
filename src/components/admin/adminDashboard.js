/** @jsx React.createElement */
/**
 * Admin Dashboard - Container
 * Ties together all administrative configuration tabs.
 */

/**
 * Admin Dashboard - Overview Tab
 */
const OverviewTab = ({ users, activityLogs, inventoryData, inputLogs, outputLogs, isEditMode, layout, onLayoutChange, onStartEdit, onCancelEdit, onFinishEdit }) => {
    const DashboardGrid = window.DashboardGrid || (() => null);
    const renderIcon = (name, props = {}) => window.renderIcon ? window.renderIcon(name, props) : null;
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === 'Administrator').length;
    const logCount = activityLogs.length;
    const totalItems = inventoryData.length;
    const negativeStock = inventoryData.filter((item) => (parseFloat(item.quantity) || 0) < 0);
    const zeroStock = inventoryData.filter((item) => (parseFloat(item.quantity) || 0) === 0);
    const lowStock = inventoryData.filter((item) => {
        const stock = parseFloat(item.quantity) || 0;
        const threshold = parseFloat(item.optimalStock) || 0;
        return threshold > 0 && stock < threshold;
    });
    const inventoryCodes = new Set(inventoryData.map((item) => item.id || item.itemCode).filter(Boolean));
    const orphanInputs = inputLogs.filter((log) => !inventoryCodes.has(log.itemCode));
    const orphanOutputs = outputLogs.filter((log) => !inventoryCodes.has(log.itemCode));
    const lastArrival = [...inputLogs].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];
    const lastShipment = [...outputLogs].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];
    const integrityScore = Math.max(0, 100 - (negativeStock.length * 20) - (orphanInputs.length * 5) - (orphanOutputs.length * 5));

    const healthStatus = integrityScore === 100 ? 'Healthy' : integrityScore > 80 ? 'Stable' : 'Critical';
    const statusColor = integrityScore === 100 ? '#10b981' : integrityScore > 80 ? '#f59e0b' : '#ef4444';

    const healthPills = [
        { label: 'Negative stock', value: negativeStock.length, tone: negativeStock.length ? '#ef4444' : '#10b981' },
        { label: 'Low stock', value: lowStock.length, tone: lowStock.length ? '#f59e0b' : '#10b981' },
        { label: 'Zero stock', value: zeroStock.length, tone: zeroStock.length ? '#64748b' : '#10b981' },
        { label: 'Orphan logs', value: orphanInputs.length + orphanOutputs.length, tone: (orphanInputs.length + orphanOutputs.length) ? '#ef4444' : '#10b981' }
    ];

    const gridItems = [
        {
            id: 'admin_metrics',
            label: 'System Metrics',
            isResizable: false,
            fixedSize: 'full',
            visible: true,
            component: (
                <div className="admin-overview-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>
                            {renderIcon('Users', { size: 24 })}
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8 }}>Total</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--accent-color)' }}>{totalUsers}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '600' }}>Registered Users</div>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--success)', marginBottom: '0.5rem' }}>
                            {renderIcon('Shield', { size: 24 })}
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8 }}>Admins</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)' }}>{adminCount}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: '600' }}>Administrators</div>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                            {renderIcon('Activity', { size: 24 })}
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.8 }}>Activity</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--warning)' }}>{logCount}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--warning)', fontWeight: '600' }}>Activity Logs</div>
                    </div>
                </div>
            )
        },
        {
            id: 'database_health',
            label: 'Integrity Scan',
            visible: true,
            component: (
                <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(37, 99, 235, 0.92))', color: '#fff', borderRadius: '22px', padding: '1.6rem', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1, transform: 'rotate(15deg)' }}>
                        {renderIcon('Shield', { size: 140 })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', position: 'relative' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.75 }}>Database Integrity</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '900', lineHeight: 1, marginTop: '0.6rem', color: statusColor }}>{healthStatus}</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.6rem', maxWidth: '180px' }}>Analyzing stock anomalies and orphan transaction records.</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem', position: 'relative' }}>
                        {healthPills.map((pill) => (
                            <div key={pill.label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.08)', padding: '0.85rem 1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ fontSize: '0.72rem', opacity: 0.72, textTransform: 'uppercase', fontWeight: '800' }}>{pill.label}</div>
                                <div style={{ marginTop: '0.3rem', fontSize: '1.3rem', fontWeight: '900', color: pill.tone }}>{pill.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'operational_snapshot',
            label: 'Snapshot',
            visible: true,
            component: (
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '22px', padding: '1.5rem', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                        {renderIcon('Layers', { size: 18, color: 'var(--accent-color)' })}
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Operational Snapshot</h3>
                    </div>
                    <div style={{ display: 'grid', gap: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '14px', background: 'var(--hover-bg)' }}>
                            <div>
                                <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: '800' }}>Inventory Items</div>
                                <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{totalItems}</div>
                            </div>
                            {renderIcon('Box', { size: 18, color: 'var(--accent-color)' })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '14px', background: 'var(--hover-bg)' }}>
                            <div>
                                <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: '800' }}>Arrival Logs</div>
                                <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{inputLogs.length}</div>
                            </div>
                            {renderIcon('ArrowDownCircle', { size: 18, color: '#10b981' })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '14px', background: 'var(--hover-bg)' }}>
                            <div>
                                <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', opacity: 0.6, fontWeight: '800' }}>Shipment Logs</div>
                                <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{outputLogs.length}</div>
                            </div>
                            {renderIcon('ArrowUpCircle', { size: 18, color: '#ef4444' })}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'attention_needed',
            label: 'Anomalies',
            visible: true,
            component: (
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.4rem', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                        {renderIcon('AlertTriangle', { size: 18, color: '#f59e0b' })}
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Attention Needed</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Low stock items</span>
                            <strong>{lowStock.length}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Negative stock items</span>
                            <strong>{negativeStock.length}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Logs without item master</span>
                            <strong>{orphanInputs.length + orphanOutputs.length}</strong>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'latest_movement',
            label: 'Movements',
            visible: true,
            component: (
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.4rem', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                        {renderIcon('Activity', { size: 18, color: 'var(--accent-color)' })}
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Latest Movement</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ padding: '0.9rem 1rem', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.16)' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', opacity: 0.65 }}>Last Arrival</div>
                            <div style={{ marginTop: '0.35rem', fontWeight: '800' }}>{lastArrival ? `${lastArrival.itemCode} - ${lastArrival.quantity}` : 'No arrivals yet'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{lastArrival?.date || 'No date available'}</div>
                        </div>
                        <div style={{ padding: '0.9rem 1rem', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.16)' }}>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', opacity: 0.65 }}>Last Shipment</div>
                            <div style={{ marginTop: '0.35rem', fontWeight: '800' }}>{lastShipment ? `${lastShipment.itemCode} - ${lastShipment.quantity}` : 'No shipments yet'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{lastShipment?.date || 'No date available'}</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'recent_activity',
            label: 'Activity Feed',
            isResizable: false,
            fixedSize: 'full',
            visible: true,
            component: (
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                        {renderIcon('Activity', { size: 20, color: 'var(--accent-color)' })}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Recent Activity</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {activityLogs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No recent activity to show.</div>
                        ) : (
                            activityLogs.slice(0, 10).map((log, index) => (
                                <div key={index} className="admin-activity-row" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ background: 'var(--hover-bg)', padding: '0.75rem', borderRadius: '50%', color: 'var(--accent-color)' }}>
                                        {log.type === 'input'
                                            ? renderIcon('ArrowDownCircle', { size: 18, color: 'var(--success)' })
                                            : log.type === 'output'
                                                ? renderIcon('ArrowUpCircle', { size: 18, color: 'var(--danger)' })
                                                : renderIcon('Box', { size: 18 })}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{log.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{log.details}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', opacity: 0.8 }}>
                                            {log.user} - {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )
        }
    ];

    const [isWidgetPanelOpen, setIsWidgetPanelOpen] = React.useState(false);
    const adminWidgetMap = [
        ['admin_metrics', 'System Metrics'],
        ['database_health', 'Integrity Scan'],
        ['operational_snapshot', 'Snapshot'],
        ['attention_needed', 'Anomalies'],
        ['latest_movement', 'Movements'],
        ['recent_activity', 'Activity Feed']
    ];

    const processedItems = gridItems.map(item => ({
        ...item,
        visible: !layout.hidden?.includes(item.id)
    }));

    return (
        <div className="admin-tab-content fade-in">
            <div className="dashboard-toolbar admin-overview-toolbar" style={{ paddingBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <div className="dashboard-title-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h1 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {renderIcon('Grid', { size: 22, color: 'var(--accent-color)' })} Admin Overview
                    </h1>
                    <button onClick={() => (isEditMode ? onCancelEdit() : onStartEdit())} style={{ background: isEditMode ? 'var(--accent-color)' : 'var(--hover-bg)', color: isEditMode ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {renderIcon('Edit', { size: 14 })}
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isEditMode && layout.hidden?.length > 0 && (
                        <button 
                            onClick={() => onLayoutChange(prev => ({ ...prev, hidden: [] }))}
                            style={{ background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {renderIcon('Eye', { size: 14 })} Restore {layout.hidden.length} Hidden
                        </button>
                    )}
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
                        {isEditMode ? 'Editing snapshot layout.' : 'System health & activity at a glance.'}
                    </div>
                </div>
            </div>

            {isEditMode && (
                <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                        {renderIcon('Eye', { size: 18, color: 'var(--accent-color)' })}
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Overview Visibility Controls</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        {adminWidgetMap.map(([id, label]) => {
                            const isHidden = layout.hidden?.includes(id);
                            return (
                                <button 
                                    key={id} 
                                    onClick={() => {
                                        onLayoutChange(prev => ({
                                            ...prev,
                                            hidden: isHidden 
                                                ? (prev.hidden || []).filter(h => h !== id)
                                                : [...(prev.hidden || []), id]
                                        }));
                                    }} 
                                    style={{ 
                                        padding: '0.7rem 1rem', 
                                        borderRadius: '12px', 
                                        border: isHidden ? '1px solid var(--border-color)' : '1px solid var(--success)', 
                                        background: isHidden ? 'var(--card-bg)' : 'rgba(16,185,129,0.08)', 
                                        color: isHidden ? 'var(--text-secondary)' : 'var(--success)',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isHidden ? renderIcon('EyeOff', { size: 14 }) : renderIcon('Eye', { size: 14 })}
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            <DashboardGrid
                items={processedItems}
                layout={layout}
                isEditMode={isEditMode}
                onLayoutChange={onLayoutChange}
                onToggleVisibility={(id) => {
                    const isHidden = layout.hidden?.includes(id);
                    onLayoutChange(prev => ({
                        ...prev,
                        hidden: isHidden 
                            ? (prev.hidden || []).filter(h => h !== id)
                            : [...(prev.hidden || []), id]
                    }));
                }}
                viewKey="admin-overview"
            />
            {isEditMode && (
                <div className="dashboard-edit-banner" style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--accent-color)', color: '#fff', padding: '1rem 2rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span>REARRANGE MODE</span>
                    <button onClick={onCancelEdit} style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '800' }}>CANCEL</button>
                    <button onClick={onFinishEdit} style={{ background: '#fff', color: 'var(--accent-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '800' }}>FINISH</button>
                </div>
            )}
        </div>
    );
};

/**
 * Admin Dashboard - Container
 * Ties together all administrative configuration tabs.
 */
const AdminDashboard = ({
    currentUser,
    inputLogs,
    outputLogs,
    inventoryData,
    onDataSync,
    onBrandingUpdate
}) => {
    const renderIcon = (name, props = {}) => window.renderIcon ? window.renderIcon(name, props) : null;
    const [activeTab, setActiveTab] = React.useState('Overview');
    const [isRearranging, setIsRearranging] = React.useState(false);

    // Internal state for Admin-only data
    const [users, setUsers] = React.useState([]);
    const [activityLogs, setActivityLogs] = React.useState([]);
    const [branding, setBranding] = React.useState({});
    const [globalSettings, setGlobalSettings] = React.useState({});
    const [settings, setSettings] = React.useState(currentUser?.settings || {});
    const [loading, setLoading] = React.useState(true);

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [fetchedUsers, fetchedBranding, fetchedGlobalSettings, fetchedActivityLogs, fetchedSettings] = await Promise.all([
                window.AppDataHandler.getData('users'),
                window.AppDataHandler.getBranding(),
                window.AppDataHandler.getGlobalSettings(),
                window.AppDataHandler.getActivityLogs(),
                window.AppDataHandler.getSettings()
            ]);

            // Generate merged activity logs
            const merged = [
                ...(fetchedActivityLogs || []),
                ...inputLogs.map(log => ({
                    timestamp: log.timestamp,
                    user: log.userName || 'System',
                    title: 'Stock In',
                    details: `IN-${log.id} - Processed input for ${log.itemCode}`,
                    category: 'transaction',
                    type: 'input'
                })),
                ...outputLogs.map(log => ({
                    timestamp: log.timestamp,
                    user: log.userName || 'System',
                    title: 'Stock Out',
                    details: `OUT-${log.id} - Dispatched ${log.itemCode}`,
                    category: 'transaction',
                    type: 'output'
                }))
            ];

            const finalLogs = [];
            const seen = new Set();
            merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).forEach(log => {
                const ts = log.timestamp || new Date().getTime();
                const key = `${Math.floor(ts / 1000)}-${log.user}-${log.title.substring(0, 10)}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    finalLogs.push(log);
                }
            });

            setUsers(fetchedUsers || []);
            setActivityLogs(finalLogs);
            setBranding(fetchedBranding || {});
            setGlobalSettings(fetchedGlobalSettings || {});
            setSettings(fetchedSettings || {});
        } catch (e) {
            console.error("Admin data sync failed:", e);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadAdminData();
    }, [inputLogs, outputLogs]);

    const sanitizeAdminLayout = (l) => {
        const defaultOrder = ['admin_metrics', 'database_health', 'operational_snapshot', 'attention_needed', 'latest_movement', 'recent_activity'];
        const currentOrder = l?.order || defaultOrder;
        const cleaned = currentOrder.filter(id => defaultOrder.includes(id));
        const missing = defaultOrder.filter(id => !cleaned.includes(id));

        return {
            ...l,
            order: [...cleaned, ...missing],
            sizes: {
                admin_metrics: 2, database_health: 1, operational_snapshot: 1,
                attention_needed: 1, latest_movement: 1, recent_activity: 2,
                ...(l?.sizes || {})
            }
        };
    };

    const [adminLayout, setAdminLayout] = React.useState(sanitizeAdminLayout(settings?.adminLayout));

    React.useEffect(() => {
        if (!isRearranging && settings?.adminLayout) {
            setAdminLayout(sanitizeAdminLayout(settings.adminLayout));
        }
    }, [isRearranging, settings]);

    const handleFinishRearrange = async () => {
        try {
            await window.AppDataHandler.saveSettings({ ...settings, adminLayout });
            setIsRearranging(false);
        } catch (e) {
            alert(`Failed to save admin layout: ${e.message}`);
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Syncing Admin Data...</div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <OverviewTab
                        users={users}
                        activityLogs={activityLogs}
                        inventoryData={inventoryData}
                        inputLogs={inputLogs}
                        outputLogs={outputLogs}
                        isEditMode={isRearranging}
                        layout={adminLayout}
                        onLayoutChange={setAdminLayout}
                        onStartEdit={() => setIsRearranging(true)}
                        onCancelEdit={() => {
                            setIsRearranging(false);
                            setAdminLayout(sanitizeAdminLayout(settings.adminLayout));
                        }}
                        onFinishEdit={handleFinishRearrange}
                    />
                );
            case 'Logs':
                return <ActivityLogsTab activityLogs={activityLogs} onClearLogs={loadAdminData} />;
            case 'Assets':
                return <AssetManagementTab onUpdate={onDataSync} />;
            case 'Access':
                return <UserManagementTab users={users} onUpdateUser={loadAdminData} currentUser={currentUser} />;
            case 'Settings':
                return (
                    <GlobalSettingsTab
                        globalSettings={globalSettings}
                        onUpdateGlobalSettings={setGlobalSettings}
                        branding={branding}
                        onUpdateBranding={onBrandingUpdate}
                    />
                );
            case 'Data':
                return <ManageDataTab inventoryData={inventoryData} onDataSync={onDataSync} />;
            default:
                return <div style={{ padding: '2rem', textAlign: 'center' }}>Tab under construction...</div>;
        }
    };

    return (
        <div className="admin-dashboard-container" style={{ padding: '0 2rem 2rem 2rem' }}>
            <div className="admin-tab-bar-shell" style={{ position: 'relative', marginBottom: '2rem' }}>
                <div className="admin-tab-bar">
                    {['Overview', 'Logs', 'Data', 'Assets', 'Access', 'Settings'].map((tab) => (
                        <button
                            key={tab}
                            className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => { setActiveTab(tab); setIsRearranging(false); }}
                        >
                            <span className="admin-tab-btn-icon">
                                {tab === 'Overview' && renderIcon('Dashboard', { size: 18 })}
                                {tab === 'Logs' && renderIcon('FileText', { size: 18 })}
                                {tab === 'Data' && renderIcon('FileSpreadsheet', { size: 18 })}
                                {tab === 'Assets' && renderIcon('Box', { size: 18 })}
                                {tab === 'Access' && renderIcon('Users', { size: 18 })}
                                {tab === 'Settings' && renderIcon('Settings', { size: 18 })}
                            </span>
                            {tab}
                        </button>
                    ))}
                </div>

            </div>

            <div className="admin-tab-panel">
                {renderTabContent()}
            </div>
        </div>
    );
};

/**
 * Admin Dashboard - Activity Logs Tab
 */
const ActivityLogsTab = ({ activityLogs, onClearLogs }) => {
    const renderIcon = (name, props = {}) => window.renderIcon ? window.renderIcon(name, props) : null;
    const [filterCategory, setFilterCategory] = React.useState('All Categories');
    const [isClearing, setIsClearing] = React.useState(false);

    const categories = ['All Categories', 'inventory', 'transaction', 'system', 'supplier', 'user'];

    const filteredLogs = filterCategory === 'All Categories'
        ? activityLogs
        : activityLogs.filter(log => log.category === filterCategory);

    const getBadgeColor = (category) => {
        switch (category) {
            case 'inventory': return { bg: 'rgba(168, 85, 247, 0.15)', text: 'rgb(147, 51, 234)' };
            case 'transaction': return { bg: 'rgba(59, 130, 246, 0.15)', text: 'rgb(37, 99, 235)' };
            case 'system': return { bg: 'rgba(107, 114, 128, 0.15)', text: 'rgb(75, 85, 99)' };
            case 'supplier': return { bg: 'rgba(16, 185, 129, 0.15)', text: 'rgb(5, 150, 105)' };
            case 'user': return { bg: 'rgba(245, 158, 11, 0.15)', text: 'rgb(217, 119, 6)' };
            default: return { bg: 'var(--hover-bg)', text: 'var(--text-secondary)' };
        }
    };

    const handleDownload = () => {
        const header = "Timestamp,User,Action,Details,Category\n";
        const content = filteredLogs.map(log => {
            const date = `"${new Date(log.timestamp).toLocaleString().replace(/"/g, '""')}"`;
            const user = `"${(log.user || '').replace(/"/g, '""')}"`;
            const action = `"${(log.title || '').replace(/"/g, '""')}"`;
            const details = `"${(log.details || '').replace(/"/g, '""')}"`;
            const category = `"${(log.category || 'misc').replace(/"/g, '""')}"`;
            return `${date},${user},${action},${details},${category}`;
        }).join('\n');

        const blob = new Blob([header + content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleClear = async () => {
        if (!confirm("Are you sure you want to PERMANENTLY clear all dedicated activity logs? (Transactions history will remain)")) return;
        setIsClearing(true);
        try {
            await window.AppDataHandler.clearActivityLogs();
            if (onClearLogs) onClearLogs();
        } catch (e) {
            alert("Failed to clear logs: " + e.message);
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Filter by:</span>
                    <select
                        className="auth-input"
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        style={{ width: '200px', margin: 0, padding: '0.5rem 1rem' }}
                    >
                        {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{filteredLogs.length} logs</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={handleDownload}
                        className="tool-btn"
                        style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                        {renderIcon('Download', { size: 16 })} Download .csv
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={isClearing}
                        style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                        {isClearing ? 'Clearing...' : <>{renderIcon('Trash', { size: 16 })} Clear Logs</>}
                    </button>
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th style={{ textAlign: 'center' }}>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No activity found.</td></tr>
                        ) : filteredLogs.map((log, i) => {
                            const badge = getBadgeColor(log.category);
                            return (
                                <tr key={i}>
                                    <td style={{ fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{ fontWeight: '600' }}>{log.user}</td>
                                    <td style={{ fontWeight: '600' }}>{log.title}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '12px',
                                            background: badge.bg,
                                            color: badge.text,
                                            fontSize: '0.7rem',
                                            fontWeight: '800'
                                        }}>
                                            {log.category || 'misc'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/**
 * Admin Dashboard - Asset Management Tab
 */
const PillCard = ({ title, items, newItem, setNewItem, onAdd, onRemove, icon }) => {
    const renderIcon = (name, props = {}) => window.renderIcon ? window.renderIcon(name, props) : null;
    return (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--hover-bg)', padding: '0.5rem', borderRadius: '10px', color: 'var(--accent-color)' }}>{icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>{title}</h3>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem', minHeight: '80px', alignContent: 'flex-start' }}>
                {items.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', opacity: 0.6, fontStyle: 'italic' }}>No values defined.</div>
                ) : (
                    items.map((item, idx) => (
                        <div key={idx} className="fade-in" style={{
                            background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '12px',
                            padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
                            fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)'
                        }}>
                            {item}
                            <button onClick={() => onRemove(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 2, display: 'flex', borderRadius: '4px' }} onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={e => e.target.style.background = 'none'}>
                                {renderIcon('Trash', { size: 14 })}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    className="auth-input"
                    style={{ margin: 0, fontSize: '0.9rem' }}
                    placeholder={`New ${title.slice(0, -1)}...`}
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && onAdd()}
                />
                <button
                    onClick={onAdd}
                    style={{ background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '10px', padding: '0 1rem', cursor: 'pointer', fontWeight: '700' }}
                >
                    {renderIcon('Plus', { size: 20 })}
                </button>
            </div>
        </div>
    );
};

const AssetManagementTab = ({ onUpdate }) => {
    const renderIcon = (name, props = {}) => window.renderIcon ? window.renderIcon(name, props) : null;
    const [uoms, setUoms] = React.useState([]);
    const [warehouses, setWarehouses] = React.useState([]);
    const [newUom, setNewUom] = React.useState('');
    const [newWarehouse, setNewWarehouse] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        const load = async () => {
            try {
                const [u, w] = await Promise.all([
                    window.AppDataHandler.getUOMs(),
                    window.AppDataHandler.getWarehouses()
                ]);
                setUoms(u || []);
                setWarehouses(w || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const handleAddUom = async () => {
        if (!newUom.trim()) return;
        const updated = [...uoms, newUom.trim()];
        setUoms(updated);
        setNewUom('');
        await saveAssets(updated, warehouses);
    };

    const handleRemoveUom = async (index) => {
        const updated = uoms.filter((_, i) => i !== index);
        setUoms(updated);
        await saveAssets(updated, warehouses);
    };

    const handleAddWarehouse = async () => {
        if (!newWarehouse.trim()) return;
        const updated = [...warehouses, newWarehouse.trim()];
        setWarehouses(updated);
        setNewWarehouse('');
        await saveAssets(uoms, updated);
    };

    const handleRemoveWarehouse = async (index) => {
        const updated = warehouses.filter((_, i) => i !== index);
        setWarehouses(updated);
        await saveAssets(uoms, updated);
    };

    const saveAssets = async (u, w) => {
        setIsSaving(true);
        try {
            await Promise.all([
                window.AppDataHandler.saveUOMs(u),
                window.AppDataHandler.saveWarehouses(w)
            ]);
            onUpdate(); // Notify parent to refresh data globally
        } catch (e) {
            alert("Error saving assets: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>Loading core assets...</div>;

    return (
        <div className="admin-tab-content fade-in">
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Configure universal dropdown values used throughout the system.</p>
                {isSaving && <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: '700', animation: 'pulse 1s infinite' }}>Saving Sync...</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                <PillCard
                    title="Units of Measure"
                    items={uoms}
                    newItem={newUom}
                    setNewItem={setNewUom}
                    onAdd={handleAddUom}
                    onRemove={handleRemoveUom}
                    icon={renderIcon('Box', { size: 18 })}
                />

                <PillCard
                    title="Warehouse Locations"
                    items={warehouses}
                    newItem={newWarehouse}
                    setNewItem={setNewWarehouse}
                    onAdd={handleAddWarehouse}
                    onRemove={handleRemoveWarehouse}
                    icon={renderIcon('Home', { size: 18 })}
                />
            </div>

            <div style={{ marginTop: '2rem', background: 'var(--hover-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    {renderIcon('Shield', { size: 16 })}
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Updates here will be reflected across all dropdowns in the Inventory and Logs modules. Ensure consistency in naming.</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Admin Dashboard - Global Settings Tab
 */
const SettingRow = ({ label, desc, stateKey, settings, onToggle }) => (
    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ paddingRight: '1rem' }}>
            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{desc}</div>
        </div>
        <div style={{ background: settings[stateKey] ? 'var(--accent-color)' : 'var(--border-color)', width: '48px', height: '26px', borderRadius: '24px', position: 'relative', transition: 'background 0.3s' }}>
            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: settings[stateKey] ? '25px' : '3px', transition: '0.3s' }}></div>
        </div>
        <input type="checkbox" checked={!!settings[stateKey]} onChange={() => onToggle(stateKey)} style={{ display: 'none' }} />
    </label>
);

const GlobalSettingsTab = ({ globalSettings, onUpdateGlobalSettings, branding, onUpdateBranding }) => {
    const renderIcon = (name, props = {}) => window.renderIcon ? window.renderIcon(name, props) : null;
    // 1. Branding & Styling State
    const [logoUrl, setLogoUrl] = React.useState(branding?.logoUrl || '');
    const [companyName, setCompanyName] = React.useState(branding?.companyName || 'System');
    const [accentColor, setAccentColor] = React.useState(branding?.accentColor || '#4f46e5');
    const fileInputRef = React.useRef(null);

    // 2. Widget & System Settings
    const [settings, setSettings] = React.useState({
        showTotalItems: true,
        showLowStock: true,
        showSuppliersOnly: true,
        showRecentArrivals: true,
        showRecentShipments: true,
        showCriticalReplenishment: true,
        showPredictiveReplenish: true,
        showInnoAssistant: true,
        showCategoryPerformance: true,
        showWarehouseHealth: true,
        globalDarkMode: false,
        ...globalSettings
    });

    const [isSaving, setIsSaving] = React.useState(false);
    const [isNuking, setIsNuking] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const toggleSetting = (key) => setSettings({ ...settings, [key]: !settings[key] });

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            // A. Save Global Settings
            await window.AppDataHandler.saveGlobalSettings(settings);
            onUpdateGlobalSettings(settings);

            // B. Save Branding
            const brandingData = { logoUrl, companyName: companyName || 'System', accentColor };
            await window.AppDataHandler.saveBranding(brandingData);
            onUpdateBranding(brandingData);

            // C. Activity Log
            await window.AppDataHandler.addActivityLog({
                title: 'System Reconfigured',
                details: 'Updated global branding, module visibility, and system defaults.',
                category: 'system'
            });

            // Immediately apply global accent if needed (optional overlay)
            document.documentElement.style.setProperty('--accent-color', accentColor);

            setMessage('All modifications saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (e) {
            alert(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const resized = await window.resizeImage(file, 400);
            setLogoUrl(resized);
        } catch (e) { alert("Failed to process image."); }
    };

    const handleNukeData = async () => {
        const confirm1 = confirm("⚠️ DANGER ZONE: You are about to DELETE ALL inventory, logs, and supplier data. This cannot be undone. Are you absolutely sure?");
        if (!confirm1) return;
        const confirm2 = prompt("To confirm, please type 'NUKE' in all caps:");
        if (confirm2 !== 'NUKE') return alert("Aborted. Confirmation text did not match.");
        setIsNuking(true);
        try {
            await Promise.all([
                window.AppDataHandler.saveInventory([]),
                window.AppDataHandler.saveInputLogs([]),
                window.AppDataHandler.saveOutputLogs([]),
                window.AppDataHandler.saveSuppliers([]),
                window.AppDataHandler.clearActivityLogs()
            ]);
            window.Toast.success("Database Purged", "All business records have been wiped.");
            setTimeout(() => location.reload(), 1500);
        } catch (e) {
            window.Toast.error("Reset Failed", e.message);
        } finally { setIsNuking(false); }
    };

    return (
        <div className="admin-tab-content fade-in">
            {message && <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 'bold' }}>{message}</div>}

            {/* BLOCK 1: Branding & Global Styling */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {renderIcon('Image', { size: 20 })} Branding & Core Defaults
                    </h3>
                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="auth-btn-primary"
                        style={{ width: 'auto', padding: '0.5rem 1.5rem', margin: 0, fontSize: '0.8rem' }}
                    >
                        {isSaving ? 'Saving...' : 'Save Branding'}
                    </button>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Logo Section */}
                    <div>
                        <label className="auth-label" style={{ fontWeight: '700', fontSize: '0.9rem' }}>Company Logo</label>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.75rem' }}>
                            <div style={{
                                width: '80px', height: '80px', background: 'var(--bg-color)', border: '2px solid var(--border-color)', borderRadius: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
                            }}>
                                {logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : renderIcon('Image', { size: 28, opacity: 0.3 })}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input className="auth-input" style={{ margin: 0 }} placeholder="URL" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
                                    <button onClick={() => fileInputRef.current.click()} style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 1rem', cursor: 'pointer' }}>
                                        {renderIcon('UploadCloud', { size: 18 })}
                                    </button>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Best at 200x200px. URL or File Upload supported.</span>
                            </div>
                        </div>
                    </div>

                    {/* Accent Color Section */}
                    <div>
                        <label className="auth-label" style={{ fontWeight: '700', fontSize: '0.9rem' }}>System Accent Color</label>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', alignItems: 'center' }}>
                            {['#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'].map(c => (
                                <button key={c} onClick={() => setAccentColor(c)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: accentColor === c ? '2px solid var(--text-primary)' : 'none', cursor: 'pointer' }} />
                            ))}
                            <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>Sets the default for all new users.</span>
                        </div>
                    </div>

                    {/* Company Name & Dark Mode */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="auth-label" style={{ fontWeight: '700', fontSize: '0.9rem' }}>Company Name</label>
                            <input className="auth-input" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ marginTop: '0.5rem' }} />
                        </div>
                        <div>
                            <label className="auth-label" style={{ fontWeight: '700', fontSize: '0.9rem' }}>Default Display Theme</label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button
                                    onClick={() => setSettings({ ...settings, globalDarkMode: false })}
                                    style={{
                                        width: '100%', padding: '0.75rem',
                                        borderRadius: '12px', border: '1px solid var(--border-color)',
                                        background: settings.globalDarkMode ? 'var(--card-bg)' : 'var(--accent-color)',
                                        color: settings.globalDarkMode ? 'var(--text-primary)' : '#fff',
                                        fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    {renderIcon('Sun', { size: 16 })} Light
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, globalDarkMode: true })}
                                    style={{
                                        width: '100%', padding: '0.75rem',
                                        borderRadius: '12px', border: '1px solid var(--border-color)',
                                        background: !settings.globalDarkMode ? 'var(--card-bg)' : 'var(--accent-color)',
                                        color: !settings.globalDarkMode ? 'var(--text-primary)' : '#fff',
                                        fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    {renderIcon('Moon', { size: 16 })} Dark
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOCK 2: Dashboard Modules */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Dashboard Module Visibility</h3>
                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="auth-btn-primary"
                        style={{ width: 'auto', padding: '0.5rem 1.5rem', margin: 0, fontSize: '0.8rem' }}
                    >
                        Update Modules
                    </button>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <SettingRow label="Total Items Overview" desc="Metric cards for aggregates." stateKey="showTotalItems" settings={settings} onToggle={toggleSetting} />
                    <SettingRow label="Low Stock Alerts" desc="Critical inventory indicator." stateKey="showLowStock" settings={settings} onToggle={toggleSetting} />
                    <SettingRow label="Suppliers Analytics" desc="Overview of procurement sources." stateKey="showSuppliersOnly" settings={settings} onToggle={toggleSetting} />
                    <SettingRow label="Recent Arrival Logs" desc="Historical list of inputs." stateKey="showRecentArrivals" settings={settings} onToggle={toggleSetting} />
                    <SettingRow label="Recent Shipment Logs" desc="Historical list of outputs." stateKey="showRecentShipments" settings={settings} onToggle={toggleSetting} />
                    <SettingRow label="Critical Replenishment" desc="Focus on items needing stock-up." stateKey="showCriticalReplenishment" settings={settings} onToggle={toggleSetting} />
                    <SettingRow label="Forecast Engine" desc="Predictive analytics for run-out dates." stateKey="showPredictiveReplenish" settings={settings} onToggle={toggleSetting} />
                    <SettingRow label="InnoAssistant (AI)" desc="TensorFlow powered intake center." stateKey="showInnoAssistant" settings={settings} onToggle={toggleSetting} />
                    <SettingRow label="Category Statistics" desc="Bar chart for inventory by type." stateKey="showCategoryPerformance" settings={settings} onToggle={toggleSetting} />
                    <SettingRow label="Warehouse Health" desc="Stock integrity across locations." stateKey="showWarehouseHealth" settings={settings} onToggle={toggleSetting} />
                </div>
            </div>

            {/* BLOCK 3: Save Button */}
            <div style={{ padding: '0 0 3rem 0', textAlign: 'right' }}>
                <button
                    className="auth-btn-primary"
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    style={{ width: 'auto', padding: '1rem 3rem', margin: 0, boxShadow: '0 10px 15px -3px var(--accent-color-transparent)' }}
                >
                    {isSaving ? 'Synchronizing...' : 'Save All Changes'}
                </button>
            </div>

            {/* NUKE & FIREBASE */}
            <div style={{ opacity: 0.8 }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ background: 'var(--danger)', color: 'white', padding: '0.6rem', borderRadius: '10px' }}>{renderIcon('Trash', { size: 18 })}</div>
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--danger)', margin: 0 }}>Factory Data Reset</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 1rem 0' }}>Permanently wipe all business records from the database.</p>

                            <div style={{ background: 'var(--card-bg)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                <div style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Following data will be erased:</div>
                                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: 0 }}>
                                    <li>Inventory Items & Stock Levels</li>
                                    <li>Arrivals (Input Logs)</li>
                                    <li>Shipments (Output Logs)</li>
                                    <li>Suppliers & Contact Records</li>
                                </ul>
                            </div>

                            <button onClick={handleNukeData} disabled={isNuking} style={{ background: 'var(--danger)', border: 'none', color: 'white', borderRadius: '10px', padding: '0.75rem 1.5rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isNuking ? 'Executing Sync...' : 'ERASE ALL BUSINESS DATA'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Admin Dashboard - User Management Tab
 */
const RestrictionGrid = ({ form, setter }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem' }}>
        {(window.RESTRICTION_LIST || []).map((restriction) => {
            const active = (form.restrictions || []).includes(restriction.id);
            return (
                <button
                    key={restriction.id}
                    type="button"
                    onClick={() => {
                        const current = form.restrictions || [];
                        setter({
                            ...form,
                            restrictions: current.includes(restriction.id)
                                ? current.filter((item) => item !== restriction.id)
                                : [...current, restriction.id]
                        });
                    }}
                    style={{
                        border: `1px solid ${active ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-color)'}`,
                        background: active ? 'rgba(239, 68, 68, 0.08)' : 'var(--hover-bg)',
                        color: active ? 'var(--danger)' : 'var(--text-primary)',
                        borderRadius: '12px',
                        padding: '0.8rem 0.9rem',
                        cursor: 'pointer',
                        fontWeight: '700',
                        textAlign: 'left'
                    }}
                >
                    {restriction.label}
                </button>
            );
        })}
    </div>
);

const DashboardVisibilityGrid = ({ form, setter }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.5rem' }}>
        {(window.DASHBOARD_WIDGET_OPTIONS || []).map(([key, label]) => {
            const hidden = (form.settings?.hiddenDashboardWidgets || []).includes(key);
            return (
                <button
                    key={key}
                    type="button"
                    onClick={() => {
                        const hidden = form.settings?.hiddenDashboardWidgets || [];
                        setter({
                            ...form,
                            settings: {
                                ...form.settings,
                                hiddenDashboardWidgets: hidden.includes(key)
                                    ? hidden.filter((item) => item !== key)
                                    : [...hidden, key]
                            }
                        });
                    }}
                    style={{
                        border: `1px solid ${hidden ? 'var(--border-color)' : 'rgba(16, 185, 129, 0.35)'}`,
                        background: hidden ? 'var(--hover-bg)' : 'rgba(16, 185, 129, 0.08)',
                        color: hidden ? 'var(--text-secondary)' : 'var(--success)',
                        borderRadius: '12px',
                        padding: '0.8rem 0.9rem',
                        cursor: 'pointer',
                        fontWeight: '700',
                        textAlign: 'left'
                    }}
                >
                    {hidden ? `Hidden: ${label}` : `Visible: ${label}`}
                </button>
            );
        })}
    </div>
);

const UserForm = ({ form, setter, isEdit = false, editingUser, handleImageUpload, updateFormRole, detectedRoles }) => {
    const FormInput = window.FormInput || (() => null);
    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormInput label="Full Name" placeholder="e.g. John Doe" value={form.name} onChange={(e) => setter({ ...form, name: e.target.value })} />
                <FormInput label="Username" placeholder="jdoe" value={form.username} onChange={(e) => setter({ ...form, username: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                <FormInput label="Email Address" placeholder="Optional" value={form.email} onChange={(e) => setter({ ...form, email: e.target.value })} />
                <FormInput label={isEdit ? 'Reset Password' : 'Initial Password'} type="password" placeholder={isEdit ? 'Leave blank to keep current' : 'Required'} value={form.password} onChange={(e) => setter({ ...form, password: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '18px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {form.profilePicture ? (
                        <img src={window.AppDataHandler.getUserAvatarSrc({ ...(editingUser || {}), avatar: form.profilePicture, profilePicture: form.profilePicture }, form.name || 'User')} alt={`${form.name || 'User'} avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-color)' }}>{(form.name || 'U').charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div className="auth-input-group">
                        <label className="auth-label">Profile Photo</label>
                        <input type="file" accept="image/*" className="auth-input" style={{ padding: '0.65rem', height: 'auto' }} onChange={(e) => handleImageUpload(setter, form, e)} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="tool-btn edit-btn" onClick={() => setter({ ...form, profilePicture: '' })} style={{ margin: 0 }}>Remove Image</button>
                    </div>
                </div>
            </div>

            <div>
                <label className="auth-label">User Role</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {(window.AVAILABLE_ROLES || detectedRoles).map((role) => (
                        <button
                            key={role}
                            type="button"
                            onClick={() => updateFormRole(setter, form, role)}
                            style={{
                                flex: 1,
                                padding: '0.85rem',
                                borderRadius: '12px',
                                border: `1px solid ${form.role === role ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                background: form.role === role ? 'var(--selected-bg)' : 'transparent',
                                color: form.role === role ? 'var(--accent-color)' : 'var(--text-secondary)',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {form.role !== 'Administrator' && (
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <div>
                        <label className="auth-label" style={{ display: 'block', marginBottom: '0.25rem' }}>Hub Access</label>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>Sections accessible to this role (Automated).</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: 'Dashboard' },
                                { id: 'assets', label: 'All Assets', icon: 'Box' },
                                { id: 'partners', label: 'Partners', icon: 'Users' },
                                { id: 'admin', label: 'Admin Hub', icon: 'Shield' }
                            ].map((hub) => {
                                const active = !!form.hub?.[hub.id];
                                const Icons = window.createIconProxy ? window.createIconProxy() : (window.Icons || {});
                                const HubIcon = Icons[hub.icon] || (() => null);

                                return (
                                    <div
                                        key={hub.id}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '1rem 0.75rem',
                                            gap: '0.6rem',
                                            borderRadius: '16px',
                                            border: `1px solid ${active ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                            background: active ? 'var(--selected-bg)' : 'var(--hover-bg)',
                                            color: active ? 'var(--accent-color)' : 'var(--text-secondary)',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            opacity: active ? 1 : 0.5
                                        }}
                                    >
                                        <div style={{
                                            padding: '0.6rem',
                                            borderRadius: '12px',
                                            background: active ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                                            color: active ? 'var(--accent-color)' : 'inherit'
                                        }}>
                                            <HubIcon size={22} strokeWidth={active ? 2.5 : 2} />
                                        </div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>{hub.label}</span>
                                        {active && (
                                            <div style={{ position: 'absolute', top: '6px', right: '6px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)' }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {form.role === 'Auditor' && (
                        <div>
                            <label className="auth-label" style={{ display: 'block', marginBottom: '0.25rem' }}>Revoked Actions</label>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Highlighted actions are <strong>blocked</strong> for this Auditor.</p>
                            <RestrictionGrid form={form} setter={setter} />
                        </div>
                    )}
                </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ fontWeight: '800', marginBottom: '0.75rem' }}>User Preferences</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="auth-input-group">
                        <label className="auth-label">Theme</label>
                        <select className="auth-input" value={form.settings.theme} onChange={(e) => setter({ ...form, settings: { ...form.settings, theme: e.target.value } })}>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                    <div className="auth-input-group">
                        <label className="auth-label">Accent Color</label>
                        <input type="color" className="auth-input" value={form.settings.themeColor} onChange={(e) => setter({ ...form, settings: { ...form.settings, themeColor: e.target.value } })} style={{ padding: '0.35rem 0.5rem' }} />
                    </div>
                    <FormInput label="Global Threshold" type="number" value={form.settings.lowStockThreshold} onChange={(e) => setter({ ...form, settings: { ...form.settings, lowStockThreshold: e.target.value } })} />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!form.settings.isThresholdEnabled} onChange={(e) => setter({ ...form, settings: { ...form.settings, isThresholdEnabled: e.target.checked } })} />
                    Enable account-specific stock threshold override
                </label>

                <label className="auth-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Dashboard Widgets</label>
                <DashboardVisibilityGrid form={form} setter={setter} />
            </div>
        </div>
    );
};

const UserManagementTab = ({ users, onUpdateUser, currentUser }) => {
    const GenericModal = window.GenericModal || (() => null);
    const StatusBadge = window.StatusBadge || (() => null);
    const renderIcon = (name, props = {}) => window.renderIcon ? window.renderIcon(name, props) : null;

    const allRestrictions = window.AppDataHandler.getAllRestrictions();
    window.RESTRICTION_LIST = [
        { id: 'AddItems', label: 'Add Items' },
        { id: 'EditItems', label: 'Edit Items' },
        { id: 'RemoveItems', label: 'Remove Items' },
        { id: 'AddLogs', label: 'Add Logs' },
        { id: 'EditLogs', label: 'Edit Logs' },
        { id: 'RemoveLogs', label: 'Remove Logs' },
        { id: 'AddSuppliers', label: 'Add Suppliers' },
        { id: 'EditSuppliers', label: 'Edit Suppliers' },
        { id: 'RemoveSuppliers', label: 'Remove Suppliers' }
    ];
    window.DASHBOARD_WIDGET_OPTIONS = [
        ['showTotalItems', 'Total Items'],
        ['showLowStock', 'Low Stock'],
        ['showSuppliersOnly', 'Suppliers'],
        ['showRecentArrivals', 'Recent Arrivals'],
        ['showRecentShipments', 'Recent Shipments'],
        ['showCriticalReplenishment', 'Critical Replenishment'],
        ['showPredictiveReplenish', 'Forecast'],
        ['showInnoAssistant', 'Smart Suggestions'],
        ['showCategoryPerformance', 'Category Performance'],
        ['showWarehouseHealth', 'Warehouse Health']
    ];

    // Role detection: prioritize existing roles from DB, fallback to system defaults
    const detectedRoles = React.useMemo(() => {
        const set = new Set(['Administrator', 'Manager', 'WarehouseStaff', 'Sales', 'Auditor']);
        if (users?.length) {
            users.forEach(u => u.role && set.add(u.role));
        }
        return Array.from(set).sort((a, b) => {
            const order = ['Administrator', 'Manager', 'WarehouseStaff', 'Sales', 'Auditor'];
            const idxA = order.indexOf(a);
            const idxB = order.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [users]);

    const deriveHubAccess = (role) => {
        const mapping = globalSettings.roleHubMapping || {
            'Administrator': { dashboard: true, assets: true, partners: true, admin: true },
            'Manager': { dashboard: true, assets: true, partners: true, admin: false },
            'WarehouseStaff': { dashboard: true, assets: true, partners: true, admin: false },
            'Sales': { dashboard: true, assets: false, partners: false, admin: false }, // Only dashboard for Sales
            'Auditor': { dashboard: true, assets: true, partners: true, admin: false }
        };
        return mapping[role] || { dashboard: false, assets: false, partners: false, admin: false };
    };

    const handleUpdateRoleMapping = async (updatedMapping) => {
        const newSettings = { ...globalSettings, roleHubMapping: updatedMapping };
        setGlobalSettings(newSettings);
        try {
            await window.AppDataHandler.updateGlobalSettings({ roleHubMapping: updatedMapping });
            onUpdateUser(); // Refresh users if their access changed
        } catch (e) { alert(e.message); }
    };

    const createEmptyForm = () => ({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'WarehouseStaff',
        restrictions: [...allRestrictions],
        profilePicture: '',
        settings: {
            theme: 'light',
            themeColor: '#4f46e5',
            lowStockThreshold: 1000,
            isThresholdEnabled: false,
            hiddenDashboardWidgets: []
        },
        hub: {
            dashboard: true,
            assets: true,
            partners: true,
            admin: false
        }
    });

    const createEditForm = (user) => ({
        name: user.name || '',
        username: user.username || '',
        email: user.email?.endsWith('@internal.local') || user.email?.endsWith('@local.internal') ? '' : (user.email || ''),
        password: '',
        role: user.role || 'WarehouseStaff',
        restrictions: [...(user.restrictions || [])],
        profilePicture: user.profilePicture || user.avatar || '',
        settings: {
            theme: user.settings?.theme || 'light',
            themeColor: user.settings?.themeColor || '#4f46e5',
            lowStockThreshold: user.settings?.lowStockThreshold || 1000,
            isThresholdEnabled: user.settings?.isThresholdEnabled ?? false,
            hiddenDashboardWidgets: [...(user.settings?.hiddenDashboardWidgets || [])]
        },
        hub: user.hub || {
            dashboard: true,
            assets: true,
            partners: true,
            admin: user.role === 'Administrator'
        }
    });

    const [searchQuery, setSearchQuery] = React.useState('');
    const [isAddingUser, setIsAddingUser] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState(null);
    const [addForm, setAddForm] = React.useState(createEmptyForm());
    const [editForm, setEditForm] = React.useState(createEmptyForm());
    const [isRoleSettingsOpen, setIsRoleSettingsOpen] = React.useState(false);
    const [globalSettings, setGlobalSettings] = React.useState(window.AppDataHandler.getGlobalSettingsSync());
    const [tempMapping, setTempMapping] = React.useState(null);

    const filteredUsers = React.useMemo(() => {
        const sq = (searchQuery || '').toLowerCase();
        return users.filter((u) => {
            const name = (u.name || '').toLowerCase();
            const username = (u.username || '').toLowerCase();
            const email = (u.email || '').toLowerCase();
            return name.includes(sq) || username.includes(sq) || email.includes(sq);
        });
    }, [users, searchQuery]);

    const updateFormRole = (setter, form, role) => {
        setter({
            ...form,
            role,
            hub: deriveHubAccess(role),
            // Admins and non-Auditors have no restrictions. 
            restrictions: role === 'Auditor' ? (form.restrictions || []) : []
        });
    };

    const handleImageUpload = async (setter, form, event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const resized = await window.resizeImage(file, 400);
        setter({ ...form, profilePicture: resized });
    };

    const openEditor = (user) => {
        setEditingUser(user);
        setEditForm(createEditForm(user));
    };

    const handleRegister = async () => {
        if (!addForm.name || !addForm.username || !addForm.password) {
            alert('Please fill in Name, Username, and a password.');
            return;
        }

        setIsSaving(true);
        try {
            await window.AppDataHandler.adminCreateUser({
                ...addForm,
                settings: {
                    ...addForm.settings,
                    lowStockThreshold: parseFloat(addForm.settings.lowStockThreshold) || 1000
                },
                restrictions: addForm.role === 'Administrator' ? [] : addForm.restrictions
            });
            setIsAddingUser(false);
            setAddForm(createEmptyForm());
            await onUpdateUser();
        } catch (e) {
            let msg = e.message || 'Registration failed.';
            if (e.response?.data) {
                msg += '\n\nServer Feedback:\n' + Object.entries(e.response.data).map(([key, value]) => `${key}: ${value.message}`).join('\n');
            }
            alert(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        if (!editForm.name || !editForm.username) {
            alert('Name and username are required.');
            return;
        }

        setIsSaving(true);
        try {
            await window.AppDataHandler.adminUpdateUser(editingUser.id, {
                ...editForm,
                settings: {
                    ...editForm.settings,
                    lowStockThreshold: parseFloat(editForm.settings.lowStockThreshold) || ''
                },
                restrictions: editForm.role === 'Administrator' ? [] : editForm.restrictions
            });
            setEditingUser(null);
            await onUpdateUser();
        } catch (e) {
            let msg = e.message || 'Update failed.';
            if (e.response?.data) {
                const feedback = Object.entries(e.response.data)
                    .map(([key, value]) => `${key}: ${value.message || JSON.stringify(value)}`)
                    .join('\n');
                msg += '\n\nServer Feedback:\n' + feedback;
            }
            console.error("User Update Error:", e);
            alert(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editingUser) return;
        if (!window.confirm(`Permanently remove ${editingUser.name}? This cannot be undone.`)) return;

        setIsSaving(true);
        try {
            await window.AppDataHandler.deleteSharedUser(editingUser.id);
            setEditingUser(null);
            await onUpdateUser();
        } catch (e) {
            alert(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 'min(100%, 360px)' }}>
                    {renderIcon('Search', { size: 18, style: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.45 } })}
                    <input className="search-bar auth-input" placeholder="Find by name, username or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.75rem', marginBottom: 0, borderRadius: '14px', width: '100%' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="tool-btn edit-btn" onClick={onUpdateUser} style={{ width: '46px', height: '46px', padding: 0, borderRadius: '12px', justifyContent: 'center' }} title="Sync with server">
                        {renderIcon('RotateCw', { size: 20 })}
                    </button>
                    <button className="tool-btn edit-btn" onClick={() => {
                        setIsRoleSettingsOpen(true);
                        setTempMapping(globalSettings.roleHubMapping || {});
                    }} 
                    style={{ width: '46px', height: '46px', padding: 0, borderRadius: '12px', justifyContent: 'center' }} 
                    title="Global Role Access Settings">
                        {renderIcon('Settings', { size: 20 })}
                    </button>
                    <button className="auth-btn-primary" onClick={() => setIsAddingUser(true)} style={{ margin: 0, height: '46px', padding: '0 1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {renderIcon('Plus', { size: 18 })} Add Member
                    </button>
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Access</th>
                            <th>Restrictions</th>
                            <th>Personal Widgets</th>
                            <th>Joined</th>
                            <th style={{ textAlign: 'center' }}>Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No members found matching your search.</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => {
                                const hiddenWidgets = user.settings?.hiddenDashboardWidgets || [];
                                return (
                                    <tr key={user.id} style={{ opacity: user.id === currentUser.uid ? 0.88 : 1 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                                                <img src={window.AppDataHandler.getUserAvatarSrc(user, user.name || 'User')} alt={`${user.name || 'User'} avatar`} style={{ width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)', background: 'var(--hover-bg)' }} />
                                                <div>
                                                    <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{user.name || 'Unnamed User'}</div>
                                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                        @{user.username}
                                                        {user.id === currentUser.uid ? <span style={{ color: 'var(--accent-color)', fontWeight: '800', marginLeft: '0.35rem' }}>(You)</span> : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><StatusBadge type="role" value={user.role || 'WarehouseStaff'} /></td>
                                        <td>
                                            {user.role === 'Administrator' ? (
                                                <span style={{ color: 'var(--accent-color)', fontWeight: '700', fontSize: '0.82rem' }}>Unrestricted Access</span>
                                            ) : (() => {
                                                const hubs = Object.entries(user.hub || {}).filter(([_, val]) => val).length;
                                                const revoked = (user.restrictions || []).length;
                                                return <span style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                                                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>{hubs} Hub{hubs !== 1 ? 's' : ''} Allowed</span>
                                                    {revoked > 0 && <span style={{ color: 'var(--danger)', fontWeight: 700 }}>, {revoked} Actions Revoked</span>}
                                                </span>;
                                            })()}
                                        </td>
                                        <td style={{ fontSize: '0.82rem', color: hiddenWidgets.length ? 'var(--warning)' : 'var(--success)', fontWeight: '700' }}>
                                            {hiddenWidgets.length ? `${hiddenWidgets.length} hidden` : 'All visible'}
                                        </td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(user.created || Date.now()).toLocaleDateString()}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="tool-btn edit-btn" onClick={() => openEditor(user)} style={{ width: '42px', height: '42px', padding: 0, justifyContent: 'center', margin: '0 auto' }} title="Manage member">
                                                {renderIcon('Edit', { size: 18 })}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <GenericModal isOpen={isAddingUser} onClose={() => setIsAddingUser(false)} title="Register New Member" width="760px">
                <UserForm
                    form={addForm}
                    setter={setAddForm}
                    handleImageUpload={handleImageUpload}
                    updateFormRole={updateFormRole}
                    detectedRoles={detectedRoles}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button className="auth-btn-text" onClick={() => setIsAddingUser(false)} style={{ flex: 1 }}>Discard</button>
                    <button className="auth-btn-primary" onClick={handleRegister} disabled={isSaving} style={{ flex: 2, margin: 0 }}>{isSaving ? 'Creating...' : 'Create Member'}</button>
                </div>
            </GenericModal>

            <GenericModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit Member Details" width="820px">
                {editingUser ? (
                    <>
                        <div style={{ marginBottom: '1rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem' }}>
                            <div style={{ fontWeight: '800', marginBottom: '0.2rem' }}>{editingUser.name}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ID: {editingUser.id}</div>
                        </div>

                        <UserForm
                            form={editForm}
                            setter={setEditForm}
                            isEdit
                            editingUser={editingUser}
                            handleImageUpload={handleImageUpload}
                            updateFormRole={updateFormRole}
                            detectedRoles={detectedRoles}
                        />

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button className="tool-btn remove-btn" onClick={handleDelete} style={{ width: '52px', height: '52px', padding: 0, justifyContent: 'center' }} title="Delete member">
                                {renderIcon('Trash', { size: 20 })}
                            </button>
                            <button className="auth-btn-text" onClick={() => setEditingUser(null)} style={{ flex: 1 }}>Cancel</button>
                            <button className="auth-btn-primary" onClick={handleUpdate} disabled={isSaving} style={{ flex: 2, margin: 0 }}>{isSaving ? 'Saving...' : 'Save Member'}</button>
                        </div>
                    </>
                ) : null}
            </GenericModal>

            <GenericModal isOpen={isRoleSettingsOpen} onClose={() => setIsRoleSettingsOpen(false)} title="Global Role Access Config" width="700px">
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configure default Hub visibility for each User Role. These settings apply to all users assigned to the role.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {detectedRoles.map(role => {
                            const mapping = tempMapping || {};
                            const hubs = mapping[role] || deriveHubAccess(role);
                            const isEditable = role !== 'Administrator';

                            return (
                                <div key={role} style={{
                                    padding: '1rem',
                                    background: 'var(--hover-bg)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    opacity: isEditable ? 1 : 0.7
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{role}</span>
                                        {!isEditable && <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-color)', fontWeight: '900' }}>System Locked</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        {[
                                            { id: 'dashboard', label: 'Dashboard' },
                                            { id: 'assets', label: 'Assets' },
                                            { id: 'partners', label: 'Partners' },
                                            { id: 'admin', label: 'Admin Hub' }
                                        ].map(hub => (
                                            <button
                                                key={hub.id}
                                                disabled={!isEditable}
                                                onClick={() => {
                                                    setTempMapping({
                                                        ...mapping,
                                                        [role]: { ...hubs, [hub.id]: !hubs[hub.id] }
                                                    });
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.6rem',
                                                    borderRadius: '10px',
                                                    border: `1px solid ${hubs[hub.id] ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                                    background: hubs[hub.id] ? 'var(--selected-bg)' : 'transparent',
                                                    color: hubs[hub.id] ? 'var(--accent-color)' : 'var(--text-secondary)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    cursor: isEditable ? 'pointer' : 'default'
                                                }}
                                            >
                                                {hub.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button className="auth-btn-primary" onClick={() => {
                            if (tempMapping) handleUpdateRoleMapping(tempMapping);
                            setIsRoleSettingsOpen(false);
                        }} style={{ width: 'auto', padding: '0.8rem 2.5rem', margin: 0 }}>Done</button>
                    </div>
                </div>
            </GenericModal>
        </div>
    );
};

const ManageDataTab = ({ inventoryData, onDataSync }) => {
    const { StatusBadge, GenericModal = () => null } = window;
    const renderIcon = (name, props = {}) => window.renderIcon ? window.renderIcon(name, props) : null;
    const [importData, setImportData] = React.useState(null);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [syncProgress, setSyncProgress] = React.useState({ current: 0, total: 0, status: '' });
    const [sheetUrl, setSheetUrl] = React.useState('');
    const [reviewItems, setReviewItems] = React.useState(null);

    const processWorkbook = (wb, workbookName = 'Workbook') => {
        const helper = window.ImportDataHelper;
        if (!helper) throw new Error('Import helper is unavailable.');
        const parsed = helper.parseWorkbook(wb, { workbookName });
        setImportData(parsed);
        setReviewItems(null);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = window.XLSX.read(bstr, { type: 'binary' });
            processWorkbook(wb, file.name);
        };
        reader.readAsBinaryString(file);
    };

    const handleGoogleSheetFetch = async () => {
        if (!sheetUrl) return;
        setIsProcessing(true);
        try {
            let exportUrl = sheetUrl;
            if (sheetUrl.includes('/edit')) exportUrl = sheetUrl.split('/edit')[0] + '/export?format=xlsx';
            else if (!sheetUrl.includes('/export')) {
                const idMatch = sheetUrl.match(/[-\w]{25,}/);
                if (idMatch) exportUrl = `https://docs.google.com/spreadsheets/d/${idMatch[0]}/export?format=xlsx`;
            }

            const res = await fetch(exportUrl);
            if (!res.ok) throw new Error("Fetch failed. Sheet must be 'Public' or 'Anyone with link'.");
            const arrayBuffer = await res.arrayBuffer();
            const wb = window.XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
            processWorkbook(wb, 'Google Sheet');
            setSheetUrl('');
        } catch (e) { alert(e.message); }
        finally { setIsProcessing(false); }
    };

    const generateReview = async () => {
        if (!importData) return;
        setIsProcessing(true);
        try {
            const [curInv, curInputLogs, curOutputLogs] = await Promise.all([
                window.AppDataHandler.getInventory(),
                window.AppDataHandler.getInputLogs(),
                window.AppDataHandler.getOutputLogs()
            ]);

            const review = window.ImportDataHelper.buildReview(importData, {
                inventory: curInv,
                inputLogs: curInputLogs,
                outputLogs: curOutputLogs
            });
            setReviewItems(review);
        } catch (e) { alert("Review failed: " + e.message); }
        finally { setIsProcessing(false); }
    };

    const commitImport = async () => {
        if (!reviewItems || !importData) return;
        setReviewItems(null);
        setIsProcessing(true);
        const total = (importData.inventory?.length || 0) + (importData.inputLogs?.length || 0) + (importData.outputLogs?.length || 0);
        setSyncProgress({ current: 0, total, status: 'Preparing validated sync...' });

        try {
            const importedUoms = Array.from(new Set(
                (importData.inventory || [])
                    .map((item) => String(item.uom || '').trim())
                    .filter(Boolean)
            ));
            if (importedUoms.length > 0) {
                const existingUoms = await window.AppDataHandler.getUOMs();
                const nextUoms = [...existingUoms];
                importedUoms.forEach((uom) => {
                    if (!nextUoms.includes(uom)) nextUoms.push(uom);
                });
                if (nextUoms.length !== existingUoms.length) {
                    await window.AppDataHandler.saveUOMs(nextUoms);
                }
            }

            if (importData.sourceSheets.receive) {
                setSyncProgress({ current: 0, total, status: 'Replacing arrivals log set...' });
                await window.AppDataHandler.saveInputLogs(importData.inputLogs);
                setSyncProgress(prev => ({ ...prev, current: prev.current + importData.inputLogs.length, status: 'Arrivals synced.' }));
            }

            if (importData.sourceSheets.out) {
                setSyncProgress(prev => ({ ...prev, status: 'Replacing shipments log set...' }));
                await window.AppDataHandler.saveOutputLogs(importData.outputLogs);
                setSyncProgress(prev => ({ ...prev, current: prev.current + importData.outputLogs.length, status: 'Shipments synced.' }));
            }

            if (importData.sourceSheets.items || importData.sourceSheets.inventory) {
                setSyncProgress(prev => ({ ...prev, status: 'Saving item masters with derived stock on hand...' }));
                await window.AppDataHandler.saveInventory(importData.inventory);
                setSyncProgress(prev => ({ ...prev, current: prev.current + importData.inventory.length, status: 'Inventory synced.' }));
            }

            await window.AppDataHandler.addActivityLog({
                title: 'Workbook Import Completed',
                details: `Imported ${importData.inventory.length} items, ${importData.inputLogs.length} arrivals, and ${importData.outputLogs.length} shipments from ${importData.workbookName}.`,
                category: 'system'
            });

            if (onDataSync) await onDataSync();

            alert(`Import complete. Saved ${importData.inventory.length} items, ${importData.inputLogs.length} arrivals, and ${importData.outputLogs.length} shipments.`);
            setImportData(null);
            setSheetUrl('');
        } catch (e) { alert("Commit failed: " + e.message); }
        finally { setIsProcessing(false); setSyncProgress({ current: 0, total: 0, status: '' }); }
    };

    const handleExport = async (type) => {
        setIsProcessing(true);
        try {
            if (type === 'all') {
                const [inv, sup, inputs, outputs] = await Promise.all([
                    window.AppDataHandler.getInventory(),
                    window.AppDataHandler.getSuppliers(),
                    window.AppDataHandler.getInputLogs(),
                    window.AppDataHandler.getOutputLogs()
                ]);
                const wb = window.XLSX.utils.book_new();
                window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(inv), 'Items');
                window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(sup), 'Suppliers');
                window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(inputs), 'Arrivals');
                window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.json_to_sheet(outputs), 'Shipments');
                window.XLSX.writeFile(wb, `master_backup_${new Date().toISOString().split('T')[0]}.xlsx`);
                window.Toast.success('Export Complete', 'Full system backup generated.');
            } else {
                const data = type === 'inventory'
                    ? await window.AppDataHandler.getInventory()
                    : await window.AppDataHandler.getSuppliers();

                if (type === 'inventory' && window.ExportTool) {
                    window.ExportTool.exportItemMaster(data);
                } else {
                    const ws = window.XLSX.utils.json_to_sheet(data);
                    const wb = window.XLSX.utils.book_new();
                    window.XLSX.utils.book_append_sheet(wb, ws, type);
                    window.XLSX.writeFile(wb, `${type}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
                }
                window.Toast.success('Export Complete', `${type.charAt(0).toUpperCase() + type.slice(1)} backup generated.`);
            }

            await window.AppDataHandler.addActivityLog({ title: `Data Export: ${type}`, details: `Generated backup for system records.`, category: 'system' });
        } catch (e) { window.Toast.error("Export Failed", e.message); }
        finally { setIsProcessing(false); }
    };

    const DiffRow = ({ field, from, to }) => (
        <tr style={{ fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
            <td style={{ padding: '0.5rem', fontWeight: '700', opacity: 0.6, width: '120px' }}>{field}</td>
            <td style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>- {from || 'empty'}</td>
            <td style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>+ {to}</td>
        </tr>
    );

    const getAddedLabel = (item) => item.name || item.itemCode || item.transactionId || 'Imported record';

    return (
        <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {renderIcon('UploadCloud', { size: 18, color: 'var(--accent-color)' })} Master Sync Engine
                        </h3>

                        <div className="upload-zone" style={{ position: 'relative', border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '3rem', textAlign: 'center', background: 'var(--hover-bg)', marginBottom: '1.5rem' }}>
                            {renderIcon('FileSpreadsheet', { size: 40, style: { opacity: 0.2, marginBottom: '1rem' } })}
                            <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Drop Master Workbook here</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Parses `Items`, `Receive`, and `Out` and derives stock on hand from movement logs.</div>
                            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        </div>

                        {importData && (
                            <div className="fade-in" style={{ padding: '1rem', background: 'rgba(129, 140, 248, 0.05)', borderRadius: '12px', border: '1px solid var(--accent-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Workbook loaded: {importData.workbookName}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{importData.inventory.length} Items | {importData.inputLogs.length} Arrivals | {importData.outputLogs.length} Shipments</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.65, marginTop: '0.35rem' }}>
                                            Source sheets: {Object.entries(importData.sourceSheets).filter(([, name]) => !!name).map(([, name]) => name).join(', ') || 'None detected'}
                                        </div>
                                        {importData.warnings.length > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.35rem', fontWeight: '700' }}>
                                                {importData.warnings.length} warning(s) detected. Review before syncing.
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={generateReview} disabled={isProcessing} className="auth-btn-primary" style={{ margin: 0, width: 'auto', padding: '0.5rem 1.5rem' }}>
                                        {isProcessing ? 'Analyzing...' : 'View Review Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {isProcessing && syncProgress.total > 0 && (
                        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--accent-color)', borderRadius: '20px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '700' }}>Syncing: {syncProgress.status}</span>
                                <span style={{ color: 'var(--accent-color)', fontWeight: '800' }}>{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--hover-bg)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.1s' }}></div>
                            </div>
                        </div>
                    )}

                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {renderIcon('Globe', { size: 18, color: '#ea4335' })} Cloud Sync (Google Sheets)
                        </h3>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                {renderIcon('Link', { size: 16, style: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 } })}
                                <input
                                    className="auth-input"
                                    placeholder="Paste Google Sheet URL or ID..."
                                    value={sheetUrl}
                                    onChange={(e) => setSheetUrl(e.target.value)}
                                    style={{ paddingLeft: '2.75rem', marginBottom: 0, borderRadius: '12px', fontSize: '0.9rem' }}
                                />
                            </div>
                            <button
                                onClick={handleGoogleSheetFetch}
                                disabled={isProcessing || !sheetUrl}
                                className="auth-btn-primary"
                                style={{ margin: 0, width: 'auto', padding: '0 1.5rem', height: '46px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {isProcessing ? 'Fetching...' : <>{renderIcon('ArrowRight', { size: 18 })} Sync Now</>}
                            </button>
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <strong>Note:</strong> Sheet must be shared with "Anyone with the link".
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {renderIcon('Download', { size: 18, color: 'var(--success)' })} Quick Backup & Export
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={() => handleExport('all')}
                                disabled={isProcessing}
                                className="auth-btn-primary"
                                style={{ width: '100%', padding: '1rem', marginBottom: '0.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {renderIcon('Database', { size: 20 })}
                                    <span style={{ fontWeight: '800' }}>EXPORT ALL (Full Backup)</span>
                                </div>
                                {renderIcon('ChevronRight', { size: 18 })}
                            </button>
                            <button
                                onClick={() => handleExport('inventory')}
                                disabled={isProcessing}
                                className="tool-btn"
                                style={{ width: '100%', padding: '1rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {renderIcon('Box', { size: 20 })}
                                    <span style={{ fontWeight: '700' }}>Export Inventory</span>
                                </div>
                                {renderIcon('ChevronRight', { size: 18 })}
                            </button>
                            <button
                                onClick={() => handleExport('suppliers')}
                                disabled={isProcessing}
                                className="tool-btn"
                                style={{ width: '100%', padding: '1rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {renderIcon('Users', { size: 20 })}
                                    <span style={{ fontWeight: '700' }}>Export Suppliers</span>
                                </div>
                                {renderIcon('ChevronRight', { size: 18 })}
                            </button>
                            <div>Stock on hand is derived from arrivals minus shipments.</div>
                            <div>Unchanged records are skipped during sync.</div>
                            <div>Warnings are surfaced before commit for ambiguous dates.</div>
                        </div>
                    </div>
                </div>
            </div>

            <GenericModal
                isOpen={!!reviewItems}
                onClose={() => setReviewItems(null)}
                title="Review Master Sync Changes"
                width="850px"
            >
                {reviewItems && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {reviewItems.warnings.length > 0 && (
                            <div style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.35)', background: 'rgba(245, 158, 11, 0.08)' }}>
                                <div style={{ fontWeight: '800', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Import warnings</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {reviewItems.warnings.slice(0, 8).map((warning) => (
                                        <div key={warning}>{warning}</div>
                                    ))}
                                    {reviewItems.warnings.length > 8 && (
                                        <div>...and {reviewItems.warnings.length - 8} more warning(s).</div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                            {['inventory', 'inputLogs', 'outputLogs'].map(type => {
                                const stats = reviewItems[type];
                                return (
                                    <div key={type} style={{ padding: '0.6rem 1.2rem', background: 'var(--hover-bg)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem', border: '1px solid var(--border-color)' }}>
                                        <span style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', opacity: 0.7 }}>{type === 'inputLogs' ? 'arrivals' : type === 'outputLogs' ? 'shipments' : 'inventory'}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ color: 'var(--success)', fontWeight: '800', fontSize: '0.9rem' }}>+{stats.added.length}</span>
                                            <span style={{ color: 'var(--accent-color)', fontWeight: '800', fontSize: '0.9rem' }}>~{stats.updated.length}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {['inventory', 'inputLogs', 'outputLogs'].map(type => {
                                const { added, updated } = reviewItems[type];
                                if (added.length === 0 && updated.length === 0) return null;

                                return (
                                    <div key={type} style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem', background: 'var(--hover-bg)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '800' }}>
                                            {renderIcon('Layers', { size: 16 })} {(type === 'inputLogs' ? 'ARRIVALS' : type === 'outputLogs' ? 'SHIPMENTS' : 'INVENTORY')} CHANGES
                                        </h4>

                                        {added.map(item => (
                                            <div key={item.transactionId || item.itemCode || item.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{getAddedLabel(item)}</span>
                                                    <span style={{ background: 'var(--success)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900' }}>NEW</span>
                                                </div>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <tbody>
                                                        {Object.entries(item).map(([f, v]) => (
                                                            <tr key={f} style={{ fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                                                                <td style={{ padding: '0.4rem 1rem', width: '120px', fontWeight: '700', opacity: 0.5 }}>{f}</td>
                                                                <td style={{ padding: '0.4rem 1rem', color: 'var(--success)', background: 'rgba(34, 197, 94, 0.05)' }}>+ {v}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}

                                        {updated.map(item => (
                                            <div key={item.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                <div style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{item.name}</span>
                                                    <span style={{ background: 'var(--accent-color)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '900' }}>CHANGED</span>
                                                </div>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <tbody>
                                                        {item.changes.map(c => (
                                                            <DiffRow key={c.field} field={c.field} from={c.from} to={c.to} />
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', background: 'var(--hover-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                            <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                                Syncing {reviewItems.inventory.added.length + reviewItems.inputLogs.added.length + reviewItems.outputLogs.added.length} additions and {reviewItems.inventory.updated.length + reviewItems.inputLogs.updated.length + reviewItems.outputLogs.updated.length} changes. Stock on hand will be saved from arrivals minus shipments only.
                            </div>
                            <button onClick={() => setReviewItems(null)} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={commitImport} className="auth-btn-primary" style={{ margin: 0, width: 'auto', padding: '0.8rem 2rem' }}>Confirm & Sync All</button>
                        </div>
                    </div>
                )}
            </GenericModal>
        </div>
    );
};


window.AdminDashboard = AdminDashboard;
