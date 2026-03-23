const Dashboard = ({ inventoryData, inputLogs, outputLogs, supplierData, settings, onPerformAction, openPrompt, globalSettings = {} }) => {
    const [activeWarehouseFilter, setActiveWarehouseFilter] = React.useState('All');
    const [activeView, setActiveView] = React.useState('statistics');


    // Default config assuming everything is ON if not specified
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
        showWarehouseDistribution: true,
        ...globalSettings
    };

    // Extract unique warehouses for filter dropdown
    const availableWarehouses = ['All', ...new Set(inventoryData.map(i => i.warehouse).filter(Boolean))].sort();

    // Filter data based on warehouse
    const filteredInventory = activeWarehouseFilter === 'All' ? inventoryData : inventoryData.filter(i => i.warehouse === activeWarehouseFilter);
    // Note: Supplier is supplier. Passed as all.
    // For logs: Recent Arrivals & Shipments.
    const filteredInputs = activeWarehouseFilter === 'All' ? inputLogs : inputLogs.filter(log => {
        const item = inventoryData.find(i => i.id === log.itemCode);
        return item && item.warehouse === activeWarehouseFilter;
    });
    const filteredOutputs = activeWarehouseFilter === 'All' ? outputLogs : outputLogs.filter(log => {
        const item = inventoryData.find(i => i.id === log.itemCode);
        return item && item.warehouse === activeWarehouseFilter;
    });

    return (
        <div className="list-box" style={{ background: 'transparent', border: 'none', boxShadow: 'none', overflowY: 'auto', paddingRight: '10px' }}>
            <div style={{ paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <window.DashboardIcon stroke="var(--accent-color)" /> Dashboard
                        </h1>
                    </div>

                    <window.ViewSwitcher
                        activeView={activeView}
                        setActiveView={setActiveView}
                        options={[
                            { key: 'statistics', label: 'Statistics' },
                            { key: 'overview', label: 'Overview' },
                            { key: 'aiAct', label: '(AI) Act' }
                        ]}
                    />
                </div>

                {availableWarehouses.length > 0 && (
                    <div className="location-pills" style={{ padding: '0', animation: 'none', background: 'transparent', border: 'none' }}>
                        {availableWarehouses.map(w => (
                            <button
                                key={w}
                                className={`location-pill ${activeWarehouseFilter === w ? 'active' : ''}`}
                                onClick={() => setActiveWarehouseFilter(w)}
                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                            >
                                {w === 'All' ? 'Location: All Warehouses' : w}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }} className="fade-in">
                {/* 1. Statistics View */}
                {activeView === 'statistics' && (
                    <>
                        {(gSet.showTotalItems || gSet.showLowStock || gSet.showSuppliersOnly) && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {gSet.showTotalItems && <window.TotalItemsCard inventoryData={filteredInventory} />}
                                {gSet.showLowStock && <window.LowStockCard inventoryData={filteredInventory} settings={settings} />}
                                {gSet.showSuppliersOnly && <window.SuppliersOnlyCard supplierData={supplierData} />}
                            </div>
                        )}
                        {(gSet.showCategoryPerformance || gSet.showWarehouseDistribution) && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                {gSet.showCategoryPerformance && <window.CategoryPerformance inventoryData={filteredInventory} settings={settings} />}
                                {gSet.showWarehouseDistribution && <window.WarehouseDistribution inventoryData={filteredInventory} settings={settings} />}
                            </div>
                        )}
                    </>
                )}

                {/* 2. Overview View */}
                {activeView === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                        {gSet.showRecentArrivals && <window.RecentArrivalsList inputLogs={filteredInputs} inventoryData={inventoryData} />}
                        {gSet.showRecentShipments && <window.RecentShipmentsList outputLogs={filteredOutputs} inventoryData={inventoryData} />}
                    </div>
                )}

                {/* 3. (AI) Act View */}
                {activeView === 'aiAct' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {gSet.showInnoAssistant && <window.InnoAssistant
                            inventoryData={filteredInventory}
                            outputLogs={filteredOutputs}
                            inputLogs={filteredInputs}
                            supplierData={supplierData}
                            onPerformAction={onPerformAction}
                        />}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                            {gSet.showPredictiveReplenish && <window.PredictiveReplenish inventoryData={filteredInventory} outputLogs={filteredOutputs} />}
                            {gSet.showCriticalReplenishment && <window.CriticalReplenishment inventoryData={filteredInventory} settings={settings} supplierData={supplierData} openPrompt={openPrompt} />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
window.Dashboard = Dashboard;
