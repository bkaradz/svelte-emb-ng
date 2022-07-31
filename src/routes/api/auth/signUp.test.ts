import { connectDB } from '$lib/database/mongooseDB';
import ContactsModel from '$lib/models/contacts.model';
import type { User } from "./signUp.json";

const userData: Partial<User> = {
	"name": "John Doe",
	"email": "johndoe@example.com",
	"phone": "0733123456",
	"address": "1569 Old Lobengula",
	"password": "johnDoe123",
	"confirmPassword": "johnDoe123"
}

export const fetchPosts = async (formData: any) => {
		const res = await fetch('http://localhost:5173/api/auth/signUp.json', {
			method: 'POST',
			body: JSON.stringify(formData),
			headers: { 'Content-Type': 'application/json' }
		});
		return res.json();
};

if (import.meta.vitest) {
	const { describe, it, expect } = import.meta.vitest;

	beforeAll(async () => {
		await connectDB();
		await ContactsModel.deleteMany({})
	})

	describe('Sign up a user:', () => {
		it('Should return created user data with user name if successful:', async () => {
			const userData1 = {...userData}
			const result = await fetchPosts(userData1);
			expect(result?.name).toBe('John Doe')
		});
		it('Should return an error if name is not provided:', async () => {
			const userData1 = {...userData}
			delete userData1.name
			const result = await fetchPosts(userData1);
			expect(result?.error?.issues[0]?.path[0]).toBe('name')
		});
		it('Should return an error if email is not provided:', async () => {
			const userData1 = {...userData}
			delete userData1.email
			const result = await fetchPosts(userData1);
			expect(result?.error?.issues[0]?.path[0]).toBe('email')
		});
		it('Should return an error if phone is not provided:', async () => {
			const userData1 = {...userData}
			delete userData1.phone
			const result = await fetchPosts(userData1);
			expect(result?.error?.issues[0]?.path[0]).toBe('phone')
		});
		it('Should return an error if address is not provided:', async () => {
			const userData1 = {...userData}
			delete userData1.address
			const result = await fetchPosts(userData1);
			expect(result?.error?.issues[0]?.path[0]).toBe('address')
		});
		it('Should return an error if password is not provided:', async () => {
			const userData1 = {...userData}
			delete userData1.password
			const result = await fetchPosts(userData1);
			expect(result?.error?.issues[0]?.path[0]).toBe('password')
		});
		it('Should return an error if confirmPassword is not provided:', async () => {
			const userData1 = {...userData}
			delete userData1.confirmPassword
			const result = await fetchPosts(userData1);
			expect(result?.error?.issues[0]?.path[0]).toBe('confirmPassword')
		});
		it('Should return an error if password and confirmPassword do not match:', async () => {
			const userData1 = {...userData}
			userData1.confirmPassword = "johnDoe123a"
			const result = await fetchPosts(userData1);
			expect(result?.error?.issues[0]?.path[0]).toBe('confirmPassword')
		});
	});
}