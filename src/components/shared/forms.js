const FormInput = ({ label, type = "text", id, ...props }) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9));
    return (
        <div className="auth-input-group">
            {label && <label className="auth-label" htmlFor={inputId}>{label}</label>}
            <input type={type} className="auth-input" id={inputId} name={inputId} {...props} />
        </div>
    );
};
window.FormInput = FormInput;

const FormSelect = ({ label, options = [], id, ...props }) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substr(2, 9));
    return (
        <div className="auth-input-group">
            {label && <label className="auth-label" htmlFor={selectId}>{label}</label>}
            <select className="auth-input" id={selectId} name={selectId} style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }} {...props}>
                {options.map((opt, i) => (
                    <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                        {typeof opt === 'object' ? opt.label : opt}
                    </option>
                ))}
            </select>
        </div>
    );
};
window.FormSelect = FormSelect;
const FormButtons = ({ confirmLabel = "Save Changes", isDanger = false, onClose, onConfirm, isSaving }) => (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center', marginTop: '2.5rem' }}>
        <button type="button" className="auth-btn-text" onClick={onClose} style={{ padding: '0.8rem 1.5rem', background: 'transparent' }}>Cancel</button>
        <button 
            type="button"
            className={isDanger ? "tool-btn remove-btn" : "auth-btn-primary"} 
            onClick={onConfirm} 
            disabled={isSaving}
            style={{ padding: '0.8rem 2rem', minWidth: '140px', margin: 0 }}
        >
            {isSaving ? 'Processing...' : confirmLabel}
        </button>
    </div>
);
window.FormButtons = FormButtons;

