import { useEffect, useState } from 'react';

// Capacitor imports - optional, only loaded when available
let Capacitor: any;
let CapacitorHttp: any;
let Camera: any;
let CameraResultType: any;
let CameraSource: any;
let Filesystem: any;
let Directory: any;
let Share: any;
let StatusBar: any;
let Style: any;

try {
  Capacitor = require('@capacitor/core').Capacitor;
  CapacitorHttp = require('@capacitor/core').CapacitorHttp;
  Camera = require('@capacitor/camera').Camera;
  CameraResultType = require('@capacitor/camera').CameraResultType;
  CameraSource = require('@capacitor/camera').CameraSource;
  Filesystem = require('@capacitor/filesystem').Filesystem;
  Directory = require('@capacitor/filesystem').Directory;
  Share = require('@capacitor/share').Share;
  StatusBar = require('@capacitor/status-bar').StatusBar;
  Style = require('@capacitor/status-bar').Style;
} catch (e) {
  console.warn('[Capacitor] Plugins not available in web environment');
}

interface CapacitorState {
  isNative: boolean;
  platform: string;
  isOnline: boolean;
}

export const useCapacitor = () => {
  const [state, setState] = useState<CapacitorState>({
    isNative: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform(),
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    if (state.isNative) {
      // Set status bar style
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#0a0a0a' });

      // Handle back button on Android
      if (state.platform === 'android') {
        document.addEventListener('backbutton', handleBackButton);
      }
    }

    return () => {
      if (state.platform === 'android') {
        document.removeEventListener('backbutton', handleBackButton);
      }
    };
  }, [state.isNative, state.platform]);

  const handleBackButton = () => {
    // Navigate back or close app
    window.history.back();
  };

  // Camera functionality
  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        width: 1920,
        height: 1440,
        correctOrientation: true,
      });

      return image;
    } catch (error) {
      console.error('[Capacitor] Camera error:', error);
      throw error;
    }
  };

  const pickFromGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        width: 1920,
        height: 1440,
        correctOrientation: true,
      });

      return image;
    } catch (error) {
      console.error('[Capacitor] Gallery error:', error);
      throw error;
    }
  };

  // File system functionality
  const saveFile = async (filename: string, data: string) => {
    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data: data,
        directory: Directory.Documents,
        recursive: true,
      });

      return result;
    } catch (error) {
      console.error('[Capacitor] Save file error:', error);
      throw error;
    }
  };

  const readFile = async (filename: string) => {
    try {
      const result = await Filesystem.readFile({
        path: filename,
        directory: Directory.Documents,
      });

      return result;
    } catch (error) {
      console.error('[Capacitor] Read file error:', error);
      throw error;
    }
  };

  // Share functionality
  const shareContent = async (title: string, text: string, url?: string) => {
    try {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Condividi',
      });
    } catch (error) {
      console.error('[Capacitor] Share error:', error);
      throw error;
    }
  };

  // HTTP requests with native implementation
  const makeHttpRequest = async (url: string, options?: any) => {
    try {
      const response = await CapacitorHttp.get({
        url,
        ...options,
      });

      return response;
    } catch (error) {
      console.error('[Capacitor] HTTP error:', error);
      throw error;
    }
  };

  return {
    ...state,
    takePhoto,
    pickFromGallery,
    saveFile,
    readFile,
    shareContent,
    makeHttpRequest,
  };
};
