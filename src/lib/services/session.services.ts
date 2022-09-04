import * as cookie from 'cookie';
import config from 'config';
import { loginCredentialsSchema, type loginCredentials } from '../../routes/api/auth/signIn.json/+server';
import prisma from '$lib/prisma/client';
import bcrypt from 'bcrypt';


export const setSessionCookies = (accessToken: string, refreshToken: string) => {
	return {
		'Set-Cookie': [
			cookie.serialize('accessToken', accessToken, {
				maxAge: config.get('cookieAccessTokenTtl'), // 15min
				httpOnly: config.get('httpOnly'),
				domain: 'localhost',
				path: '/',
				sameSite: config.get('sameSite'),
				secure: config.get('secure')
			}),
			cookie.serialize('refreshToken', refreshToken, {
				maxAge: config.get('cookieRefreshTokenTtl'), // 1year
				httpOnly: config.get('httpOnly'),
				domain: 'localhost',
				path: '/',
				sameSite: config.get('sameSite'),
				secure: config.get('secure')
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

export async function createSession(createDBy: any, userAgent: string) {
	const session = await prisma.sessions.create({
		data: {
			contactsId: createDBy,
			userAgent,
			valid: true
		}
	})
	return session;
}

export async function findSessions(query: string) {
	const session = await prisma.sessions.findUnique({
		where: {
			id: query,
		}
	})
	return session;
}

/**
 * @param userCredentials 
 * @returns 
 */
export async function validateUserPassword(userCredentials: loginCredentials) {

	const parsedUser = loginCredentialsSchema.safeParse(userCredentials)

	if (!parsedUser.success) {
		throw new Error(`${parsedUser.error}`);
	}

	const { email, password } = userCredentials

	const emailRes = await prisma.email.findUnique({
		where: {
			email: email,
		}
	})

	if (!emailRes) {
		return null;
	}

	const userRes = await prisma.contacts.findUnique({
		where: {
			id: emailRes.contactsId,
		},
		select: {
			id: true,
			name: true,
			isActive: true,
			isUser: true,
			userRole: true,
			password: true
		},
	})

	if (!userRes) {
		return null;
	}

	if (!userRes?.password) {
		return null;
	}

	const isValid = await bcrypt.compare(password, userRes.password).catch(() => false);

	if (!isValid) {
		return null;
	}

	{	// scope to remove password
		const { password, ...userRest } = userRes

		return userRest
	}
}

/**
 * Delete logout Session
 * @param createDBy -- User id from postgresql
 * @returns 
 */
export async function deleteSessions(createDBy: string) {
	const session = await prisma.sessions.delete({
		where: {
			id: createDBy,
		}
	})
	return session;
}


