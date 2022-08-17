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
const userData2: Partial<User> = {
	"name": "Jane Doe",
	"email": "janedoe@example.com",
	"phone": "0733123456",
	"address": "1569 Old Lobengula",
	"password": "janeDoe123",
	"confirmPassword": "janeDoe123"
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

	describe.skip('Sign In a user:', () => {
		it('First User Sign Up: Should return created user data with user name if successful:', async () => {
			const uri = 'http://localhost:5173/api/auth/signUp.json'
			const userData1 = {...userData}
			const result = await fetchPosts(userData1, uri);
			expect(result?.name).toBe('John Doe')
			expect(result?.userRole).toBe('ADMIN')
		});
		it('First User Login: Should loggin first user as ADMIN, return session credentials:', async () => {
			const uri = 'http://localhost:5173/api/auth/signIn.json'

			const userData1 = pick(userData, 'email', 'password')
     
			const result = await fetchPosts(userData1, uri);      
			expect(result?.authenticated).toBeTruthy()
		});
		it('First User Login: Should return an error if email is not provided:', async () => {
			const uri = 'http://localhost:5173/api/auth/signIn.json'

			const userData1 = pick(userData, 'email')

			const result = await fetchPosts(userData1, uri);
			expect(result?.error?.issues[0]?.path[0]).toBe('password')
		});
		it('First User Login: Should return an error if password is not provided:', async () => {
			const uri = 'http://localhost:5173/api/auth/signIn.json'

			const userData1 = pick(userData, 'password')

			const result = await fetchPosts(userData1, uri);
			expect(result?.error?.issues[0]?.path[0]).toBe('email')
		});
		it('Second User Sign Up: Should return created user data with user name if successful:', async () => {
			const uri = 'http://localhost:5173/api/auth/signUp.json'
			const userData1 = {...userData2}
			const result = await fetchPosts(userData1, uri);
			expect(result?.name).toBe('Jane Doe')
			expect(result?.userRole).toBe('USER')
		});
		it('Second User Login: Should return unauthorized if not approved by ADMIN:', async () => {
			const uri = 'http://localhost:5173/api/auth/signIn.json'

			const userData1 = pick(userData2, 'email', 'password')
     
			const result = await fetchPosts(userData1, uri);
			expect(result?.message).toBe('Unauthorized')
		});
	});
}