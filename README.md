# Chromatone

**Color → Monochrome Pattern Encoding**

Chromatone is a powerful web-based halftone engine that transforms color images into rich, directional monochrome patterns. Unlike traditional halftones that only encode brightness (value), Chromatone encodes **hue, saturation, and value** simultaneously using a unique system of slashes, dots, and cross-hatching.

## Features

- **Hue Encoding**: Colors are mapped to directional marks:
  - **Red**: Forward slashes (/)
  - **Blue**: Backslashes (\)
  - **Yellow**: Dots (•)
  - **Green**: Backslashes + Dots (\ + •)
  - **Orange**: Forward slashes + Dots (/ + •)
  - **Purple**: Cross-hatching (X)
  - **Gray/Black**: Solid blocks (■)

- **Value Encoding**: Line thickness corresponds to brightness.
  - **Light values (Highlight)**: Thin, delicate lines
  - **Dark values (Shadow)**: Thick, dense lines

- **Saturation Encoding**: Controls line contiguity. Highly saturated colors produce clean, continuous lines; desaturated colors produce broken, textured lines.

- **Real-time Control**: Adjust cell size, scale, and density instantly.
- **Privacy First**: All processing happens locally in your browser. No images are uploaded to any server.

## Usage

1. Open `index.html` in any modern web browser.
2. Drag and drop an image onto the canvas (or click to upload).
3. Adjust the sliders to fine-tune the output:
   - **Cell Size**: Controls the resolution of the halftone grid.
   - **Scale**: Zooms the pattern in/out relative to the cell size.
   - **Min/Max Density**: Adjusts the contrast and line weight range.
4. Click **Process Image** to update the preview.
5. Click **Export PNG** to save your creation.

## Use Cases

- **E-ink Displays**: Create optimized wallpapers for Kindle, reMarkable, etc.
- **Printmaking**: Generate stencils for screen printing, risograph, or linocut.
- **Tattoo Art**: Create transfer-ready shading patterns.
- **Accessibility**: Visualize color differences for colorblind viewers.
- **Digital Art**: Create striking, retro-futuristic monochrome aesthetic.

## Technical Details

Built with vanilla HTML, CSS, and JavaScript. No external dependencies.
The core logic resides in `hatching-engine.js`, which implements a custom RYB-like color model and procedural drawing algorithms.

## Credits

Made by **Joe George** with **Claude Opus 4.5**.
February 2026.

## Support

If you enjoy this tool, consider supporting the development:
[Ko-Fi](https://ko-fi.com/joe_george)
