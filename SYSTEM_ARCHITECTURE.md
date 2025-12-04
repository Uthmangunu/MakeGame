# StoryMode Engine - System Architecture

This document explains the technical systems that make up the StoryMode Engine.

## 1. High-Level Overview
The application is a **Web-based Game Engine** that uses **Generative AI** to create content. It follows a standard "Client-Server" architecture, but with "Serverless" functions for backend logic.

```mermaid
graph TD
    User[User] -->|Plays Game| Frontend[React Frontend]
    User -->|Creates Story| Frontend
    Frontend -->|Auth & Data| Firebase[Firebase (Auth, DB, Storage)]
    Frontend -->|Generates Game| CloudFunc[Cloud Function]
    CloudFunc -->|Prompts| AI[OpenRouter / Gemini AI]
    AI -->|Returns JSON| CloudFunc
    CloudFunc -->|Saves Level| Firebase
```

## 2. The Systems

### A. The Frontend System (Client)
*   **Role**: The interface the user sees. Handles game rendering and UI.
*   **Tech**: React, Vite, TypeScript, Phaser.
*   **Key Components**:
    1.  **GameCanvas (`GameCanvas.tsx`)**: The bridge between React (UI) and Phaser (Game Loop). It initializes the game engine.
    2.  **Game State Manager (`gameState.ts`)**: The "brain" of the running game. It keeps track of:
        *   Which level is loaded?
        *   Where is the player?
        *   What "flags" (variables) are set? (e.g., `hasKey = true`)
    3.  **Phaser Scene (`GameScene.ts`)**: The "eyes" of the game. It draws the tiles, handles player input (WASD), and detects collisions.

### B. The Backend System (Serverless)
*   **Role**: Handles secure tasks like talking to the AI and saving data.
*   **Tech**: Firebase Cloud Functions, Node.js.
*   **Key Components**:
    1.  **Generator Function (`generateGame.ts`)**:
        *   Receives a story prompt.
        *   Constructs a strict system prompt for the AI ("You are a game designer... output JSON").
        *   Calls the AI API securely (using the hidden API Key).
        *   Validates the AI's output.
        *   Saves the result to the database.

### C. The Data System (Persistence)
*   **Role**: Stores users, games, and levels.
*   **Tech**: Firebase Firestore & Storage.
*   **Structure**:
    *   **Firestore (`games` collection)**: Stores metadata (Title, Summary, Author).
    *   **Storage (`games/{id}/levels/`)**: Stores the heavy JSON files for each level.

### D. The AI Pipeline
*   **Role**: The "Creative Director".
*   **Flow**:
    1.  **Input**: "A knight needs to find a sword in a cave."
    2.  **Processing**: AI converts this into a grid of numbers (0=wall, 1=floor) and objects.
    3.  **Output**: A structured JSON file that the Frontend System knows how to read.

## 3. Security Measures
*   **Environment Variables (`.env`)**: Secrets like the `OPENROUTER_API_KEY` are stored in `.env` files.
*   **Git Ignore (`.gitignore`)**: Tells Git to *never* upload `.env` files to the cloud.
*   **Server-Side Generation**: We never call the AI from the Frontend. We call a Cloud Function, which calls the AI. This keeps the key hidden from users.
