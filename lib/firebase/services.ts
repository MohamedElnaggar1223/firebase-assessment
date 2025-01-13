import { functions } from './config';
import { httpsCallable } from 'firebase/functions';

export interface CreateUserParams {
    email: string;
    password: string;
    name: string;
    gender: string;
    uid?: string;
}

export interface CreateUserResponse {
    success: boolean;
    uid: string;
}

export const createUserWithFirebase = async (userData: CreateUserParams): Promise<CreateUserResponse> => {
    try {
        const createUserFunction = httpsCallable<CreateUserParams, CreateUserResponse>(
            functions,
            'createUser'
        );

        const result = await createUserFunction(userData);
        return result.data;
    } catch (error: any) {
        const message = error.message || 'An error occurred while creating the user';
        throw new Error(message);
    }
};