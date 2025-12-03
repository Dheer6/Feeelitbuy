import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  BackHandler,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';

const WEBSITE_URL = 'https://feeelitbuy.vercel.app';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Prevent default behavior
      }
      // Show exit confirmation
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: true }
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  // Handle navigation state changes
  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);

    // Detect external links and open in browser
    if (navState.url && !navState.url.includes('feeelitbuy.vercel.app')) {
      if (webViewRef.current) {
        webViewRef.current.stopLoading();
        WebBrowser.openBrowserAsync(navState.url);
        
        // Go back to previous page
        if (canGoBack) {
          webViewRef.current.goBack();
        }
      }
    }
  };

  // Handle page load completion
  const handleLoadEnd = () => {
    setIsLoading(false);
    setRefreshing(false);
    setHasError(false);
  };

  // Handle load progress
  const handleLoadProgress = ({ nativeEvent }) => {
    setLoadProgress(nativeEvent.progress);
  };

  // Handle errors
  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setIsLoading(false);
    setHasError(true);
  };

  // Handle HTTP errors
  const handleHttpError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView HTTP error: ', nativeEvent.statusCode);
    if (nativeEvent.statusCode >= 400) {
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Retry loading
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // Pull to refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // Handle messages from WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'OPEN_EXTERNAL') {
        WebBrowser.openBrowserAsync(data.url);
      }
    } catch (error) {
      console.log('Message handler error:', error);
    }
  };

  // Injected JavaScript to handle external links
  const injectedJavaScript = `
    (function() {
      // Override window.open to send message to React Native
      const originalOpen = window.open;
      window.open = function(url, target) {
        if (target === '_blank' || target === '_new') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'OPEN_EXTERNAL',
            url: url
          }));
          return null;
        }
        return originalOpen.call(window, url, target);
      };

      // Intercept clicks on links with target="_blank"
      document.addEventListener('click', function(e) {
        let target = e.target;
        while (target && target.tagName !== 'A') {
          target = target.parentElement;
        }
        
        if (target && target.tagName === 'A') {
          const href = target.getAttribute('href');
          const targetAttr = target.getAttribute('target');
          
          if (targetAttr === '_blank' && href) {
            e.preventDefault();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'OPEN_EXTERNAL',
              url: href.startsWith('http') ? href : window.location.origin + href
            }));
          }
        }
      }, true);
    })();
    true;
  `;

  if (hasError) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <StatusBar style="auto" />
          <ErrorScreen onRetry={handleRetry} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar style="auto" />
        {isLoading && <LoadingScreen progress={loadProgress} />}

        <WebView
        ref={webViewRef}
        source={{ uri: WEBSITE_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadEnd={handleLoadEnd}
        onLoadProgress={handleLoadProgress}
        onError={handleError}
        onHttpError={handleHttpError}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        // Enable JavaScript
        javaScriptEnabled={true}
        // Enable DOM storage for cookies/session
        domStorageEnabled={true}
        // Enable third-party cookies
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        // File upload support
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        // Media playback
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        // Mixed content (HTTPS + HTTP)
        mixedContentMode="compatibility"
        // Geolocation
        geolocationEnabled={true}
        // Pull to refresh
        pullToRefreshEnabled={true}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        // Caching
        cacheEnabled={true}
        cacheMode="LOAD_DEFAULT"
        // SSL/TLS error handling
        onShouldStartLoadWithRequest={(request) => {
          // Allow navigation
          return true;
        }}
        // User agent (optional - makes site think it's a mobile browser)
        userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        // Performance
        startInLoadingState={false}
        renderLoading={() => null}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
});
