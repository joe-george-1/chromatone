/**
 * Color → Hatching Application
 * UI logic and controls
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const inputCanvas = document.getElementById('inputCanvas');
    const outputCanvas = document.getElementById('outputCanvas');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processBtn = document.getElementById('processBtn');
    const exportBtn = document.getElementById('exportBtn');

    // Control elements
    const cellSizeInput = document.getElementById('cellSize');
    const scaleInput = document.getElementById('scale');
    const minDensityInput = document.getElementById('minDensity');
    const maxDensityInput = document.getElementById('maxDensity');

    // Value display elements
    const cellSizeValue = document.getElementById('cellSizeValue');
    const scaleValue = document.getElementById('scaleValue');
    const minDensityValue = document.getElementById('minDensityValue');
    const maxDensityValue = document.getElementById('maxDensityValue');

    // State
    let currentImage = null;
    let engine = new HatchingEngine();

    // Initialize canvases
    const inputCtx = inputCanvas.getContext('2d');
    const outputCtx = outputCanvas.getContext('2d');

    /**
     * Load image onto input canvas
     */
    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;

                // Size canvas to image (with reasonable max)
                const maxSize = 800;
                let width = img.width;
                let height = img.height;

                if (width > maxSize || height > maxSize) {
                    const scale = maxSize / Math.max(width, height);
                    width = Math.floor(width * scale);
                    height = Math.floor(height * scale);
                }

                inputCanvas.width = width;
                inputCanvas.height = height;
                outputCanvas.width = width;
                outputCanvas.height = height;

                // Draw image
                inputCtx.drawImage(img, 0, 0, width, height);

                // Keep drop zone visible but semi-transparent for new uploads
                dropZone.classList.add('has-image');
                processBtn.disabled = false;

                // Auto-process
                processImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Process the image with current settings
     */
    function processImage() {
        if (!currentImage) return;

        // Update engine options
        engine.setOptions({
            cellSize: parseInt(cellSizeInput.value),
            scale: parseFloat(scaleInput.value),
            minDensity: parseFloat(minDensityInput.value),
            maxDensity: parseFloat(maxDensityInput.value)
        });

        // Process
        engine.processImage(inputCanvas, outputCanvas);

        // Enable export
        exportBtn.disabled = false;
    }

    /**
     * Export output as PNG
     */
    function exportImage() {
        const link = document.createElement('a');
        link.download = 'hatched-output.png';
        link.href = outputCanvas.toDataURL('image/png');
        link.click();
    }

    /**
     * Update value displays
     */
    function updateValueDisplays() {
        cellSizeValue.textContent = cellSizeInput.value + 'px';
        scaleValue.textContent = scaleInput.value;
        minDensityValue.textContent = minDensityInput.value;
        maxDensityValue.textContent = maxDensityInput.value;
    }

    // Event listeners - File input
    // Drop zone always clickable for new uploads
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadImage(e.target.files[0]);
        }
    });

    // Drag and drop - always active
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragging');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragging');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragging');

        if (e.dataTransfer.files.length > 0) {
            loadImage(e.dataTransfer.files[0]);
        }
    });

    // Controls - with debounced live update
    let processTimeout;
    function handleControlChange() {
        updateValueDisplays();

        // Debounce processing
        clearTimeout(processTimeout);
        processTimeout = setTimeout(() => {
            processImage();
        }, 100);
    }

    cellSizeInput.addEventListener('input', handleControlChange);
    scaleInput.addEventListener('input', handleControlChange);
    minDensityInput.addEventListener('input', handleControlChange);
    maxDensityInput.addEventListener('input', handleControlChange);

    // Buttons
    processBtn.addEventListener('click', processImage);
    exportBtn.addEventListener('click', exportImage);

    // Modal handlers
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutModal = document.getElementById('aboutModal');
    const closeModal = document.getElementById('closeModal');

    aboutBtn.addEventListener('click', () => {
        aboutModal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        aboutModal.classList.remove('active');
    });

    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutModal.classList.contains('active')) {
            aboutModal.classList.remove('active');
        }
    });

    // Initialize value displays
    updateValueDisplays();
});
