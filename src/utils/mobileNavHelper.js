/**
 * Mobile bottom navigation helper.
 * Hides the bottom nav while actively scrolling down and restores it
 * when the user scrolls up, pauses, or reaches the edges of the content.
 */
(function() {
    const MOBILE_BREAKPOINT = 680;
    const TOP_BUFFER = 15;
    const BOTTOM_BUFFER = 20;
    const DELTA_THRESHOLD = 10;
    const IDLE_DELAY_MS = 250;
    const THROTTLE_MS = 16; // ~60fps throttle

    window.useMobileBottomNav = (containerRef, deps = []) => {
        const [isVisible, setIsVisible] = React.useState(true);
        const idleTimerRef = React.useRef(null);
        const lastScrollTopRef = React.useRef(0);
        const lastTimestampRef = React.useRef(0);

        React.useEffect(() => {
            const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

            const clearIdleTimer = () => {
                if (idleTimerRef.current) {
                    clearTimeout(idleTimerRef.current);
                    idleTimerRef.current = null;
                }
            };

            const scheduleIdleReveal = () => {
                clearIdleTimer();
                idleTimerRef.current = setTimeout(() => {
                    if (isMobileViewport()) setIsVisible(true);
                }, IDLE_DELAY_MS);
            };

            const syncVisibility = () => {
                const now = Date.now();
                if (now - lastTimestampRef.current < THROTTLE_MS) return;
                lastTimestampRef.current = now;

                const container = containerRef.current;
                if (!container) return;

                if (!isMobileViewport()) {
                    lastScrollTopRef.current = container.scrollTop || 0;
                    setIsVisible(true);
                    return;
                }

                const currentScrollTop = container.scrollTop || 0;
                const scrollHeight = container.scrollHeight;
                const clientHeight = container.clientHeight;
                const delta = currentScrollTop - lastScrollTopRef.current;

                // Edge cases: Always show if at top or bottom of the container
                const isNearTop = currentScrollTop <= TOP_BUFFER;
                const isNearBottom = (scrollHeight - currentScrollTop - clientHeight) <= BOTTOM_BUFFER;

                if (isNearTop || isNearBottom) {
                    setIsVisible(true);
                } else if (Math.abs(delta) > DELTA_THRESHOLD) {
                    // Only change visibility if the scroll is deliberate (> DELTA_THRESHOLD)
                    if (delta > 0) {
                        setIsVisible(false);
                    } else {
                        setIsVisible(true);
                    }
                }

                lastScrollTopRef.current = currentScrollTop;
                scheduleIdleReveal();
            };

            const handleViewportChange = () => {
                const container = containerRef.current;
                if (!container) return;
                
                lastScrollTopRef.current = container.scrollTop || 0;
                if (!isMobileViewport()) {
                    setIsVisible(true);
                    clearIdleTimer();
                } else {
                    syncVisibility();
                }
            };

            const container = containerRef.current;
            if (!container) return undefined;

            lastScrollTopRef.current = container.scrollTop || 0;
            setIsVisible(true);

            container.addEventListener('scroll', syncVisibility, { passive: true });
            window.addEventListener('resize', handleViewportChange);
            window.addEventListener('orientationchange', handleViewportChange);

            return () => {
                clearIdleTimer();
                container.removeEventListener('scroll', syncVisibility);
                window.removeEventListener('resize', handleViewportChange);
                window.removeEventListener('orientationchange', handleViewportChange);
            };
        }, [containerRef, ...deps]);

        return isVisible;
    };
})();
