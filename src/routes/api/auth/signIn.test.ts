import { connectDB } from '$lib/database/mongooseDB';
import ContactsModel from '$lib/models/contacts.model';
import pick from 'lodash-es/pick';
import type { User } from "./signUp.json";

const userData: Partial<User> = {
	"name": "John Doe",
	"email": "johndoe@example.com",
	"phone": "0733123456",
	"address": "1569 Old Lobengula",
	"password": "johnDoe123",
	"confirmPassword": "johnDoe123"
}

export const fetchPosts = async (formData: any, uri: string) => {
		const res = await fetch(uri, {
			method: 'POST',
			body: JSON.stringify(formData),
			headers: { 'Content-Type': 'application/json' }
		});
		return res?.json();
};


if (import.meta.vitest) {
	const { describe, it, expect } = import.meta.vitest;

	beforeAll(async () => {
		await connectDB();
		await ContactsModel.deleteMany({})
	})

	describe('Sign up a user:', () => {
		it('Should return created user data with user name if successful:', async () => {
			const uri = 'http://localhost:5173/api/auth/signUp.json'
			const userData1 = {...userData}
			const result = await fetchPosts(userData1, uri);
			expect(result?.name).toBe('John Doe')
		});
		it('Should return logged in user session credentials:', async () => {
			const uri = 'http://localhost:5173/api/auth/signIn.json'

			const userData1 = pick(userData, 'email', 'password')
      
			const result = await fetchPosts(userData1, uri);
      
			expect(result?.authenticated).toBeTruthy()
		});
		it('Should return an error if email is not provided:', async () => {
			const uri = 'http://localhost:5173/api/auth/signIn.json'

			const userData1 = pick(userData, 'email')

			const result = await fetchPosts(userData1, uri);
			expect(result?.error).toBeTruthy()
		});
		it('Should return an error if password is not provided:', async () => {
			const uri = 'http://localhost:5173/api/auth/signIn.json'

			const userData1 = pick(userData,  'password')

			const result = await fetchPosts(userData1, uri);
			expect(result?.error).toBeTruthy()
		});	
	});
}