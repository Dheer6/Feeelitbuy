// AndroidManifest.xml additions for file upload support
// These are automatically handled by Expo, but here's what gets configured:

/*
Android Permissions (in app.json):
- CAMERA
- READ_EXTERNAL_STORAGE  
- WRITE_EXTERNAL_STORAGE
- ACCESS_FINE_LOCATION
- INTERNET
- ACCESS_NETWORK_STATE

For file picker intent (auto-handled by react-native-webview):
The library automatically adds the required intent filters for:
- ACTION_GET_CONTENT
- ACTION_PICK
- MediaStore.ACTION_IMAGE_CAPTURE
- MediaStore.ACTION_VIDEO_CAPTURE

No manual AndroidManifest.xml editing needed with Expo managed workflow.

If using bare workflow, add to AndroidManifest.xml:

<manifest>
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.INTERNET" />
  
  <application
    android:usesCleartextTraffic="true"
    android:allowBackup="true">
    
    <provider
      android:name="androidx.core.content.FileProvider"
      android:authorities="${applicationId}.fileprovider"
      android:exported="false"
      android:grantUriPermissions="true">
      <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
    </provider>
  </application>
</manifest>
*/
