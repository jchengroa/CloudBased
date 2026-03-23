const Dashboard = ({ inventoryData, inputLogs, outputLogs, supplierData, settings }) => {
    const [activeWarehouseFilter, setActiveWarehouseFilter] = React.useState('All');
    
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
            <div style={{ paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <window.DashboardIcon stroke="var(--accent-color)" /> Command Center
                    </h1>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time inventory intelligence</div>
                </div>

                {availableWarehouses.length > 0 && (
                    <div className="location-pills" style={{ padding: '0', animation: 'none' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
                {/* Top Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <window.TotalItemsCard inventoryData={filteredInventory} />
                    <window.LowStockCard inventoryData={filteredInventory} settings={settings} />
                    <window.SuppliersOnlyCard supplierData={supplierData} />
                </div>

                {/* Arrivals / Shipments */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    <window.RecentArrivalsList inputLogs={filteredInputs} inventoryData={inventoryData} />
                    <window.RecentShipmentsList outputLogs={filteredOutputs} inventoryData={inventoryData} />
                </div>

                {/* Critical Replenishment */}
                <div>
                    <window.CriticalReplenishment inventoryData={filteredInventory} settings={settings} />
                </div>

                {/* Performance & Distribution */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    <window.CategoryPerformance inventoryData={filteredInventory} settings={settings} />
                    <window.WarehouseDistribution inventoryData={filteredInventory} settings={settings} />
                </div>
            </div>
        </div>
    );
};
window.Dashboard = Dashboard;
