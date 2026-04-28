/**
 * Unified Sorting System
 * Provides context-aware sorting logic for the entire application.
 */
(function() {
    const { useState, useMemo } = React;

    const getSortValue = (item, key) => {
        if (!item || !key) return '';

        switch (key) {
            case 'name':
            case 'productName':
            case 'itemName':
                return (item.name || item.productName || item.itemName || '').toString().toLowerCase();

            case 'id':
            case 'itemCode':
            case 'code':
                return (item.id || item.itemCode || item.code || '').toString().toLowerCase();

            case 'category':
                return (item.category || '').toString().toLowerCase();

            case 'transactionId':
            case 'txnId':
                return (item.transactionId || item.txnId || '').toString().toLowerCase();

            case 'batchLot':
            case 'lot':
                return (item.batchLot || item.lot || '').toString().toLowerCase();

            case 'supplier':
            case 'supplierName':
                return (item.supplierName || item.supplier || item.name || '').toString().toLowerCase();

            case 'contact':
            case 'contactPerson':
                return (item.contact || item.contactPerson || '').toString().toLowerCase();

            case 'email':
                return (item.email || '').toString().toLowerCase();

            case 'quantity':
            case 'stock':
            case 'stockOnHand':
            case 'qtyMoved':
            case 'qty':
                return parseFloat(item.quantity || item.stock || item.stockOnHand || item.qtyMoved || item.qty || 0);

            case 'optimalStock':
                return parseFloat(item.optimalStock || 0);

            case 'date':
            case 'restocked':
            case 'lastRestock':
                return new Date(item.date || item.restocked || item.lastRestock || 0).getTime();

            case 'status': {
                const statusOrder = { Reorder: 0, Okay: 1 };
                return statusOrder[item.status] ?? 2;
            }

            case 'isRestocked': {
                const restockOrder = { Yes: 2, I: 1, No: 0 };
                return restockOrder[item.isRestocked] ?? -1;
            }

            default: {
                const val = item[key];
                if (typeof val === 'string') return val.toLowerCase();
                if (typeof val === 'number') return val;
                return val || '';
            }
        }
    };

    const useSorting = (data, initialKey = '', initialDirection = 'asc') => {
        const [sortConfig, setSortConfig] = useState({ key: initialKey, direction: initialDirection });

        const requestSort = (key) => {
            let direction = 'asc';
            if (sortConfig.key === key && sortConfig.direction === 'asc') {
                direction = 'desc';
            }
            setSortConfig({ key, direction });
        };

        const sortedData = useMemo(() => {
            if (!sortConfig.key || !Array.isArray(data)) return data;

            return [...data].sort((a, b) => {
                const aVal = getSortValue(a, sortConfig.key);
                const bVal = getSortValue(b, sortConfig.key);

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }, [data, sortConfig]);

        const SortIndicator = ({ columnKey }) => {
            if (sortConfig.key !== columnKey) {
                return <span style={{ opacity: 0.2, marginLeft: '0.4rem', fontSize: '0.7em' }}>↕</span>;
            }
            return (
                <span style={{ marginLeft: '0.4rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                </span>
            );
        };

        return { sortedData, requestSort, sortConfig, SortIndicator };
    };

    window.useSorting = useSorting;
})();
