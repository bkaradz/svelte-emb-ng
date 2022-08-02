import { connectDB } from '$lib/database/mongooseDB';
import ContactsModel from '$lib/models/contacts.model';
import pick from 'lodash-es/pick';
import type { User } from '../auth/signUp.json';

const userData: Partial<User> = {
	"name": "John Doe",
	"email": "johndoe@example.com",
	"phone": "0733123456",
	"address": "1569 Old Lobengula",
	"password": "johnDoe123",
	"confirmPassword": "johnDoe123"
}

export const fetchPosts = async (uri: string, options: {method: string, headers?: any, body?: any}) => {
		const res = await fetch(uri, options);
		return res?.json();
};


if (import.meta.vitest) {
	const { describe, it, expect } = import.meta.vitest;

	beforeAll(async () => {
		await connectDB();
		await ContactsModel.deleteMany({})
	})

	describe('Upload and Get user:', () => {
    it('First User Sign Up: Should return created user data with user name if successful:', async () => {
			const uri = 'http://localhost:5173/api/auth/signUp.json'

      const formData = {...userData}

      const options = {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      }
			
			const result = await fetchPosts(uri, options);
			expect(result?.name).toBe('John Doe')
			expect(result?.userRole).toBe('ADMIN')
		});
		it('First User Login: Should loggin first user as ADMIN, return session credentials:', async () => {
			const uri = 'http://localhost:5173/api/auth/signIn.json'

			const formData = pick(userData, 'email', 'password')

      const options = {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' }
      }
     
			const result = await fetchPosts(uri, options);      
			expect(result?.authenticated).toBeTruthy()
		});
		it('Upload contacts csv', async () => {
      const form = new FormData();
			const data = '../../../../../contacts 5cont.csv'
      form.append("contacts", data);

      const options = {
        method: 'POST',
        headers: {'Content-Type': 'multipart/form-data; boundary=---011000010111000001101001'},
        body: form
      };

			const uri = 'http://localhost:5173/api/contacts/upload.json'

			const result = await fetchPosts(uri, options);
      console.log("🚀 ~ file: index.test.ts ~ line 38 ~ it ~ result", result)
			expect(result?.name).toBe('John Doe')
			expect(result?.userRole).toBe('ADMIN')
		});
	});
}