import { getApps, initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyC6x4ZiwPBmzeJKEn0avOx2JwL1K-8x-Yk",
  authDomain: "lid-shop.firebaseapp.com",
  projectId: "lid-shop",
  storageBucket: "lid-shop.firebasestorage.app",
  messagingSenderId: "264653021326",
  appId: "1:264653021326:web:4cba37e0167a81f6bce9df",
  measurementId: "G-4VW92DHRFS"
}

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const analyticsPromise =
  import.meta.env.PROD && typeof window !== 'undefined'
    ? isSupported()
        .then((ok) => (ok ? getAnalytics(firebaseApp) : null))
        .catch(() => null)
    : Promise.resolve(null)

