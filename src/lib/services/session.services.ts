// import * as cookie from 'cookie';
import prisma from '$lib/prisma/client';
import type { LoginCredentials } from '$lib/validation/login.validate';
import type { Cookies } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import config from 'config';

export const setSessionCookies = (accessToken: string, cookies: Cookies) => {
	const accessTokenSerial = cookies.serialize('accessToken', accessToken, {
		maxAge: config.get('cookieAccessTokenTtl'), // 15min
		httpOnly: config.get('httpOnly'),
		path: '/',
		sameSite: config.get('sameSite'),
		secure: config.get('secure')
	});

	return {
		'Set-Cookie': `${[accessTokenSerial]}`
	};
};

export const deleteSessionCookies = (cookies: Cookies) => {
	const accessTokenSerial = cookies.serialize('accessToken', '', {
		expires: new Date(0),
		httpOnly: true,
		path: '/',
		sameSite: 'lax',
		secure: config.get('secure')
	});

	return {
		'Set-Cookie': `${[accessTokenSerial]}`
	};
};

export async function createSession(createDBy: number, userAgent: string) {
	const session = await prisma.sessions.create({
		data: {
			contactsId: createDBy,
			userAgent,
			valid: true
		}
	});
	return session;
}

export async function findSessions(query: number) {
	const session = await prisma.sessions.findUnique({
		where: {
			id: query
		}
	});
	return session;
}

/**
 * @param userCredentials
 * @returns
 */
export async function validateUserPassword(userCredentials: LoginCredentials) {
	const { email, password } = userCredentials;

	const emailRes = await prisma.email.findUnique({
		where: {
			email: email
		}
	});

	if (!emailRes?.contactsId) {
		throw new Error(`email not found`);
	}

	const userRes = await prisma.contacts.findUnique({
		where: {
			id: emailRes.contactsId
		},
		select: {
			id: true,
			name: true,
			isActive: true,
		}
	});

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

	{
		// scope to remove password
		const { password, ...userRest } = userRes;

		return userRest;
	}
}

/**
 * Delete logout Session
 * @param createDBy -- User id from postgresql
 * @returns
 */
export async function deleteSessions(sessionId: number) {
	const session = await prisma.sessions.delete({
		where: {
			id: sessionId
		}
	});
	return session;
}
