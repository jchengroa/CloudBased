/**
 * Admin Dashboard - Container
 * Ties together all administrative configuration tabs.
 */
const AdminDashboard = ({ currentUser, inputLogs, outputLogs, onBrandingUpdate, inventoryData }) => {
    const [activeTab, setActiveTab] = React.useState('overview');
    const [users, setUsers] = React.useState([]);
    const [activityLogs, setActivityLogs] = React.useState([]);
    const [branding, setBranding] = React.useState({});
    const [globalSettings, setGlobalSettings] = React.useState({});
    const [loading, setLoading] = React.useState(true);
    
    // We already have generic icons in sharedComponents.js so we reuse them here
    // for tab navigation.
    
    const loadData = async () => {
        setLoading(true);
        try {
            const fetchedUsers = await window.AppDataHandler.getUsers();
            const fetchedBranding = await window.AppDataHandler.getBranding();
            const fetchedGlobalSettings = await window.AppDataHandler.getGlobalSettings();
            
            // Generate unified activity logs from input/output logs + fake ones for the mockup
            // Sort them by timestamp descending
            const mergedLogs = [
                ...inputLogs.map(log => ({
                    timestamp: log.timestamp,
                    user: log.userName || 'System',
                    title: 'Logged Input Transaction',
                    details: `IN-${log.id} - Processed input for ${log.itemCode}`,
                    category: 'transaction',
                    type: 'input'
                })),
                ...outputLogs.map(log => ({
                    timestamp: log.timestamp,
                    user: log.userName || 'System',
                    title: 'Logged Output Transaction',
                    details: `OUT-${log.id} - Dispatched ${log.itemCode}`,
                    category: 'transaction',
                    type: 'output'
                })),
                // Mockup data
                { timestamp: Date.now() - 3600000, user: 'Administrator', title: 'Updated Branding', details: 'Changed company name', category: 'system', type: 'system' },
                { timestamp: Date.now() - 7200000, user: 'Administrator', title: 'Updated Supplier', details: 'Modified contact details for FastBolt', category: 'supplier', type: 'supplier' }
            ].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            setUsers(fetchedUsers);
            setActivityLogs(mergedLogs);
            setBranding(fetchedBranding);
            setGlobalSettings(fetchedGlobalSettings);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    
    React.useEffect(() => {
        loadData();
    }, [inputLogs, outputLogs]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <Icons.Shield size={16} /> },
        { id: 'users', label: 'User Management', icon: <Icons.Users size={16} /> },
        { id: 'logs', label: 'Activity Logs', icon: <Icons.FileText size={16} /> },
        { id: 'manage', label: 'Manage Data', icon: <Icons.ArrowDownCircle size={16} /> },
        { id: 'branding', label: 'Branding', icon: <Icons.Image size={16} /> },
        { id: 'settings', label: 'Global Settings', icon: <Icons.Settings size={16} /> }
    ];

    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Admin Dashboard...</div>;
    }

    return (
        <div style={{ padding: '2rem 3rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage users, monitor activity, and configure system settings.</p>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', marginBottom: '2rem', padding: '0.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`view-switcher-btn ${activeTab === tab.id ? 'active' : ''}`}
                        title={tab.label}
                        style={{
                            background: activeTab === tab.id ? 'var(--hover-bg)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                            fontWeight: activeTab === tab.id ? '700' : '600',
                            border: 'none',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === tab.id ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
                            position: 'relative'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                        {activeTab === tab.id && <div style={{ position: 'absolute', bottom: '-8px', left: '10%', right: '10%', height: '3px', background: 'var(--accent-color)', borderRadius: '3px' }} />}
                    </button>
                ))}
            </div>

            {/* Rendering matching Tab */}
            {activeTab === 'overview' && <window.AdminOverviewTab users={users} activityLogs={activityLogs} />}
            {activeTab === 'users' && <window.AdminUserManagementTab users={users} onUpdateUser={loadData} currentUser={currentUser} />}
            {activeTab === 'logs' && <window.AdminActivityLogsTab activityLogs={activityLogs} />}
            {activeTab === 'manage' && <window.AdminManageDataTab inventoryData={inventoryData} />}
            {activeTab === 'branding' && <window.AdminBrandingTab branding={branding} onUpdateBranding={(b) => { setBranding(b); onBrandingUpdate(b); }} />}
            {activeTab === 'settings' && <window.AdminGlobalSettingsTab globalSettings={globalSettings} onUpdateGlobalSettings={setGlobalSettings} />}

        </div>
    );
};
window.AdminDashboard = AdminDashboard;
