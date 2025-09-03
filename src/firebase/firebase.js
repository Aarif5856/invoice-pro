// Firebase configuration stub
// This is a placeholder for Firebase setup
// You can configure this with your actual Firebase project details

// Mock Firebase auth methods for local development
const mockSignInWithEmailAndPassword = async (auth, email, password) => {
  console.log('Mock signInWithEmailAndPassword called');
  // Simulate successful authentication
  return { user: { uid: 'mock-user-' + Date.now(), email } };
};

const mockCreateUserWithEmailAndPassword = async (auth, email, password) => {
  console.log('Mock createUserWithEmailAndPassword called');
  // Simulate successful user creation
  return { user: { uid: 'mock-user-' + Date.now(), email } };
};

const mockSignOut = async (auth) => {
  console.log('Mock signOut called');
  // Simulate successful signout
  return Promise.resolve();
};

const mockOnAuthStateChanged = (auth, callback) => {
  console.log('Mock onAuthStateChanged called');
  // Return unsubscribe function
  return () => console.log('Mock auth state listener unsubscribed');
};

// For now, we'll export null values to prevent import errors
export const auth = null;
export const db = null;

// Export mock Firebase methods
export const createUserWithEmailAndPassword = mockCreateUserWithEmailAndPassword;
export const signInWithEmailAndPassword = mockSignInWithEmailAndPassword;
export const signOut = mockSignOut;
export const onAuthStateChanged = mockOnAuthStateChanged;

// If you want to set up Firebase later, replace this with:
/*
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
*/
