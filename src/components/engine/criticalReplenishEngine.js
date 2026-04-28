/**
 * Critical Replenish Engine
 * Identifies items that are immediately below required stock levels.
 */
const useCriticalReplenishEngine = (inventoryData, settings) => {
    const getMin = (item) => {
        if (settings?.isThresholdEnabled && settings?.lowStockThreshold) return parseFloat(settings.lowStockThreshold);
        return parseFloat(item.optimalStock) || 0;
    };

    return React.useMemo(() => {
        return inventoryData
            .filter((item) => {
                const stock = parseFloat(item.quantity) || 0;
                const min = getMin(item);
                return stock < min && (item.isRestocked !== 'Yes' && item.isRestocked !== 'I');
            })
            .map((item) => {
                const stock = parseFloat(item.quantity) || 0;
                const threshold = getMin(item);
                const ratio = threshold > 0 ? stock / threshold : 0;
                return {
                    ...item,
                    threshold,
                    shortfall: Math.max(0, threshold - stock),
                    severity: stock <= 0 || ratio < 0.5 ? 'critical' : 'warning'
                };
            })
            .sort((a, b) => {
                const aRatio = a.threshold > 0 ? (parseFloat(a.quantity) || 0) / a.threshold : 0;
                const bRatio = b.threshold > 0 ? (parseFloat(b.quantity) || 0) / b.threshold : 0;
                return aRatio - bRatio;
            });
    }, [inventoryData, settings]);
};
window.useCriticalReplenishEngine = useCriticalReplenishEngine;
