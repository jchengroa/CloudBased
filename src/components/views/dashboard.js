/**
 * Dashboard Component
 * Features a customizable grid system for Dashboard Modules.
 * Separated into View components and Engine logic.
 */

const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
const WarehousePills = window.WarehousePills || (() => null);
const DashboardGrid = window.DashboardGrid || (() => null);
const formatQty = (value) => window.formatStockQuantity ? window.formatStockQuantity(value) : value;

const TotalItemsView = ({ count, warehouseCount }) => (
    <div className="dashboard-card">
        <div className="dash-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>
                <Icons.Box size={18} color="var(--accent-color)" /> Total Items
            </div>
        </div>
        <div className="dash-card-value">{count}</div>
        <div className="dash-card-subtitle">Tracked across {warehouseCount} warehouse location(s)</div>
    </div>
);

const LowStockView = ({ count, criticalCount }) => (
    <div className="dashboard-card">
        <div className="dash-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>
                <Icons.AlertTriangle size={18} color="var(--danger)" /> Replenishment Risk
            </div>
        </div>
        <div className="dash-card-value">{count}</div>
        <div className="dash-card-subtitle" style={{ color: criticalCount > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
            {criticalCount} critical, {Math.max(0, count - criticalCount)} warning
        </div>
    </div>
);

const SuppliersOnlyView = ({ count, coverage }) => (
    <div className="dashboard-card">
        <div className="dash-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>
                <Icons.Users size={18} color="#10b981" /> Partners
            </div>
        </div>
        <div className="dash-card-value">{count}</div>
        <div className="dash-card-subtitle">{coverage}% supplier-link coverage on raw and supply items</div>
    </div>
);

const CategoryPerformanceView = ({ categoryList }) => (
    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}>
                <Icons.PieChart size={18} color="var(--accent-color)" /> Category Performance
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Healthy coverage, low-stock exposure, and category share</div>
        </div>
        <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', maxHeight: '320px', overflowY: 'auto' }}>
            {categoryList.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No categories found.</div>
            ) : categoryList.map((cat) => (
                <div key={cat.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', gap: '0.5rem' }}>
                        <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{cat.name}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{cat.share}% of current catalog</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', color: cat.color }}>{cat.health}% healthy</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{cat.low} low, {cat.critical} critical</div>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--hover-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${cat.health}%`, height: '100%', background: cat.color, transition: 'width 0.5s ease-out' }} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const WarehouseHealthView = ({ whList }) => (
    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}>
                <Icons.Activity size={18} color="#0ea5e9" /> Warehouse Health
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Readiness is based on healthy-item ratio, restock backlog, and setup completeness by location</div>
        </div>
        <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '340px', overflowY: 'auto' }}>
            {whList.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No warehouse data.</div>
            ) : whList.map((warehouse) => (
                <div key={warehouse.name} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' }}>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>{warehouse.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{warehouse.summary}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', color: warehouse.scoreColor }}>{warehouse.health}%</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Readiness score</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
                        <div><div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Healthy</div><div style={{ fontWeight: '700' }}>{warehouse.healthyItems}/{warehouse.items}</div></div>
                        <div><div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Low / Critical</div><div style={{ fontWeight: '700' }}>{warehouse.lowStockCount} / {warehouse.criticalCount}</div></div>
                        <div><div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Restocking</div><div style={{ fontWeight: '700' }}>{warehouse.restockingCount}</div></div>
                        <div><div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>On Hand</div><div style={{ fontWeight: '700' }}>{formatQty(warehouse.totalQty)}</div></div>
                        <div><div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>30D In / Out</div><div style={{ fontWeight: '700' }}>{formatQty(warehouse.inbound30d)} / {formatQty(warehouse.outbound30d)}</div></div>
                        <div><div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Fill vs Target</div><div style={{ fontWeight: '700' }}>{warehouse.fillRate}%</div></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const RecentArrivalsView = ({ logs }) => (
    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem', background: 'rgba(16, 185, 129, 0.05)', borderBottom: '1px solid rgba(16, 185, 129, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: '700', fontSize: '1rem' }}>
                <Icons.ArrowDownCircle size={18} /> Recent Arrivals
            </div>
            <div style={{ color: '#059669', opacity: 0.8, fontSize: '0.8rem', marginTop: '0.2rem' }}>Latest inbound records with warehouse and supplier context</div>
        </div>
        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {logs.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center' }}>No recent arrivals.</div> : logs.map((log) => (
                <div key={log.transactionId || `${log.itemCode}-${log.date}`} style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{log.itemName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.itemCode} | {log.supplier || log.supplierName || 'No Supplier'} | {log.warehouse || 'Unassigned'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: '#10b981' }}>+{formatQty(log.quantity)} {log.uom}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(log.date).toLocaleDateString()}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const RecentShipmentsView = ({ logs }) => (
    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem', background: 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontWeight: '700', fontSize: '1rem' }}>
                <Icons.ArrowUpCircle size={18} /> Recent Shipments
            </div>
            <div style={{ color: '#e11d48', opacity: 0.8, fontSize: '0.8rem', marginTop: '0.2rem' }}>Latest outbound records with warehouse routing context</div>
        </div>
        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {logs.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center' }}>No recent shipments.</div> : logs.map((log) => (
                <div key={log.transactionId || `${log.itemCode}-${log.date}`} style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{log.itemName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.itemCode} | {log.warehouse || 'Unassigned'} | {log.user || log.userName || 'System'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: '#ef4444' }}>-{formatQty(log.quantity)} {log.uom}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(log.date).toLocaleDateString()}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const CriticalReplenishmentView = ({ criticalItems, supplierData, openPrompt }) => (
    <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem', background: 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e11d48', fontWeight: '700', fontSize: '1rem' }}>
                    <Icons.AlertTriangle size={18} /> Critical Replenishment
                </div>
                <div style={{ color: '#e11d48', opacity: 0.8, fontSize: '0.8rem', marginTop: '0.2rem' }}>Items below target and not yet marked restocking</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#e11d48', fontWeight: '800', fontSize: '1.2rem' }}>{criticalItems.length}</div>
                <div style={{ color: '#e11d48', fontSize: '0.75rem', opacity: 0.8 }}>active alerts</div>
            </div>
        </div>
        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {criticalItems.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center' }}>All stock levels are currently within target.</div> : criticalItems.map((item) => (
                <div key={item.id} style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                            <span style={{ background: item.severity === 'critical' ? '#ef4444' : '#f59e0b', color: '#fff', borderRadius: '999px', padding: '0.1rem 0.45rem', fontSize: '0.65rem', fontWeight: '800' }}>{item.severity === 'critical' ? 'Critical' : 'Warning'}</span>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</div>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {item.id} | {item.category || 'Uncategorized'} | {formatQty(item.quantity)}/{formatQty(item.threshold)} {item.uom || 'units'}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: item.severity === 'critical' ? '#ef4444' : '#f59e0b', marginTop: '0.2rem' }}>
                            Shortfall: {formatQty(item.shortfall)} {item.uom || 'units'}
                        </div>
                    </div>
                    <button className="auth-btn-text" style={{ padding: '0.4rem', color: 'var(--accent-color)', fontWeight: '700', whiteSpace: 'nowrap' }} onClick={() => {
                        const supplier = supplierData.find((entry) => entry.id === item.supplier || entry.name === item.supplier);
                        if (supplier) openPrompt('Partner Details', 'supplier-details', [supplier.name]);
                        else openPrompt('Edit Inventory Item', 'edit-item', [item.id]);
                    }}>{item.supplier ? 'Contact Supplier' : 'Fix Setup'}</button>
                </div>
            ))}
        </div>
    </div>
);

