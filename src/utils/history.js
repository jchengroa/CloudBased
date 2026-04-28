/**
 * History Utility
 * Provides a modular Undo/Redo management system for the application.
 * Optimized for React hooks and global action tracking.
 */

const useHistory = (maxDepth = 20) => {
    const [history, setHistory] = React.useState({ undoStack: [], redoStack: [] });

    /**
     * Pushes a new action onto the undo stack and clears the redo stack.
     * @param {Object} action - The action details { type, items, data, originalData, ... }
     */
    const pushAction = (action) => {
        if (!action || !action.type) return;
        
        setHistory(prev => ({
            undoStack: [...prev.undoStack, { ...action, timestamp: Date.now() }].slice(-maxDepth),
            redoStack: []
        }));
    };

    /**
     * Executes an undo operation by popping from the undo stack and pushing to the redo stack.
     * @param {Function} handleUndo - Callback to execute the actual reversal logic.
     */
    const performUndo = async (handleUndo) => {
        if (history.undoStack.length === 0) return null;

        const action = history.undoStack[history.undoStack.length - 1];
        try {
            await handleUndo(action);
            setHistory(prev => ({
                undoStack: prev.undoStack.slice(0, -1),
                redoStack: [...prev.redoStack, action]
            }));
            return action;
        } catch (error) {
            console.error("Undo failed:", error);
            throw error;
        }
    };

    /**
     * Executes a redo operation by popping from the redo stack and pushing back to the undo stack.
     * @param {Function} handleRedo - Callback to execute the actual restoration logic.
     */
    const performRedo = async (handleRedo) => {
        if (history.redoStack.length === 0) return null;

        const action = history.redoStack[history.redoStack.length - 1];
        try {
            await handleRedo(action);
            setHistory(prev => ({
                undoStack: [...prev.undoStack, action],
                redoStack: prev.redoStack.slice(0, -1)
            }));
            return action;
        } catch (error) {
            console.error("Redo failed:", error);
            throw error;
        }
    };

    const clearHistory = () => setHistory({ undoStack: [], redoStack: [] });

    return {
        undoStack: history.undoStack,
        redoStack: history.redoStack,
        canUndo: history.undoStack.length > 0,
        canRedo: history.redoStack.length > 0,
        pushToHistory: pushAction,
        undo: performUndo,
        redo: performRedo,
        clearHistory
    };
};

window.useHistory = useHistory;
