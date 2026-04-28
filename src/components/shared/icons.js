/** @jsx React.createElement */

const createBuiltInIcon = (children, defaultSize = 20, defaultStrokeWidth = 2) => {
    const Icon = ({
        size = defaultSize,
        width,
        height,
        color,
        stroke,
        strokeWidth = defaultStrokeWidth,
        style,
        className,
        onClick,
        title,
        ...rest
    }) => (
        <svg
            width={width || size}
            height={height || size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={stroke || color || 'currentColor'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            shapeRendering="geometricPrecision"
            style={{ display: 'block', flexShrink: 0, overflow: 'hidden', ...style }}
            className={className}
            onClick={onClick}
            aria-hidden={title ? undefined : true}
            role={title ? 'img' : undefined}
            data-icon-name="builtin"
            {...rest}
        >
            {title ? <title>{title}</title> : null}
            {children}
        </svg>
    );

    return Icon;
};

const BUILT_IN_ICON_REGISTRY = Object.freeze({
    Search: createBuiltInIcon(<><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></>, 18, 2.25),
    Plus: createBuiltInIcon(<><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></>, 18, 2.25),
    Edit: createBuiltInIcon(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></>, 16, 2.25),
    Trash: createBuiltInIcon(<><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></>, 16, 2.25),
    Alert: createBuiltInIcon(<><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></>, 48, 1.75),
    Sort: createBuiltInIcon(<><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="14" y2="12"></line><line x1="4" y1="18" x2="8" y2="18"></line></>, 18, 2),
    SortAZ: createBuiltInIcon(<><path d="m3 16 4 4 4-4"></path><path d="M7 20V4"></path><path d="M11 4h4a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h4"></path><path d="M11 12h4"></path></>, 16, 2),
    SortZA: createBuiltInIcon(<><path d="m3 8 4-4 4 4"></path><path d="M7 4v16"></path><path d="M11 12h4"></path><path d="M11 4h4a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h4"></path></>, 16, 2),
    TrendingUp: createBuiltInIcon(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></>, 16, 2),
    TrendingDown: createBuiltInIcon(<><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></>, 16, 2),
    ChevronDown: createBuiltInIcon(<polyline points="6 9 12 15 18 9"></polyline>, 16, 2.25),
    ChevronLeft: createBuiltInIcon(<polyline points="15 18 9 12 15 6"></polyline>, 16, 2.25),
    ChevronRight: createBuiltInIcon(<polyline points="9 18 15 12 9 6"></polyline>, 16, 2.25),
    ArrowLeft: createBuiltInIcon(<><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></>, 24, 2),
    ArrowRight: createBuiltInIcon(<><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></>, 24, 2),
    Close: createBuiltInIcon(<><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>, 20, 2.25),
    X: createBuiltInIcon(<><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>, 20, 2.25),
    Check: createBuiltInIcon(<polyline points="20 6 9 17 4 12"></polyline>, 24, 3),
    Box: createBuiltInIcon(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></>, 24, 2),
    Users: createBuiltInIcon(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></>, 24, 2),
    User: createBuiltInIcon(<><path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="7" r="4"></circle></>, 20, 2),
    ArrowDownCircle: createBuiltInIcon(<><circle cx="12" cy="12" r="10"></circle><polyline points="8 12 12 16 16 12"></polyline><line x1="12" y1="8" x2="12" y2="16"></line></>, 24, 2),
    ArrowUpCircle: createBuiltInIcon(<><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></>, 24, 2),
    AlertTriangle: createBuiltInIcon(<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></>, 24, 2),
    PieChart: createBuiltInIcon(<><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></>, 24, 2),
    Activity: createBuiltInIcon(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>, 24, 2),
    Dashboard: createBuiltInIcon(<><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></>, 24, 2.25),
    List: createBuiltInIcon(<><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></>, 24, 2.25),
    Layers: createBuiltInIcon(<><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></>, 24, 2.25),
    Truck: createBuiltInIcon(<><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></>, 24, 2.25),
    FileSpreadsheet: createBuiltInIcon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h2"></path><path d="M14 13h2"></path><path d="M8 17h2"></path><path d="M14 17h2"></path></>, 24, 2),
    Settings: createBuiltInIcon(<><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></>, 24, 1.8),
    Shield: createBuiltInIcon(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>, 24, 2),
    FileText: createBuiltInIcon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></>, 24, 2),
    UploadCloud: createBuiltInIcon(<><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path></>, 24, 2),
    Image: createBuiltInIcon(<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></>, 24, 2),
    Link: createBuiltInIcon(<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></>, 24, 2),
    Globe: createBuiltInIcon(<><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></>, 24, 2),
    AlertCircle: createBuiltInIcon(<><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></>, 18, 2.25),
    Download: createBuiltInIcon(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></>, 24, 2),
    Sun: createBuiltInIcon(<><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></>, 24, 2),
    Moon: createBuiltInIcon(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>, 24, 2),
    Home: createBuiltInIcon(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></>, 24, 2),
    Eye: createBuiltInIcon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>, 24, 2),
    EyeOff: createBuiltInIcon(<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></>, 24, 2),
    Maximize: createBuiltInIcon(<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>, 24, 2),
    Minimize: createBuiltInIcon(<><path d="M4 14h6m0 0v6m0-6l-7 7m17-7h-6m0 0v6m0-6l7 7M20 4l-7 7M4 4l7 7"></path></>, 24, 2),
    ArrowLeftCircle: createBuiltInIcon(<><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line></>, 24, 2),
    ArrowRightCircle: createBuiltInIcon(<><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></>, 24, 2),
    RotateCw: createBuiltInIcon(<><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></>, 18, 2.25),
    Grid: createBuiltInIcon(<><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></>, 24, 2),
    Sheet: createBuiltInIcon(<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></>, 24, 2),
    Database: createBuiltInIcon(<><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></>, 24, 2),
    Lock: createBuiltInIcon(<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></>, 24, 2),
    Move: createBuiltInIcon(<><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></>, 24, 2),
    Undo: createBuiltInIcon(<><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></>, 20, 2),
    Redo: createBuiltInIcon(<><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path></>, 20, 2),
    Question: createBuiltInIcon(<><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></>, 20, 2)
});

