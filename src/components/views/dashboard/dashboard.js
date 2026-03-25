/**
 * Dashboard Component
 * Features a customizable grid system for Dashboard Modules.
 */
const Dashboard = ({ branding, inventoryData, inputLogs, outputLogs, supplierData, settings = {}, onPerformAction, openPrompt, globalSettings = {}, user }) => {
    const [activeWarehouseFilter, setActiveWarehouseFilter] = React.useState('All');
    const [activeView, setActiveView] = React.useState('overview');
    const [isRearranging, setIsRearranging] = React.useState(false);

    const gSet = {
        showTotalItems: true, showLowStock: true, showSuppliersOnly: true, 
        showRecentArrivals: true, showRecentShipments: true,
        showCriticalReplenishment: true, showPredictiveReplenish: true,
        showInnoAssistant: true, showCategoryPerformance: true,
        showWarehouseHealth: true,
        ...globalSettings
    };

    // Module Definitions
    const allModulesList = [
        { id: 'metrics', label: 'Key Metrics', isResizable: false },
        { id: 'charts_category', label: 'Category Stats' },
        { id: 'charts_warehouse', label: 'Warehouse Health' },
        { id: 'list_logs', label: 'Activity Logs' },
        { id: 'critical', label: 'Critical Actions' },
        { id: 'assistant', label: 'AI Assistant', isResizable: false },
        { id: 'predictive', label: 'Forecast' }
    ];

    const [layouts, setLayouts] = React.useState({
        overview: settings.overviewLayout || { 
            order: ['metrics', 'charts_category', 'charts_warehouse', 'list_logs', 'critical'],
            sizes: { charts_category: 1, charts_warehouse: 1 } 
        },
        aiAct: settings.actLayout || { 
            order: ['assistant', 'predictive', 'critical'],
            sizes: { predictive: 1, critical: 1 } 
        }
    });

    const handleLayoutChange = async (newLayout) => {
        const key = activeView === 'overview' ? 'overviewLayout' : 'actLayout';
        setLayouts(prev => ({ ...prev, [activeView]: newLayout }));
        try {
            await window.AppDataHandler.saveSettings({ ...settings, [key]: newLayout });
        } catch(e) { console.error("Layout Save Failed:", e); }
    };

    // Filter Data Logic
    const availableWarehouses = ['All', ...new Set(inventoryData.map(i => i.warehouse).filter(Boolean))].sort();
    const filteredInventory = activeWarehouseFilter === 'All' ? inventoryData : inventoryData.filter(i => i.warehouse === activeWarehouseFilter);
    const filteredInputs = activeWarehouseFilter === 'All' ? inputLogs : inputLogs.filter(l => (inventoryData.find(i => i.id === l.itemCode)?.warehouse === activeWarehouseFilter));
    const filteredOutputs = activeWarehouseFilter === 'All' ? outputLogs : outputLogs.filter(l => (inventoryData.find(i => i.id === l.itemCode)?.warehouse === activeWarehouseFilter));

    // Construct Item List with real components
    const gridItems = allModulesList.map(m => {
        let component = null;
        let visible = false;

        switch(m.id) {
            case 'metrics': 
                visible = gSet.showTotalItems || gSet.showLowStock || gSet.showSuppliersOnly;
                component = (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {gSet.showTotalItems && <window.TotalItemsCard inventoryData={filteredInventory} />}
                        {gSet.showLowStock && <window.LowStockCard inventoryData={filteredInventory} settings={settings} />}
                        {gSet.showSuppliersOnly && <window.SuppliersOnlyCard supplierData={supplierData} />}
                    </div>
                );
                break;
            case 'charts_category':
                visible = gSet.showCategoryPerformance;
                component = <window.CategoryPerformance inventoryData={filteredInventory} settings={settings} />;
                break;
            case 'charts_warehouse':
                visible = gSet.showWarehouseHealth;
                component = <window.WarehouseHealth inventoryData={filteredInventory} settings={settings} />;
                break;
            case 'list_logs':
                visible = gSet.showRecentArrivals || gSet.showRecentShipments;
                component = (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                        {gSet.showRecentArrivals && <window.RecentArrivalsList inputLogs={filteredInputs} inventoryData={inventoryData} />}
                        {gSet.showRecentShipments && <window.RecentShipmentsList outputLogs={filteredOutputs} inventoryData={inventoryData} />}
                    </div>
                );
                break;
            case 'critical':
                visible = gSet.showCriticalReplenishment;
                component = <window.CriticalReplenishment inventoryData={filteredInventory} settings={settings} supplierData={supplierData} openPrompt={openPrompt} />;
                break;
            case 'assistant':
                visible = gSet.showInnoAssistant;
                component = <window.InnoAssistant inventoryData={filteredInventory} outputLogs={filteredOutputs} inputLogs={filteredInputs} supplierData={supplierData} onPerformAction={onPerformAction} user={user} />;
                break;
            case 'predictive':
                visible = gSet.showPredictiveReplenish;
                component = <window.PredictiveReplenish branding={branding} inventoryData={filteredInventory} outputLogs={filteredOutputs} />;
                break;
        }

        return { ...m, component, visible };
    });

    return (
        <div className="dashboard-content-wrapper" style={{ padding: '0 2rem 2rem 2rem' }}>
            <div style={{ paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <window.DashboardIcon stroke="var(--accent-color)" /> Dashboard
                        </h1>
                        <button onClick={() => setIsRearranging(!isRearranging)} style={{ background: isRearranging ? 'var(--accent-color)' : 'var(--hover-bg)', color: isRearranging ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}>
                            <Icons.Edit size={16} />
                        </button>
                    </div>
                    <window.ViewSwitcher activeView={activeView} setActiveView={setActiveView} options={[{ key: 'overview', label: 'Overview' }, { key: 'aiAct', label: 'Act' }]} />
                </div>

                {availableWarehouses.length > 0 && (
                    <div className="location-pills" style={{ padding: '0', animation: 'none', background: 'transparent', border: 'none' }}>
                        {availableWarehouses.map(w => (
                            <button key={w} className={`location-pill ${activeWarehouseFilter === w ? 'active' : ''}`} onClick={() => setActiveWarehouseFilter(w)} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                {w === 'All' ? 'Location: All Warehouses' : w}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <window.DashboardGrid 
                items={gridItems} 
                layout={layouts[activeView]} 
                isEditMode={isRearranging} 
                onLayoutChange={handleLayoutChange} 
            />

            {isRearranging && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: 'var(--accent-color)', color: '#fff', padding: '0.8rem 1.6rem', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', fontWeight: '800', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <span>DASHBOARD REARRANGE MODE</span>
                    <button onClick={() => setIsRearranging(false)} style={{ background: '#fff', border: 'none', color: 'var(--accent-color)', padding: '0.3rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}>FINISH</button>
                </div>
            )}
        </div>
    );
};
window.Dashboard = Dashboard;
