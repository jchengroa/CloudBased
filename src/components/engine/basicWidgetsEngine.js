/**
 * Basic Widgets Engine
 * Handles logic for metrics across the dashboard.
 */
const useBasicWidgetsEngine = (inventoryData, inputLogs, outputLogs, supplierData, settings) => {
    return React.useMemo(() => {
        const getMin = (item) => {
            if (settings?.isThresholdEnabled && settings?.lowStockThreshold) return parseFloat(settings.lowStockThreshold);
            return parseFloat(item.optimalStock) || 0;
        };

        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 86400000);
        const categories = {};
        const warehouses = {};
        const itemLookup = {};
        const lowStockItems = [];
        const supplierRelevantItems = [];
        let linkedSupplierItems = 0;

        inventoryData.forEach(item => {
            const itemId = String(item.id);
            const qty = parseFloat(item.quantity) || 0;
            const min = getMin(item);
            const stockRatio = min > 0 ? qty / min : (qty > 0 ? 1 : 0);
            const isLow = qty < min;
            const isCritical = qty <= 0 || (min > 0 && stockRatio < 0.5);
            const isProduct = (item.category || '').toLowerCase().includes('product');

            itemLookup[itemId] = item;
            if (isLow) {
                lowStockItems.push({
                    ...item,
                    threshold: min,
                    shortfall: Math.max(0, min - qty),
                    severity: isCritical ? 'critical' : 'warning'
                });
            }

            if (!isProduct) {
                supplierRelevantItems.push(item);
                if (item.supplier) linkedSupplierItems += 1;
            }

            let categoryName = (item.category || 'Uncategorized').trim().toLowerCase();
            if (categoryName === 'product') categoryName = 'products';
            if (categoryName === 'raw material') categoryName = 'raw materials';
            if (categoryName === 'ingredient') categoryName = 'ingredients';
            categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();

            if (!categories[categoryName]) categories[categoryName] = { total: 0, low: 0, critical: 0, stock: 0 };
            categories[categoryName].total += 1;
            categories[categoryName].stock += qty;
            if (isLow) categories[categoryName].low += 1;
            if (isCritical) categories[categoryName].critical += 1;

            const warehouseName = item.warehouse || 'Unassigned';
            if (!warehouses[warehouseName]) {
                warehouses[warehouseName] = {
                    items: 0,
                    healthyItems: 0,
                    lowStockCount: 0,
                    criticalCount: 0,
                    restockingCount: 0,
                    totalQty: 0,
                    thresholdQty: 0,
                    inbound30d: 0,
                    outbound30d: 0,
                    unassignedLinks: 0
                };
            }

            warehouses[warehouseName].items += 1;
            warehouses[warehouseName].totalQty += qty;
            warehouses[warehouseName].thresholdQty += min;
            if (isLow) warehouses[warehouseName].lowStockCount += 1;
            else warehouses[warehouseName].healthyItems += 1;
            if (isCritical) warehouses[warehouseName].criticalCount += 1;
            if (item.isRestocked === 'I') warehouses[warehouseName].restockingCount += 1;
            if (!item.warehouse || (!item.supplier && !isProduct) || (!item.customer && isProduct)) {
                warehouses[warehouseName].unassignedLinks += 1;
            }
        });

        const movementByWarehouse = {};
        const accumulateMovement = (log, type) => {
            if (!log?.date) return;
            const logTime = new Date(log.date).getTime();
            if (Number.isNaN(logTime) || logTime < thirtyDaysAgo) return;

            const item = itemLookup[String(log.itemCode)];
            const warehouseName = item?.warehouse || 'Unassigned';
            if (!movementByWarehouse[warehouseName]) {
                movementByWarehouse[warehouseName] = { inbound30d: 0, outbound30d: 0 };
            }

            const qty = parseFloat(log.quantity) || 0;
            if (type === 'input') movementByWarehouse[warehouseName].inbound30d += qty;
            else movementByWarehouse[warehouseName].outbound30d += qty;
        };

        inputLogs.forEach((log) => accumulateMovement(log, 'input'));
        outputLogs.forEach((log) => accumulateMovement(log, 'output'));

        const categoryPerformance = Object.keys(categories).map(name => {
            const data = categories[name];
            const healthy = data.total - data.low;
            const health = data.total === 0 ? 0 : Math.round((healthy / data.total) * 100);
            let color = '#10b981';
            if (health < 80 && health >= 50) color = '#f59e0b';
            if (health < 50) color = '#ef4444';
            return {
                name,
                ...data,
                healthy,
                health,
                color,
                share: inventoryData.length ? Math.round((data.total / inventoryData.length) * 100) : 0
            };
        }).sort((a, b) => b.total - a.total);

        const warehouseHealth = Object.keys(warehouses).map(name => {
            const data = warehouses[name];
            const movement = movementByWarehouse[name] || { inbound30d: 0, outbound30d: 0 };
            const healthyRatio = data.items > 0 ? data.healthyItems / data.items : 1;
            const restockPenalty = data.items > 0 ? data.restockingCount / data.items : 0;
            const dataPenalty = data.items > 0 ? data.unassignedLinks / data.items : 0;
            const health = Math.max(0, Math.round((healthyRatio * 100) - (restockPenalty * 10) - (dataPenalty * 10)));

            let scoreColor = '#10b981';
            if (health < 80 && health >= 50) scoreColor = '#f59e0b';
            if (health < 50) scoreColor = '#ef4444';

            const fillRate = data.thresholdQty > 0 ? Math.round((data.totalQty / data.thresholdQty) * 100) : 100;
            const movement30d = movement.inbound30d + movement.outbound30d;
            const summary = data.criticalCount > 0
                ? `${data.criticalCount} critical item${data.criticalCount !== 1 ? 's' : ''} need attention`
                : data.lowStockCount > 0
                    ? `${data.lowStockCount} low-stock item${data.lowStockCount !== 1 ? 's' : ''} need follow-up`
                    : 'Stock profile looks healthy';

            return {
                name,
                ...data,
                ...movement,
                movement30d,
                fillRate,
                health,
                scoreColor,
                summary
            };
        }).sort((a, b) => b.health - a.health);

        const enrichLog = (log, type) => {
            const item = itemLookup[String(log.itemCode)] || {};
            return {
                ...log,
                type,
                itemName: log.itemName || item.name || 'Unknown Item',
                uom: log.uom || item.uom || 'units',
                warehouse: item.warehouse || 'Unassigned',
                supplierName: item.supplier || log.supplier || '',
                quantityValue: parseFloat(log.quantity) || 0
            };
        };

        const recentArrivals = [...inputLogs]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6)
            .map((log) => enrichLog(log, 'input'));

        const recentShipments = [...outputLogs]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6)
            .map((log) => enrichLog(log, 'output'));

        return {
            totalItems: inventoryData.length,
            totalSuppliers: supplierData.length,
            lowStockItems,
            warehouseCount: Object.keys(warehouses).length,
            supplierCoverage: supplierRelevantItems.length > 0 ? Math.round((linkedSupplierItems / supplierRelevantItems.length) * 100) : 100,
            categoryPerformance,
            warehouseHealth,
            recentArrivals,
            recentShipments
        };
    }, [inventoryData, inputLogs, outputLogs, supplierData, settings]);
};
window.useBasicWidgetsEngine = useBasicWidgetsEngine;
