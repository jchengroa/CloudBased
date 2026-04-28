// --- IMAGE UTILITY ---
// Resizes and compresses images to fit within Firestore document limits (~1MB)
window.resizeImage = (file, maxSide = 500) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSide) {
                        height *= maxSide / width;
                        width = maxSide;
                    }
                } else {
                    if (height > maxSide) {
                        width *= maxSide / height;
                        height = maxSide;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height); // Ensure transparency
                ctx.drawImage(img, 0, 0, width, height);
                // Switch to PNG to preserve transparency (JPEG adds white background)
                resolve(canvas.toDataURL('image/png')); 
            };
        };
    });
};

window.formatStockQuantity = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return '0';

    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(numericValue);
};
