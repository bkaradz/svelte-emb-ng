import * as cookie from 'cookie';
import SessionsModel from '$lib/models/sessions.model';
import type { SessionsDocument } from '$lib/models/sessions.model';
import type { FilterQuery } from 'mongoose';
import ContactsModel from '$lib/models/contacts.model';
import type { ContactsDocument } from '$lib/models/contacts.model';
import config from 'config';
import { loginCredentialsSchema, type loginCredentials } from '../../routes/api/auth/signIn.json';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday'
dayjs.extend(isToday)

export const setSessionCookies = (accessToken: string, refreshToken: string) => {
	return {
		'Set-Cookie': [
			cookie.serialize('accessToken', accessToken, {
				maxAge: config.get('cookieAccessTokenTtl'), // 15min
				httpOnly: true,
				domain: 'localhost',
				path: '/',
				sameSite: 'lax',
				secure: false
			}),
			cookie.serialize('refreshToken', refreshToken, {
				maxAge: config.get('cookieRefreshTokenTtl'), // 1year
				httpOnly: true,
				domain: 'localhost',
				path: '/',
				sameSite: 'lax',
				secure: false
			})
		]
	};
};

export const deleteSessionCookies = () => {
	return {
		'Set-Cookie': [
			cookie.serialize('accessToken', '', {
				expires: new Date(0),
				httpOnly: true,
				domain: 'localhost',
				path: '/',
				sameSite: 'lax',
				secure: false
			}),
			cookie.serialize('refreshToken', '', {
				expires: new Date(0),
				httpOnly: true,
				domain: 'localhost',
				path: '/',
				sameSite: 'lax',
				secure: false
			})
		]
	};
};

export async function createSession(userId: ContactsDocument['_id'], userAgent: string) {
	const session = await SessionsModel.create({ user: userId, userAgent });
	return session;
}

export async function findSessions(query: FilterQuery<SessionsDocument>) {
	return await SessionsModel.find(query).lean();
}

/**
 * @param userCredentials 
 * @returns 
 */
export async function validateUserPassword(userCredentials: loginCredentials): Promise<null | Omit<ContactsDocument, 'password'>> {

	const parsedUser = loginCredentialsSchema.safeParse(userCredentials)

	if (!parsedUser.success) {
		throw new Error(`${parsedUser.error}`);	
	}

	const {email, password } = userCredentials

	const user: ContactsDocument | null = await ContactsModel.findOne(
		{ email },
		{
			phone: 0,
			address: 0,
			balanceDue: 0,
			totalReceipts: 0,
			createdAt: 0,
			updatedAt: 0,
			__v: 0
		}
	);

	if (!user) {
		return null;
	}

	const isValid = await user.comparePassword(password);

	if (!isValid) {
		return null;
	}

	delete user.password

	return user;
}

/**
 * Delete logout Session
 * @param userID -- User id from mongodb
 * @returns 
 */
export async function deleteSessions(userId: ContactsDocument['_id']) {
	return await SessionsModel.findByIdAndDelete(userId);
}


