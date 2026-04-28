/**
 * Validation Logic
 * Centralized verification functions for forms and settings.
 */

const Validation = {
    // Inventory Item Validation
    validateItem: (formData, inventoryData, isEdit, originalId) => {
        if (!formData.id) return 'Item ID is required.';
        if (!formData.name) return 'Item Name is required.';
        if ((parseFloat(formData.optimalStock) || 0) < 0) return 'Optimal stock cannot be negative.';
        
        const isDuplicate = inventoryData.some(i => i.id === formData.id && (!isEdit || i.id !== originalId));
        if (isDuplicate) return `Item ID "${formData.id}" already exists.`;
        
        return null; // Valid
    },

    // Supplier Validation
    validateSupplier: (formData, supplierData, isEdit, originalId) => {
        if (!formData.name) return 'Supplier Name is required.';

        const isNameDuplicate = supplierData.some(s => s.name === formData.name && (!isEdit || s.id !== originalId));
        if (isNameDuplicate) return `Supplier Name "${formData.name}" already exists.`;
        
        return null; // Valid
    },

    // Log Validation (Input/Output)
    validateLog: (formData, inputLogs, outputLogs, isEdit, originalId) => {
        if (!formData.transactionId) return 'Transaction ID is required.';
        if (!formData.itemCode) return 'Please select an item.';
        if (!formData.quantity || (parseFloat(formData.quantity) || 0) <= 0) return 'Quantity must be greater than zero.';
        
        const allLogs = [...inputLogs, ...outputLogs];
        const isDuplicate = allLogs.some(l => l.transactionId === formData.transactionId && (!isEdit || l.transactionId !== originalId));
        if (isDuplicate) return `Transaction ID "${formData.transactionId}" already exists.`;
        
        return null; // Valid
    },

    // Stock Threshold Validation
    validateThreshold: (val) => {
        if (val === '') return { isValid: false, error: "Please input a numerical value properly!" };
        
        const num = parseInt(val, 10);
        if (isNaN(num)) return { isValid: false, error: "Invalid number." };
        if (num < 0) return { isValid: false, error: "Threshold cannot be less than 0!", correctedValue: 0 };
        if (num > 99999) return { isValid: false, error: "Exceeded maximum threshold!", correctedValue: 99999 };
        
        return { isValid: true, value: num };
    },

    // Unit of Measure Validation
    validateUom: (name, existingUoms) => {
        const trimmed = name.trim();
        if (!trimmed) return "Please enter a UOM name.";
        if (existingUoms.map(u => u.toLowerCase()).includes(trimmed.toLowerCase())) return `"${trimmed}" already exists.`;
        return null;
    },

    // Warehouse Validation
    validateWarehouse: (name, existingWarehouses) => {
        const trimmed = name.trim();
        if (!trimmed) return "Please enter a warehouse name.";
        if (existingWarehouses.map(w => w.toLowerCase()).includes(trimmed.toLowerCase())) return `"${trimmed}" already exists.`;
        return null;
    }
};
