/**
 * Admin Dashboard - Branding Tab
 */
const BrandingTab = ({ branding, onUpdateBranding }) => {
    const [logoUrl, setLogoUrl] = React.useState(branding?.logoUrl || '');
    const [companyName, setCompanyName] = React.useState(branding?.companyName || 'CloudBased');
    const [isSaving, setIsSaving] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const data = { logoUrl, companyName: companyName || 'CloudBased' };
            await window.AppDataHandler.saveBranding(data);
            onUpdateBranding(data);
            setMessage('Branding updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch(e) {
            alert('Error saving branding: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="admin-tab-content fade-in" style={{ maxWidth: '600px' }}>
            {message && <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 'bold' }}>{message}</div>}

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem' }}>Company Branding</h3>

                <div style={{ marginBottom: '2rem' }}>
                    <label className="auth-label" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Company Logo</label>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                        <div style={{ 
                            width: '100px', height: '100px', 
                            background: 'var(--hover-bg)', 
                            border: '2px dashed var(--border-color)', 
                            borderRadius: '16px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            overflow: 'hidden', color: 'var(--text-secondary)'
                        }}>
                            {logoUrl ? <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Logo" /> : <Icons.Image size={32} opacity={0.5} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input 
                                    className="auth-input" 
                                    placeholder="Enter image URL..." 
                                    value={logoUrl} 
                                    onChange={e => setLogoUrl(e.target.value)} 
                                    style={{ margin: 0 }}
                                />
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Recommended size: 200x200px. Supported formats: PNG, JPG, SVG
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label className="auth-label" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Company Name</label>
                    <input 
                        className="auth-input" 
                        placeholder="CloudBased" 
                        value={companyName} 
                        onChange={e => setCompanyName(e.target.value)}
                        style={{ marginTop: '0.5rem' }}
                    />
                </div>

                <button 
                    className="auth-btn-primary" 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    style={{ width: 'auto', padding: '0.8rem 2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Icons.Shield size={18} /> {isSaving ? 'Saving...' : 'Save Branding'}
                </button>
            </div>
        </div>
    );
};
window.AdminBrandingTab = BrandingTab;
