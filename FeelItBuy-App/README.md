# FeelItBuy Mobile App

A production-ready React Native (Expo) app that loads the FeelItBuy website (https://feeelitbuy.vercel.app) in a WebView with full native features.

## Features

✅ Full-screen WebView with JavaScript enabled  
✅ File uploads (camera & gallery support)  
✅ Loading indicator with progress bar  
✅ Android hardware back button navigation  
✅ External links open in device browser  
✅ Pull-to-refresh functionality  
✅ Offline error handling with retry  
✅ Cookie/session persistence (login stays)  
✅ SSL error handling  
✅ Native splash screen  
✅ Production-ready build configurations  

## Prerequisites

- Node.js (v20.16+ recommended, v20.14+ minimum)
- npm or yarn
- Expo CLI
- For iOS builds: macOS with Xcode
- For Android builds: Android Studio (optional) or EAS Build

## Installation

### 1. Install Dependencies

```powershell
cd "c:\Users\sruja\OneDrive\Desktop\Feeelitbuy\FeelItBuy-App"
npm install
```

**Note:** If you see Node.js version warnings, they're safe to ignore. The app works with Node.js v20.14+, though v20.19.4+ is recommended.

### 2. Install Expo CLI (if not already installed)

```powershell
npm install -g expo-cli
npm install -g eas-cli
```

### 3. Create Placeholder Icons

Create the following placeholder images in the `assets` folder:

- **icon.png** - 1024x1024px (app icon)
- **adaptive-icon.png** - 1024x1024px (Android adaptive icon)
- **splash.png** - 1284x2778px (splash screen)
- **favicon.png** - 48x48px (web favicon)

You can use any image editor or generate them online at:
- https://www.appicon.co/
- https://icon.kitchen/

**Quick placeholder creation (temporary):**
You can temporarily use solid color images or download free icons from https://www.flaticon.com/

## Running the App

### Development Mode (Expo Go)

```powershell
# Start Expo development server
npm start

# Or run directly on Android
npm run android

# Or run directly on iOS
npm run ios
```

Scan the QR code with:
- **Android**: Expo Go app
- **iOS**: Camera app

### Running on Physical Device

1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Run `npm start`
3. Scan the QR code displayed in terminal/browser

## Building for Production

### Setup EAS Build

```powershell
# Login to Expo
eas login

# Configure EAS project
eas build:configure
```

This will create an `eas.json` file (already included) and link your project.

### Build APK (Android - for testing)

```powershell
eas build --platform android --profile preview
```

This creates an APK file you can install directly on Android devices.

### Build AAB (Android - for Google Play Store)

```powershell
eas build --platform android --profile production
```

This creates an Android App Bundle (.aab) for uploading to Google Play Store.

### Build for iOS (requires Apple Developer account)

```powershell
eas build --platform ios --profile production
```

### Build Both Platforms

```powershell
eas build --platform all --profile production
```

## Build Profiles Explained

The `eas.json` file contains three build profiles:

- **development**: For development builds with debugging
- **preview**: Creates APK for internal testing (Android only)
- **production**: Creates AAB/IPA for store submission

## App Configuration

### Update App Name & Bundle Identifier

Edit `app.json`:

```json
{
  "expo": {
    "name": "FeelItBuy",  // Display name
    "slug": "feelitbuy-app",
    "ios": {
      "bundleIdentifier": "com.feelitbuy.app"  // Change this
    },
    "android": {
      "package": "com.feelitbuy.app"  // Change this
    }
  }
}
```

### Update Website URL

Edit `App.js`:

```javascript
const WEBSITE_URL = 'https://feeelitbuy.vercel.app';
```

## Permissions

### Android Permissions (auto-configured)

- **CAMERA** - Camera access for photo uploads
- **READ_EXTERNAL_STORAGE** - Access gallery
- **WRITE_EXTERNAL_STORAGE** - Save files
- **ACCESS_FINE_LOCATION** - GPS location
- **INTERNET** - Network access
- **ACCESS_NETWORK_STATE** - Check connectivity

### iOS Permissions (auto-configured)

Configured in `app.json` > `ios.infoPlist`:
- Camera usage
- Photo library access
- Microphone (for video)
- Location services

## File Upload Configuration

### Android Manifest (auto-handled by Expo)

The app automatically handles file uploads. For custom file types, you can modify the WebView configuration in `App.js`:

```javascript
// Already configured for images and camera
allowFileAccess={true}
allowFileAccessFromFileURLs={true}
```

### Testing File Upload

1. Visit a page with file upload on your website
2. Tap the upload button
3. You'll see options: Camera, Gallery, Files
4. Select and upload

If file upload doesn't work, check "Troubleshooting" section below.

## Troubleshooting

### 1. File Upload Not Working

**Problem**: File picker doesn't open or uploads fail

**Solutions**:

```javascript
// In App.js, ensure these are set:
allowFileAccess={true}
allowFileAccessFromFileURLs={true}
allowUniversalAccessFromFileURLs={true}
```

**Android**: Add to `app.json`:

```json
"android": {
  "usesCleartextTraffic": true,
  "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
}
```

**iOS**: Permissions are already configured in `app.json`.

### 2. Mixed Content / CORS Issues

**Problem**: Some resources don't load (HTTP content on HTTPS page)

**Solutions**:

```javascript
// Already configured in App.js:
mixedContentMode="compatibility"
```

**Android**: Add to `app.json`:

```json
"android": {
  "usesCleartextTraffic": true
}
```

### 3. Cookies / Login Not Persisting

**Problem**: User gets logged out after closing app

**Solutions**:

```javascript
// Already configured in App.js:
domStorageEnabled={true}
thirdPartyCookiesEnabled={true}
sharedCookiesEnabled={true}
cacheEnabled={true}
```

If still not working, check if your website uses `SameSite` cookies. Your backend may need to set:

```
Set-Cookie: session=abc123; SameSite=None; Secure
```

### 4. SSL Certificate Errors

**Problem**: Page won't load due to SSL errors

**Solution**: Already handled in `App.js`. The WebView will attempt to load the page. For stricter SSL handling:

```javascript
onShouldStartLoadWithRequest={(request) => {
  // Add custom SSL validation here
  return true;
}}
```

### 5. External Links Not Opening

**Problem**: Links with `target="_blank"` don't work

**Solution**: Already handled with `injectedJavaScript` in `App.js`. External links automatically open in device browser.

### 6. Pull-to-Refresh Not Working

**Solution**: Already enabled:

```javascript
pullToRefreshEnabled={true}
```

Pull down from the top of the page to refresh.

### 7. Back Button Exits App Immediately

**Problem**: Android back button doesn't navigate WebView history

**Solution**: Already handled in `App.js` with `BackHandler`. The app will:
1. Navigate WebView back if history exists
2. Show exit confirmation if on first page

### 8. App Crashes on Launch

**Check**:

```powershell
# Clear cache and reinstall
expo start -c

# Or rebuild
npm install
expo start
```

### 9. Build Fails on EAS

**Common issues**:

- Missing app icons → Add placeholder images to `assets/`
- Bundle identifier conflict → Change in `app.json`
- EAS project not configured → Run `eas build:configure`

```powershell
# Check EAS configuration
eas whoami
eas build:configure
```

### 10. White Screen / Blank Page

**Solutions**:

1. Check internet connection
2. Verify website URL is correct in `App.js`
3. Check console for errors: `expo start` then press `j` to open debugger
4. Test website in mobile browser first

```powershell
# Enable debugging
expo start --dev-client
```

## Publishing to App Stores

### Google Play Store (Android)

1. Build AAB:
   ```powershell
   eas build --platform android --profile production
   ```

2. Download the `.aab` file from EAS dashboard

3. Go to [Google Play Console](https://play.google.com/console)

4. Create app and upload AAB

5. Fill out store listing, screenshots, etc.

6. Submit for review

### Apple App Store (iOS)

1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)

2. Build IPA:
   ```powershell
   eas build --platform ios --profile production
   ```

3. Download `.ipa` or use EAS Submit:
   ```powershell
   eas submit --platform ios
   ```

4. Go to [App Store Connect](https://appstoreconnect.apple.com/)

5. Create app and upload build

6. Fill out app information and submit for review

## Advanced Configuration

### Custom User Agent

Edit `App.js`:

```javascript
userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36..."
```

### Custom Loading Screen

Modify `components/LoadingScreen.js` to customize appearance.

### Custom Error Screen

Modify `components/ErrorScreen.js` to customize error messaging.

### Geolocation

Already enabled:

```javascript
geolocationEnabled={true}
```

Your website needs to request permission using HTML5 Geolocation API.

### Push Notifications (Future Enhancement)

For push notifications, install:

```powershell
expo install expo-notifications expo-device expo-constants
```

Then configure in `app.json` and add notification handling code.

### Deep Linking (Future Enhancement)

To open the app from website links, configure in `app.json`:

```json
"scheme": "feelitbuy",
"android": {
  "intentFilters": [
    {
      "action": "VIEW",
      "data": { "scheme": "https", "host": "feeelitbuy.vercel.app" }
    }
  ]
}
```

## File Structure

```
FeelItBuy-App/
├── App.js                      # Main app component with WebView
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── eas.json                    # EAS Build configuration
├── babel.config.js             # Babel configuration
├── index.js                    # App entry point
├── components/
│   ├── LoadingScreen.js        # Loading indicator component
│   └── ErrorScreen.js          # Error screen component
└── assets/
    ├── icon.png                # App icon (1024x1024)
    ├── adaptive-icon.png       # Android adaptive icon
    ├── splash.png              # Splash screen
    └── favicon.png             # Web favicon
```

## Common Commands

```powershell
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Clear cache
expo start -c

# Build APK (testing)
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios

# Check build status
eas build:list

# Update app (OTA)
expo publish
```

## Testing Checklist

Before submitting to stores, test:

- [ ] App launches successfully
- [ ] Website loads correctly
- [ ] File upload works (camera & gallery)
- [ ] External links open in browser
- [ ] Back button navigation works
- [ ] Pull-to-refresh works
- [ ] Login persists after app restart
- [ ] Offline error screen appears and retry works
- [ ] App doesn't crash on orientation change
- [ ] Loading indicator appears during page load
- [ ] Splash screen displays correctly

## Support & Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Forums](https://forums.expo.dev/)

## License

MIT License - feel free to use this code for your projects.

---

**Ready to build!** Start with `npm install` and `npm start` to see your app in action.
