import { connectDB } from '$lib/database/mongooseDB';
import ContactsModel from '$lib/models/contacts.model';
import pick from 'lodash-es/pick';
import type { User } from "./signUp.json";
import * as cookie from 'cookie';
import { session } from '$app/stores';

const userData: Partial<User> = {
	"name": "John Doe",
	"email": "johndoe@example.com",
	"phone": "0733123456",
	"address": "1569 Old Lobengula",
	"password": "johnDoe123",
	"confirmPassword": "johnDoe123"
}

let userCookie: any


export const fetchPosts = async (uri: string, options: {method: string, headers?: any, body?: any}) => {
		const res = await fetch(uri, options);
		
    // console.log("🚀 ~ line 25 ~ fetchPosts ~ cookies", res.headers )
    // console.log("🚀 ~ line 25 ~ fetchPosts ~ cookies set-cookie", res.headers.get('set-cookie') )
    // console.log("🚀 ~ line 25 ~ fetchPosts ~ cookies content-type", res.headers.get('content-type') )
		userCookie = res.headers.get('set-cookie')
   
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
      console.log("🚀 ~ file: signOut.test.ts ~ line 67 ~ it ~ result", result)
			// session.set(JSON.parse(JSON.stringify(result)))  
      console.log("🚀 ~ file: signOut.test.ts ~ line 69 ~ it ~ result.authenticated", result?.authenticated)
			expect(result?.authenticated).toBeTruthy()
		});
		// Can not be tested because session can not be set from the backend
		// it('First User Logout: Should return an error if email is not provided:', async () => {
		// 	const uri = 'http://localhost:5173/api/auth/signOut.json'

		// 	const options = {
		// 		method: 'POST',
		// 		headers: userCookie
		// 	}

		// 	const result = await fetchPosts(uri, options);
    //   console.log("🚀 ~ file: signOut.test.ts ~ line 56 ~ it ~ result", result)
		// 	expect(result?.error?.issues[0]?.path[0]).toBe('You have successfully singed out')
		// });
		
	});
}