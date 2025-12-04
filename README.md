# StoryMode Engine - Deployment Guide

This guide explains how to deploy the StoryMode Engine to Firebase.

## Prerequisites
1.  **Firebase CLI**: Install with `npm install -g firebase-tools`.
2.  **Firebase Project**: Create a project in the [Firebase Console](https://console.firebase.google.com/).
3.  **Blaze Plan**: Upgrade your Firebase project to the Blaze plan (required for Cloud Functions and external API calls to OpenRouter).

## Setup
1.  **Login**: Run `firebase login`.
2.  **Initialize**: Run `firebase init` in the root directory.
    *   Select **Functions** and **Hosting**.
    *   Use your existing project.
    *   **Functions**: Select `TypeScript`, use `functions` folder, install dependencies.
    *   **Hosting**: Use `frontend/dist` as the public directory. Configure as a single-page app (Yes).

## Configuration
### Environment Variables
You need to set environment variables for both the frontend (build time) and backend (runtime).

**Frontend (.env)**
Create `frontend/.env` (or set in your CI/CD):
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Backend (Firebase Config)**
Set the OpenRouter API key for Cloud Functions:
```bash
firebase functions:config:set openrouter.key="YOUR_OPENROUTER_API_KEY"
```
*Note: You'll need to update `functions/src/generateGame.ts` to use `functions.config().openrouter.key` instead of `process.env` if you use this method, or use `dotenv`.*

## Local Development
1.  **Install Dependencies**:
    ```bash
    cd frontend && npm install
    cd ../functions && npm install
    ```

2.  **Environment Variables**:
    Create `frontend/.env` with your Firebase config (see Configuration section).
    
    For Functions to work locally with OpenRouter, you need to set the key in the runtime environment or use a `.env` file in `functions/` (if using `dotenv`) or set it in the emulator shell.
    *Simplest way for MVP*: Hardcode the key temporarily for local dev OR use `firebase functions:config:get > .runtimeconfig.json` if you have set it via CLI (requires `firebase-tools` setup).

3.  **Run Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
    Open `http://localhost:5173`.

4.  **Run Backend (Emulators)**:
    ```bash
    firebase emulators:start
    ```
    *Note: You need to configure the frontend to use emulators if you want to test functions locally. In `frontend/src/firebase.ts`, add `connectFunctionsEmulator(functions, "localhost", 5001);`.*

    **Alternative (Easier)**: Deploy functions first, then run frontend locally connecting to live functions.

## Deployment
1.  **Build Frontend**:
    ```bash
    cd frontend
    npm install
    npm run build
    ```

2.  **Build Backend**:
    ```bash
    cd ../functions
    npm install
    npm run build
    ```

3.  **Deploy**:
    ```bash
    cd ..
    firebase deploy
    ```

## Post-Deployment
-   **Authentication**: Enable **Google Sign-In** in the Firebase Console -> Authentication -> Sign-in method.
-   **Firestore**: Create the `games` collection (optional, will be created automatically).
-   **Storage**: Ensure rules allow read access to `games/{gameId}/levels/{levelId}.json`.

## Troubleshooting
-   **CORS Errors**: If you see CORS errors when calling the function, ensure your function allows calls from your hosting domain. Callable functions usually handle this automatically.
-   **Cold Starts**: The first generation might be slow.
