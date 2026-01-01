# PWA Icons

This directory contains icons for the Progressive Web App.

## Required Icons

The following icons are needed for full PWA support:

- `icon-72x72.png` - Android Chrome
- `icon-96x96.png` - Android Chrome
- `icon-128x128.png` - Android Chrome
- `icon-144x144.png` - Android Chrome, Windows
- `icon-152x152.png` - iOS Safari
- `icon-192x192.png` - Android Chrome (standard)
- `icon-384x384.png` - Android Chrome
- `icon-512x512.png` - Android Chrome (high-res)

## Icon Design Guidelines

- **Background**: SBB Red (#A5061C)
- **Foreground**: White
- **Symbol**: Train icon or "SBB" text
- **Padding**: 10% safe area around the icon
- **Format**: PNG with transparency support

## Generating Icons

You can generate all required sizes from a single 512x512 source image using:

### Online Tools:

- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

### Command Line (ImageMagick):

```bash
# From a 512x512 source image
convert icon-512x512.png -resize 72x72 icon-72x72.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
```

## Temporary Placeholder

Until proper icons are created, the app will use default browser icons. To add
proper icons, place the PNG files in this directory following the naming
convention above.
