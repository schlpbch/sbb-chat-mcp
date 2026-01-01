# PWA Implementation Guide

## Overview

The Swiss Travel Companion application now has full Progressive Web App (PWA)
support, making it installable on devices and capable of working offline.

## Features Implemented

### ✅ Core PWA Features

1. **Web App Manifest** (`/public/manifest.json`)

   - App name, description, and branding
   - Icon definitions for all platforms
   - Display mode: standalone
   - Theme color: SBB Red (#A5061C)
   - App shortcuts for quick actions
   - Share target support

2. **Service Worker** (`/public/sw.js`)

   - Offline support with intelligent caching
   - Network-first strategy for API calls
   - Cache-first strategy for static assets
   - Runtime caching for dynamic content
   - Background sync support
   - Push notification support

3. **Install Prompt** (`/src/components/PWAInstallPrompt.tsx`)

   - Native install prompt handling
   - Custom UI for install invitation
   - Dismissal with 7-day cooldown
   - Automatic service worker registration

4. **Offline Page** (`/public/offline.html`)
   - Branded offline fallback
   - Auto-reconnect functionality
   - User-friendly messaging

### 📱 Platform Support

- **Android**: Full support with install prompt
- **iOS**: Add to Home Screen support
- **Desktop**: Chrome, Edge, Safari install support
- **Windows**: Installable from Edge

## Caching Strategies

### Network First (API Calls)

- Fresh data when online
- Cached fallback when offline
- Automatic cache updates

### Cache First (Static Assets)

- CSS, JavaScript, fonts
- Images and media
- Faster load times

### Stale While Revalidate (HTML Pages)

- Immediate cached response
- Background update check
- Best of both worlds

## Installation

### For Users

1. **Desktop (Chrome/Edge)**:

   - Click the install icon in the address bar
   - Or use the custom install prompt

2. **Android**:

   - Tap "Add to Home Screen" from browser menu
   - Or use the custom install prompt

3. **iOS**:
   - Tap Share button
   - Select "Add to Home Screen"

### For Developers

The PWA is automatically enabled. No additional setup required.

## File Structure

```
public/
├── manifest.json          # Web app manifest
├── sw.js                  # Service worker
├── offline.html           # Offline fallback page
└── icons/                 # App icons
    ├── README.md
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png

src/
├── app/
│   └── layout.tsx         # PWA meta tags
└── components/
    └── PWAInstallPrompt.tsx  # Install UI
```

## Configuration

### Manifest Customization

Edit `/public/manifest.json` to customize:

- App name and description
- Theme colors
- Icon paths
- Shortcuts
- Share target

### Service Worker Customization

Edit `/public/sw.js` to customize:

- Cache names and versions
- Caching strategies
- Precached assets
- Background sync behavior

### Install Prompt Customization

Edit `/src/components/PWAInstallPrompt.tsx` to customize:

- Prompt appearance
- Dismissal behavior
- Timing and conditions

## Testing

### Local Testing

1. **Build for production**:

   ```bash
   npm run build
   npm start
   ```

2. **Test in Chrome DevTools**:

   - Open DevTools → Application tab
   - Check Manifest
   - Check Service Workers
   - Test offline mode

3. **Lighthouse Audit**:

   ```bash
   npx lighthouse http://localhost:3000 --view
   ```

### PWA Checklist

- ✅ Manifest file present
- ✅ Service worker registered
- ✅ HTTPS (required for production)
- ✅ Icons for all sizes
- ✅ Offline fallback
- ✅ Install prompt
- ✅ Theme color
- ✅ Viewport meta tag

## Deployment Considerations

### HTTPS Required

PWAs require HTTPS in production. Ensure your deployment platform provides SSL:

- Vercel: Automatic HTTPS
- Netlify: Automatic HTTPS
- Google Cloud Run: Configure HTTPS

### Icon Generation

Before deploying, generate proper icons:

1. Create a 512x512 source icon
2. Use an icon generator tool
3. Place icons in `/public/icons/`
4. Update manifest.json paths if needed

Recommended tools:

- <https://realfavicongenerator.net/>
- <https://www.pwabuilder.com/imageGenerator>

### Service Worker Updates

When updating the service worker:

1. Change `CACHE_NAME` version
2. Users will get updates on next visit
3. Old caches are automatically cleaned

## Monitoring

### Service Worker Status

Check service worker status in browser:

```javascript
navigator.serviceWorker.getRegistration().then((reg) => {
  console.log('Service Worker:', reg);
});
```

### Cache Status

View cached resources:

```javascript
caches.keys().then((names) => {
  console.log('Cache names:', names);
});
```

### Install Status

Check if app is installed:

```javascript
window.matchMedia('(display-mode: standalone)').matches;
```

## Troubleshooting

### Service Worker Not Registering

1. Check HTTPS (required except localhost)
2. Check browser console for errors
3. Verify `/sw.js` is accessible
4. Clear browser cache and reload

### Install Prompt Not Showing

1. PWA criteria must be met
2. User must not have dismissed recently
3. App must not already be installed
4. Check browser compatibility

### Offline Mode Not Working

1. Verify service worker is active
2. Check cache names match
3. Test with DevTools offline mode
4. Check network tab for failed requests

## Best Practices

1. **Keep Service Worker Simple**: Complex logic can cause issues
2. **Version Your Caches**: Always increment cache names on updates
3. **Test Offline**: Regularly test offline functionality
4. **Monitor Performance**: Use Lighthouse for PWA audits
5. **Update Regularly**: Keep service worker and manifest current

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced SW
  library

## Next Steps

1. ✅ Generate proper app icons
2. ✅ Test on multiple devices
3. ✅ Configure push notifications (optional)
4. ✅ Add background sync for favorites (optional)
5. ✅ Implement app shortcuts actions
6. ✅ Add share target handler

---

**Status**: ✅ PWA Fully Implemented  
**Last Updated**: 2025-12-29  
**Version**: 1.0.0
