import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: 'admin-watchstore.firebaseapp.com',
    projectId: 'admin-watchstore',
    storageBucket: 'admin-watchstore.firebasestorage.app',
    messagingSenderId: '841280143401',
    appId: '1:841280143401:web:f7371aca1e479bf9bcdc38',
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
