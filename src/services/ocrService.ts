/**
 * OCR Service for Menu Text Extraction
 * Handles image processing and text extraction using Google Vision API REST endpoint
 */

import { Platform } from 'react-native';

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
  private static readonly SERVICE_ACCOUNT_EMAIL = 'pocketsomm-vision-service@pocketsomm-vision-api.iam.gserviceaccount.com';
  private static readonly PROJECT_ID = 'pocketsomm-vision-api';

  /**
   * Get OAuth2 access token using service account
   */
  private static async getAccessToken(): Promise<string> {
    try {
      // For React Native, we'll use a different approach
      // We'll make the API call from the backend instead
      throw new Error('OCR processing should be done on the backend');
    } catch (error) {
      console.error('OAuth2 token error:', error);
      throw new Error(`Failed to get access token: ${error.message}`);
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
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
        
        console.log('Sending OCR request to backend...');
        const response = await fetch('http://192.168.1.152:3001/api/ocr/extract-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log('OCR response received from backend');

        if (!response.ok) {
          throw new Error(`OCR API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log(`OCR successful on attempt ${attempt}`);
        return {
          text: data.text || '',
          confidence: data.confidence || 0.8,
          boundingBoxes: data.boundingBoxes || [],
        };
      } catch (error) {
        lastError = error;
        console.error(`OCR attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // 2s, 4s delays
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    console.error('All OCR attempts failed');
    if (lastError?.name === 'AbortError') {
      throw new Error('OCR processing timed out after 5 minutes. Please try again with a smaller image or check your connection.');
    } else if (lastError?.message.includes('Network request failed')) {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    } else if (lastError?.message.includes('timeout')) {
      throw new Error('OCR processing timed out. The image might be too large or complex.');
    } else {
      throw new Error(`OCR processing failed after ${maxRetries} attempts: ${lastError?.message}`);
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
   */
  private static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      console.log('Converting image to base64...');
      const response = await fetch(imageUri);
      console.log('Image fetch response received');
      const blob = await response.blob();
      console.log('Image blob created, size:', blob.size);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          const base64Data = base64.split(',')[1];
          console.log('Base64 conversion completed, length:', base64Data.length);
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Image conversion error:', error);
      throw new Error('Failed to convert image to base64');
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