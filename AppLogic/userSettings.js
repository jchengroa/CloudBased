/**
 * User Settings (Account & System Management)
 * A visually stunning modal for managing profile, preferences, and data.
 */

const UIIcons = {
    User: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    Key: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>,
    Palette: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h1.5A5.5 5.5 0 0 0 22 10c0-4.4-4.5-8-10-8Z"></path></svg>,
    Moon: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>,
    Activity: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
    Database: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>,
    Download: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    Upload: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    Trash: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    RefreshCw: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
    Info: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>,
    Heart: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Book: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>,
    Check: (p) => <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"></polyline></svg>
};

const SettingsCard = ({ icon, title, children }) => (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
        {title && (
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                <span style={{ color: 'var(--accent-color)', display: 'flex' }}>{icon}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{title}</span>
            </div>
        )}
        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
            {children}
        </div>
    </div>
);

const UserSettings = ({ user, onClose, onUpdateUser, inventoryData = [] }) => {
    // Current States
    const [name, setName] = React.useState(user.name || '');
    const [username, setUsername] = React.useState(user.username || '');
    const [pic, setPic] = React.useState(user.profilePicture || '');
    const [theme, setTheme] = React.useState(user.settings?.theme || 'light');
    const [themeColor, setThemeColor] = React.useState(user.settings?.themeColor || '#4f46e5');
    const [threshold, setThreshold] = React.useState(user.settings?.lowStockThreshold || '');
    const [isThresholdEnabled, setIsThresholdEnabled] = React.useState(user.settings?.isThresholdEnabled ?? false);

    // Auth Edit Modal Overlay State
    const [authAction, setAuthAction] = React.useState(null); // 'editProfile' or 'changePassword' or null
    const [oldPass, setOldPass] = React.useState('');
    const [newPass, setNewPass] = React.useState('');
    const [confirmPass, setConfirmPass] = React.useState('');

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [confirmDialog, setConfirmDialog] = React.useState(null); // { title: '', message: '', onConfirm: fn }

    // Handlers
    const showMessage = (msg, isErr = false) => {
        isErr ? setError(msg) : setSuccess(msg);
        setTimeout(() => { setError(''); setSuccess(''); }, 3000);
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const updated = await window.AppDataHandler.updateProfile({ name, username, profilePicture: pic });
            onUpdateUser(updated);
            setAuthAction(null);
            showMessage('Profile updated successfully!');
        } catch (e) { showMessage(e.message, true); }
        finally { setLoading(false); }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        if (newPass !== confirmPass) { showMessage("New passwords don't match.", true); setLoading(false); return; }
        try {
            await window.AppDataHandler.changePassword(oldPass, newPass);
            setOldPass(''); setNewPass(''); setConfirmPass('');
            setAuthAction(null);
            showMessage('Password changed successfully!');
        } catch (e) { showMessage(e.message, true); }
        finally { setLoading(false); }
    };

    const handleSaveSystemSettings = async (mode = theme, color = themeColor, enabled = isThresholdEnabled, val = threshold) => {
        setLoading(true);
        try {
            const newSettings = { ...user.settings, theme: mode, themeColor: color, lowStockThreshold: parseFloat(val) || '', isThresholdEnabled: enabled };
            await window.AppDataHandler.saveSettings(newSettings);
            const updated = { ...user, settings: newSettings };
            onUpdateUser(updated);

            document.documentElement.setAttribute('data-theme', mode);
            document.documentElement.style.setProperty('--accent-color', color);

            showMessage('System preferences saved!');
        } catch (e) { showMessage(e.message, true); }
        finally { setLoading(false); }
    };

    // Auto-save Theme/Color selections visually immediately (and backend persist)
    const updateTheme = (newMode, newColor) => {
        setTheme(newMode);
        setThemeColor(newColor);
        document.documentElement.setAttribute('data-theme', newMode);
        document.documentElement.style.setProperty('--accent-color', newColor);
        handleSaveSystemSettings(newMode, newColor, isThresholdEnabled, threshold);
    };

    const updateThresholdSettings = (enabled, val = threshold) => {
        setIsThresholdEnabled(enabled);
        setThreshold(val);
        handleSaveSystemSettings(theme, themeColor, enabled, val);
    };

    const handleClearCache = () => {
        setConfirmDialog({
            title: 'Clear Local Storage?',
            message: 'This will remove your local session and cached preferences. You will need to log in again to resync with the cloud database. Continue?',
            onConfirm: () => {
                localStorage.clear();
                location.reload();
            }
        });
    };

    return (
        <div className="prompt-overlay" onClick={e => e.target.className === 'prompt-overlay' && onClose()}>
            <div className="prompt-box" style={{ maxWidth: '800px', width: '90%', padding: '2rem 2.5rem', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>User Settings</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>Manage your profile, preferences, and application settings.</p>
                    </div>
                    <button className="prompt-close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.5}>
                        <Icons.Close size={28} />
                    </button>
                </div>

                {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
                {success && <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

                <SettingsCard icon={<UIIcons.User size={22} />} title="User Profile">
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        {pic ? (
                            <img src={pic} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', background: '#e0e7ff', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                        ) : (
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', fontWeight: '800', border: '3px solid var(--card-bg)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                {name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Name</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>{name}</div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role</div>
                            <div style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>{user.role || 'Administrator'}</div>

                            <button onClick={() => setAuthAction('editProfile')} style={{ padding: '0.6rem 1.25rem', background: 'var(--hover-bg)', color: 'var(--text-primary)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                <UIIcons.User size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                        <button onClick={() => setAuthAction('changePassword')} style={{ background: '#0f172a', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                            <UIIcons.Key size={18} /> Change Password
                        </button>
                    </div>
                </SettingsCard>

                <SettingsCard icon={<UIIcons.Palette size={22} />} title="Appearance">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <UIIcons.Moon size={18} /> Dark Mode
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Toggle dark mode styling across the application.</div>
                        </div>
                        <div style={{ background: theme === 'dark' ? 'var(--accent-color)' : 'var(--border-color)', width: '48px', height: '26px', borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }} onClick={() => updateTheme(theme === 'dark' ? 'light' : 'dark', themeColor)}>
                            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: theme === 'dark' ? '25px' : '3px', transition: '0.3s' }}></div>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem -1.5rem', marginBottom: '1.5rem' }} />
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Application Theme</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Choose your preferred color scheme for the interface.</div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        {[
                            { hex: '#4f46e5', label: 'Default Blue' },
                            { hex: '#10b981', label: 'Emerald Green' },
                            { hex: '#8b5cf6', label: 'Royal Purple' },
                            { hex: '#ef4444', label: 'Rose Pink' },
                            { hex: '#f59e0b', label: 'Amber Gold' }
                        ].map(c => (
                            <button key={c.hex} onClick={() => updateTheme(theme, c.hex)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', paddingRight: '1.5rem', borderRadius: '8px', border: `1px solid ${themeColor === c.hex ? 'var(--accent-color)' : 'var(--border-color)'}`, background: themeColor === c.hex ? 'var(--selected-bg)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500', minWidth: '160px', position: 'relative' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: c.hex }}></div>
                                {c.label}
                                {themeColor === c.hex && <UIIcons.Check size={16} color="var(--accent-color)" style={{ position: 'absolute', right: '10px' }} />}
                            </button>
                        ))}
                    </div>
                </SettingsCard>

                <SettingsCard icon={<UIIcons.Activity size={22} />} title="Inventory Settings">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ maxWidth: '80%' }}>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Global Stock Threshold</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Override all individual minimum stock levels with a single global threshold.</div>
                        </div>
                        <div style={{ background: isThresholdEnabled ? 'var(--accent-color)' : 'var(--border-color)', width: '48px', height: '26px', borderRadius: '24px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }} onClick={() => updateThresholdSettings(!isThresholdEnabled)}>
                            <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isThresholdEnabled ? '25px' : '3px', transition: '0.3s' }}></div>
                        </div>
                    </div>

                    <div style={{
                        opacity: isThresholdEnabled ? 1 : 0.5,
                        pointerEvents: isThresholdEnabled ? 'auto' : 'none',
                        transition: 'opacity 0.3s'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="number"
                                className="auth-input"
                                placeholder="Threshold"
                                value={threshold}
                                onChange={e => setThreshold(e.target.value)}
                                style={{ maxWidth: '300px', margin: 0 }}
                            />
                            <button
                                onClick={() => handleSaveSystemSettings()}
                                disabled={loading}
                                style={{ background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.8rem 1.5rem', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Apply
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                            Note: This is a <strong>local override</strong> for your account only. It will not change the MSL values in the shared database.
                        </p>
                    </div>
                </SettingsCard>

                <SettingsCard icon={<UIIcons.Database size={22} />} title="Data Management">

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ maxWidth: '75%' }}>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Clear Local Storage</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Reset all application settings and cached data stored locally.</div>
                        </div>
                        <button onClick={handleClearCache} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.6rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                            <UIIcons.Trash size={16} /> Clear Storage
                        </button>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '0 -1.5rem', marginBottom: '1.5rem' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ maxWidth: '75%' }}>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Force Database Resync</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Manually trigger a full synchronization with the cloud database.</div>
                        </div>
                        <button onClick={() => location.reload()} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '0.6rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => { e.target.style.color = 'var(--text-primary)' }} onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)' }}>
                            <UIIcons.RefreshCw size={16} /> Resync Now
                        </button>
                    </div>

                    {/* DANGER ZONE */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', margin: '1.5rem -1.5rem -1.5rem -1.5rem', padding: '1.5rem' }}>
                        <div style={{ maxWidth: '75%' }}>
                            <div style={{ fontWeight: '600', color: 'var(--danger)', marginBottom: '0.25rem' }}>Delete Account</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Permanently delete your account and profile data.</div>
                        </div>
                        <button onClick={async () => {
                            if (confirm("WARNING: This will permanently delete your account. Are you absolutely sure?")) {
                                try {
                                    setLoading(true);
                                    await window.AppDataHandler.deleteAccount();
                                } catch (e) {
                                    showMessage("Account deletion failed. You may need to log out and log back in first: " + e.message, true);
                                    setLoading(false);
                                }
                            }
                        }} disabled={loading} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                            <UIIcons.Trash size={16} /> Delete Account
                        </button>
                    </div>
                </SettingsCard>

                <SettingsCard icon={<UIIcons.Info size={22} />} title="About">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--hover-bg)', padding: '1.5rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <UIIcons.Info size={16} /> Version Info
                            </div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.4rem', fontWeight: '500' }}>CloudBased IMS</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Version 0.11.2</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date Modified: March 24, 2026</div>
                        </div>
                        <div style={{ background: 'var(--hover-bg)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <img src="Resources/icon.png" alt="Icon" style={{ width: '40px', height: '40px', marginBottom: '0.75rem', opacity: 0.9 }} onError={(e) => { e.target.style.display = 'none'; }} />
                            <div style={{ fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Made by Group 5</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Created by: Cheng Roa & Tejada</div>
                        </div>
                    </div>
                    <button style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                        <UIIcons.Book size={18} /> Access User Manual
                    </button>
                </SettingsCard>
            </div>

            {/* In-Modal Overlay for profile/password editing so we don't navigate away */}
            {authAction && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: '700' }}>{authAction === 'editProfile' ? 'Edit Profile' : 'Change Password'}</h3>

                        {authAction === 'editProfile' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <FormInput label="Display Name" value={name} onChange={e => setName(e.target.value)} />
                                <FormInput label="Username" value={username} onChange={e => setUsername(e.target.value)} />
                                <div className="auth-input-group">
                                    <label className="auth-label">Profile Picture (Upload)</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <input type="file" accept="image/*" className="auth-input" style={{ padding: '0.65rem', height: 'auto', flex: 1 }} onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const resized = await window.resizeImage(file, 400);
                                                setPic(resized);
                                            }
                                        }} />
                                        {pic && (
                                            <button
                                                type="button"
                                                onClick={() => setPic('')}
                                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    {pic && pic.length > 500 && <span style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.25rem' }}>✓ New image selected</span>}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setAuthAction(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                    <button onClick={handleUpdateProfile} disabled={loading} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save Profile</button>
                                </div>
                            </div>
                        )}

                        {authAction === 'changePassword' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <FormInput type="password" label="Current Password" value={oldPass} onChange={e => setOldPass(e.target.value)} />
                                <FormInput type="password" label="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} />
                                <FormInput type="password" label="Confirm Password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />

                                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                    <button
                                        type="button"
                                        className="auth-btn-text"
                                        style={{ fontSize: '0.85rem' }}
                                        onClick={() => {
                                            setConfirmDialog({
                                                title: 'Send Reset Link?',
                                                message: (
                                                    <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                        <p>We will send a password reset link to <strong>{user.email}</strong>.</p>
                                                        <div style={{ background: 'var(--hover-bg)', padding: '1rem', borderRadius: '12px', marginTop: '1rem', border: '1px solid var(--border-color)' }}>
                                                            <p style={{ fontWeight: '700', color: 'var(--accent-color)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                                                Important Note:
                                                            </p>
                                                            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                                                                <li>Please be <strong>conservative</strong> with this request. Firebase limits individual users to 10 emails per day.</li>
                                                                <li>Check your <strong>Spam/Junk</strong> folder if the mail doesn't arrive within 2 minutes.</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                ),
                                                onConfirm: async () => {
                                                    setLoading(true);
                                                    try {
                                                        await window.AppDataHandler.sendPasswordResetEmail(user.email);
                                                        setConfirmDialog({
                                                            title: 'Email Sent!',
                                                            message: 'The reset link has been dispatched. Please check your inbox and spam folder.',
                                                            onConfirm: () => setAuthAction(null),
                                                            confirmLabel: 'Close',
                                                            hideCancel: true
                                                        });
                                                    } catch (e) {
                                                        showMessage(e.message, true);
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }
                                            });
                                        }}
                                    >
                                        Forgot current password?
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setAuthAction(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                    <button onClick={handleChangePassword} disabled={loading} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Update Password</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {confirmDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
                    <div className="fade-in" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{confirmDialog.title}</h3>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1rem' }}>{confirmDialog.message}</div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            {!confirmDialog.hideCancel && (
                                <button onClick={() => setConfirmDialog(null)} style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                            )}
                            <button onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); setConfirmDialog(null); }} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
                                {confirmDialog.confirmLabel || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
window.UserSettings = UserSettings;
