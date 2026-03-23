/**
 * Admin Dashboard - Import Data Tab
 */
const ImportDataTab = () => {
    const [sheetUrl, setSheetUrl] = React.useState('');
    const [file, setFile] = React.useState(null);
    const fileInputRef = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const processWorkbook = async (workbook) => {
        const getSheet = (name) => workbook.Sheets[name] ? window.XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 }) : [];
        
        const itemsSheet = getSheet('Items');
        const invSheet = getSheet('Inventory');
        const recvSheet = getSheet('Receive');
        const outSheet = getSheet('Out');

        if (itemsSheet.length === 0 && invSheet.length === 0) {
            throw new Error("Could not find required tabs. Make sure your file contains tabs named 'Items', 'Inventory', 'Receive', and 'Out'.");
        }

        const findCol = (headerRow, names) => {
            if (!headerRow) return -1;
            for (let i = 0; i < headerRow.length; i++) {
                const h = (headerRow[i] || '').toString().trim().toLowerCase();
                if (names.some(n => h === n.toLowerCase())) return i;
            }
            return -1;
        };

        const parsedItems = {};
        
        // PARSE ITEMS
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
                    warehouse: 'Bulacan', // Assigned to Bulacan as requested
                    quantity: 0
                };
            }
        }

        // PARSE INVENTORY
        if (invSheet.length > 1) {
            let h = invSheet[0];
            let cId = findCol(h, ['Item Code', 'ItemCode']);
            let cQty = findCol(h, ['Stock on hand', 'Quantity', 'Qty']);
            let cUom = findCol(h, ['UoM', 'Unit', 'UOM']);
            let cOpt = findCol(h, ['Optimal Stock', 'Optimal']);
            let cReorder = findCol(h, ['Reorder', 'Status']);
            let cReordered = findCol(h, ['Reordered?', 'Reordered']);

            if (cId === -1) cId = 0; // Assume first column is Item Code if header is weird

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
                
                // RESTOCKED LOGIC
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

        let newSuppliersMap = {};

        const parseDate = (dateVal) => {
            if (typeof dateVal === 'number') {
                return new Date((dateVal - 25569) * 86400 * 1000).toISOString().split('T')[0];
            }
            return typeof dateVal === 'string' ? dateVal : new Date().toISOString().split('T')[0];
        };

        // PARSE RECEIVE
        let newInputs = [];
        if (recvSheet.length > 1) {
            let h = recvSheet[0];
            let cId = findCol(h, ['Item Code', 'ItemCode']);
            if (cId === -1) cId = 0; // "first column, but blank in sheets"
            let cQty = findCol(h, ['Quantity', 'QTY']);
            if (cQty === -1) cQty = 2; 
            let cDate = findCol(h, ['Date']);
            if (cDate === -1) cDate = 3;
            let cComp = findCol(h, ['Company', 'Supplier']);
            if (cComp === -1) cComp = 4;
            let cBatch = findCol(h, ['Batch/LOT', 'Batch', 'Lot']);
            if (cBatch === -1) cBatch = 5;

            for (let i = 1; i < recvSheet.length; i++) {
                let row = recvSheet[i];
                if (!row || !row[cId]) continue;
                let id = row[cId].toString().trim();
                let compName = row[cComp] ? row[cComp].toString().trim() : 'Unknown Supplier';
                
                if (compName && !newSuppliersMap[compName]) {
                    newSuppliersMap[compName] = { id: compName.toLowerCase().replace(/[^a-z0-9]/g, '-'), name: compName, contactPerson: '', email: '', phone: '', address: '', categories: [] };
                }

                newInputs.push({
                    id: 'IN-' + Date.now() + '-' + i + Math.floor(Math.random()*1000),
                    transactionId: 'TXN-IN-' + Math.floor(100000 + Math.random() * 900000),
                    itemCode: id,
                    quantity: parseFloat(row[cQty]) || 0,
                    date: parseDate(row[cDate]),
                    supplier: compName,
                    batchLot: row[cBatch] ? row[cBatch].toString().trim() : '',
                    timestamp: Date.now(),
                    userName: 'System Import'
                });
            }
        }

        // PARSE OUT
        let newOutputs = [];
        if (outSheet.length > 1) {
            let h = outSheet[0];
            let cId = findCol(h, ['Item Code', 'ItemCode']);
            if (cId === -1) cId = 0; 
            let cQty = findCol(h, ['Quantity', 'QTY']);
            if (cQty === -1) cQty = 2; 
            let cDate = findCol(h, ['Date']);
            if (cDate === -1) cDate = 3;
            let cComp = findCol(h, ['Company', 'Customer']);
            if (cComp === -1) cComp = 4;
            let cBatch = findCol(h, ['Batch/LOT', 'Batch', 'Lot']);
            if (cBatch === -1) cBatch = 5;

            for (let i = 1; i < outSheet.length; i++) {
                let row = outSheet[i];
                if (!row || !row[cId]) continue;
                let id = row[cId].toString().trim();
                let compName = row[cComp] ? row[cComp].toString().trim() : 'Unknown Client';
                
                if (compName && !newSuppliersMap[compName]) {
                    // It says "Company" for Out as well, we'll store them as suppliers or generic contacts for now
                    newSuppliersMap[compName] = { id: compName.toLowerCase().replace(/[^a-z0-9]/g, '-'), name: compName, contactPerson: '', email: '', phone: '', address: '', categories: [] };
                }

                newOutputs.push({
                    id: 'OUT-' + Date.now() + '-' + i + Math.floor(Math.random()*1000),
                    transactionId: 'TXN-OUT-' + Math.floor(100000 + Math.random() * 900000),
                    itemCode: id,
                    quantity: parseFloat(row[cQty]) || 0,
                    date: parseDate(row[cDate]),
                    supplier: compName, // Storing as supplier/recipient reference
                    batchLot: row[cBatch] ? row[cBatch].toString().trim() : '',
                    timestamp: Date.now(),
                    userName: 'System Import'
                });
            }
        }

        // SAVING ALGORITHM
        let inventoryArr = Object.values(parsedItems);
        let suppliersArr = Object.values(newSuppliersMap);

        const currentInventory = await window.AppDataHandler.getInventory() || [];
        const currentInputs = await window.AppDataHandler.getInputLogs() || [];
        const currentOutputs = await window.AppDataHandler.getOutputLogs() || [];
        const currentSuppliers = await window.AppDataHandler.getSuppliers() || [];

        // Merge Inventory (Override matched, add new)
        let invMerged = [...currentInventory];
        for (const item of inventoryArr) {
            let existingIndex = invMerged.findIndex(i => i.id === item.id);
            if (existingIndex >= 0) {
                invMerged[existingIndex] = { ...invMerged[existingIndex], ...item }; 
            } else {
                invMerged.push(item);
            }
        }

        // Merge Suppliers
        let supMerged = [...currentSuppliers];
        for (const sup of suppliersArr) {
            if (!supMerged.find(s => s.name.toLowerCase() === sup.name.toLowerCase())) {
                supMerged.push(sup);
            }
        }

        await window.AppDataHandler.saveInventory(invMerged);
        await window.AppDataHandler.saveSuppliers(supMerged);
        if (newInputs.length) await window.AppDataHandler.saveInputLogs([...currentInputs, ...newInputs]);
        if (newOutputs.length) await window.AppDataHandler.saveOutputLogs([...currentOutputs, ...newOutputs]);

        return { items: inventoryArr.length, inputs: newInputs.length, outputs: newOutputs.length, suppliers: suppliersArr.length };
    };

    const handleSheetImport = async () => {
        if (!window.XLSX) return alert("Spreadsheet parser is still loading, please wait a moment.");
        if (!sheetUrl) return alert("Please enter a Google Sheets URL.");
        if (!sheetUrl.includes('/d/')) return alert("Invalid Google Sheets URL.");
        
        setIsLoading(true);
        try {
            const fileId = sheetUrl.match(/\/d\/(.*?)\//)[1];
            const exportUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
            
            const response = await fetch(exportUrl);
            if (!response.ok) throw new Error("Could not fetch the sheet. Make sure it is public (Anyone with the link can view).");
            
            const arrayBuffer = await response.arrayBuffer();
            const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
            
            const stats = await processWorkbook(workbook);
            alert(`Import Successful!\n\nImported/Updated:\n- ${stats.items} Items\n- ${stats.inputs} Arrival Logs\n- ${stats.outputs} Shipment Logs\n- ${stats.suppliers} Companies`);
            setSheetUrl('');
        } catch (e) {
            alert("Error importing from Google Sheets: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (!window.XLSX) return alert("Spreadsheet parser is still loading, please wait a moment.");
        
        const file = e.target.files[0];
        if (!file) return;
        
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;
                const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
                
                const stats = await processWorkbook(workbook);
                alert(`File "${file.name}" imported successfully!\n\nImported/Updated:\n- ${stats.items} Items\n- ${stats.inputs} Arrival Logs\n- ${stats.outputs} Shipment Logs\n- ${stats.suppliers} Companies`);
                
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } catch(err) {
                alert("Error parsing file: " + err.message);
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
            alert("Error reading file.");
            setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="admin-tab-content fade-in" style={{ maxWidth: '800px' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: '12px' }}>
                        <Icons.Link size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Import from Google Sheets</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Paste a Google Sheets URL to import inventory data directly.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input 
                                type="text" 
                                className="auth-input" 
                                placeholder="https://docs.google.com/spreadsheets/d/..." 
                                value={sheetUrl}
                                onChange={e => setSheetUrl(e.target.value)}
                                style={{ flex: 1, margin: 0 }}
                            />
                            <button className="auth-btn-primary" onClick={handleSheetImport} disabled={isLoading} style={{ width: 'auto', padding: '0.6rem 2rem', margin: 0, background: 'var(--success)' }}>
                                {isLoading ? 'Importing...' : 'Import'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-color)', padding: '0.75rem', borderRadius: '12px' }}>
                        <Icons.FileText size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>Import from File</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload an Excel file (.xlsx) to import inventory and logs.</p>
                        
                        <input 
                            type="file" 
                            accept=".xlsx,.xls,.csv" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={handleFileChange} 
                        />
                        <button 
                            className="auth-btn-primary" 
                            onClick={() => fileInputRef.current.click()} 
                            disabled={isLoading} 
                            style={{ width: 'auto', padding: '0.6rem 1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Icons.UploadCloud size={18} /> {isLoading ? 'Processing...' : 'Choose File'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', color: 'var(--accent-color)' }}>
                    <Icons.AlertTriangle size={20} />
                    <span style={{ fontWeight: '700' }}>Import Logic Requirements</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>The system expects 4 specific tabs: <b>Inventory, Receive, Out, and Items</b>.</li>
                    <li>Items Tab provides base details (Name, Desc). Inventory Tab provides metrics (Stock, Status, Reorder).</li>
                    <li>Receive and Out tabs form your transaction history. TXN IDs will be auto-generated.</li>
                    <li>Google Sheets must be publicly accessible (Anyone with the link can view) to use the URL import.</li>
                    <li>All unassigned stock is forcefully routed to <b>Bulacan</b> by default.</li>
                    <li>Companies listed in logs are automatically added as new Suppliers with blank contact data.</li>
                </ul>
            </div>
        </div>
    );
};
window.AdminImportDataTab = ImportDataTab;