const PredictiveReplenishView = ({ branding, predictions }) => {
    const addToCalendar = (item) => {
        const title = encodeURIComponent(`[REFILL] ${item.name}`);
        const dateObj = item.predictedDate || new Date();
        const reminderDate = new Date(dateObj);
        reminderDate.setDate(reminderDate.getDate() - 2);
        const dateStr = reminderDate.toISOString().replace(/-|:|\\.\\d+/g, '').split('T')[0];
        const dateRange = `${dateStr}/${dateStr}`;
        const details = encodeURIComponent(`PREDICTIVE REPLENISH:\nItem: ${item.name}\nStock: ${formatQty(item.quantity)}\nRate: ${item.dailyBurn}/day\nStock-Out: ${dateObj.toLocaleDateString()}\nScheduled via ${branding?.companyName || 'System'}.`);
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateRange}&details=${details}`, '_blank');
    };

    return (
        <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.2)', background: 'linear-gradient(145deg, var(--card-bg), rgba(139, 92, 246, 0.03))' }}>
            <div style={{ padding: '1.2rem', borderBottom: '1px solid rgba(139, 92, 246, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontWeight: '800', fontSize: '1.1rem' }}><Icons.TrendingUp size={18} color="#8b5cf6" /> Predictive Replenishment</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Projected stock-outs based on the last 30 days of outbound movement</div>
                </div>
                {predictions.length > 0 && <div style={{ background: '#8b5cf6', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>{predictions.length} risk(s)</div>}
            </div>
            <div style={{ padding: '0.5rem 0', minHeight: '150px' }}>
                {predictions.length === 0 ? <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>No immediate stock-out risks found.</div> : predictions.slice(0, 6).map((item) => (
                    <div key={item.id} style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Burn: {item.dailyBurn}/day | Stock: {formatQty(item.quantity)} {item.uom || 'units'}</div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                            <div>
                                <div style={{ color: item.daysRemaining <= 3 ? '#ef4444' : '#f59e0b', fontWeight: '800' }}>{item.daysRemaining === 0 ? 'Out Today' : `${item.daysRemaining} day(s)`}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.predictedDate ? item.predictedDate.toLocaleDateString() : 'No date'}</div>
                            </div>
                            <button onClick={() => addToCalendar(item)} style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: '#4285F4' }}><Icons.Link size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const InnoAssistantView = ({ engine }) => {
    const suggestions = [
        'What urgent actions do you recommend?',
        'Show warehouse health',
        'Which items are missing suppliers?',
        'Mark all low stock as restocking'
    ];

    return (
        <div style={{ width: '100%', padding: '0 0 2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800' }}>
                    InnoAssistant
                </div>
            </div>
            <div style={{ width: '100%', maxWidth: '760px', position: 'relative' }}>
                <div style={{ borderRadius: '20px', padding: '2px', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Ask about stock, suppliers, warehouse health, automation issues, or log a movement..."
                        value={engine.command}
                        onChange={(e) => { engine.setCommand(e.target.value); if (engine.parsedResult) engine.setParsedResult(null); }}
                        onKeyDown={(e) => e.key === 'Enter' && engine.processCommand()}
                        style={{ width: '100%', height: '60px', border: 'none', borderRadius: '18px', padding: '0 1.5rem', background: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.8rem' }}>
                    {suggestions.map((suggestion) => (
                        <button key={suggestion} onClick={() => { engine.setCommand(suggestion); engine.setParsedResult(null); }} style={{ border: '1px solid var(--border-color)', background: 'var(--hover-bg)', borderRadius: '999px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>{suggestion}</button>
                    ))}
                </div>
                {engine.parsedResult && (
                    <div style={{ marginTop: '1rem', background: 'rgba(99, 102, 241, 0.03)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                        {engine.parsedResult.error ? <div style={{ color: '#ef4444' }}>{engine.parsedResult.error}</div> : (
                            <>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: engine.parsedResult.isQuery ? '600' : '700' }}>
                                        {engine.parsedResult.isQuery ? engine.parsedResult.answer : engine.parsedResult.humanReadable}
                                    </div>
                                    {Array.isArray(engine.parsedResult.bullets) && engine.parsedResult.bullets.length > 0 && (
                                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                            {engine.parsedResult.bullets.map((bullet, index) => (
                                                <div key={`${bullet}-${index}`}>• {bullet}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {!engine.parsedResult.isQuery && !engine.isActionRestricted && (
                                    <button className="auth-btn-primary" onClick={engine.confirmAction} style={{ width: 'auto', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>Execute</button>
                                )}
                                {!engine.parsedResult.isQuery && engine.isActionRestricted && (
                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '700', whiteSpace: 'nowrap' }}>Restricted</div>
                                )}
                            </>
                        )}
                    </div>
                )}
                <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', color: '#047857', fontSize: '0.75rem', fontWeight: '600', width: '100%', textAlign: 'center' }}>
                    InnoAssistant works on your live inventory, partner, and movement data so it can answer status questions and execute supported stock operations.
                </div>
            </div>
        </div>
    );
};

const Dashboard = ({ branding, inventoryData, inputLogs, outputLogs, supplierData, customerData = [], settings = {}, onPerformAction, openPrompt, globalSettings = {}, user, warehouses = [] }) => {
    const [activeWarehouseFilter, setActiveWarehouseFilter] = React.useState('All');
    const [isRearranging, setIsRearranging] = React.useState(false);

    const inventoryById = React.useMemo(() => inventoryData.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {}), [inventoryData]);

    const filteredInventory = React.useMemo(() => activeWarehouseFilter === 'All' ? inventoryData : inventoryData.filter((item) => item.warehouse === activeWarehouseFilter), [activeWarehouseFilter, inventoryData]);
    const filteredInputs = React.useMemo(() => activeWarehouseFilter === 'All' ? inputLogs : inputLogs.filter((log) => inventoryById[log.itemCode]?.warehouse === activeWarehouseFilter), [activeWarehouseFilter, inputLogs, inventoryById]);
    const filteredOutputs = React.useMemo(() => activeWarehouseFilter === 'All' ? outputLogs : outputLogs.filter((log) => inventoryById[log.itemCode]?.warehouse === activeWarehouseFilter), [activeWarehouseFilter, outputLogs, inventoryById]);

    const basicEngine = window.useBasicWidgetsEngine(filteredInventory, filteredInputs, filteredOutputs, supplierData, settings);
    const predictiveEngine = window.usePredictiveReplenishEngine(filteredInventory, filteredOutputs);
    const criticalEngine = window.useCriticalReplenishEngine(filteredInventory, settings);
    const innoAssistant = window.useInnoAssistantEngine(inventoryData, outputLogs, inputLogs, supplierData, customerData, user, onPerformAction);
    const automationEngine = window.useAutomationEngine(filteredInventory, supplierData, customerData, filteredOutputs, settings, filteredInputs);

    const sanitizeLayout = (layout) => {
        const defaultOrder = ['assistant', 'metrics', 'charts_category', 'charts_warehouse', 'recent_arrivals', 'recent_shipments', 'critical', 'predictive', 'automation'];
        const currentOrder = layout?.order || defaultOrder;
        const invalidIds = ['list_logs', 'metric_total_items', 'metric_low_stock', 'metric_suppliers'];
        const cleaned = currentOrder.filter((id) => !invalidIds.includes(id) && defaultOrder.includes(id));
        const missing = defaultOrder.filter((id) => !cleaned.includes(id));
        return {
            ...layout,
            order: [...cleaned, ...missing],
            sizes: {
                assistant: 2, metrics: 2, charts_category: 1, charts_warehouse: 1,
                recent_arrivals: 1, recent_shipments: 1, critical: 1, predictive: 1, automation: 1,
                ...(layout?.sizes || {})
            }
        };
    };

    const [draftHiddenWidgets, setDraftHiddenWidgets] = React.useState(settings.hiddenDashboardWidgets || []);
    const [draftLayout, setDraftLayout] = React.useState(sanitizeLayout(settings.dashboardLayout));

    React.useEffect(() => {
        if (!isRearranging) {
            setDraftHiddenWidgets(settings.hiddenDashboardWidgets || []);
            setDraftLayout(sanitizeLayout(settings.dashboardLayout));
        }
    }, [isRearranging, settings]);

    const gSet = {
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
        showAutomation: true,
        ...globalSettings
    };

    const isWidgetEnabled = (settingKey) => Boolean(gSet[settingKey]) && !draftHiddenWidgets.includes(settingKey);
    const handleToggleUserWidget = (widgetKey) => setDraftHiddenWidgets((prev) => prev.includes(widgetKey) ? prev.filter((key) => key !== widgetKey) : [...prev, widgetKey]);
    const handleFinishRearrange = async () => {
        try {
            await window.AppDataHandler.saveSettings({ ...settings, hiddenDashboardWidgets: draftHiddenWidgets, dashboardLayout: draftLayout });
            setIsRearranging(false);
        } catch (e) {
            alert(`Failed to save layout: ${e.message}`);
        }
    };

    const gridToSettingMap = {
        assistant: 'showInnoAssistant',
        metrics: 'showTotalItems',
        charts_category: 'showCategoryPerformance',
        charts_warehouse: 'showWarehouseHealth',
        recent_arrivals: 'showRecentArrivals',
        recent_shipments: 'showRecentShipments',
        critical: 'showCriticalReplenishment',
        predictive: 'showPredictiveReplenish',
        automation: 'showAutomation'
    };

    const criticalCount = criticalEngine.filter((item) => item.severity === 'critical').length;

    const gridItems = [
        { id: 'metrics', label: 'Key Metrics', isResizable: false, fixedSize: 'full' },
        { id: 'charts_category', label: 'Category Stats' },
        { id: 'charts_warehouse', label: 'Warehouse Health' },
        { id: 'recent_arrivals', label: 'Recent Arrivals' },
        { id: 'recent_shipments', label: 'Recent Shipments' },
        { id: 'critical', label: 'Critical Actions' },
        { id: 'assistant', label: 'Smart Suggestions', isResizable: false, fixedSize: 'full' },
        { id: 'predictive', label: 'Forecast' },
        { id: 'automation', label: 'Smart Suggestions' },
    ].map((item) => {
        let component = null;
        let visible = false;

        switch (item.id) {
            case 'metrics':
                visible = isWidgetEnabled('showTotalItems') || isWidgetEnabled('showLowStock') || isWidgetEnabled('showSuppliersOnly');
                component = (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {isWidgetEnabled('showTotalItems') && <TotalItemsView count={basicEngine.totalItems} warehouseCount={basicEngine.warehouseCount} />}
                        {isWidgetEnabled('showLowStock') && <LowStockView count={basicEngine.lowStockItems.length} criticalCount={criticalCount} />}
                        {isWidgetEnabled('showSuppliersOnly') && <SuppliersOnlyView count={basicEngine.totalSuppliers} coverage={basicEngine.supplierCoverage} />}
                    </div>
                );
                break;
            case 'charts_category':
                visible = isWidgetEnabled('showCategoryPerformance');
                component = <CategoryPerformanceView categoryList={basicEngine.categoryPerformance} />;
                break;
            case 'charts_warehouse':
                visible = isWidgetEnabled('showWarehouseHealth');
                component = <WarehouseHealthView whList={basicEngine.warehouseHealth} />;
                break;
            case 'recent_arrivals':
                visible = isWidgetEnabled('showRecentArrivals');
                component = <RecentArrivalsView logs={basicEngine.recentArrivals} />;
                break;
            case 'recent_shipments':
                visible = isWidgetEnabled('showRecentShipments');
                component = <RecentShipmentsView logs={basicEngine.recentShipments} />;
                break;
            case 'critical':
                visible = isWidgetEnabled('showCriticalReplenishment');
                component = <CriticalReplenishmentView criticalItems={criticalEngine} supplierData={supplierData} openPrompt={openPrompt} />;
                break;
            case 'assistant':
                visible = isWidgetEnabled('showInnoAssistant');
                component = <InnoAssistantView engine={innoAssistant} />;
                break;
            case 'automation':
                visible = isWidgetEnabled('showAutomation');
                component = window.AutomationHub ? <window.AutomationHub automation={automationEngine} openPrompt={openPrompt} onBulkAction={onPerformAction} /> : null;
                break;
            case 'predictive':
                visible = isWidgetEnabled('showPredictiveReplenish');
                component = <PredictiveReplenishView branding={branding} predictions={predictiveEngine} />;
                break;
        }
        return { ...item, component, visible };
    });

    return (
        <div className="dashboard-content-wrapper" style={{ padding: '0 2rem 2rem 2rem' }}>
            <div className="dashboard-toolbar" style={{ paddingBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h1 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <Icons.Dashboard stroke="var(--accent-color)" size={22} /> Dashboard
                        </h1>
                        <button onClick={() => setIsRearranging(!isRearranging)} style={{ background: isRearranging ? 'var(--accent-color)' : 'var(--hover-bg)', color: isRearranging ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: '10px', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Icons.Edit size={14} />
                        </button>
                    </div>
                    <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }} />
                    <WarehousePills warehouses={['All', ...new Set(inventoryData.map((entry) => entry.warehouse).filter(Boolean))]} activeWarehouse={activeWarehouseFilter} onChange={setActiveWarehouseFilter} allLabel="All Locations" compact={true} />
                </div>
            </div>

            {isRearranging && (
                <div className="dashboard-widget-panel" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                        <Icons.Eye size={18} color="var(--accent-color)" />
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>Widget Visibility Controls</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        {[
                            ['showTotalItems', 'Total Items'],
                            ['showLowStock', 'Low Stock'],
                            ['showSuppliersOnly', 'Partners'],
                            ['showRecentArrivals', 'Recent Arrivals'],
                            ['showRecentShipments', 'Recent Shipments'],
                            ['showCriticalReplenishment', 'Critical'],
                            ['showPredictiveReplenish', 'Forecast'],
                            ['showInnoAssistant', 'Smart Suggestions'],
                            ['showCategoryPerformance', 'Categories'],
                            ['showWarehouseHealth', 'Warehouse Health'],
                            ['showAutomation', 'Smart Suggestions']
                        ].map(([key, label]) => (
                            <button key={key} onClick={() => handleToggleUserWidget(key)} style={{ padding: '0.7rem 1rem', borderRadius: '12px', border: isWidgetEnabled(key) ? '1px solid var(--success)' : '1px solid var(--border-color)', background: isWidgetEnabled(key) ? 'rgba(16,185,129,0.08)' : 'var(--hover-bg)', color: isWidgetEnabled(key) ? 'var(--success)' : 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                                {isWidgetEnabled(key) ? <Icons.Eye size={14} /> : <Icons.EyeOff size={14} />}
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <DashboardGrid key="main" items={gridItems} layout={draftLayout} isEditMode={isRearranging} onLayoutChange={(layout) => setDraftLayout(layout)} onToggleVisibility={(id) => {
                if (id === 'metrics') {
                    const keys = ['showTotalItems', 'showLowStock', 'showSuppliersOnly'];
                    const anyVisible = keys.some((key) => isWidgetEnabled(key));
                    keys.forEach((key) => {
                        const isHidden = draftHiddenWidgets.includes(key);
                        if (anyVisible && !isHidden) handleToggleUserWidget(key);
                        else if (!anyVisible && isHidden) handleToggleUserWidget(key);
                    });
                } else {
                    const settingKey = gridToSettingMap[id];
                    if (settingKey) handleToggleUserWidget(settingKey);
                }
            }} viewKey="main" />

            {isRearranging && (
                <div className="dashboard-edit-banner" style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--accent-color)', color: '#fff', padding: '1rem 2rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span>REARRANGE MODE</span>
                    <button onClick={handleFinishRearrange} style={{ background: '#fff', color: 'var(--accent-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '800' }}>FINISH</button>
                </div>
            )}
        </div>
    );
};

window.Dashboard = Dashboard;

/**
 * Product Statistics Summary
 * A detailed view for a single product, including stock trends,
 * transaction summaries, and predictive analytics.
 */
const ProductStatSummary = ({ item, inputLogs, outputLogs, onEdit, user }) => {
    const hasRes = (action) => {
        if (!user || user.role === 'Administrator') return false;
        return (user.restrictions || []).includes(action);
    };
    const itemInputs = inputLogs.filter(l => l.itemCode === item.id);
    const itemOutputs = outputLogs.filter(l => l.itemCode === item.id);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allLogs = [...itemInputs.map(l => ({ ...l, type: 'in' })), ...itemOutputs.map(l => ({ ...l, type: 'out' }))]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const points = [];
    let currentStock = parseFloat(item.quantity) || 0;
    points.push({ date: new Date(), value: currentStock });

    allLogs.forEach(log => {
        if (new Date(log.date) < thirtyDaysAgo) return;
        if (log.type === 'in') currentStock -= parseFloat(log.quantity) || 0;
        else currentStock += parseFloat(log.quantity) || 0;
        points.push({ date: new Date(log.date), value: currentStock });
    });

    const chronPoints = points.sort((a, b) => a.date - b.date);
    const maxVal = Math.max(...chronPoints.map(p => p.value), item.optimalStock || 0, 10);
    const minVal = Math.min(...chronPoints.map(p => p.value), 0);
    const range = maxVal - minVal;

    const width = 400;
    const height = 120;
    const padding = 20;

    const svgPoints = chronPoints.map((p, i) => {
        const x = (i / (chronPoints.length - 1 || 1)) * (width - padding * 2) + padding;
        const y = height - ((p.value - minVal) / (range || 1)) * (height - padding * 2) - padding;
        return `${x},${y}`;
    }).join(' ');

    const recentOut = itemOutputs.filter(log => new Date(log.date) >= thirtyDaysAgo);
    const totalOut = recentOut.reduce((sum, log) => sum + (parseFloat(log.quantity) || 0), 0);
    const dailyBurn = (totalOut / 30).toFixed(2);
    const daysRemaining = dailyBurn > 0 ? Math.floor((parseFloat(item.quantity) || 0) / dailyBurn) : Infinity;

    // Smart Engine Exception Flags (Consistent with automationEngine.js)
    const isStaleRestock = item.isRestocked === 'I' && (!itemInputs[0] || (new Date() - new Date(itemInputs[0].date)) > 7 * 86400000);
    const isDormant = (parseFloat(item.quantity) || 0) > 0 && (!allLogs[0] || (new Date() - new Date(allLogs[0].date)) > 45 * 86400000);
    const cat = (item.category || '').toLowerCase();
    const hasDataIssues = !item.warehouse || (!item.supplier && !cat.includes('product')) || (!item.customer && cat.includes('product'));

    const Icons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    const renderIcon = (name, props = {}) => {
        const Icon = Icons[name] || (() => null);
        return <Icon {...props} />;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.6, fontWeight: '600' }}>ITEM: {item.id}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800' }}>{item.name}</div>
                </div>
                {!hasRes('EditItems') && (
                    <button className="auth-btn-primary" onClick={() => onEdit(item)} style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                        Edit Product
                    </button>
                )}
            </div>

            <div className="dashboard-card" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Stock Levels (30D)</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Range: {minVal} - {maxVal} {item.uom}</div>
                </div>
                <div style={{ width: '100%', height: '140px', position: 'relative' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
                        <polygon points={`${padding},${height} ${svgPoints} ${width - padding},${height}`} fill="url(#grad)" opacity="0.1" />
                        <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: 'var(--accent-color)', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: 'var(--accent-color)', stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>
                        <polyline fill="none" stroke="var(--accent-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={svgPoints} />
                        {item.optimalStock > 0 && (
                            <line
                                x1={padding}
                                y1={height - ((item.optimalStock - minVal) / (range || 1)) * (height - padding * 2) - padding}
                                x2={width - padding}
                                y2={height - ((item.optimalStock - minVal) / (range || 1)) * (height - padding * 2) - padding}
                                stroke="#ef4444"
                                strokeWidth="1"
                                strokeDasharray="3"
                                opacity="0.4"
                            />
                        )}
                    </svg>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="dashboard-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 }}>Total Arrivals</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{itemInputs.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981' }}>Across all logs</div>
                </div>
                <div className="dashboard-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 }}>Total Shipments</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{itemOutputs.length}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6366f1' }}>Across all logs</div>
                </div>
            </div>

            {/* Engine Analysis Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* 1. Predictive Burn Analysis */}
                <div style={{
                    padding: '1rem 1.2rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.02) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                        <Icons.Activity size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', color: 'var(--accent-color)', fontSize: '0.85rem' }}>Burn Analysis</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Burn rate: <strong>{dailyBurn}</strong>/day. Stock-out in <strong>{daysRemaining === Infinity ? 'infinite days' : daysRemaining + ' day(s)'}</strong>.
                        </div>
                    </div>
                    {daysRemaining <= 7 && (
                        <div style={{ padding: '0.3rem 0.7rem', background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: '900', borderRadius: '20px' }}>REORDER</div>
                    )}
                </div>

                {/* 2. Exception Warnings (Setup, Stale, Dormant) */}
                {(isStaleRestock || hasDataIssues || isDormant) && (
                    <div style={{
                        padding: '1rem 1.2rem',
                        borderRadius: '16px',
                        background: 'rgba(245, 158, 11, 0.05)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '800' }}>
                            <Icons.AlertTriangle size={18} /> Smart Engine Insights
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {hasDataIssues && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f59e0b' }} />
                                    Accountability gap: Missing warehouse or partner linkage.
                                </div>
                            )}
                            {isStaleRestock && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f59e0b' }} />
                                    Stale restock: Item marked as 'InProgress' but no receipt for 7+ days.
                                </div>
                            )}
                            {isDormant && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#f59e0b' }} />
                                    Dormant stock: No movement recorded for over 45 days.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

window.ProductStatSummary = ProductStatSummary;
