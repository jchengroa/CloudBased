/**
 * Smart Suggestions Widget
 * Surfaces recommended business-process actions from live data.
 */
const AutomationHub = ({ automation, openPrompt, onBulkAction }) => {
    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    const [runningAction, setRunningAction] = React.useState(null);
    const [toast, setToast] = React.useState(null);

    const {
        urgentActions = [],
        criticalItems = [],
        predictiveItems = [],
        staleRestocks = [],
        dispatchQueue = [],
        dataIssues = [],
        dormantStock = [],
        supplierGroups = [],
        summary = {},
        urgentCount = 0
    } = automation || {};

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const executeAction = async (action) => {
        if (!action) return;
        setRunningAction(action.kind);
        try {
            if (action.kind === 'bulk-mark-restocking') {
                await onBulkAction('bulk-mark-restocking', action.itemIds || []);
            } else if (action.kind === 'supplier-details') {
                openPrompt('Partner Details', 'supplier-details', [action.supplierName]);
            } else if (action.kind === 'customer-details') {
                openPrompt('Partner Details', 'customer-details', [action.customerName]);
            } else if (action.kind === 'edit-item') {
                openPrompt('Edit Inventory Item', 'edit-item', [action.itemId]);
            } else if (action.kind === 'product-stats') {
                openPrompt('Product Insights', 'product-stats', [action.itemId]);
            }

            if (action.kind === 'bulk-mark-restocking') {
                showToast(`Updated ${action.itemIds.length} item(s).`);
            }
        } catch (e) {
            showToast(`Failed: ${e.message}`, 'error');
        } finally {
            setRunningAction(null);
        }
    };

    const allCriticalIds = criticalItems.map((item) => item.id);
    const hasActions = urgentActions.length > 0;

    return (
        <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            {toast && (
                <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    left: '0.75rem',
                    background: toast.type === 'error' ? '#ef4444' : '#10b981',
                    color: '#fff',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    zIndex: 10
                }}>
                    {toast.msg}
                </div>
            )}

            <div style={{
                padding: '1.1rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '0.75rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icons.Zap size={16} style={{ color: '#f59e0b' }} />
                        <span style={{ fontWeight: '800', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>Smart Suggestions</span>
                        {urgentCount > 0 && (
                            <span style={{
                                background: '#ef4444',
                                color: '#fff',
                                borderRadius: '999px',
                                fontSize: '0.68rem',
                                fontWeight: '800',
                                padding: '1px 7px'
                            }}>{urgentCount} urgent</span>
                        )}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                        Actionable recommendations for replenishment, dispatch, cleanup, and follow-up
                    </div>
                </div>
                {allCriticalIds.length > 0 && (
                    <button
                        onClick={() => executeAction({ kind: 'bulk-mark-restocking', itemIds: allCriticalIds })}
                        disabled={runningAction === 'bulk-mark-restocking'}
                        style={{
                            background: 'var(--accent-color)',
                            color: '#fff',
                            border: 'none',
                            padding: '0.45rem 0.9rem',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            opacity: runningAction ? 0.6 : 1,
                            whiteSpace: 'nowrap',
                            alignSelf: 'center'
                        }}
                    >
                        {runningAction === 'bulk-mark-restocking' ? 'Processing...' : 'Mark Low Stock Restocking'}
                    </button>
                )}
            </div>

            {!hasActions ? (
                <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>All clear</div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>No immediate automation actions are required</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '0.25rem', opacity: 0.7 }}>Replenishment, dispatch, and setup checks are all currently stable.</div>
                </div>
            ) : (
                <div style={{ padding: '1rem 1.1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.65rem' }}>
                        {[
                            ['Critical', summary.criticalItems || 0, '#ef4444'],
                            ['Forecast', summary.predictiveItems || 0, '#8b5cf6'],
                            ['Dispatch', summary.dispatchCustomers || 0, '#6366f1'],
                            ['Setup', summary.dataIssues || 0, '#f59e0b'],
                            ['Dormant', summary.dormantStock || 0, '#64748b']
                        ].map(([label, value, color]) => (
                            <div key={label} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.75rem', background: 'var(--hover-bg)' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>{label}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color }}>{value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', overflow: 'hidden' }}>
                        <div style={{ padding: '0.9rem 1rem', background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)', fontWeight: '800' }}>
                            Recommended Actions
                        </div>
                        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                            {urgentActions.map((item) => (
                                <div key={item.id} style={{ padding: '0.95rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                            <span style={{ background: item.color, color: '#fff', borderRadius: '999px', padding: '0.12rem 0.5rem', fontSize: '0.68rem', fontWeight: '800' }}>{item.badge}</span>
                                            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.title}</span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.description}</div>
                                    </div>
                                    {item.action && (
                                        <button
                                            onClick={() => executeAction(item.action)}
                                            style={{
                                                alignSelf: 'center',
                                                background: 'none',
                                                border: '1px solid var(--border-color)',
                                                color: 'var(--accent-color)',
                                                borderRadius: '10px',
                                                padding: '0.45rem 0.8rem',
                                                fontWeight: '700',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {item.action.buttonLabel}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.9rem', background: 'rgba(239,68,68,0.03)' }}>
                            <div style={{ fontWeight: '800', marginBottom: '0.35rem' }}>Reorder Groups</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {supplierGroups.length > 0
                                    ? supplierGroups.slice(0, 3).map((group) => `${group.supplier.name}: ${group.items.length} item(s)`).join(' | ')
                                    : 'No grouped supplier reorders right now.'}
                            </div>
                        </div>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.9rem', background: 'rgba(99,102,241,0.03)' }}>
                            <div style={{ fontWeight: '800', marginBottom: '0.35rem' }}>Workflow Notes</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {staleRestocks.length > 0 && `${staleRestocks.length} stale restock follow-up(s). `}
                                {dispatchQueue.length > 0 && `${dispatchQueue.length} customer dispatch reminder(s). `}
                                {dataIssues.length === 0 && dormantStock.length === 0 && staleRestocks.length === 0 && dispatchQueue.length === 0
                                    ? 'No extra workflow exceptions detected.'
                                    : ''}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.AutomationHub = AutomationHub;

/**
 * AutomationRibbon
 * A slim, collapsible, session-dismissible strip for Assets and Partners views.
 */
const AutomationRibbon = ({ automation, context = 'assets', openPrompt }) => {
    const [dismissed, setDismissed] = React.useState(false);
    const [expanded, setExpanded] = React.useState(false);

    if (!automation || dismissed) return null;

    const {
        supplierGroups = [],
        unlinkedCritical = [],
        dispatchQueue = [],
        staleRestocks = [],
        predictiveItems = [],
        dataIssues = [],
        dormantStock = []
    } = automation;

    let count = 0;
    let summary = '';
    let groups = [];

    if (context === 'assets') {
        const reorderCount = (supplierGroups || []).reduce((n, group) => n + group.items.length, 0) + (unlinkedCritical || []).length;
        const dispatchCount = (dispatchQueue || []).reduce((n, group) => n + group.products.length, 0);
        const staleCount = (staleRestocks || []).length;
        const forecastCount = (predictiveItems || []).length;
        const setupCount = (dataIssues || []).length;
        const dormantCount = (dormantStock || []).length;

        count = reorderCount + dispatchCount + staleCount + forecastCount + setupCount + dormantCount;
        if (count === 0) return null;

        summary = [
            reorderCount > 0 ? `${reorderCount} reorder issue(s)` : null,
            forecastCount > 0 ? `${forecastCount} forecast risk(s)` : null,
            dispatchCount > 0 ? `${dispatchCount} dispatch reminder(s)` : null,
            setupCount > 0 ? `${setupCount} setup gap(s)` : null,
            staleCount > 0 ? `${staleCount} stale restock(s)` : null,
            dormantCount > 0 ? `${dormantCount} dormant` : null
        ].filter(Boolean).join(' | ');

        groups = [
            ...supplierGroups.map((group) => ({
                label: group.supplier.name,
                sublabel: `${group.items.length} item(s) need replenishment`,
                action: () => openPrompt('Partner Details', 'supplier-details', [group.supplier.name]),
                actionLabel: 'Open'
            })),
            ...dispatchQueue.map((group) => ({
                label: group.customer.name,
                sublabel: `${group.products.length} ready-to-ship product(s)`,
                action: () => openPrompt('Partner Details', 'customer-details', [group.customer.name]),
                actionLabel: 'Open'
            })),
            ...staleRestocks.slice(0, 3).map((item) => ({
                label: item.name,
                sublabel: 'Restocking without recent receipt',
                action: () => openPrompt('Edit Inventory Item', 'edit-item', [item.id]),
                actionLabel: 'Review'
            })),
            ...predictiveItems.slice(0, 3).map((item) => ({
                label: item.name,
                sublabel: `Potential shortage in ${item.daysRemaining} days`,
                action: () => openPrompt('Product Insights', 'product-stats', [item.id]),
                actionLabel: 'Plan'
            })),
            ...dataIssues.slice(0, 3).map((item) => ({
                label: item.name,
                sublabel: `Missing: ${item.issues[0]}`,
                action: () => openPrompt('Edit Inventory Item', 'edit-item', [item.id]),
                actionLabel: 'Fix'
            })),
            ...unlinkedCritical.slice(0, 3).map((item) => ({
                label: item.name,
                sublabel: 'No supplier link for reorder',
                action: () => openPrompt('Edit Inventory Item', 'edit-item', [item.id]),
                actionLabel: 'Fix'
            }))
        ];
    } else if (context === 'partners-suppliers') {
        count = supplierGroups.length + staleRestocks.length;
        if (count === 0) return null;
        summary = `${supplierGroups.length} supplier reorder group(s) and ${staleRestocks.length} stale receipt follow-up(s)`;
        groups = supplierGroups.map((group) => ({
            label: group.supplier.name,
            sublabel: `${group.items.length} linked item(s) need replenishment`,
            action: () => openPrompt('Partner Details', 'supplier-details', [group.supplier.name]),
            actionLabel: 'Open'
        }));
    } else if (context === 'partners-customers') {
        count = dispatchQueue.length;
        if (count === 0) return null;
        summary = `${dispatchQueue.length} customer dispatch reminder(s) detected`;
        groups = dispatchQueue.map((group) => ({
            label: group.customer.name,
            sublabel: `${group.products.length} product(s) awaiting shipment`,
            action: () => openPrompt('Partner Details', 'customer-details', [group.customer.name]),
            actionLabel: 'Open'
        }));
    }

    if (count === 0) return null;

    return (
        <div style={{
            margin: '0 0 0.75rem 0',
            borderRadius: '12px',
            border: '1px solid rgba(245,158,11,0.25)',
            background: 'rgba(245,158,11,0.04)',
            overflow: 'hidden',
            fontSize: '0.8rem',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.55rem 0.9rem',
                cursor: 'pointer'
            }} onClick={() => setExpanded((value) => !value)}>
                <span style={{ fontSize: '0.85rem' }}>Smart Suggestions</span>
                <span style={{ fontWeight: '700', color: '#92400e', flex: 1 }}>{summary}</span>
                <span style={{ color: '#92400e', opacity: 0.6, fontWeight: '700', fontSize: '0.72rem' }}>
                    {expanded ? 'Hide' : 'Details'}
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#92400e',
                        opacity: 0.4,
                        cursor: 'pointer',
                        padding: '0 0.15rem',
                        fontSize: '0.9rem',
                        lineHeight: 1
                    }}
                    title="Dismiss"
                >x</button>
            </div>

            {expanded && (
                <div style={{ borderTop: '1px solid rgba(245,158,11,0.15)' }}>
                    {groups.map((group, index) => (
                        <div key={`${group.label}-${index}`} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.45rem 0.9rem',
                            gap: '0.5rem',
                            borderTop: index > 0 ? '1px solid rgba(245,158,11,0.08)' : 'none'
                        }}>
                            <div>
                                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.78rem' }}>{group.label}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{group.sublabel}</div>
                            </div>
                            {group.action && (
                                <button
                                    onClick={group.action}
                                    style={{
                                        background: 'none',
                                        border: '1px solid rgba(245,158,11,0.3)',
                                        color: '#92400e',
                                        padding: '0.2rem 0.55rem',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        whiteSpace: 'nowrap'
                                    }}
                                >{group.actionLabel}</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

window.AutomationRibbon = AutomationRibbon;
