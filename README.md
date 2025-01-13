# Firebase User Creation Function Setup Guide

This guide will help you set up a Firebase Cloud Function that handles user registration in your Firebase project. The function creates a new user in Firebase Authentication and stores additional user information in Firestore.

## Prerequisites

Before starting, you'll need:
1. A Google account
2. A credit card (required for the Blaze plan, but you likely won't be charged unless you have high usage)
3. Node.js installed on your computer ([Download Here](https://nodejs.org/))

## Step-by-Step Setup Guide

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a name for your project (e.g., "assessment-mohamed-elnaggar")
4. Choose whether to enable Google Analytics (you can choose to disable it for now)
5. Accept the terms and click "Create Project"

### 2. Upgrade to the Blaze Plan (Required for Cloud Functions)

1. In the Firebase Console, click on "Upgrade" (in the left sidebar)
2. Select "Blaze" (Pay as you go) plan
3. Add your credit card information
   - Don't worry! Firebase has a generous free tier, and you'll only be charged if you exceed it
   - You can set up budget alerts to avoid unexpected charges

### 3. Enable Required Services

1. In the Firebase Console:
2. Click "Authentication" in the left sidebar
   - Click "Get Started"
   - In the "Sign-in method" tab
   - Enable "Email/Password" authentication
3. Click "Firestore Database" in the left sidebar
   - Click "Create Database"
   - Choose "Start in production mode"
   - Select a location closest to your users
   - Click "Enable"

### 4. Set Up Your Local Environment

1. Open Terminal (Mac/Linux) or Command Prompt (Windows)
2. Install Firebase CLI by running:
   ```bash
   npm install -g firebase-tools
   ```
3. Log in to Firebase:
   ```bash
   firebase login
   ```
4. Create a new directory for your project:
   ```bash
   mkdir my-firebase-function
   cd my-firebase-function
   ```

### 5. Initialize Firebase Function

1. In your project directory, run:
   ```bash
   firebase init functions
   ```
2. When prompted:
   - Select your Firebase project
   - Choose TypeScript
   - Say "Yes" to using ESLint
   - Install dependencies with npm

### 6. Add Function Code

1. Replace the contents of `functions/src/index.ts` with the code below:

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();

const db = getFirestore();
const auth = getAuth();

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  gender: string;
  uid?: string;
}

export const createUser = onCall(async (request) => {
  const data = request.data as CreateUserRequest;

  if (!data.email || !data.password || !data.name || !data.gender) {
    throw new HttpsError(
      'invalid-argument',
      'Missing required fields'
    );
  }

  try {
    const userRecord = await auth.createUser({
      email: data.email,
      password: data.password,
      uid: data.uid
    });

    await db.collection('users').doc(userRecord.uid).set({
      name: data.name,
      gender: data.gender,
      createdAt: new Date()
    });

    return {
      success: true,
      uid: userRecord.uid
    };

  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.code === 'auth/email-already-exists') {
      throw new HttpsError(
        'already-exists',
        'The email address is already in use'
      );
    }

    if (error.code === 'auth/invalid-email') {
      throw new HttpsError(
        'invalid-argument',
        'The email address is invalid'
      );
    }

    throw new HttpsError(
      'internal',
      'An error occurred while creating the user'
    );
  }
});
```

### 7. Add Firestore Security Rules

1. In the Firebase Console, go to Firestore Database
2. Click on the "Rules" tab
3. Replace the existing rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click "Publish"

### 8. Deploy the Function

1. In your terminal, make sure you're in the project directory
2. Run:
   ```bash
   firebase deploy --only functions 
   ```
3. Wait for deployment to complete (usually takes 1-2 minutes)

### Using the Registration System

Once everything is set up and deployed, you can start registering users:

1. Open your web browser
2. Go to your website's registration page at: `/register`
   - If you're running locally: http://localhost:3000/register
   - If you've deployed your site: https://your-domain.com/register

3. On the registration page, you'll see a form where users can enter:
   - Email address
   - Password
   - Full name
   - Gender

4. Fill out all the required information and click "Create account"

When a user registers:
- Their account will be created in Firebase Authentication
- Their profile information will be stored securely in Firestore
- They'll be redirected to the login page after successful registration

Note: If you see any errors during registration, make sure:
- The email address hasn't been used before
- The password is at least 6 characters long
- All fields are filled out correctly