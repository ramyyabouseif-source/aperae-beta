import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NDA_ACCEPTED_KEY = 'nda_accepted';
const NDA_TIMESTAMP_KEY = 'nda_timestamp';

export class NDAService {
  static async hasAcceptedNDA(): Promise<boolean> {
    try {
      const accepted = await AsyncStorage.getItem(NDA_ACCEPTED_KEY);
      return accepted === 'true';
    } catch (error) {
      console.error('Error checking NDA acceptance:', error);
      return false;
    }
  }

  static async acceptNDA(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(NDA_ACCEPTED_KEY, 'true');
      await AsyncStorage.setItem(NDA_TIMESTAMP_KEY, timestamp);
      
      // Log acceptance with timestamp for audit trail
      console.log('=== NDA ACCEPTANCE LOG ===');
      console.log('Timestamp:', timestamp);
      console.log('User Agent:', navigator.userAgent || 'Mobile App');
      console.log('Platform:', Platform.OS || 'Unknown');
      console.log('App Version:', '1.0.0'); // You can get this from app.json
      console.log('NDA Version:', '1.0'); // Track NDA version for future updates
      console.log('========================');
      
      // In a production app, you'd also send this to your backend
      // await this.logNDAAcceptance(timestamp);
      
    } catch (error) {
      console.error('Error accepting NDA:', error);
      throw error;
    }
  }

  static async getNDATimestamp(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(NDA_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error getting NDA timestamp:', error);
      return null;
    }
  }

  static async resetNDA(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NDA_ACCEPTED_KEY);
      await AsyncStorage.removeItem(NDA_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error resetting NDA:', error);
      throw error;
    }
  }

  // Optional: Send to backend for audit trail
  static async logNDAAcceptance(timestamp: string): Promise<void> {
    try {
      // This would send to your backend for permanent logging
      // const response = await fetch('YOUR_BACKEND_URL/api/nda-acceptance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     timestamp,
      //     userAgent: navigator.userAgent,
      //     platform: Platform.OS,
      //     appVersion: '1.0.0',
      //     ndaVersion: '1.0'
      //   })
      // });
      console.log('NDA acceptance logged to backend (if implemented)');
    } catch (error) {
      console.error('Error logging NDA acceptance:', error);
    }
  }
}