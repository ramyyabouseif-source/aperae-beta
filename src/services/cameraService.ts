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

export class CameraService {
  /**
   * Request camera permissions
   */
  static async requestCameraPermission(): Promise<CameraPermission> {
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
        mediaTypes: [ImagePicker.MediaType.Images],
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
    } catch (error) {
      console.error('Camera photo capture error:', error);
      throw new Error(`Failed to take photo: ${error.message}`);
    }
  }

  /**
   * Pick a photo from the gallery
   */
  static async pickPhoto(): Promise<PhotoResult | null> {
    try {
      // Request media library permission
      const hasPermission = await this.requestMediaLibraryPermission();
      if (!hasPermission) {
        throw new Error('Media library permission denied');
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Images],
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
    } catch (error) {
      console.error('Photo picker error:', error);
      throw new Error(`Failed to pick photo: ${error.message}`);
    }
  }

  /**
   * Check if camera is available on the device
   */
  static async isCameraAvailable(): Promise<boolean> {
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
