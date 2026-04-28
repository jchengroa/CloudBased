const AppNavigation = ({ items = [], activeKey, onNavigate, mobileVisible = true }) => {
    const navRef = React.useRef(null);
    const buttonRefs = React.useRef({});
    const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
    const rafRef = React.useRef(null);

    const scheduleIndicatorUpdate = React.useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = requestAnimationFrame(() => {
                const navEl = navRef.current;
                const activeButtonEl = buttonRefs.current[activeKey];

                if (!navEl || !activeButtonEl) {
                    setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
                    return;
                }

                const navRect = navEl.getBoundingClientRect();
                const buttonRect = activeButtonEl.getBoundingClientRect();

                setIndicatorStyle({
                    left: buttonRect.left - navRect.left,
                    top: buttonRect.top - navRect.top,
                    width: buttonRect.width,
                    height: buttonRect.height,
                    opacity: 1
                });
            });
        });
    }, [activeKey]);

    const updateIndicator = React.useCallback(() => {
        const navEl = navRef.current;
        const activeButtonEl = buttonRefs.current[activeKey];

        if (!navEl || !activeButtonEl) {
            setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
            return;
        }

        const navRect = navEl.getBoundingClientRect();
        const buttonRect = activeButtonEl.getBoundingClientRect();

        setIndicatorStyle({
            left: buttonRect.left - navRect.left,
            top: buttonRect.top - navRect.top,
            width: buttonRect.width,
            height: buttonRect.height,
            opacity: 1
        });
    }, [activeKey]);

    React.useLayoutEffect(() => {
        scheduleIndicatorUpdate();
    }, [scheduleIndicatorUpdate, items.length]);

    React.useEffect(() => {
        const navEl = navRef.current;
        if (!navEl) return undefined;

        const resizeObserver = new ResizeObserver(() => {
            scheduleIndicatorUpdate();
        });

        resizeObserver.observe(navEl);
        Object.values(buttonRefs.current).forEach((el) => {
            if (el) resizeObserver.observe(el);
        });

        window.addEventListener('resize', scheduleIndicatorUpdate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            resizeObserver.disconnect();
            window.removeEventListener('resize', scheduleIndicatorUpdate);
        };
    }, [scheduleIndicatorUpdate, items.length]);

    React.useEffect(() => {
        const navEl = navRef.current;
        if (!navEl) return undefined;

        const settleTimerA = setTimeout(scheduleIndicatorUpdate, 120);
        const settleTimerB = setTimeout(scheduleIndicatorUpdate, 260);
        const handleTransitionEnd = (event) => {
            if (
                event.target instanceof Element &&
                (event.target.classList.contains('app-nav-btn') || event.target.classList.contains('app-nav-text'))
            ) {
                scheduleIndicatorUpdate();
            }
        };

        navEl.addEventListener('transitionend', handleTransitionEnd);
        return () => {
            clearTimeout(settleTimerA);
            clearTimeout(settleTimerB);
            navEl.removeEventListener('transitionend', handleTransitionEnd);
        };
    }, [activeKey, scheduleIndicatorUpdate]);

    return (
        <nav
            ref={navRef}
            className={`app-nav ${mobileVisible ? 'mobile-visible' : 'mobile-hidden'}`}
            aria-label="Primary navigation"
        >
            <div
                className="app-nav-indicator"
                style={{
                    left: `${indicatorStyle.left}px`,
                    top: `${indicatorStyle.top}px`,
                    width: `${indicatorStyle.width}px`,
                    height: `${indicatorStyle.height}px`,
                    opacity: indicatorStyle.opacity
                }}
            />
            {items.map((item) => (
                <button
                    key={item.key}
                    ref={(el) => { buttonRefs.current[item.key] = el; }}
                    className={`app-nav-btn ${activeKey === item.key ? 'active' : ''}`}
                    onClick={() => onNavigate(item.key)}
                    title={item.label}
                    type="button"
                >
                    <span className="app-nav-btn-icon">
                        {item.icon}
                    </span>
                    <span className="app-nav-text">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

window.AppNavigation = AppNavigation;
