// ==============================================
//  INSTRUKCJA: Wklej tutaj swoje dane z Firebase
// ==============================================
// 1. Wejdź na https://console.firebase.google.com
// 2. Kliknij "Dodaj projekt" (lub "Add project")
// 3. Nazwij go np. "budzet-domowy", kliknij dalej
// 4. Google Analytics — możesz wyłączyć, nie jest potrzebne
// 5. Po utworzeniu projektu kliknij ikonkę </> (Web) żeby dodać aplikację
// 6. Nazwij ją "budzet", kliknij "Zarejestruj"
// 7. Skopiuj wartości z firebaseConfig i wklej poniżej
//
// Potem włącz Realtime Database:
// 8. W menu bocznym Firebase kliknij "Build" → "Realtime Database"
// 9. Kliknij "Create Database"
// 10. Wybierz lokalizację (europe-west1 najlepsza dla PL)
// 11. Wybierz "Start in TEST MODE" → kliknij Enable
//
// WAŻNE: Test mode działa 30 dni. Potem zmień reguły na:
// {
//   "rules": {
//     ".read": true,
//     ".write": true
//   }
// }
// (albo dodaj autoryzację jeśli chcesz zabezpieczyć)

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAhevSQh95YAJPyGhkAvttPkmOzn6_B5-A",
  authDomain: "budzet-domowy-4ffe5.firebaseapp.com",
  databaseURL: "https://budzet-domowy-4ffe5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "budzet-domowy-4ffe5",
  storageBucket: "budzet-domowy-4ffe5.firebasestorage.app",
  messagingSenderId: "49483854369",
  appId: "1:49483854369:web:2d9f557a2531564152a960",
  measurementId: "G-LRT9PPHWKK"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
