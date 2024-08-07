// firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBuxqeuLEnWBNjhaV3vGqnIflDO8W1NFSU",
  authDomain: "astrolabs-1a622.firebaseapp.com",
  projectId: "astrolabs-1a622",
  storageBucket: "astrolabs-1a622.appspot.com",
  messagingSenderId: "42001484814",
  appId: "1:42001484814:web:0f118be52a6f6f9dd7005f"
};

let app;
let auth;
let db;
let storage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
