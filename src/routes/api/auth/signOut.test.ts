import { connectDB } from '$lib/database/mongooseDB';
import ContactsModel from '$lib/models/contacts.model';
import pick from 'lodash-es/pick';
import type { User } from "./signUp.json";
import * as cookie from 'cookie';

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
		// const { authToken } = req.cookies
		// loginRes.headers["set-cookie"][0];
		// const cookies = cookie.parse(res.headers.get('cookie') || '');
    console.log("🚀 ~ line 25 ~ fetchPosts ~ cookies", res.headers )
    console.log("🚀 ~ line 25 ~ fetchPosts ~ cookies set-cookie", res.headers.get('set-cookie') )
    console.log("🚀 ~ line 25 ~ fetchPosts ~ cookies content-type", res.headers.get('content-type') )
    console.log("🚀 ~ line 25 ~ fetchPosts ~ cookies set-cookie", res.headers["set-cookie"])
   
		return res?.json();
};


if (import.meta.vitest) {
	const { describe, it, expect } = import.meta.vitest;

	beforeAll(async () => {
		await connectDB();
		await ContactsModel.deleteMany({})
	})

	describe('Sign Out a user:', () => {
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
		it('First User Logout: Should return an error if email is not provided:', async () => {
			const uri = 'http://localhost:5173/api/auth/signOut.json'

			const userData1 = {}

			const result = await fetchPosts(userData1, uri);
      console.log("🚀 ~ file: signOut.test.ts ~ line 56 ~ it ~ result", result)
			expect(result?.error?.issues[0]?.path[0]).toBe('You have successfully singed out')
		});
		
	});
}