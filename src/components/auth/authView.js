/**
 * Auth Component
 * Handles functional and 'elegant' Login and Signup screens.
 */

const Auth = ({ onLoginSuccess }) => {
    const getParam = (key) => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has(key)) return urlParams.get(key);
        // Also check hash (in case of /#/?mode=...)
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
        return hashParams.get(key);
    };

    const queryMode = getParam('mode');
    const oobCode = getParam('oobCode') || getParam('token');

    // Background Management Logic (Merged from BackgroundManager)
    const backgrounds = [
        'assets/images/background1.png',
        'assets/images/background2.jpg',
        'assets/images/background3.jpg',
        'assets/images/background4.jpg'
    ];

    const getInitialBgIdx = () => {
        try {
            const key = 'cloudbased_bg_idx';
            const lastIdxStr = localStorage.getItem(key);
            // Default to 0 on very first load
            return lastIdxStr ? parseInt(lastIdxStr) : 0;
        } catch (e) {
            return 0;
        }
    };

    const [bgIdx, setBgIdx] = React.useState(getInitialBgIdx());

    // Only increment the background index once per full page load/mount
    // This solves the 'skipping' issue in React StrictMode where initial state logic runs twice
    React.useEffect(() => {
        try {
            const key = 'cloudbased_bg_idx';
            const nextIdx = (bgIdx + 1) % backgrounds.length;
            localStorage.setItem(key, nextIdx.toString());
        } catch (e) {
            console.warn("Could not persist background cycle index.");
        }
    }, [backgrounds.length]); // Explicitly only on mount for the given backgrounds set

    const [view, setView] = React.useState(queryMode === 'resetPassword' ? 'resetNewPassword' : 'login');
    const [branding, setBranding] = React.useState(window.AppDataHandler.getBrandingSync());
    const [showPassword, setShowPassword] = React.useState(false);
    const [oldPass, setOldPass] = React.useState('');
    const [newPass, setNewPass] = React.useState('');
    const [confirmPass, setConfirmPass] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        identifier: ''
    });

    React.useEffect(() => {
        const loadBranding = async () => {
            const b = await window.AppDataHandler.getBranding();
            setBranding(b);
            if (b.companyName) {
                document.title = `${b.companyName} - Login`;
            }
        };
        loadBranding();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError("Please enter both username and password.");
            return;
        }

        setLoading(true);
        try {
            const user = await window.AppDataHandler.login(formData.username, formData.password);
            onLoginSuccess(user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const [confirmDialog, setConfirmDialog] = React.useState(null);

    const handleForgotPassword = async (e) => {
        if (e) e.preventDefault();
        if (!formData.identifier) {
            setError("Please enter your email address.");
            return;
        }

        setConfirmDialog({
            title: 'Send Reset Link?',
            message: (
                <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <p>We will send a password reset link to your registered email address.</p>
                </div>
            ),
            onConfirm: async () => {
                setLoading(true);
                try {
                    await window.AppDataHandler.sendPasswordResetEmail(formData.identifier);
                    setError('');
                    setConfirmDialog({
                        title: 'Link Sent!',
                        message: 'If an account matches that identifier, a reset link is on its way.',
                        onConfirm: () => setView('login'),
                        confirmLabel: 'Back to Login',
                        hideCancel: true
                    });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            await window.AppDataHandler.confirmPasswordReset(oobCode, formData.password);
            setConfirmDialog({
                title: 'Password Reset!',
                message: 'Your password has been successfully updated.',
                onConfirm: () => { window.location.href = window.location.pathname; },
                confirmLabel: 'Proceed to Login',
                hideCancel: true
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePasswordDirectly = async (e) => {
        e.preventDefault();
        if (!formData.username || !oldPass || !newPass || !confirmPass) {
            setError("All fields are required.");
            return;
        }
        if (newPass !== confirmPass) {
            setError("New passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await window.AppDataHandler.login(formData.username, oldPass);
            await window.AppDataHandler.changePassword(oldPass, newPass);
            alert("Password updated successfully!");
            setView('login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getSubmitHandler = () => {
        if (view === 'forgot') return handleForgotPassword;
        if (view === 'change') return handleChangePasswordDirectly;
        if (view === 'resetNewPassword') return handleResetPassword;
        return handleLogin;
    };

    const viewSubtexts = {
        'login': 'Sign in to your account',
        'forgot': 'Recover your account access',
        'change': 'Update your password',
        'resetNewPassword': 'Create a new secure password'
    };

    return (
        <div className="auth-overlay">
            {/* Base Background (Current) */}
            {/* Background Layer: Updates sequentially only on page refresh */}
            <div className="auth-bg-layer" style={{
                backgroundImage: `url('${backgrounds[bgIdx]}')`,
                opacity: 0.65,
                zIndex: 0,
                filter: 'blur(8px)',
                transform: 'scale(1.05)'
            }}></div>

            {/* Dark overlay for contrast */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 2 }}></div>

            <div className="auth-external-branding" style={{ zIndex: 10 }}>
                <div className="auth-external-logo">
                    {branding.logoUrl ? (
                        <img src={branding.logoUrl} alt="Logo" />
                    ) : (
                        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900' }}>
                            <SafeIcons.Shield size={32} />
                        </div>
                    )}
                </div>
                <h1 className="auth-external-name">{branding.companyName || 'CloudBased'}</h1>
                <p className="auth-external-subtitle">{viewSubtexts[view]}</p>
            </div>

            <div className="auth-box" style={{ zIndex: 10 }}>
                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '500' }}>
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={getSubmitHandler()}>
                    {view === 'login' && (
                        <div className="auth-input-group">
                            <label className="auth-label">Username or Email</label>
                            <div className="auth-input-wrapper">
                                <div className="auth-input-icon-left"><window.UsersIcon size={20} /></div>
                                <input type="text" name="username" className="auth-input" placeholder="Enter username or email" value={formData.username} onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    {view === 'forgot' && (
                        <div className="auth-input-group">
                            <label className="auth-label">Email Address</label>
                            <div className="auth-input-wrapper">
                                <div className="auth-input-icon-left"><window.UsersIcon size={20} /></div>
                                <input type="email" name="identifier" className="auth-input" placeholder="john@example.com" value={formData.identifier} onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    {view === 'change' && (
                        <>
                            <div className="auth-input-group">
                                <label className="auth-label">Username</label>
                                <div className="auth-input-wrapper">
                                    <div className="auth-input-icon-left"><window.UsersIcon size={20} /></div>
                                    <input type="text" name="username" className="auth-input" placeholder="johndoe" value={formData.username} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label">Current Password</label>
                                <div className="auth-input-wrapper">
                                    <div className="auth-input-icon-left"><window.LockIcon size={20} /></div>
                                    <input type="password" name="oldPass" className="auth-input" placeholder="••••••••" value={oldPass} onChange={e => setOldPass(e.target.value)} required />
                                </div>
                            </div>
                        </>
                    )}

                    {(view === 'login' || view === 'resetNewPassword' || view === 'change') && (
                        <div className="auth-input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="auth-label">Password</label>
                                {view === 'login' && (
                                    <button type="button" className="auth-btn-text" style={{ fontSize: '0.8rem' }} onClick={() => setView('forgot')}>
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="auth-input-wrapper">
                                <div className="auth-input-icon-left">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <input type={showPassword ? 'text' : 'password'} name="password" className="auth-input" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                                <div className="auth-input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <window.EyeOffIcon size={20} /> : <window.EyeIcon size={20} />}
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'resetNewPassword' && (
                        <div className="auth-input-group" style={{ marginTop: '-0.5rem' }}>
                            <label className="auth-label">Confirm New Password</label>
                            <div className="auth-input-wrapper">
                                <div className="auth-input-icon-left">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                </div>
                                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" className="auth-input" placeholder="••••••••" value={formData.confirmPassword || ''} onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="auth-btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Continue')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    {view !== 'login' && (
                        <button className="auth-btn-text" onClick={() => setView('login')}>Back to Sign in</button>
                    )}
                </div>
            </div>

            <div style={{ position: 'relative', marginTop: '3rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.3)', zIndex: 10 }}>
                © 2026 John Carlo Cheng Roa
            </div>

            {confirmDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '1rem' }}>
                    <div className="fade-in" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>{confirmDialog.title}</h3>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1rem' }}>{confirmDialog.message}</div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            {!confirmDialog.hideCancel && <button onClick={() => setConfirmDialog(null)} style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>}
                            <button onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); setConfirmDialog(null); }} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>{confirmDialog.confirmLabel || 'Confirm'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
