/**
 * Admin Dashboard - Manage Data Tab
 * Combined Import and Export functionalities with a visual Diff/Review system.
 */
const ManageDataTab = ({ inventoryData }) => {
    const [sheetUrl, setSheetUrl] = React.useState('');
    const fileInputRef = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(false);
    
    // Diff State
    const [diffData, setDiffData] = React.useState(null);

    const getSheet = (workbook, name) => workbook.Sheets[name] ? window.XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }) : [];
    
    const findCol = (headerRow, names) => {
        if (!headerRow) return -1;
        for (let i = 0; i < headerRow.length; i++) {
            const h = (headerRow[i] || '').toString().trim().toLowerCase();
            if (names.some(n => h === n.toLowerCase())) return i;
        }
        return -1;
    };

    const parseDate = (dateVal) => {
        if (typeof dateVal === 'number') {
            return new Date((dateVal - 25569) * 86400 * 1000).toISOString().split('T')[0];
        }
        return typeof dateVal === 'string' ? dateVal : new Date().toISOString().split('T')[0];
    };

    const processWorkbook = async (workbook) => {
        const itemsSheet = getSheet(workbook, 'Items');
        const invSheet = getSheet(workbook, 'Inventory');
        const recvSheet = getSheet(workbook, 'Receive');
        const outSheet = getSheet(workbook, 'Out');

        if (itemsSheet.length === 0 && invSheet.length === 0) {
            throw new Error("Could not find required tabs. Make sure your file contains tabs named 'Items', 'Inventory', 'Receive', and 'Out'.");
        }

        const parsedItems = {};
        
        // --- PARSE ITEMS ---
        if (itemsSheet.length > 1) {
            let h = itemsSheet[0];
            let cId = findCol(h, ['Item Code', 'ItemCode', 'Code']);
            let cName = findCol(h, ['Item Name', 'ItemName', 'Name']);
            let cDesc = findCol(h, ['Description', 'Desc']);
            let cGroup = findCol(h, ['Item Group', 'Group', 'Category']);
            let cUom = findCol(h, ['UoM', 'Unit', 'UOM']);

            if (cId === -1) cId = 0;
            if (cName === -1) cName = 1;

            for (let i = 1; i < itemsSheet.length; i++) {
                let row = itemsSheet[i];
                if (!row || !row[cId]) continue;
                let id = row[cId].toString().trim();
                parsedItems[id] = {
                    id: id,
                    name: (cName !== -1 && row[cName]) ? row[cName].toString().trim() : id,
                    description: (cDesc !== -1 && row[cDesc]) ? row[cDesc].toString().trim() : '',
                    category: (cGroup !== -1 && row[cGroup]) ? row[cGroup].toString().trim() : 'Uncategorized',
                    uom: (cUom !== -1 && row[cUom]) ? row[cUom].toString().trim() : 'pcs',
                    warehouse: 'Bulacan', 
                    quantity: 0
                };
            }
        }

        // --- PARSE INVENTORY ---
        if (invSheet.length > 1) {
            let h = invSheet[0];
            let cId = findCol(h, ['Item Code', 'ItemCode']);
            let cQty = findCol(h, ['Stock on hand', 'Quantity', 'Qty']);
            let cUom = findCol(h, ['UoM', 'Unit', 'UOM']);
            let cOpt = findCol(h, ['Optimal Stock', 'Optimal']);
            let cReorder = findCol(h, ['Reorder', 'Status']);
            let cReordered = findCol(h, ['Reordered?', 'Reordered']);

            if (cId === -1) cId = 0; 

            for (let i = 1; i < invSheet.length; i++) {
                let row = invSheet[i];
                if (!row || !row[cId] || typeof row[cId] === 'undefined') continue;
                let id = row[cId].toString().trim();
                
                if (!parsedItems[id]) {
                    parsedItems[id] = { id: id, name: id, warehouse: 'Bulacan', quantity: 0 };
                }
                
                if (cQty !== -1 && row[cQty] !== undefined) parsedItems[id].quantity = parseFloat(row[cQty]) || 0;
                if (cUom !== -1 && row[cUom]) parsedItems[id].uom = row[cUom].toString().trim();
                if (cOpt !== -1 && row[cOpt] !== undefined) parsedItems[id].optimalStock = parseFloat(row[cOpt]) || 0;
                if (cReorder !== -1 && row[cReorder]) parsedItems[id].status = row[cReorder].toString().trim();
                
                if (cReordered !== -1 && row[cReordered]) {
                    const val = row[cReordered].toString().trim().toLowerCase();
                    if (val === 'y') parsedItems[id].isRestocked = 'Yes';
                    else if (val === 'i') parsedItems[id].isRestocked = 'I';
                    else parsedItems[id].isRestocked = 'No';
                } else {
                    parsedItems[id].isRestocked = 'No';
                }
            }
        }

        // --- PARSE LOGS & SUPPLIERS ---
        let newSuppliersMap = {};
        let newInputs = [];
        if (recvSheet.length > 1) {
            let h = recvSheet[0];
            let cId = findCol(h, ['Item Code', 'ItemCode']);
            let cQty = findCol(h, ['Quantity', 'QTY']);
            let cDate = findCol(h, ['Date']);
            let cComp = findCol(h, ['Company', 'Supplier']);
            let cBatch = findCol(h, ['Batch/LOT', 'Batch', 'Lot']);

            for (let i = 1; i < recvSheet.length; i++) {
                let row = recvSheet[i];
                if (!row || !row[cId]) continue;
                let id = row[cId].toString().trim();
                let compName = row[cComp] ? row[cComp].toString().trim() : 'Unknown Supplier';
                if (!newSuppliersMap[compName]) {
                    newSuppliersMap[compName] = { id: compName.toLowerCase().replace(/[^a-z0-9]/g, '-'), name: compName, contactPerson: '', email: '', phone: '', address: '', categories: [] };
                }
                newInputs.push({
                    id: 'IN-' + Date.now() + '-' + i,
                    transactionId: 'TXN-IN-' + Math.floor(100000 + Math.random() * 900000),
                    itemCode: id,
                    quantity: parseFloat(row[cQty]) || 0,
                    date: parseDate(row[cDate]),
                    supplier: compName,
                    batchLot: row[cBatch] ? row[cBatch].toString().trim() : '',
                    timestamp: Date.now(),
                    userName: 'System'
                });
            }
        }

        let newOutputs = [];
        if (outSheet.length > 1) {
            let h = outSheet[0];
            let cId = findCol(h, ['Item Code', 'ItemCode']);
            let cQty = findCol(h, ['Quantity', 'QTY']);
            let cDate = findCol(h, ['Date']);
            let cComp = findCol(h, ['Company', 'Customer']);
            let cBatch = findCol(h, ['Batch/LOT', 'Batch', 'Lot']);

            for (let i = 1; i < outSheet.length; i++) {
                let row = outSheet[i];
                if (!row || !row[cId]) continue;
                let id = row[cId].toString().trim();
                let compName = row[cComp] ? row[cComp].toString().trim() : 'Unknown Client';
                if (!newSuppliersMap[compName]) {
                    newSuppliersMap[compName] = { id: compName.toLowerCase().replace(/[^a-z0-9]/g, '-'), name: compName, contactPerson: '', email: '', phone: '', address: '', categories: [] };
                }
                newOutputs.push({
                    id: 'OUT-' + Date.now() + '-' + i,
                    transactionId: 'TXN-OUT-' + Math.floor(100000 + Math.random() * 900000),
                    itemCode: id,
                    quantity: parseFloat(row[cQty]) || 0,
                    date: parseDate(row[cDate]),
                    supplier: compName,
                    batchLot: row[cBatch] ? row[cBatch].toString().trim() : '',
                    timestamp: Date.now(),
                    userName: 'System'
                });
            }
        }

        // --- COMPUTE DIFF ---
        const currentInventory = await window.AppDataHandler.getInventory() || [];
        const currentSuppliers = await window.AppDataHandler.getSuppliers() || [];

        const added = [];
        const updated = [];
        const deleted = [];
        const unchangedCount = 0;

        const incomingIds = new Set(Object.keys(parsedItems));

        // 1. Check for updates and deletions
        currentInventory.forEach(item => {
            if (!incomingIds.has(item.id)) {
                deleted.push(item);
            } else {
                const newItem = parsedItems[item.id];
                const changedFields = {};
                ['name', 'description', 'category', 'uom', 'quantity', 'optimalStock', 'isRestocked'].forEach(f => {
                    if (newItem[f] !== item[f] && newItem[f] !== undefined) {
                        changedFields[f] = { old: item[f], new: newItem[f] };
                    }
                });
                if (Object.keys(changedFields).length > 0) {
                    updated.push({ id: item.id, changes: changedFields, item: newItem });
                }
            }
        });

        // 2. Check for additions
        Object.keys(parsedItems).forEach(id => {
            if (!currentInventory.find(i => i.id === id)) {
                added.push(parsedItems[id]);
            }
        });

        const suppliersArr = Object.values(newSuppliersMap).filter(s => !currentSuppliers.find(cs => cs.name.toLowerCase() === s.name.toLowerCase()));

        setDiffData({
            added,
            updated,
            deleted,
            newSuppliers: suppliersArr,
            newInputs,
            newOutputs,
            toUpdate: Object.values(parsedItems) 
        });
    };

    const handleCommitSync = async () => {
        setIsLoading(true);
        try {
            const currentSuppliers = await window.AppDataHandler.getSuppliers() || [];
            const currentInputs = await window.AppDataHandler.getInputLogs() || [];
            const currentOutputs = await window.AppDataHandler.getOutputLogs() || [];

            // We use the "toUpdate" as the NEW complete set (if we want to handle deletions)
            // Or we just merge if we want to keep things.
            // User said "handle removed things", so we will replace with the incoming set.
            
            await window.AppDataHandler.saveInventory(diffData.toUpdate);
            
            if (diffData.newSuppliers.length > 0) {
                await window.AppDataHandler.saveSuppliers([...currentSuppliers, ...diffData.newSuppliers]);
            }
            if (diffData.newInputs.length > 0) {
                await window.AppDataHandler.saveInputLogs([...currentInputs, ...diffData.newInputs]);
            }
            if (diffData.newOutputs.length > 0) {
                await window.AppDataHandler.saveOutputLogs([...currentOutputs, ...diffData.newOutputs]);
            }
            
            // Log the activity
            await window.AppDataHandler.addActivityLog({
                title: 'Data Sync Executed',
                details: `Imported ${diffData.added.length} items, ${diffData.updated.length} updates, and ${diffData.deleted.length} deletions.`,
                category: 'system'
            });

            alert("Sync Complete! The inventory has been updated.");
            setDiffData(null);
        } catch (e) {
            alert("Error committing sync: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSheetImport = async () => {
        if (!window.XLSX) return alert("Spreadsheet parser is still loading...");
        if (!sheetUrl) return alert("Please enter a Google Sheets URL.");
        setIsLoading(true);
        try {
            const fileId = sheetUrl.match(/\/d\/(.*?)\//)[1];
            const exportUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
            const response = await fetch(exportUrl);
            if (!response.ok) throw new Error("Could not fetch the sheet.");
            const arrayBuffer = await response.arrayBuffer();
            const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
            await processWorkbook(workbook);
        } catch (e) { alert("Error: " + e.message); }
        finally { setIsLoading(false); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const workbook = window.XLSX.read(event.target.result, { type: 'array' });
                await processWorkbook(workbook);
            } catch(err) { alert("Error parsing file: " + err.message); }
            finally { setIsLoading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
        };
        reader.readAsArrayBuffer(file);
    };

    if (diffData) {
        return (
            <div className="admin-tab-content fade-in" style={{ maxWidth: '1000px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Review Changes</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Compare current system data with the imported file.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => setDiffData(null)} style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleCommitSync} disabled={isLoading} className="auth-btn-primary" style={{ margin: 0, width: 'auto', padding: '0.6rem 2rem' }}>
                            {isLoading ? 'Syncing...' : 'Confirm Sync'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--success)' }}>Added</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{diffData.added.length}</div>
                    </div>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#3b82f6' }}>Updated</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{diffData.updated.length}</div>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--danger)' }}>Removed</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{diffData.deleted.length}</div>
                    </div>
                    <div style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>New Logs</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{diffData.newInputs.length + diffData.newOutputs.length}</div>
                    </div>
                </div>

                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead style={{ background: 'var(--hover-bg)', position: 'sticky', top:0, zIndex: 1 }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Property</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Original Value</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>New Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* ADDED */}
                                {diffData.added.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '0.8rem 1rem' }}><strong>{item.id}</strong><br/><span style={{opacity:0.6}}>{item.name}</span></td>
                                        <td style={{ padding: '0.8rem 1rem' }}><span style={{ color: 'var(--success)', fontWeight: '700' }}>+ ADDED</span></td>
                                        <td style={{ padding: '0.8rem 1rem', opacity: 0.4 }}>—</td>
                                        <td style={{ padding: '0.8rem 1rem' }}>Created in system</td>
                                    </tr>
                                ))}
                                {/* UPDATED */}
                                {diffData.updated.map(u => (
                                    Object.entries(u.changes).map(([field, vals], idx) => (
                                        <tr key={u.id + field} style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(59, 130, 246, 0.03)' }}>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                {idx === 0 ? <strong>{u.id}</strong> : ''}
                                                <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: '700', textTransform: 'uppercase' }}>{field}</div>
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem' }}>{idx === 0 ? <span style={{ color: '#3b82f6', fontWeight: '700' }}>Δ CHANGED</span> : ''}</td>
                                            <td style={{ padding: '0.8rem 1rem', textDecoration: 'line-through', color: 'var(--danger)', opacity: 0.7 }}>{vals.old}</td>
                                            <td style={{ padding: '0.8rem 1rem', color: 'var(--success)', fontWeight: '600' }}>{vals.new}</td>
                                        </tr>
                                    ))
                                ))}
                                {/* DELETED */}
                                {diffData.deleted.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(239, 68, 68, 0.03)' }}>
                                        <td style={{ padding: '0.8rem 1rem' }}><strong>{item.id}</strong><br/><span style={{opacity:0.6}}>{item.name}</span></td>
                                        <td style={{ padding: '0.8rem 1rem' }}><span style={{ color: 'var(--danger)', fontWeight: '700' }}>− REMOVED</span></td>
                                        <td style={{ padding: '0.8rem 1rem' }}>Existed in system</td>
                                        <td style={{ padding: '0.8rem 1rem', opacity: 0.6 }}>Will be deleted</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-tab-content fade-in" style={{ maxWidth: '800px' }}>
            {/* EXPORT SECTION */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)', padding: '0.75rem', borderRadius: '12px' }}>
                        <window.ArrowDownCircleIcon size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Export Inventory Data</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Download your complete inventory database in CSV format (ERPNext compatible).</p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => window.ExportTool.exportItemMaster(inventoryData)} style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <Icons.Download size={18} /> Item Master
                            </button>
                            <button onClick={() => window.ExportTool.exportStockRecon(inventoryData)} style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <Icons.Download size={18} /> Stock Recon
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* IMPORT SECTION - SHEETS */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '12px' }}>
                        <Icons.Link size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Import from Google Sheets</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Paste a Google Sheets URL to import inventory data directly.</p>
                        
                        <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '0.8rem 1rem', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <window.AlertCircleIcon size={18} style={{ color: '#0ea5e9' }} />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Sharing Access Required:</strong> Set your Google Sheet to <span style={{ color: '#0ea5e9', fontWeight: '700' }}>"Anyone with the link - Viewer"</span> for the import to work.
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input 
                                type="text" 
                                className="auth-input" 
                                placeholder="Google Sheets Link" 
                                value={sheetUrl}
                                onChange={e => setSheetUrl(e.target.value)}
                                style={{ flex: 1, margin: 0 }}
                            />
                            <button className="auth-btn-primary" onClick={handleSheetImport} disabled={isLoading} style={{ width: 'auto', padding: '0.6rem 2.25rem', margin: 0, background: 'var(--success)' }}>
                                {isLoading ? 'Importing...' : 'Review Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* IMPORT SECTION - FILE */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-color)', padding: '0.75rem', borderRadius: '12px' }}>
                        <Icons.FileText size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Import from Local File</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload an Excel file (.xlsx) to import inventory and logs.</p>
                        <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                        <button className="auth-btn-primary" onClick={() => fileInputRef.current.click()} disabled={isLoading} style={{ width: 'auto', padding: '0.6rem 1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Icons.UploadCloud size={18} /> {isLoading ? 'Processing...' : 'Review & Upload'}
                        </button>
                    </div>
                </div>
            </div>

            {/* REQUIREMENTS SECTION */}
            <div style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', color: 'var(--accent-color)' }}>
                    <Icons.AlertTriangle size={20} />
                    <span style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Import Logic Requirements</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <li>The system expects 4 specific tabs: <b>Inventory, Receive, Out, and Items</b>.</li>
                    <li>Items Tab provides base details. Inventory Tab provides stock metrics.</li>
                    <li>Receive and Out tabs form your transaction history (TXN IDs auto-generated).</li>
                    <li>All unassigned stock is forcefully routed to <b>Bulacan</b> by default.</li>
                    <li>Google Sheets must be set to <b>"Anyone with the link - Viewer"</b> for the import to work.</li>
                    <li>Companies listed in logs are automatically added as new Suppliers.</li>
                </ul>
            </div>
        </div>
    );
};
window.AdminManageDataTab = ManageDataTab;
