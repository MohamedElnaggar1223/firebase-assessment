import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface CreateUserRequest {
    email: string;
    password: string;
    name: string;
    gender: string;
    uid?: string;
}

export const createUser = functions.https.onCall(async (data: CreateUserRequest) => {
    if (!data.email || !data.password || !data.name || !data.gender) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Missing required fields'
        );
    }

    try {
        const userRecord = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            uid: data.uid
        });

        await admin.firestore().collection('users').doc(userRecord.uid).set({
            name: data.name,
            gender: data.gender,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            uid: userRecord.uid
        };

    } catch (error: any) {
        console.error('Error creating user:', error);

        if (error.code === 'auth/email-already-exists') {
            throw new functions.https.HttpsError(
                'already-exists',
                'The email address is already in use'
            );
        }

        if (error.code === 'auth/invalid-email') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'The email address is invalid'
            );
        }

        throw new functions.https.HttpsError(
            'internal',
            'An error occurred while creating the user'
        );
    }
});