const ICON_ALIAS_MAP = Object.freeze({
    Search1: 'Search',
    Search2: 'Search',
    AlertCircle: 'Alert',
    AlertTriangle: 'AlertTriangle',
    SortAZ: 'SortAZ',
    SortZA: 'SortZA',
    TrendingUp: 'TrendingUp',
    TrendingDown: 'TrendingDown',
    ChevronDown: 'ChevronDown',
    ChevronLeft: 'ChevronLeft',
    ChevronRight: 'ChevronRight',
    ArrowLeft: 'ChevronLeft',
    ArrowRight: 'ChevronRight',
    ArrowDownCircle: 'ArrowDownCircle',
    ArrowUpCircle: 'ArrowUpCircle',
    ArrowLeftCircle: 'ArrowLeftCircle',
    ArrowRightCircle: 'ArrowRightCircle',
    Close: 'Close',
    X: 'X',
    Check: 'Check',
    Box: 'Box',
    User: 'User',
    Users: 'Users',
    Book: 'FileText',
    Info: 'AlertCircle',
    Palette: 'Image',
    Refresh: 'RotateCw',
    RotateCw: 'RotateCw',
    Activity: 'Activity',
    PieChart: 'PieChart',
    Dashboard: 'Dashboard',
    Grid: 'Grid',
    List: 'List',
    Layers: 'Layers',
    Truck: 'Truck',
    FileSpreadsheet: 'FileSpreadsheet',
    FileText: 'FileText',
    Settings: 'Settings',
    Shield: 'Shield',
    UploadCloud: 'UploadCloud',
    Download: 'Download',
    Image: 'Image',
    Link: 'Link',
    Globe: 'Globe',
    Sun: 'Sun',
    Moon: 'Moon',
    Home: 'Home',
    Eye: 'Eye',
    EyeOff: 'EyeOff',
    Maximize: 'Maximize',
    Minimize: 'Minimize',
    Sheet: 'Sheet',
    Database: 'Database',
    Lock: 'Lock',
    Move: 'Move',
    Undo: 'Undo',
    Redo: 'Redo',
    Question: 'Question',
    question_cr: 'Question'
});

