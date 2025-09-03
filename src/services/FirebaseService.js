import { auth, db } from '../firebase/firebase.js';
import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export class FirebaseService {
  
  // Ensure user is authenticated
  async ensureAuthenticated() {
    try {
      if (!auth) {
        // For local development without Firebase, return a mock user
        return { uid: 'local-user', isAnonymous: true };
      }
      
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      return auth.currentUser;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Authentication failed');
    }
  }

  // Save invoice to Firestore
  async saveInvoice(invoiceData, filename, theme = 'minimalist', isDraft = false) {
    try {
      if (!db) {
        console.log('Firebase not configured, skipping database save');
        return { success: true, local: true };
      }
      
      const user = await this.ensureAuthenticated();
      
      const docData = {
        ownerUid: user ? user.uid : null,
        filename,
        data: invoiceData,
        theme,
        isDraft,
        type: 'invoice',
        createdAt: serverTimestamp()
      };

      // Set timeout for database operation
      const dbPromise = addDoc(collection(db, 'invoices'), docData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database save timeout after 10 seconds')), 10000)
      );

      await Promise.race([dbPromise, timeoutPromise]);
      return { success: true };
    } catch (error) {
      console.error('Failed to save invoice to Firebase:', error);
      throw error;
    }
  }

  // Save receipt to Firestore
  async saveReceipt(receiptData, filename, theme = 'minimalist', isDraft = false) {
    try {
      if (!db) {
        console.log('Firebase not configured, skipping database save');
        return { success: true, local: true };
      }
      
      const user = await this.ensureAuthenticated();
      
      const docData = {
        ownerUid: user ? user.uid : null,
        filename,
        data: receiptData,
        theme,
        isDraft,
        type: 'receipt',
        createdAt: serverTimestamp()
      };

      // Set timeout for database operation
      const dbPromise = addDoc(collection(db, 'receipts'), docData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database save timeout after 10 seconds')), 10000)
      );

      await Promise.race([dbPromise, timeoutPromise]);
      return { success: true };
    } catch (error) {
      console.error('Failed to save receipt to Firebase:', error);
      throw error;
    }
  }

  // Sign out user
  async signOut() {
    console.log('FirebaseService.signOut() called');
    try {
      if (auth) {
        console.log('Firebase auth available, calling auth.signOut()');
        await auth.signOut();
        console.log('Firebase auth.signOut() completed');
      } else {
        console.log('Firebase auth not available, using local signout');
      }
      // For local development without Firebase, just return success
      console.log('SignOut returning success');
      return { success: true };
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    if (!auth) {
      return { uid: 'local-user', isAnonymous: true };
    }
    return auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    if (!auth) {
      return true; // For local development, always consider authenticated
    }
    return !!auth.currentUser;
  }
}

export default new FirebaseService();
