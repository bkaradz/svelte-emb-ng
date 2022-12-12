// import * as cookie from 'cookie';
import config from 'config';
import type { loginCredentials } from '$lib/validation/login.validate';
import prisma from '$lib/prisma/client';
import bcrypt from 'bcrypt';
import type { Cookies } from '@sveltejs/kit';

export const setSessionCookies = (accessToken: string, cookies: Cookies) => {
	const accessTokenSerial = cookies.serialize('accessToken', accessToken, {
		maxAge: config.get('cookieAccessTokenTtl'), // 15min
		httpOnly: config.get('httpOnly'),
		domain: 'localhost',
		path: '/',
		sameSite: config.get('sameSite'),
		secure: config.get('secure')
	})

	return {
		'Set-Cookie': `${[accessTokenSerial]}`
	};
};

export const deleteSessionCookies = (cookies: Cookies) => {
	const accessTokenSerial = cookies.serialize('accessToken', '', {
		expires: new Date(0),
		httpOnly: true,
		domain: 'localhost',
		path: '/',
		sameSite: 'lax',
		secure: false
	})

	return {
		'Set-Cookie': `${[accessTokenSerial]}`
	};
};

export async function createSession(createDBy: any, userAgent: string) {
	const session = await prisma.sessions.create({
		data: {
			contactsId: parseInt(createDBy),
			userAgent,
			valid: true
		}
	})
	return session;
}

export async function findSessions(query: string) {
	const session = await prisma.sessions.findUnique({
		where: {
			id: parseInt(query),
		}
	})
	return session;
}

/**
 * @param userCredentials 
 * @returns 
 */
export async function validateUserPassword(userCredentials: loginCredentials) {

	const { email, password } = userCredentials

	const emailRes = await prisma.email.findUnique({
		where: {
			email: email,
		}
	})

	if (!emailRes?.contactsId) {
		throw new Error(`email not found`);
	}

	const userRes = await prisma.contacts.findUnique({
		where: {
			id: emailRes.contactsId,
		},
		select: {
			id: true,
			name: true,
			isActive: true,
			isUserActive: true,
			isUser: true,
			userRole: true,
			password: true
		},
	})

	if (!userRes) {
		throw new Error(`User not found`);
	}

	if (!userRes?.password) {
		throw new Error(`Not a valid not found`);
	}

	const isValid = await bcrypt.compare(password, userRes.password).catch(() => false);

	if (!isValid) {
		throw new Error(`Email or Password not valid`);
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
			id: parseInt(createDBy),
		}
	})
	return session;
}


