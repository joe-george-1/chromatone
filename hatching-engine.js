/**
 * Hatching Engine v4 - Final Calibration
 * Converts color images to monochrome using directional patterns
 * 
 * Shape Logic:
 * - Red    → Diagonal (/) - contiguous at high sat, dashed at low
 * - Blue   → Diagonal (\) - same behavior
 * - Yellow → Dots (•) - small size, scales subtly with value
 * - Orange → (/) + (•)
 * - Green  → (\) + (•)  
 * - Purple/Indigo → Cross-hatch (X)
 * - Gray/Black → Squares (■) with smooth transition to chromatic
 */

class HatchingEngine {
    constructor(options = {}) {
        this.cellSize = options.cellSize || 8;
        this.scale = options.scale || 1.0;
        this.minDensity = options.minDensity || 0.1;
        this.maxDensity = options.maxDensity || 1.0;
    }

    setOptions(options) {
        Object.assign(this, options);
    }

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;

        if (max === min) {
            return { h: 0, s: 0, l };
        }

        const d = max - min;
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        let h;
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }

        return { h: h * 360, s, l };
    }

    /**
     * Analyze color and return pattern instructions
     * Smooth transition between achromatic (squares) and chromatic (hatching)
     */
    analyzeColor(r, g, b) {
        const { h, s, l } = this.rgbToHsl(r, g, b);
        const hue = ((h % 360) + 360) % 360;
        const value = 1 - l;  // Darkness: 0 = white, 1 = black

        // Smooth transition zone for saturation
        // Below 0.10: pure squares (achromatic)
        // 0.10-0.25: blend squares with hatching
        // Above 0.25: pure hatching (chromatic)
        const grayThreshold = 0.10;
        const blendThreshold = 0.25;

        if (s < grayThreshold) {
            return {
                type: 'gray',
                value: value,
                saturation: s,
                chromaBlend: 0
            };
        }

        // Calculate blend factor for smooth transition
        const chromaBlend = s < blendThreshold
            ? (s - grayThreshold) / (blendThreshold - grayThreshold)
            : 1;

        // Determine primary color components based on hue
        // Refined for RICH TERTIARY TRANSITIONS with extended dot/line tapers
        let redAmount = 0, blueAmount = 0, yellowAmount = 0;

        // POLISHED RYB mapping with smooth tertiary blends:
        // - Yellow dots extend deep into orange (starting at hue 15)
        // - Yellow dots persist through green (until hue 180)
        // - Purple has gradual red/blue line tapers for rich cross-hatch

        if (hue < 15) {
            // Pure Red - no yellow yet
            redAmount = 1;
        } else if (hue < 30) {
            // Red-Orange: red starting to fade, yellow dots fading IN
            redAmount = 1 - (hue - 15) / 50;  // Red starts tapering at hue 15
            yellowAmount = (hue - 15) / 25;    // Yellow dots come in faster
        } else if (hue < 45) {
            // Orange: red fading OUT faster, yellow dominant
            redAmount = 0.7 - (hue - 30) / 25;  // Red fades to ~0.1 by hue 45 (was 0.4)
            yellowAmount = 0.6 + (hue - 30) / 40;  // Yellow strong
        } else if (hue < 90) {
            // Pure Yellow - WIDE RANGE (no red!)
            yellowAmount = 1;
            redAmount = 0;
        } else if (hue < 130) {
            // Yellow-Green: yellow strong, blue tapering IN
            yellowAmount = 1 - (hue - 90) / 80;  // Yellow fades slowly
            blueAmount = (hue - 90) / 80 * 0.6;  // Blue lines taper in gently
        } else if (hue < 180) {
            // Green: yellow dots persist, blue lines present
            yellowAmount = 0.5 - (hue - 130) / 100;  // Yellow extends deep!
            blueAmount = 0.6 + (hue - 130) / 100;
        } else if (hue < 210) {
            // Cyan: trace yellow for warmth
            blueAmount = 1;
            yellowAmount = Math.max(0, 0.25 - (hue - 180) / 120);
        } else if (hue < 240) {
            // Pure Blue
            blueAmount = 1;
        } else if (hue < 270) {
            // Blue-Indigo: red lines tapering IN for cross-hatch
            blueAmount = 1;
            redAmount = (hue - 240) / 60 * 0.5;  // Red taper starts early
        } else if (hue < 310) {
            // Purple: rich cross-hatch with balanced red/blue tapers
            blueAmount = 1 - (hue - 270) / 80 * 0.4;  // Blue fades slowly
            redAmount = 0.5 + (hue - 270) / 80 * 0.5;  // Red rises smoothly
        } else if (hue < 340) {
            // Magenta: red dominant, blue tapering OUT
            redAmount = 1;
            blueAmount = 0.6 - (hue - 310) / 60;  // Blue lines taper out
        } else {
            // Magenta to Red: trace blue for purple tint
            redAmount = 1;
            blueAmount = Math.max(0, 0.3 - (hue - 340) / 40);
        }

        // Determine pattern type
        let type = 'mixed';

        if (redAmount > 0.6 && blueAmount > 0.4) {
            type = 'purple';
        } else if (redAmount > 0.6 && yellowAmount < 0.15 && blueAmount < 0.15) {
            type = 'red';
        } else if (blueAmount > 0.6 && yellowAmount < 0.15 && redAmount < 0.15) {
            type = 'blue';
        } else if (yellowAmount > 0.7 && redAmount < 0.15 && blueAmount < 0.15) {
            type = 'yellow';
        } else if (redAmount > 0.25 && yellowAmount > 0.25 && blueAmount < 0.2) {
            type = 'orange';
        } else if (blueAmount > 0.25 && yellowAmount > 0.2 && redAmount < 0.2) {
            type = 'green';
        }

        return {
            type,
            redAmount,
            blueAmount,
            yellowAmount,
            value,
            saturation: s,
            chromaBlend
        };
    }

    /**
     * Draw diagonal line (/) for red
     * Lines taper BOTH toward white AND toward black
     */
    drawRedLine(ctx, x, y, size, value, saturation) {
        // value² creates smooth tapering - thin for pastels, thick for darks
        const thickness = this.scale * (0.5 + value * value * 3.5);
        if (thickness < 0.3) return;  // Skip nearly invisible lines
        ctx.lineWidth = thickness;

        const contiguity = saturation;
        const lineLength = size * (0.3 + contiguity * 0.7);
        const offset = (size - lineLength) / 2;

        ctx.beginPath();
        if (contiguity > 0.7) {
            ctx.moveTo(x, y + size);
            ctx.lineTo(x + size, y);
        } else {
            ctx.moveTo(x + offset, y + size - offset);
            ctx.lineTo(x + size - offset, y + offset);
        }
        ctx.stroke();
    }

    /**
     * Draw diagonal line (\) for blue
     * Lines taper BOTH toward white AND toward black
     */
    drawBlueLine(ctx, x, y, size, value, saturation) {
        // value² creates smooth tapering - thin for pastels, thick for darks
        const thickness = this.scale * (0.5 + value * value * 3.5);
        if (thickness < 0.3) return;  // Skip nearly invisible lines
        ctx.lineWidth = thickness;

        const contiguity = saturation;
        const lineLength = size * (0.3 + contiguity * 0.7);
        const offset = (size - lineLength) / 2;

        ctx.beginPath();
        if (contiguity > 0.7) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y + size);
        } else {
            ctx.moveTo(x + offset, y + offset);
            ctx.lineTo(x + size - offset, y + size - offset);
        }
        ctx.stroke();
    }

    /**
     * Draw dot for yellow
     * CALIBRATED: Smaller dots, more subtle scaling
     */
    drawDot(ctx, x, y, size, value, amount = 1) {
        const centerX = x + size / 2;
        const centerY = y + size / 2;

        // Smaller max radius - yellow should be light/subtle
        const maxRadius = size * 0.22 * this.scale;
        const minRadius = size * 0.05 * this.scale;

        // Gentler value scaling - don't make dots too big for dark yellows
        const valueScale = 0.3 + value * 0.7;
        const radius = minRadius + (maxRadius - minRadius) * valueScale * amount;

        if (radius < 0.4) return;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw square for grays/blacks
     * Now unified with Scale parameter
     */
    drawSquare(ctx, x, y, size, value) {
        // Apply scale to square size for consistency with other patterns
        const baseSize = size * value * 0.85;
        const squareSize = baseSize * this.scale;
        if (squareSize < 0.8) return;

        // Center the square in the cell
        const offset = (size - squareSize) / 2;
        ctx.fillRect(x + offset, y + offset, squareSize, squareSize);
    }

    /**
     * Draw cross-hatch for purple
     */
    drawCrossHatch(ctx, x, y, size, value, saturation) {
        this.drawRedLine(ctx, x, y, size, value, saturation);
        this.drawBlueLine(ctx, x, y, size, value, saturation);
    }

    /**
     * Process entire image
     */
    processImage(inputCanvas, outputCanvas) {
        const width = inputCanvas.width;
        const height = inputCanvas.height;

        outputCanvas.width = width;
        outputCanvas.height = height;

        const inputCtx = inputCanvas.getContext('2d');
        const outputCtx = outputCanvas.getContext('2d');

        const imageData = inputCtx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        // White background
        outputCtx.fillStyle = '#ffffff';
        outputCtx.fillRect(0, 0, width, height);

        // Pure black only
        outputCtx.strokeStyle = '#000000';
        outputCtx.fillStyle = '#000000';
        outputCtx.lineCap = 'round';

        for (let cy = 0; cy < height; cy += this.cellSize) {
            for (let cx = 0; cx < width; cx += this.cellSize) {
                const sampleX = Math.min(cx + Math.floor(this.cellSize / 2), width - 1);
                const sampleY = Math.min(cy + Math.floor(this.cellSize / 2), height - 1);
                const idx = (sampleY * width + sampleX) * 4;

                const r = pixels[idx];
                const g = pixels[idx + 1];
                const b = pixels[idx + 2];

                const cellWidth = Math.min(this.cellSize, width - cx);
                const cellHeight = Math.min(this.cellSize, height - cy);
                const size = Math.min(cellWidth, cellHeight);

                const analysis = this.analyzeColor(r, g, b);

                if (analysis.value < this.minDensity) continue;

                const effectiveValue = Math.min(analysis.value, this.maxDensity);

                // Handle smooth gray-to-color transition
                if (analysis.type === 'gray' || analysis.chromaBlend < 1) {
                    // Draw square component (achromatic base)
                    const squareWeight = 1 - (analysis.chromaBlend || 0);
                    if (squareWeight > 0.1) {
                        this.drawSquare(outputCtx, cx, cy, size, effectiveValue * squareWeight);
                    }

                    // If in transition zone, also draw color component
                    if (analysis.chromaBlend > 0 && analysis.type !== 'gray') {
                        const colorWeight = analysis.chromaBlend;
                        this.drawColorPattern(outputCtx, cx, cy, size, analysis, effectiveValue * colorWeight);
                    }
                } else {
                    // Pure chromatic - draw color pattern only
                    this.drawColorPattern(outputCtx, cx, cy, size, analysis, effectiveValue);
                }
            }
        }

        return outputCanvas;
    }

    /**
     * Draw the appropriate color pattern based on analysis
     */
    drawColorPattern(ctx, x, y, size, analysis, value) {
        switch (analysis.type) {
            case 'red':
                this.drawRedLine(ctx, x, y, size, value, analysis.saturation);
                break;

            case 'blue':
                this.drawBlueLine(ctx, x, y, size, value, analysis.saturation);
                break;

            case 'yellow':
                this.drawDot(ctx, x, y, size, value);
                break;

            case 'orange':
                this.drawRedLine(ctx, x, y, size, value, analysis.saturation);
                this.drawDot(ctx, x, y, size, value, analysis.yellowAmount * 0.8);
                break;

            case 'green':
                this.drawBlueLine(ctx, x, y, size, value, analysis.saturation);
                this.drawDot(ctx, x, y, size, value, analysis.yellowAmount * 0.8);
                break;

            case 'purple':
                this.drawCrossHatch(ctx, x, y, size, value, analysis.saturation);
                break;

            default:
                // Mixed colors - draw proportionally
                if (analysis.redAmount > 0.15) {
                    this.drawRedLine(ctx, x, y, size, value * analysis.redAmount, analysis.saturation);
                }
                if (analysis.blueAmount > 0.15) {
                    this.drawBlueLine(ctx, x, y, size, value * analysis.blueAmount, analysis.saturation);
                }
                if (analysis.yellowAmount > 0.15) {
                    this.drawDot(ctx, x, y, size, value, analysis.yellowAmount * 0.7);
                }
                break;
        }
    }
}

window.HatchingEngine = HatchingEngine;
