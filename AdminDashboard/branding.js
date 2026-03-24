/**
 * Admin Dashboard - Branding Tab
 */
const BrandingTab = ({ branding, onUpdateBranding }) => {
    const [logoUrl, setLogoUrl] = React.useState(branding?.logoUrl || '');
    const [companyName, setCompanyName] = React.useState(branding?.companyName || 'System');
    const [accentColor, setAccentColor] = React.useState(branding?.accentColor || '#4f46e5');
    const [isSaving, setIsSaving] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const fileInputRef = React.useRef(null);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const data = { 
                logoUrl, 
                companyName: companyName || 'System',
                accentColor 
            };
            await window.AppDataHandler.saveBranding(data);
            onUpdateBranding(data);
            
            // Immediately apply global accent if no personal preference exists
            document.documentElement.style.setProperty('--accent-color', accentColor);
            await window.AppDataHandler.addActivityLog({
                title: 'Updated Branding',
                details: `Changed company name to "${companyName || 'System'}" and updated visual assets.`,
                category: 'system'
            });
            
            setMessage('Branding updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch(e) {
            alert('Error saving branding: ' + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const resized = await window.resizeImage(file, 400); // Higher res for logos
            setLogoUrl(resized);
        } catch(e) { alert("Failed to process image."); }
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
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <input 
                                    className="auth-input" 
                                    placeholder="Logo URL" 
                                    value={logoUrl} 
                                    onChange={e => setLogoUrl(e.target.value)} 
                                    style={{ margin: 0, flex: 1 }}
                                />
                                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
                                <button onClick={() => fileInputRef.current.click()} style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 1rem', cursor: 'pointer', fontWeight: '600' }} title="Upload File">
                                    <Icons.UploadCloud size={18} />
                                </button>
                                {logoUrl && (
                                    <button onClick={() => setLogoUrl('')} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', padding: '0 1rem', cursor: 'pointer', fontWeight: '600' }} title="Remove Logo">
                                        <Icons.Trash size={18} />
                                    </button>
                                )}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Recommended size: 200x200px. Upload or paste a URL.
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label className="auth-label" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Default Accent Color</label>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {[
                            { hex: '#4f46e5', label: 'Indigo' },
                            { hex: '#10b981', label: 'Emerald' },
                            { hex: '#8b5cf6', label: 'Violet' },
                            { hex: '#ef4444', label: 'Rose' },
                            { hex: '#f59e0b', label: 'Amber' }
                        ].map(color => (
                            <button
                                key={color.hex}
                                onClick={() => setAccentColor(color.hex)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '50%', background: color.hex, border: accentColor === color.hex ? '3px solid var(--text-primary)' : '2px solid transparent',
                                    cursor: 'pointer', transition: 'transform 0.2s'
                                }}
                                title={color.label}
                                onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                            />
                        ))}
                        <input 
                            type="color" 
                            value={accentColor} 
                            onChange={e => setAccentColor(e.target.value)} 
                            style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} 
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label className="auth-label" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Company Name</label>
                    <input 
                        className="auth-input" 
                        placeholder="Company Name" 
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
