/**
 * Shared UI Components
 * Houses reusable elements used across multiple views to reduce duplication.
 */

// Dropdown filter pill button
const SortButton = ({ sortOptions, currentSortKey, onSortChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropRef = React.useRef(null);

    // close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeLabel = sortOptions.find(o => o.key === currentSortKey)?.label || 'Sort';

    return (
        <div className="sort-wrapper" ref={dropRef}>
            <button
                className={`sort-btn ${currentSortKey ? 'sort-btn-active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Sort"
            >
                {activeLabel}
            </button>
            {isOpen && (
                <div className="sort-dropdown">
                    {currentSortKey && (
                        <button
                            className="sort-option sort-option-clear"
                            onClick={() => { onSortChange(''); setIsOpen(false); }}
                        >
                            ✕ Clear Sort
                        </button>
                    )}
                    {sortOptions.map(opt => (
                        <button
                            key={opt.key}
                            className={`sort-option ${currentSortKey === opt.key ? 'sort-option-selected' : ''}`}
                            onClick={() => { onSortChange(opt.key); setIsOpen(false); }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Pill group navigation (used in InventoryTable logs)
const ViewSwitcher = ({ activeView, setActiveView, options }) => (
    <div className="view-switcher">
        {options.map(v => (
            <button
                key={v.key}
                className={`view-switcher-btn ${activeView === v.key ? 'active' : ''}`}
                onClick={() => setActiveView(v.key)}
            >
                {v.label}
            </button>
        ))}
    </div>
);
