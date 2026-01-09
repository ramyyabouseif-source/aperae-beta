/**
 * OCR Service for Menu Text Extraction
 * Handles image processing and text extraction using Google Vision API REST endpoint
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { getApiBaseUrl } from '../utils/api';

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes?: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface MenuItem {
  name: string;
  description?: string;
  price?: string;
  category?: string;
  confidence: number;
}

export class OCRService {
  private static readonly GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';
  private static readonly SERVICE_ACCOUNT_EMAIL = 'aperae-vision-service@aperae-vision-api.iam.gserviceaccount.com';
  private static readonly PROJECT_ID = 'aperae-vision-api';

  /**
   * Get OAuth2 access token using service account
   */
  private static async getAccessToken(): Promise<string> {
    try {
      // For React Native, we'll use a different approach
      // We'll make the API call from the backend instead
      throw new Error('OCR processing should be done on the backend');
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'string' ? error : error?.toString() || 'Unknown error');
      console.error('OAuth2 token error:', errorMessage);
      throw new Error(`Failed to get access token: ${errorMessage}`);
    }
  }

  /**
   * Extract text from image using Google Vision API
   * This method will call the backend API instead of directly calling Google Vision
   */
  static async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Starting OCR processing (attempt ${attempt}/${maxRetries}):`, imageUri);
        
        // Convert image to base64
        const base64Image = await this.convertImageToBase64(imageUri);
        
        // Call our backend API instead of Google Vision directly
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.warn('OCR request timeout reached, aborting...');
          controller.abort();
        }, 300000); // 5 minute timeout
        
        console.log('Sending OCR request to backend...');
        const backendUrl = getApiBaseUrl();
        const ocrEndpoint = `${backendUrl}/ocr/extract-text`;
        console.log('OCR endpoint:', ocrEndpoint);
        console.log('Image size (base64 length):', base64Image.length);
        
        // Only include ngrok header if using ngrok URL (development)
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (backendUrl.includes('ngrok')) {
          headers['ngrok-skip-browser-warning'] = 'true';
        }
        
        const response = await fetch(ocrEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            image: base64Image,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        // Check if response was aborted
        if (controller.signal.aborted) {
          throw new Error('Request was aborted');
        }
        
        console.log('OCR response received from backend, status:', response.status);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`OCR API error: ${response.status} ${response.statusText}. ${errorText}`);
        }

        const data = await response.json();
        
        console.log(`OCR successful on attempt ${attempt}`);
        console.log(`OCR text length: ${data.text?.length || 0} characters`);
        // Log raw OCR text for debugging (first 500 chars to avoid log spam)
        if (data.text) {
          console.log('=== RAW OCR TEXT (first 500 chars) ===');
          console.log(data.text.substring(0, 500));
          console.log('=== END OCR TEXT PREVIEW ===');
        }
        return {
          text: data.text || '',
          confidence: data.confidence || 0.8,
          boundingBoxes: data.boundingBoxes || [],
        };
      } catch (error: any) {
        lastError = error;
        const errorName = error?.name || '';
        const errorMessage = error?.message || String(error);
        
        console.error(`OCR attempt ${attempt} failed:`, errorMessage);
        console.error(`Error name: ${errorName}`);
        console.error(`Error type: ${typeof error}`);
        
        // Check if this is an abort/timeout error
        const isAbortError = errorName === 'AbortError' || 
                            errorName === 'Aborted' || 
                            errorMessage === 'Aborted' ||
                            errorMessage.includes('abort') ||
                            errorMessage.includes('Aborted');
        
        if (isAbortError) {
          console.error(`Request was aborted (likely timeout)`);
          // For abort errors, wait a bit longer before retry to allow network to stabilize
          if (attempt < maxRetries) {
            const delay = attempt * 3000; // 3s, 6s delays for network issues
            console.log(`Retrying after abort in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } else if (attempt < maxRetries) {
          const delay = attempt * 2000; // 2s, 4s delays for other errors
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    console.error('All OCR attempts failed');
    const errorName = lastError?.name || '';
    const errorMessage = lastError?.message || String(lastError);
    
    const isAbortError = errorName === 'AbortError' || 
                        errorName === 'Aborted' || 
                        errorMessage === 'Aborted' ||
                        errorMessage.includes('abort') ||
                        errorMessage.includes('Aborted');
    
    if (isAbortError) {
      throw new Error('OCR processing timed out after 5 minutes. The image might be too large, or there may be a network connectivity issue. Please try again with a smaller image or check your internet connection.');
    } else if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch')) {
      throw new Error('Network connection failed. Please check your internet connection and ensure you are connected to the same WiFi network as your backend server.');
    } else if (errorMessage.includes('timeout')) {
      throw new Error('OCR processing timed out. The image might be too large or complex. Please try with a smaller image.');
    } else {
      throw new Error(`OCR processing failed after ${maxRetries} attempts: ${errorMessage}`);
    }
  }

  /**
   * Parse menu text to extract menu items
   */
  static parseMenuText(ocrResult: OCRResult): MenuItem[] {
    try {
      const text = ocrResult.text;
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      const menuItems: MenuItem[] = [];
      let currentCategory = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Check if line is a category header (usually in caps or title case)
        if (this.isCategoryHeader(line)) {
          currentCategory = line;
          continue;
        }
        
        // Check if line contains a menu item
        const menuItem = this.extractMenuItem(line, currentCategory, ocrResult.confidence);
        if (menuItem) {
          menuItems.push(menuItem);
        }
      }
      
      console.log(`Parsed ${menuItems.length} menu items from OCR text`);
      return menuItems;
    } catch (error) {
      console.error('Menu parsing error:', error);
      return [];
    }
  }

  /**
   * Convert image URI to base64 string
   * Uses expo-file-system for React Native/Expo, browser APIs for web
   */
  private static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      console.log('Converting image to base64...');
      console.log('Image URI:', imageUri);
      
      // Handle web platform differently
      if (Platform.OS === 'web') {
        // On web, images can be blob URLs or data URIs
        if (imageUri.startsWith('blob:')) {
          // Fetch the blob and convert to base64
          const response = await fetch(imageUri);
          const blob = await response.blob();
          
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              // FileReader returns data URI (data:image/...;base64,xxx)
              // Extract just the base64 part
              const base64 = result.split(',')[1];
              if (!base64) {
                reject(new Error('Failed to extract base64 from data URI'));
                return;
              }
              console.log('Base64 conversion completed (web blob), length:', base64.length);
              resolve(base64);
            };
            reader.onerror = () => {
              reject(new Error('FileReader failed to read blob'));
            };
            reader.readAsDataURL(blob);
          });
        } else if (imageUri.startsWith('data:')) {
          // Already a data URI, extract base64 part
          const base64 = imageUri.split(',')[1];
          if (!base64) {
            throw new Error('Invalid data URI format');
          }
          console.log('Base64 conversion completed (web data URI), length:', base64.length);
          return base64;
        } else {
          // Try to fetch as regular URL
          const response = await fetch(imageUri);
          const blob = await response.blob();
          
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              const base64 = result.split(',')[1];
              if (!base64) {
                reject(new Error('Failed to extract base64 from data URI'));
                return;
              }
              console.log('Base64 conversion completed (web URL), length:', base64.length);
              resolve(base64);
            };
            reader.onerror = () => {
              reject(new Error('FileReader failed to read blob'));
            };
            reader.readAsDataURL(blob);
          });
        }
      } else {
        // React Native/Expo: Use expo-file-system to read the file as base64
        // In expo-file-system v19+, use string literal 'base64' directly
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: 'base64' as any,
        });
        
        console.log('Base64 conversion completed (native), length:', base64.length);
        return base64;
      }
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'string' ? error : error?.toString() || 'Unknown error');
      console.error('Image conversion error:', errorMessage);
      throw new Error(`Failed to convert image to base64: ${errorMessage}`);
    }
  }

  /**
   * Calculate confidence score from OCR results
   */
  private static calculateConfidence(textAnnotations: any[]): number {
    if (!textAnnotations || textAnnotations.length === 0) return 0;
    
    const confidences = textAnnotations
      .map(annotation => annotation.confidence || 0)
      .filter(conf => conf > 0);
    
    if (confidences.length === 0) return 0.8; // Default confidence
    
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  /**
   * Extract bounding boxes for text elements
   */
  private static extractBoundingBoxes(textAnnotations: any[]): Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }> {
    return textAnnotations.slice(1).map(annotation => {
      const vertices = annotation.boundingPoly.vertices;
      const x = vertices[0]?.x || 0;
      const y = vertices[0]?.y || 0;
      const width = (vertices[2]?.x || 0) - x;
      const height = (vertices[2]?.y || 0) - y;
      
      return {
        text: annotation.description || '',
        x,
        y,
        width,
        height,
      };
    });
  }

  /**
   * Check if a line is a category header
   */
  private static isCategoryHeader(line: string): boolean {
    // Category headers are usually short, in caps, or title case
    const isShort = line.length < 30;
    const isCaps = line === line.toUpperCase();
    const isTitleCase = line === line.charAt(0).toUpperCase() + line.slice(1).toLowerCase();
    const hasCommonCategoryWords = /appetizer|entree|main|dessert|wine|beverage|salad|soup/i.test(line);
    
    return isShort && (isCaps || isTitleCase || hasCommonCategoryWords);
  }

  /**
   * Extract menu item from a line of text
   */
  private static extractMenuItem(line: string, category: string, confidence: number): MenuItem | null {
    // Skip lines that are too short or don't look like menu items
    if (line.length < 3) return null;
    
    // Extract price (look for $XX.XX pattern)
    const priceMatch = line.match(/\$[\d,]+\.?\d*/);
    const price = priceMatch ? priceMatch[0] : undefined;
    
    // Remove price from line to get item name and description
    const itemText = price ? line.replace(price, '').trim() : line;
    
    // Split into name and description (usually separated by common words)
    const nameDescriptionSplit = itemText.split(/\s+(?:with|and|served|featuring|topped|drizzled|garnished)\s+/i);
    const name = nameDescriptionSplit[0]?.trim() || '';
    const description = nameDescriptionSplit[1]?.trim() || '';
    
    // Skip if name is too short
    if (name.length < 2) return null;
    
    return {
      name,
      description: description || undefined,
      price,
      category: category || undefined,
      confidence,
    };
  }

  /**
   * Check if OCR service is available
   */
  static isAvailable(): boolean {
    return true; // Always available since we're calling backend
  }

  /**
   * Get service status
   */
  static getStatus(): { available: boolean; backendConnected: boolean } {
    return {
      available: true,
      backendConnected: true, // We'll check this when we make the API call
    };
  }
}