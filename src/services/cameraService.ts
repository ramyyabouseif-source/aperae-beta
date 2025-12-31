/**
 * Camera Service for Menu Photo Capture
 * Handles camera permissions and photo capture using Expo Camera
 */

import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface CameraPermission {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  type: 'image';
}

/**
 * Web-specific file input handler
 * Creates a hidden file input and triggers it programmatically
 */
const createWebFileInput = (accept: string = 'image/*'): Promise<PhotoResult | null> => {
  // Type guard for web environment
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return Promise.resolve(null);
  }
  
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        resolve(null);
        return;
      }
      
      // Create object URL for the file
      const uri = URL.createObjectURL(file);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        resolve({
          uri,
          width: img.width,
          height: img.height,
          type: 'image',
        });
      };
      img.onerror = () => {
        // If we can't get dimensions, return with 0 dimensions
        resolve({
          uri,
          width: 0,
          height: 0,
          type: 'image',
        });
      };
      img.src = uri;
    };
    
    input.oncancel = () => {
      resolve(null);
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
};

export class CameraService {
  /**
   * Request camera permissions
   */
  static async requestCameraPermission(): Promise<CameraPermission> {
    // On web, camera access is handled via file input, so we always return granted
    if (Platform.OS === 'web') {
      return {
        granted: true,
        canAskAgain: true,
        status: 'granted',
      };
    }
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status,
      };
    } catch (error) {
      console.error('Camera permission error:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  /**
   * Check current camera permissions
   */
  static async getCameraPermission(): Promise<CameraPermission> {
    // On web, camera access is handled via file input, so we always return granted
    if (Platform.OS === 'web') {
      return {
        granted: true,
        canAskAgain: true,
        status: 'granted',
      };
    }
    
    try {
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status !== 'denied',
        status,
      };
    } catch (error) {
      console.error('Camera permission check error:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  /**
   * Request media library permissions for saving photos
   */
  static async requestMediaLibraryPermission(): Promise<boolean> {
    // On web, file access is handled via file input, so we always return true
    if (Platform.OS === 'web') {
      return true;
    }
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Media library permission error:', error);
      return false;
    }
  }

  /**
   * Take a photo using the camera
   */
  static async takePhoto(): Promise<PhotoResult | null> {
    // On web, use file input (user can select from camera or files)
    if (Platform.OS === 'web') {
      return createWebFileInput('image/*');
    }
    
    try {
      // Check permissions first
      const permission = await this.getCameraPermission();
      if (!permission.granted) {
        const newPermission = await this.requestCameraPermission();
        if (!newPermission.granted) {
          throw new Error('Camera permission denied');
        }
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduced quality for smaller file size
        base64: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width || 0,
        height: asset.height || 0,
        type: 'image',
      };
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'string' ? error : error?.toString() || 'Unknown error');
      console.error('Camera photo capture error:', errorMessage);
      throw new Error(`Failed to take photo: ${errorMessage}`);
    }
  }

  /**
   * Pick a photo from the gallery
   */
  static async pickPhoto(): Promise<PhotoResult | null> {
    // On web, use file input
    if (Platform.OS === 'web') {
      return createWebFileInput('image/*');
    }
    
    try {
      // Request media library permission
      const hasPermission = await this.requestMediaLibraryPermission();
      if (!hasPermission) {
        throw new Error('Media library permission denied');
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduced quality for smaller file size
        base64: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width || 0,
        height: asset.height || 0,
        type: 'image',
      };
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'string' ? error : error?.toString() || 'Unknown error');
      console.error('Photo picker error:', errorMessage);
      throw new Error(`Failed to pick photo: ${errorMessage}`);
    }
  }

  /**
   * Check if camera is available on the device
   */
  static async isCameraAvailable(): Promise<boolean> {
    // On web, file input is always available
    if (Platform.OS === 'web') {
      return true;
    }
    
    try {
      // Check permissions - if we can get permissions, camera is likely available
      // The permission check will fail if camera hardware is not available
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      // Return true if permission is granted or can be asked (camera exists)
      return status === 'granted' || status === 'undetermined';
    } catch (error) {
      console.error('Camera availability check error:', error);
      // If there's an error checking permissions, assume camera is not available
      return false;
    }
  }

  /**
   * Get camera service status
   */
  static async getStatus(): Promise<{
    cameraAvailable: boolean;
    cameraPermission: CameraPermission;
    mediaLibraryPermission: boolean;
  }> {
    const cameraAvailable = await this.isCameraAvailable();
    const cameraPermission = await this.getCameraPermission();
    const mediaLibraryPermission = await this.requestMediaLibraryPermission();

    return {
      cameraAvailable,
      cameraPermission,
      mediaLibraryPermission,
    };
  }
}
