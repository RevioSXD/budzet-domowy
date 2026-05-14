# 💰 Budżet Domowy — Piotr & Patrycja

Wspólna aplikacja do zarządzania budżetem domowym z synchronizacją w czasie rzeczywistym.
Działa na iPhonie i Androidzie jako zainstalowana aplikacja (PWA).

---

## 🚀 Instrukcja uruchomienia (krok po kroku)

### Krok 1: Załóż projekt Firebase (darmowy)

1. Wejdź na **https://console.firebase.google.com**
2. Zaloguj się kontem Google
3. Kliknij **„Dodaj projekt"** (lub „Add project")
4. Nazwij go np. `budzet-domowy`
5. Google Analytics — **wyłącz** (nie potrzebne), kliknij „Utwórz projekt"
6. Po utworzeniu kliknij ikonkę **</>** (Web) na stronie głównej projektu
7. Nazwij aplikację `budzet`, kliknij **„Zarejestruj"**
8. Zobaczysz blok kodu z `firebaseConfig` — **skopiuj te wartości**

### Krok 2: Włącz Realtime Database

1. W menu bocznym Firebase kliknij **Build → Realtime Database**
2. Kliknij **„Create Database"**
3. Lokalizacja: wybierz **europe-west1** (najbliżej Polski)
4. Tryb: wybierz **„Start in test mode"** → kliknij Enable
5. Gotowe! Baza danych działa.

> ⚠️ Test mode działa 30 dni. Po tym czasie wejdź w zakładkę "Rules" i wklej:
> ```json
> {
>   "rules": {
>     ".read": true,
>     ".write": true
>   }
> }
> ```

### Krok 3: Wklej dane Firebase do kodu

Otwórz plik **`src/firebase.js`** i zamień placeholdery na swoje dane:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",                    // ← Twój klucz
  authDomain: "budzet-domowy.firebaseapp.com",
  databaseURL: "https://budzet-domowy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "budzet-domowy",
  storageBucket: "budzet-domowy.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Krok 4: Wrzuć na Vercel (darmowy hosting)

**Opcja A — przez GitHub (zalecane):**
1. Załóż konto na **https://github.com** (jeśli nie masz)
2. Utwórz nowe repozytorium, wrzuć tam pliki projektu
3. Wejdź na **https://vercel.com**, zaloguj się kontem GitHub
4. Kliknij **„New Project"** → wybierz swoje repo
5. Framework: **Vite** (powinien się wykryć automatycznie)
6. Kliknij **Deploy** — gotowe!

**Opcja B — przez Vercel CLI (terminal):**
```bash
npm install -g vercel
cd budzet-app
npm install
npm run build
vercel --prod
```

### Krok 5: Zainstaluj na telefonie

Po wrzuceniu na Vercel dostaniesz link, np. `https://budzet-domowy.vercel.app`

**iPhone (Safari):**
1. Otwórz link w Safari
2. Kliknij ikonkę udostępniania (kwadrat ze strzałką ↑)
3. Wybierz **„Dodaj do ekranu początkowego"**
4. Gotowe — masz ikonkę na pulpicie!

**Android (Chrome):**
1. Otwórz link w Chrome
2. Kliknij trzy kropki ⋮ w prawym górnym rogu
3. Wybierz **„Zainstaluj aplikację"** lub **„Dodaj do ekranu głównego"**
4. Gotowe!

---

## 📱 Funkcje aplikacji

- **Przegląd** — podsumowanie budżetu obu osób, pasek wydatków
- **Piotr / Patrycja** — osobne zakładki z przychodami, stałymi kosztami i wydatkami dodatkowymi
- **Kategorie** — wykres wydatków z podziałem na typy (kredyty, media, jedzenie, paliwo itd.)
- **Miesiące** — strzałkami przełączasz miesiąc, każdy zapisuje się osobno
- **Synchronizacja** — zmiany widoczne natychmiast na obu telefonach
- **PWA** — działa jak natywna aplikacja, pełny ekran, ikonka na pulpicie

---

## 🛠️ Rozwój lokalny

```bash
npm install
npm run dev
```

Otwórz `http://localhost:5173` w przeglądarce.
