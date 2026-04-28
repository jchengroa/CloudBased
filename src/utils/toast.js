/**
 * Toast Utility
 * A lightweight, premium toast notification system.
 */
window.Toast = {
    _container: null,

    _init() {
        if (this._container) return;
        this._container = document.createElement('div');
        this._container.id = 'toast-container';
        this._container.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            pointer-events: none;
        `;
        document.body.appendChild(this._container);

        const style = document.createElement('style');
        style.textContent = `
            .toast-item {
                background: var(--glass-bg, rgba(23, 23, 23, 0.8));
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
                color: var(--text-primary, #fff);
                padding: 1rem 1.5rem;
                border-radius: 16px;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
                display: flex;
                align-items: center;
                gap: 0.8rem;
                min-width: 280px;
                max-width: 420px;
                animation: toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                transition: all 0.3s ease;
                pointer-events: auto;
            }
            .toast-item.exiting {
                animation: toast-out 0.3s ease forwards;
            }
            .toast-icon {
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .toast-content {
                flex: 1;
            }
            .toast-title {
                font-weight: 700;
                font-size: 0.95rem;
                margin-bottom: 0.1rem;
            }
            .toast-message {
                font-size: 0.85rem;
                opacity: 0.8;
                font-weight: 500;
            }
            .toast-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 4px;
                opacity: 0.5;
                transition: opacity 0.2s;
            }
            .toast-close:hover { opacity: 1; }
            
            @keyframes toast-in {
                from { transform: translateX(120%) scale(0.9); opacity: 0; }
                to { transform: translateX(0) scale(1); opacity: 1; }
            }
            @keyframes toast-out {
                from { transform: translateX(0) scale(1); opacity: 1; }
                to { transform: translateX(120%) scale(0.9); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    },

    show(title, message, type = 'info', duration = 4000) {
        this._init();
        
        const toast = document.createElement('div');
        toast.className = 'toast-item';
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: 'var(--accent-color, #6366f1)'
        };
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '!',
            info: 'i'
        };

        toast.innerHTML = `
            <div class="toast-icon" style="color: ${colors[type]}">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close">✕</button>
        `;

        toast.querySelector('.toast-close').onclick = () => this.dismiss(toast);
        this._container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }
    },

    dismiss(toast) {
        toast.classList.add('exiting');
        toast.onanimationend = () => toast.remove();
    },

    success(title, message, duration) { this.show(title, message, 'success', duration); },
    error(title, message, duration) { this.show(title, message, 'error', duration); },
    warn(title, message, duration) { this.show(title, message, 'warning', duration); },
    info(title, message, duration) { this.show(title, message, 'info', duration); }
};
