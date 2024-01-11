// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA6Je5RyubpRZ03U7W7hpVguLNva3Tz8W0',
  authDomain: 'mucketlist-ecfd0.firebaseapp.com',
  projectId: 'mucketlist-ecfd0',
  storageBucket: 'mucketlist-ecfd0.appspot.com',
  messagingSenderId: '292072337648',
  appId: '1:292072337648:web:33b78fc06a59f13dbf1235',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
