# LISD

## Project Setup Guide

Follow these steps to set up the **LISD** project.

---

## Prerequisites

- **Node.js**
- **MySQL**
- **Firebase Account** (For authentication & Admin SDK)
- **Vue.js & Vite**
- **mkcert** (For local HTTPS)
---

## Installation & Setup

### 1. Set Up MySQL Database
Make sure **MySQL database** is created and correctly configured.

### 2. Install Dependencies
Run the following command in both **backend** and **frontend** folders:
```sh
npm install
```

### 3. Configure Backend Environment Variables
- Navigate to the `backend` folder.
- Copy `.env.example` to `.env`.
- Fill out `.env` with the correct values.

### 4. Configure Frontend Environment Variables
- Navigate to the `frontend` folder.
- Copy `.env.example` to `.env`.
- Fill out `.env` with Firebase credentials:
  - Go to **Firebase Console** → **Project Settings** → **General** → **SDK Setup and Configuration**.

### 5. Set Up Firebase Admin SDK
- Go to **Firebase Console** → **Project Settings** → **Service Accounts**.
- Click **Generate New Private Key**.
- Rename the downloaded file to **`firebase-adminsdk.json`**.
- Place it inside the `backend` folder.

### 6. Generate Local HTTPS Certificates

To enable **local HTTPS** for development:

1. **Install mkcert**  
   - **Windows:** [https://github.com/FiloSottile/mkcert#windows](https://github.com/FiloSottile/mkcert#windows)  

2. **Generate certificates**  
   In the project root (or inside `backend`), run:
   ```sh
   mkcert localhost
   ```
   This creates two files:
   - localhost.pem
   - localhost-key.pem
---

## 7. Running the Project

### Option 1: Manual Start
#### 8. Start the Backend
Navigate to the `backend` folder and run:
```sh
node server.js
```

#### 9. Start the Frontend
Navigate to the `frontend` folder and run:
```sh
npm run dev
```

#### 10. Open in Browser
Go to: [http://localhost:5173/](http://localhost:5173/)

### Option 2: Batch File
Alternatively to steps **7-9**, run the **start_project.bat** file