const COMPONENT_CACHE = new Map();

const isReservedIconProp = (prop) => (
    typeof prop !== 'string' ||
    prop.startsWith('__') ||
    prop === '$$typeof' ||
    prop === 'displayName' ||
    prop === 'name' ||
    prop === 'prototype'
);

const normalizeIconKey = (value) => (
    String(value || '')
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase()
);

const toPascalCase = (value) => (
    normalizeIconKey(value)
        .split('_')
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('')
);

const FALLBACK_ICON_NAME = 'Question';

const resolveIconBaseName = (name) => {
    if (isReservedIconProp(name)) {
        return undefined;
    }

    const alias = ICON_ALIAS_MAP[name];
    if (alias) {
        return alias;
    }

    const pascalName = toPascalCase(name);
    if (BUILT_IN_ICON_REGISTRY[pascalName]) {
        return pascalName;
    }

    return FALLBACK_ICON_NAME
};

const IconFallback = ({
    size = 18,
    width,
    height,
    color,
    className,
    style,
    title,
    onClick,
    ...rest
}) => (
    <span
        className={className}
        onClick={onClick}
        title={title}
        data-icon-name="fallback"
        style={{
            width: width || size,
            height: height || size,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            lineHeight: 0,
            verticalAlign: 'middle',
            color: color || 'currentColor',
            ...style
        }}
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : undefined}
        {...rest}
    >
        <svg width="100%" height="100%" viewBox="0 0 16 16" fill="currentColor" focusable="false" aria-hidden="true">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13Zm0 9.75a.875.875 0 1 1 0 1.75a.875.875 0 0 1 0-1.75Zm1-1.75H7V4.25h2v5.25Z"></path>
        </svg>
    </span>
);

const getIconComponent = (name) => {
    if (!isReservedIconProp(name) && BUILT_IN_ICON_REGISTRY[name]) {
        return BUILT_IN_ICON_REGISTRY[name];
    }

    const baseName = resolveIconBaseName(name);

    if (!baseName) {
        return IconFallback;
    }

    return BUILT_IN_ICON_REGISTRY[baseName] || IconFallback;
};

const createIconProxy = () => new Proxy({}, {
    get: (_, prop) => getIconComponent(prop),
    has: (_, prop) => !isReservedIconProp(prop),
    ownKeys: () => {
        const explicitNames = [...Object.keys(BUILT_IN_ICON_REGISTRY), ...Object.keys(ICON_ALIAS_MAP)];
        return Array.from(new Set(explicitNames)).sort();
    },
    getOwnPropertyDescriptor: (_, prop) => {
        if (isReservedIconProp(prop)) {
            return undefined;
        }

        return {
            configurable: true,
            enumerable: true,
            writable: false,
            value: getIconComponent(prop)
        };
    }
});

const SafeIcons = createIconProxy();
const IconRegistry = createIconProxy();

window.Icons = IconRegistry;
window.SafeIcons = SafeIcons;
window.resolveIcon = getIconComponent;
window.createIconProxy = createIconProxy;
window.renderIcon = (name, props = {}) => {
    const Icon = getIconComponent(name);
    return Icon ? <Icon {...props} /> : null;
};
window.iconAliasMap = ICON_ALIAS_MAP;
window.iconManifest = [];

const exportedIconNames = Array.from(new Set([
    ...Object.keys(BUILT_IN_ICON_REGISTRY),
    ...Object.keys(ICON_ALIAS_MAP)
]));

exportedIconNames.forEach((key) => {
    window[`${key}Icon`] = getIconComponent(key);
});
