# Quick Start Guide

## Installation & Setup

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Start development server:**
   ```powershell
   npm start
   ```

3. **Run on device:**
   - Install "Expo Go" app on your phone
   - Scan QR code from terminal

## Build for Production

### Android APK (Testing)
```powershell
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

### Android AAB (Google Play)
```powershell
eas build --platform android --profile production
```

### iOS (App Store)
```powershell
eas build --platform ios --profile production
```

## Before Building

**Add icons to `assets/` folder:**
- icon.png (1024x1024)
- adaptive-icon.png (1024x1024)
- splash.png (1284x2778)
- favicon.png (48x48)

Generate icons: https://www.appicon.co/

## Key Features Included

✅ Full WebView with JavaScript  
✅ File uploads (camera/gallery)  
✅ Loading progress bar  
✅ Back button navigation  
✅ External links in browser  
✅ Pull-to-refresh  
✅ Offline error handling  
✅ Cookie persistence  

See README.md for full documentation.
