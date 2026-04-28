/**
 * App Component
 * The central controller for the system.
 * Now supports an elegant Multi-User system with Card-Based Views and Account Management.
 */

const App = () => {
    const SafeIcons = window.createIconProxy ? window.createIconProxy() : window.Icons || {};
    const AppNavigation = window.AppNavigation || (() => null);
    const DashboardView = window.Dashboard || (() => null);
    const AssetsView = window.Assets || Assets || (() => null);
    const PartnersView = window.Partners || Partners || (() => null);
    const UserSettingsModal = window.UserSettings || UserSettings || (() => null);
    // 1. Session & Global State (Initialized with sync/local, updated with subscription)
    const [user, setUser] = React.useState(window.AppDataHandler.getCurrentUser());
    const [theme, setTheme] = React.useState('light');

    React.useEffect(() => {
        const unsubscribe = window.AppDataHandler.subscribe((type, data) => {
            if (type === 'user') setUser(data);
        });
        return () => unsubscribe();
    }, []);

    // --- RBAC: Define the map of all views and their required permissions ---
    const viewConfigs = [
        { key: 'dashboard', permission: 'ViewDashboard' },
        { key: 'assets', permission: 'ViewAssets' },
        { key: 'partners', permission: 'ViewPartners' }
    ];

    // Helper: Use the 'hub' object for structural access, 'restrictions' for action-level blocking
    const hasHubAccess = (hubKey) => {
        if (!user) return false;
        if (user.role === 'Administrator') return true;
        if (user.hub && typeof user.hub === 'object') {
            return user.hub[hubKey] !== false;
        }
        return true; 
    };

    const hasPermission = (restrictionId) => {
        if (!user) return false;
        if (user.role === 'Administrator') return true;
        return Array.isArray(user.restrictions) && !user.restrictions.includes(restrictionId);
    };

    // URL Routing Logic (Simulated for SPA)
    const getPathView = () => {
        const hash = window.location.hash.replace('#/', '') || 'dashboard';
        const aliases = {
            inventory: 'assets',
            itemList: 'assets',
            suppliers: 'partners'
        };
        const resolvedHash = aliases[hash] || hash;

        // Check permissions for the resolved view
        const currentViewConfig = viewConfigs.find(v => v.key === resolvedHash);

        // If the view is restricted or unknown, fall back to dashboard
        if (!currentViewConfig || !hasHubAccess(currentViewConfig.key)) {
            return 'dashboard';
        }

        return resolvedHash;
    };

    const [view, setView] = React.useState(getPathView());

    // Sync state with URL hash
    React.useEffect(() => {
        const handleHashChange = () => setView(getPathView());
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (newView) => {
        if (newView === 'adminDashboard') {
            window.location.href = 'admin.html';
        } else {
            window.location.hash = `#/${newView}`;
        }
    };

    const [dbLoading, setDbLoading] = React.useState(true);
    const [dbError, setDbError] = React.useState(null);

    // 2. Data State
    const [inventory, setInventory] = React.useState([]);
    const [inputLogs, setInputLogs] = React.useState([]);
    const [outputLogs, setOutputLogs] = React.useState([]);
    const [suppliers, setSuppliers] = React.useState([]);
    const [customers, setCustomers] = React.useState([]);
    const [selectedSupplier, setSelectedSupplier] = React.useState(null);
    const [selectedCustomer, setSelectedCustomer] = React.useState(null);
    const [branding, setBranding] = React.useState(window.AppDataHandler.getBrandingSync());
    const [globalSettings, setGlobalSettings] = React.useState({});
    const [uoms, setUoms] = React.useState([]);
    const [warehouses, setWarehouses] = React.useState([]);

    // --- Unified History Management ---
    const {
        canUndo, canRedo, pushToHistory,
        undo: triggerUndo, redo: triggerRedo,
        undoStack, redoStack
    } = window.useHistory(30);

    // 3. UI state (Modals)
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [isAccountSettingsOpen, setIsAccountSettingsOpen] = React.useState(false);
    const [promptState, setPromptState] = React.useState({ isOpen: false, title: '', type: '', items: [] });
    const appLayoutRef = React.useRef(null);
    const isMobileNavVisible = window.useMobileBottomNav(appLayoutRef, [view]);

    const openPrompt = (title, type, items = []) => setPromptState({ isOpen: true, title, type, items });
    window.openPrompt = openPrompt; // Expose globally for sub-components
    const closePrompt = () => setPromptState(prev => ({ ...prev, isOpen: false }));

    // Initial load - Run once on mount
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1]);
        const isReset = params.get('mode') === 'resetPassword' || params.get('token') || params.get('oobCode');
        
        if (isReset) return; // Let index.html head script handle the redirect

        const currentUser = window.AppDataHandler.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setDbLoading(true);
        try {
            const [inv, iLogs, oLogs, sups, custs, units, whs, settings, brand, gSet] = await Promise.all([
                window.AppDataHandler.getInventory(),
                window.AppDataHandler.getInputLogs(),
                window.AppDataHandler.getOutputLogs(),
                window.AppDataHandler.getSuppliers(),
                window.AppDataHandler.getCustomers(),
                window.AppDataHandler.getUOMs(),
                window.AppDataHandler.getWarehouses(),
                window.AppDataHandler.getSettings(),
                window.AppDataHandler.getBranding(),
                window.AppDataHandler.getGlobalSettings()
            ]);
            setInventory(inv);
            setInputLogs(iLogs);
            setOutputLogs(oLogs);
            setSuppliers(sups);
            setCustomers(custs);
            window.customers = custs; // Global reference for prompt system logic
            setUoms(units);
            setWarehouses(whs);
            const finalTheme = settings.theme || (gSet.globalDarkMode ? 'dark' : 'light');
            setTheme(finalTheme);
            setBranding(brand);
            setGlobalSettings(gSet);
            setDbError(window.AppDataHandler.getDbError());

            // Re-sync the user state once the initPromise is guaranteed to be finished
            const latestUser = window.AppDataHandler.getCurrentUser();
            if (latestUser) setUser(latestUser);

            // Initial sync
            updateTabMetas(brand);
            document.documentElement.setAttribute('data-theme', finalTheme);

            // Priority: User Setting > Company Global Branding > Default Indigo
            const finalAccent = settings.themeColor || brand.accentColor || '#4f46e5';
            document.documentElement.style.setProperty('--accent-color', finalAccent);
        } catch (e) {
            setDbError("System sync failed: " + e.message);
        } finally { setDbLoading(false); }
    };

    const updateTabMetas = (brand) => {
        if (!brand) return;
        if (brand.companyName) document.title = brand.companyName;
        if (brand.logoUrl) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = brand.logoUrl;
        }
    };

    const handleBrandingChange = (newBranding) => {
        setBranding(newBranding);
        updateTabMetas(newBranding);
    };

    const handlePromptConfirm = async (arg1, arg2) => {
        try {
            // Support both (data) from Prompt and (type, data) from InnoAssistant
            const type = typeof arg1 === 'string' ? arg1 : promptState.type;
            const data = typeof arg1 === 'string' ? arg2 : arg1;

            if (!type) {
                console.warn("handlePromptConfirm called without a valid type.");
                return;
            }

            // Security Validation: Secondary check for restrictions
            const res = user.restrictions || [];
            const resMap = {
                'add-item': 'AddItems', 'edit-item': 'EditItems', 'remove-item': 'RemoveItems',
                'add-input-log': 'AddLogs', 'add-output-log': 'AddLogs', 'edit-log': 'EditLogs', 'remove-log': 'RemoveLogs',
                'add-supplier': 'AddSuppliers', 'edit-supplier': 'EditSuppliers', 'remove-supplier': 'RemoveSuppliers',
                'link-supplier-items': 'EditItems'
            };
            if (user.role !== 'Administrator' && resMap[type] && res.includes(resMap[type])) {
                throw new Error(`Access Denied: You are restricted from performing ${resMap[type]}.`);
            }

            // ── Automation: Bulk Mark Restocking ─────────────────────────────
            if (type === 'bulk-mark-restocking') {
                const itemIds = Array.isArray(arg2) ? arg2 : [];
                if (itemIds.length === 0) return;
                const updated = inventory.map(item =>
                    itemIds.includes(item.id)
                        ? { ...item, isRestocked: 'I' }
                        : item
                );
                const saved = await window.AppDataHandler.saveInventory(updated);
                setInventory(saved);
                window.Toast.success('Automation', `${itemIds.length} item${itemIds.length !== 1 ? 's' : ''} marked as Restocking.`);
                return;
            }

            if (type === 'add-item') {
                const updated = [...inventory, data];
                const savedInventory = await window.AppDataHandler.saveInventory(updated);
                setInventory(savedInventory);
                pushToHistory({ type: 'add-item', id: data.id, data: data });
                window.Toast.success('Product Added', `Successfully created ${data.name}.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Added New Item',
                    details: `Created item master for ${data.name || data.id}.`,
                    category: 'inventory'
                });
            } else if (type === 'edit-item') {
                const targetItemId = data?.id || promptState.items[0];
                const oldItem = inventory.find(i => i.id === targetItemId);
                const updated = inventory.map(i => i.id === targetItemId ? data : i);
                const savedInventory = await window.AppDataHandler.saveInventory(updated);
                setInventory(savedInventory);
                pushToHistory({ type: 'edit-item', id: data.id, oldData: oldItem, newData: data });
                window.Toast.info('Product Updated', `Changes to ${data.name} saved.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Updated Item Details',
                    details: `Modified configurations for ${data.name || data.id}.`,
                    category: 'inventory'
                });
            } else if (type === 'remove-item') {
                const removedItems = inventory.filter(i => promptState.items.includes(i.id));
                const updated = inventory.filter(i => !promptState.items.includes(i.id));
                const savedInventory = await window.AppDataHandler.saveInventory(updated, true);
                setInventory(savedInventory);
                pushToHistory({ type: 'remove-items', ids: promptState.items, data: removedItems });
                window.Toast.success('Items Removed', `Successfully deleted ${removedItems.length} records.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Removed Item(s)',
                    details: `Deleted ${promptState.items.length} records from inventory master.`,
                    category: 'inventory'
                });
            } else if (type === 'add-input-log' || type === 'add-output-log') {
                const isInput = type === 'add-input-log';
                const currentLogs = isInput ? inputLogs : outputLogs;
                const setLogs = isInput ? setInputLogs : setOutputLogs;
                const saveFunc = isInput ? window.AppDataHandler.saveInputLogs : window.AppDataHandler.saveOutputLogs;

                // Handle Returned Items logic: If a log is marked as a return, reverse its stock effect
                const isReturn = data.isReturn || (data.notes && data.notes.toLowerCase().includes('return'));
                const qtyAdjust = parseFloat(data.quantity) || 0;

                const affectedItem = inventory.find(i => i.id === data.itemCode);
                let updatedItem = null;
                
                if (affectedItem) {
                    let newQuantity = parseFloat(affectedItem.quantity) || 0;
                    if (isInput) {
                        newQuantity += qtyAdjust;
                    } else {
                        newQuantity -= qtyAdjust;
                    }
                    updatedItem = { ...affectedItem, quantity: newQuantity, isRestocked: isInput ? 'No' : affectedItem.isRestocked };
                }

                // PERFORMANCE: Only save the NEW log and the SINGLE updated item
                const [savedLogsResponse, savedInventoryResponse] = await Promise.all([
                    saveFunc([data]),
                    updatedItem ? window.AppDataHandler.saveInventory([updatedItem]) : Promise.resolve([])
                ]);

                // Update local React state by merging the single saved record into existing arrays
                const newLogEntry = savedLogsResponse[0] || data;
                setLogs(prev => [...prev, newLogEntry]);
                
                if (updatedItem) {
                    const finalItem = savedInventoryResponse.find(i => i.id === data.itemCode) || updatedItem;
                    setInventory(prev => prev.map(i => i.id === data.itemCode ? finalItem : i));
                }

                pushToHistory({
                    type: isInput ? 'add-input-log' : 'add-output-log',
                    data: data,
                    inventorySnapshot: inventory.map(i => ({ id: i.id, quantity: i.quantity })) // Keep for strict revert if needed
                });

                window.Toast.success('Stock Updated', `${isInput ? 'Arrival' : 'Shipment'} of ${data.quantity} units processed.`);
                await window.AppDataHandler.addActivityLog({
                    title: isInput ? 'Stock In Processed' : 'Stock Out Processed',
                    details: `${isInput ? 'Received' : 'Dispatched'} ${data.quantity} of ${data.itemCode} (${data.transactionId}).`,
                    category: 'transaction'
                });
            } else if (type === 'add-supplier') {
                const updated = [...suppliers, data];
                const savedSuppliers = await window.AppDataHandler.saveSuppliers(updated);
                setSuppliers(savedSuppliers);
                pushToHistory({ type: 'add-supplier', data });
                window.Toast.success('Supplier Added', `${data.name} is now a partner.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Added Supplier Partner',
                    details: `Registered ${data.name} as a supplier-side partner.`,
                    category: 'supplier'
                });
            } else if (type === 'edit-supplier') {
                const oldSup = suppliers.find(s => s.id === promptState.items[0]);
                const updated = suppliers.map(s => s.id === promptState.items[0] ? data : s);
                const savedSuppliers = await window.AppDataHandler.saveSuppliers(updated);
                setSuppliers(savedSuppliers);
                pushToHistory({ type: 'edit-supplier', id: data.id, oldData: oldSup, newData: data });
                window.Toast.info('Supplier Updated', `Details for ${data.name} saved.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Updated Supplier Partner',
                    details: `Modified supplier-side partner details for ${data.name}.`,
                    category: 'supplier'
                });
            } else if (type === 'remove-supplier') {
                const removed = suppliers.filter(s => promptState.items.includes(s.id));
                const updated = suppliers.filter(s => !promptState.items.includes(s.id));
                const savedSuppliers = await window.AppDataHandler.saveSuppliers(updated, true);
                setSuppliers(savedSuppliers);
                pushToHistory({ type: 'remove-supplier', ids: promptState.items, data: removed });
                window.Toast.warn('Supplier Removed', `Partner record deleted.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Removed Supplier Partner',
                    details: `Permanently deleted supplier-side partner record for ${promptState.items[0]}.`,
                    category: 'supplier'
                });
            } else if (type === 'add-customer') {
                const updated = [...customers, data];
                const savedCustomers = await window.AppDataHandler.saveCustomers(updated);
                setCustomers(savedCustomers);
                pushToHistory({ type: 'add-customer', data });
                window.Toast.success('Customer Registered', `${data.name} is now in the database.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Added Customer Partner',
                    details: `Registered new distribution partner: ${data.name}.`,
                    category: 'supplier'
                });
            } else if (type === 'edit-customer') {
                const oldCust = customers.find(c => c.id === promptState.items[0]);
                const updated = customers.map(c => c.id === promptState.items[0] ? data : c);
                const savedCustomers = await window.AppDataHandler.saveCustomers(updated);
                setCustomers(savedCustomers);
                pushToHistory({ type: 'edit-customer', id: data.id, oldData: oldCust, newData: data });
                window.Toast.info('Customer Updated', `Details for ${data.name} saved.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Updated Customer Partner',
                    details: `Modified details for customer: ${data.name}.`,
                    category: 'supplier'
                });
            } else if (type === 'remove-customer') {
                const removed = customers.filter(c => promptState.items.includes(c.id));
                const updated = customers.filter(c => !promptState.items.includes(c.id));
                const savedCustomers = await window.AppDataHandler.saveCustomers(updated, true);
                setCustomers(savedCustomers);
                pushToHistory({ type: 'remove-customer', ids: promptState.items, data: removed });
                window.Toast.warn('Customer Records Removed', `Deleted ${removed.length} partner records.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Removed Customer(s)',
                    details: `Permanently deleted ${removed.length} customer records.`,
                    category: 'supplier'
                });
            } else if (type === 'link-supplier-items' || type === 'link-customer-items') {
                const isSupplier = type === 'link-supplier-items';
                const partnerId = data.partnerId || promptState.items[0];
                const selectedItems = new Set(data.selectedItems || []);
                const partnerName = isSupplier
                    ? suppliers.find(s => s.id === partnerId)?.name
                    : customers.find(c => c.id === partnerId)?.name;

                const itemsToUpdate = [];
                const nextInventory = inventory.map((item) => {
                    const field = isSupplier ? 'supplier' : 'customer';
                    let newItem = item;
                    if (selectedItems.has(item.id)) {
                        newItem = { ...item, [field]: partnerId };
                    } else if (item[field] === partnerId) {
                        newItem = { ...item, [field]: '' };
                    }
                    
                    if (newItem !== item) {
                        itemsToUpdate.push(newItem);
                    }
                    return newItem;
                });

                const oldLinkage = inventory.map(item => ({ id: item.id, linkage: isSupplier ? item.supplier : item.customer }));

                const savedInventory = await window.AppDataHandler.saveInventory(itemsToUpdate);
                setInventory(savedInventory);

                pushToHistory({
                    type: isSupplier ? 'link-supplier-items' : 'link-customer-items',
                    partnerId,
                    oldLinkage,
                    newLinkage: nextInventory.map(item => ({ id: item.id, linkage: isSupplier ? item.supplier : item.customer }))
                });

                window.Toast.success('Relationships Updated', `Products linked to ${partnerName || 'partner'}.`);
                await window.AppDataHandler.addActivityLog({
                    title: `Updated ${isSupplier ? 'Supplier' : 'Customer'} Links`,
                    details: `Synchronized product mappings for ${partnerName || partnerId}.`,
                    category: 'inventory'
                });
            } else if (type === 'edit-log') {
                const isInput = promptState.title.toLowerCase().includes('input');
                const logs = isInput ? inputLogs : outputLogs;
                const setLogs = isInput ? setInputLogs : setOutputLogs;
                const saveFunc = isInput ? window.AppDataHandler.saveInputLogs : window.AppDataHandler.saveOutputLogs;

                const oldLog = logs.find(l => l.transactionId === promptState.items[0]);
                if (!oldLog) throw new Error("Original log record not found.");

                const updatedLogs = logs.map(l => l.transactionId === promptState.items[0] ? data : l);

                const oldItemCode = oldLog.itemCode;
                const newItemCode = data.itemCode;
                const oldQty = parseFloat(oldLog.quantity) || 0;
                const newQty = parseFloat(data.quantity) || 0;

                const invUpdated = inventory.map(i => {
                    let nextQuantity = parseFloat(i.quantity) || 0;
                    if (i.id === oldItemCode) {
                        nextQuantity = isInput ? nextQuantity - oldQty : nextQuantity + oldQty;
                    }
                    if (i.id === newItemCode) {
                        nextQuantity = isInput ? nextQuantity + newQty : nextQuantity - newQty;
                    }
                    return nextQuantity === (parseFloat(i.quantity) || 0)
                        ? i
                        : { ...i, quantity: nextQuantity };
                });

                const savedLogs = await saveFunc(updatedLogs);
                const savedInventory = await window.AppDataHandler.saveInventory(invUpdated);
                setLogs(savedLogs);
                setInventory(savedInventory);
                pushToHistory({
                    type: isInput ? 'edit-input-log' : 'edit-output-log',
                    id: data.transactionId,
                    oldData: oldLog,
                    newData: data
                });
                window.Toast.info('Log Adjusted', `Transaction ${data.transactionId} updated.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Edited Transaction Log',
                    details: `Adjusted record for ${data.itemCode} (${promptState.items[0]}).`,
                    category: 'transaction'
                });
            } else if (type === 'remove-log') {
                const isInput = promptState.title.toLowerCase().includes('input');
                const logs = isInput ? inputLogs : outputLogs;
                const setLogs = isInput ? setInputLogs : setOutputLogs;
                const saveFunc = isInput ? window.AppDataHandler.saveInputLogs : window.AppDataHandler.saveOutputLogs;
                const toRemove = logs.filter(l => promptState.items.includes(l.transactionId));
                const updatedLogs = logs.filter(l => !promptState.items.includes(l.transactionId));
                let invUpdated = [...inventory];
                toRemove.forEach(log => {
                    invUpdated = invUpdated.map(i => i.id === log.itemCode ? { ...i, quantity: isInput ? (parseFloat(i.quantity) || 0) - parseFloat(log.quantity) : (parseFloat(i.quantity) || 0) + parseFloat(log.quantity) } : i);
                });
                const savedLogs = await saveFunc(updatedLogs, true);
                const savedInventory = await window.AppDataHandler.saveInventory(invUpdated);
                setLogs(savedLogs);
                setInventory(savedInventory);
                pushToHistory({
                    type: isInput ? 'remove-input-log' : 'remove-output-log',
                    ids: promptState.items,
                    data: toRemove
                });
                window.Toast.warn('Logs Removed', `${toRemove.length} transaction(s) deleted.`);
                await window.AppDataHandler.addActivityLog({
                    title: 'Removed Transaction Log(s)',
                    details: `Deleted ${toRemove.length} log records from system history.`,
                    category: 'transaction'
                });
            }
            closePrompt();
        } catch (err) { alert("Error saving data: " + err.message); }
    };

    const handleHistoryOperation = async (action, isUndo = true) => {
        try {
            const { type, data, oldData, newData, ids, id } = action;

            // --- Inventory Actions ---
            if (type === 'add-item') {
                if (isUndo) {
                    const next = inventory.filter(i => i.id !== id);
                    setInventory(await window.AppDataHandler.saveInventory(next, true));
                } else {
                    const next = [...inventory, data];
                    setInventory(await window.AppDataHandler.saveInventory(next));
                }
            } else if (type === 'edit-item') {
                const targetData = isUndo ? oldData : newData;
                const next = inventory.map(i => i.id === id ? targetData : i);
                setInventory(await window.AppDataHandler.saveInventory(next));
            } else if (type === 'remove-items') {
                if (isUndo) {
                    const next = [...inventory, ...data];
                    setInventory(await window.AppDataHandler.saveInventory(next));
                } else {
                    const next = inventory.filter(i => !ids.includes(i.id));
                    setInventory(await window.AppDataHandler.saveInventory(next, true));
                }
            }

            // --- Log Actions (Input/Output) ---
            else if (type === 'add-input-log' || type === 'add-output-log') {
                const isInput = type === 'add-input-log';
                const setLogs = isInput ? setInputLogs : setOutputLogs;
                const logs = isInput ? inputLogs : outputLogs;
                const saveFunc = isInput ? window.AppDataHandler.saveInputLogs : window.AppDataHandler.saveOutputLogs;

                if (isUndo) {
                    const nextLogs = logs.filter(l => l.transactionId !== data.transactionId);
                    const nextInv = inventory.map(i => {
                        if (i.id === data.itemCode) {
                            const qty = parseFloat(data.quantity) || 0;
                            return { ...i, quantity: isInput ? (parseFloat(i.quantity) || 0) - qty : (parseFloat(i.quantity) || 0) + qty };
                        }
                        return i;
                    });
                    await Promise.all([saveFunc(nextLogs, true), window.AppDataHandler.saveInventory(nextInv)]);
                    setLogs(nextLogs);
                    setInventory(nextInv);
                } else {
                    // Similar to handlePromptConfirm logic for re-applying
                    const nextLogs = [...logs, data];
                    const nextInv = inventory.map(i => {
                        if (i.id === data.itemCode) {
                            const qty = parseFloat(data.quantity) || 0;
                            return { ...i, quantity: isInput ? (parseFloat(i.quantity) || 0) + qty : (parseFloat(i.quantity) || 0) - qty };
                        }
                        return i;
                    });
                    await Promise.all([saveFunc(nextLogs), window.AppDataHandler.saveInventory(nextInv)]);
                    setLogs(nextLogs);
                    setInventory(nextInv);
                }
            }

            // --- Partner Actions ---
            else if (type === 'add-supplier' || type === 'add-customer') {
                const isSup = type === 'add-supplier';
                const setP = isSup ? setSuppliers : setCustomers;
                const pList = isSup ? suppliers : customers;
                const saveP = isSup ? window.AppDataHandler.saveSuppliers : window.AppDataHandler.saveCustomers;

                if (isUndo) {
                    const next = pList.filter(p => p.id !== data.id);
                    await saveP(next, true);
                    setP(next);
                } else {
                    const next = [...pList, data];
                    await saveP(next);
                    setP(next);
                }
            } else if (type === 'edit-supplier' || type === 'edit-customer') {
                const isSup = type === 'edit-supplier';
                const setP = isSup ? setSuppliers : setCustomers;
                const pList = isSup ? suppliers : customers;
                const saveP = isSup ? window.AppDataHandler.saveSuppliers : window.AppDataHandler.saveCustomers;
                const target = isUndo ? oldData : newData;

                const next = pList.map(p => p.id === target.id ? target : p);
                await saveP(next);
                setP(next);
            } else if (type === 'remove-supplier' || type === 'remove-customer') {
                const isSup = type === 'remove-supplier';
                const setP = isSup ? setSuppliers : setCustomers;
                const pList = isSup ? suppliers : customers;
                const saveP = isSup ? window.AppDataHandler.saveSuppliers : window.AppDataHandler.saveCustomers;

                if (isUndo) {
                    const next = [...pList, ...data];
                    await saveP(next);
                    setP(next);
                } else {
                    const next = pList.filter(p => !ids.includes(p.id));
                    await saveP(next, true);
                    setP(next);
                }
            }

            // --- Linkage Actions ---
            else if (type === 'link-supplier-items' || type === 'link-customer-items') {
                const isSupplier = type === 'link-supplier-items';
                const linkage = isUndo ? action.oldLinkage : action.newLinkage;
                const field = isSupplier ? 'supplier' : 'customer';

                const next = inventory.map(item => {
                    const match = linkage.find(l => l.id === item.id);
                    return match ? { ...item, [field]: match.linkage } : item;
                });

                setInventory(await window.AppDataHandler.saveInventory(next));
            }

            // --- Log Edit/Remove Actions ---
            else if (type === 'edit-input-log' || type === 'edit-output-log') {
                const isInput = type === 'edit-input-log';
                const setLogs = isInput ? setInputLogs : setOutputLogs;
                const logs = isInput ? inputLogs : outputLogs;
                const saveFunc = isInput ? window.AppDataHandler.saveInputLogs : window.AppDataHandler.saveOutputLogs;
                const target = isUndo ? oldData : newData;
                const other = isUndo ? newData : oldData; // Use to calculate diff

                const nextLogs = logs.map(l => l.transactionId === target.transactionId ? target : l);

                // Inventory update logic (similar to handlePromptConfirm edit-log)
                const nextInv = inventory.map(i => {
                    let qty = parseFloat(i.quantity) || 0;
                    // Revert old effect
                    if (i.id === other.itemCode) qty = isInput ? qty - parseFloat(other.quantity) : qty + parseFloat(other.quantity);
                    // Apply new effect
                    if (i.id === target.itemCode) qty = isInput ? qty + parseFloat(target.quantity) : qty - parseFloat(target.quantity);

                    return qty === (parseFloat(i.quantity) || 0) ? i : { ...i, quantity: qty };
                });

                await Promise.all([saveFunc(nextLogs), window.AppDataHandler.saveInventory(nextInv)]);
                setLogs(nextLogs);
                setInventory(nextInv);
            }
            else if (type === 'remove-input-log' || type === 'remove-output-log') {
                const isInput = type === 'remove-input-log';
                const setLogs = isInput ? setInputLogs : setOutputLogs;
                const logs = isInput ? inputLogs : outputLogs;
                const saveFunc = isInput ? window.AppDataHandler.saveInputLogs : window.AppDataHandler.saveOutputLogs;

                if (isUndo) {
                    const nextLogs = [...logs, ...data];
                    const nextInv = inventory.map(i => {
                        const rel = data.filter(d => d.itemCode === i.id);
                        if (!rel.length) return i;
                        const qtyAdjust = rel.reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);
                        return { ...i, quantity: isInput ? (parseFloat(i.quantity) || 0) + qtyAdjust : (parseFloat(i.quantity) || 0) - qtyAdjust };
                    });
                    await Promise.all([saveFunc(nextLogs), window.AppDataHandler.saveInventory(nextInv)]);
                    setLogs(nextLogs);
                    setInventory(nextInv);
                } else {
                    const nextLogs = logs.filter(l => !ids.includes(l.transactionId));
                    const nextInv = inventory.map(i => {
                        const rel = data.filter(d => d.itemCode === i.id);
                        if (!rel.length) return i;
                        const qtyAdjust = rel.reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);
                        return { ...i, quantity: isInput ? (parseFloat(i.quantity) || 0) - qtyAdjust : (parseFloat(i.quantity) || 0) + qtyAdjust };
                    });
                    await Promise.all([saveFunc(nextLogs), window.AppDataHandler.saveInventory(nextInv)]);
                    setLogs(nextLogs);
                    setInventory(nextInv);
                }
            }

            window.Toast.info(isUndo ? 'Action Reversed' : 'Action Restored', `Successfully ${isUndo ? 'undone' : 'redone'} last ${type.replace('-', ' ')}.`);
        } catch (err) {
            window.Toast.error('History Operation Failed', err.message);
            throw err;
        }
    };

    const performUndo = () => triggerUndo(action => handleHistoryOperation(action, true));
    const performRedo = () => triggerRedo(action => handleHistoryOperation(action, false));

    window.performUndo = performUndo;
    window.performRedo = performRedo;

    if (!user) return null; // Redirect handled in useEffect

    if (dbLoading) {
        return (
            <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="Logo" className="company-logo-img" style={{ height: '60px', opacity: 0.9 }} />
                ) : (
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1.5px', opacity: 0.9 }} className="app-logo">
                        {branding.companyName || 'System'}
                    </div>
                )}
                <div style={{ padding: '2px', width: '240px', background: 'var(--hover-bg)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{ width: '40%', height: '4px', background: 'var(--accent-color)', borderRadius: '12px', animation: 'load 1.8s infinite ease-in-out' }}></div>
                </div>
            </div>
        );
    }

    const userAvatarSrc = window.AppDataHandler.getUserAvatarSrc(user, user?.name);

    const allNavItems = [
        { key: 'dashboard', label: 'Dashboard', icon: <SafeIcons.Dashboard size={16} /> },
        { key: 'assets', label: 'Assets', icon: <SafeIcons.Layers size={16} /> },
        { key: 'partners', label: 'Partners', icon: <SafeIcons.Truck size={16} /> }
    ];
    const filteredNavItems = allNavItems.filter(item => hasHubAccess(item.key));

    return (
        <div className="app-wrapper">
            <header className="top-brand-bar">
                <div className="brand-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {branding.logoUrl && (
                        <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>
                            <img src={branding.logoUrl} alt="Logo" className="company-logo-img" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                    )}
                    <div className="app-logo" style={{ fontSize: '1.25rem', fontWeight: '800', border: 'none', background: 'none', padding: 0, WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>
                        {branding.companyName || 'System'}
                    </div>
                </div>
                <AppNavigation
                    items={filteredNavItems}
                    activeKey={view}
                    onNavigate={navigate}
                    mobileVisible={isMobileNavVisible}
                />

                <div className="brand-right" onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', lineHeight: 1.2 }}>{user.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--accent-color)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em', background: 'var(--selected-bg)', padding: '1px 6px', borderRadius: '4px' }}>{user.role}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', opacity: 0.8 }}>@{user.username}</span>
                        </div>
                    </div>
                    <img
                        src={userAvatarSrc}
                        alt={`${user.name} avatar`}
                        className="user-avatar-btn"
                        style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--accent-color)' }}
                    />
                </div>
            </header>

            {isProfileOpen && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setIsProfileOpen(false)}></div>
                    <div style={{ position: 'fixed', top: '75px', right: '4vw', zIndex: 1000 }}>
                        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '0.6rem', minWidth: '220px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                            {hasHubAccess('admin') && (
                                <button style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '500', display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                                    onMouseEnter={e => e.target.style.background = 'var(--hover-bg)'}
                                    onMouseLeave={e => e.target.style.background = 'none'}
                                    onClick={() => { navigate('adminDashboard'); setIsProfileOpen(false); }}
                                >
                                    <SafeIcons.Shield size={18} style={{ color: 'var(--accent-color)' }} />
                                    <span style={{ color: 'var(--accent-color)', fontWeight: '700' }}>Admin Dashboard</span>
                                </button>
                            )}
                            <button style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '500', display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                                onMouseEnter={e => e.target.style.background = 'var(--hover-bg)'}
                                onMouseLeave={e => e.target.style.background = 'none'}
                                onClick={() => { setIsAccountSettingsOpen(true); setIsProfileOpen(false); }}>
                                <SafeIcons.Settings size={18} /> User Settings
                            </button>
                            <button style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', transition: 'background 0.2s', display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                                onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.08)'}
                                onMouseLeave={e => e.target.style.background = 'none'}
                                onClick={() => window.AppDataHandler.logout()}>
                                <SafeIcons.Trash size={18} /> Sign Out
                            </button>
                        </div>
                    </div>
                </>
            )}

            <main className="app-layout" ref={appLayoutRef}>
                <div key={view} className="main-view-panel">
                    {view === 'dashboard' && <DashboardView branding={branding} onPerformAction={handlePromptConfirm} openPrompt={openPrompt} globalSettings={globalSettings} inventoryData={inventory} inputLogs={inputLogs} outputLogs={outputLogs} supplierData={suppliers} customerData={customers} settings={{ ...user.settings, theme }} user={user} warehouses={warehouses} />}
                    {view === 'assets' && <AssetsView openPrompt={openPrompt} inventoryData={inventory} inputLogs={inputLogs} outputLogs={outputLogs} supplierData={suppliers} customerData={customers} dbError={dbError} user={user} lowStockThreshold={user.settings?.lowStockThreshold} isThresholdEnabled={user.settings?.isThresholdEnabled ?? false} warehouses={warehouses} canUndo={canUndo} canRedo={canRedo} onUndo={performUndo} onRedo={performRedo} />}
                    {view === 'partners' && <PartnersView openPrompt={openPrompt} supplierData={suppliers} customerData={customers} inventoryData={inventory} inputLogs={inputLogs} outputLogs={outputLogs} dbError={dbError} user={user} warehouses={warehouses} canUndo={canUndo} canRedo={canRedo} onUndo={performUndo} onRedo={performRedo} />}
                </div>
            </main>

            <Prompt
                isOpen={promptState.isOpen}
                onClose={closePrompt}
                onConfirm={handlePromptConfirm}
                title={promptState.title}
                type={promptState.type}
                items={promptState.items}
                inventoryData={inventory}
                supplierData={suppliers}
                customerData={customers}
                inputLogs={inputLogs}
                outputLogs={outputLogs}
                uoms={uoms}
                warehouses={warehouses}
                user={user}
            />

            {isAccountSettingsOpen && (
                <UserSettingsModal
                    user={user}
                    inventoryData={inventory}
                    onClose={() => setIsAccountSettingsOpen(false)}
                    onUpdateUser={async (u) => {
                        setUser(u);
                        localStorage.setItem('cloudbased_session', JSON.stringify(u));
                    }}
                />
            )}
        </div>
    );
};

// Robust Multi-Stage Bootloader for VPS environments
// This ensures all script dependencies are fully initialized in the global scope before React mounts.
const mountApp = () => {
    const rootElement = document.getElementById('root');
    if (!rootElement) return;

    // List of critical global dependencies to verify
    const dependencies = [
        'React', 'ReactDOM', 'AppDataHandler', 'Icons',
        'Assets', 'Partners', 'Dashboard', 'ItemList', 'UserSettings',
        'Navigation', 'Prompt', 'ViewSwitcher', 'WarehousePills'
    ];

    const missing = dependencies.filter(dep => !window[dep]);

    if (missing.length > 0) {
        console.warn(`[Bootloader] Waiting for dependencies: ${missing.join(', ')}`);
        // Retry loop to handle script initialization lag on slow servers
        setTimeout(mountApp, 100);
        return;
    }

    console.log('[Bootloader] All dependencies resolved. Rendering application...');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
};

// Initiate application boot sequence
mountApp();
