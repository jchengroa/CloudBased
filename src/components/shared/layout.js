const ViewSwitcher = ({ activeView, setActiveView, options }) => (
    <div className="view-switcher" style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '40px', display: 'flex', gap: '4px', border: '1px solid var(--border-color)' }}>
        {options.map(v => (
            <button
                key={v.key}
                className={`view-switcher-btn ${activeView === v.key ? 'active' : ''}`}
                onClick={() => setActiveView(v.key)}
                style={{ 
                    background: activeView === v.key ? 'var(--accent-color)' : 'transparent',
                    border: 'none',
                    color: activeView === v.key ? 'white' : 'var(--text-secondary)',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '30px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: activeView === v.key ? '0 8px 16px -4px rgba(99, 102, 241, 0.4)' : 'none'
                }}
            >
                {v.label}
            </button>
        ))}
    </div>
);
window.ViewSwitcher = ViewSwitcher;

const GenericModal = ({ isOpen, onClose, title, children, width = "500px" }) => {
    if (!isOpen) return null;
    return (
        <div className="prompt-overlay" onClick={onClose}>
            <div className="prompt-box" style={{ width, padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>{title}</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'var(--hover-bg)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '32px', height: '32px', color: 'var(--text-secondary)' }}>
                        <Icons.Close size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};
window.GenericModal = GenericModal;

const Card = ({ children, style, className = '' }) => (
    <div className={`card-component ${className}`} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', ...style }}>
        {children}
    </div>
);
window.Card = Card;

const CardHeader = ({ icon, title, subtitle, rightElement }) => (
    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--hover-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)' }}>
                {icon} {title}
            </h3>
            {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem', marginBottom: 0 }}>{subtitle}</p>}
        </div>
        {rightElement && <div>{rightElement}</div>}
    </div>
);
window.CardHeader = CardHeader;

const CardBody = ({ children, style, className = '' }) => (
    <div className={`card-body ${className}`} style={{ padding: '1.5rem', ...style }}>
        {children}
    </div>
);
window.CardBody = CardBody;
