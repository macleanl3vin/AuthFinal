// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAuth, initializeAuth, getReactNativePersistence} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwvFWiCaGlTxNboMH0pMMwQcjsL78hp4M",
  authDomain: "iosfaceid.firebaseapp.com",
  projectId: "iosfaceid",
  storageBucket: "iosfaceid.appspot.com",
  messagingSenderId: "338110400267",
  appId: "1:338110400267:web:fac24ad08f97485e18040e",
};

export const FIREBASE_APP = initializeApp(firebaseConfig);

const auth = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
