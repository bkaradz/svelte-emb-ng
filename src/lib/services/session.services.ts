import * as cookie from 'cookie';
import config from 'config';
import { loginCredentialsSchema, type loginCredentials } from '../../routes/api/auth/signIn.json/+server';
import prisma from '$lib/server/prisma';
import bcrypt from 'bcrypt';

export const setSessionCookies = (accessToken: string, refreshToken: string) => {
	const accessTokenSerial = cookie.serialize('accessToken', accessToken, {
		maxAge: config.get('cookieAccessTokenTtl'), // 15min
		httpOnly: config.get('httpOnly'),
		domain: 'localhost',
		path: '/',
		sameSite: config.get('sameSite'),
		secure: config.get('secure')
	})

	const refreshTokenSerial = cookie.serialize('refreshToken', refreshToken, {
		maxAge: config.get('cookieRefreshTokenTtl'), // 1year
		httpOnly: config.get('httpOnly'),
		domain: 'localhost',
		path: '/',
		sameSite: config.get('sameSite'),
		secure: config.get('secure')
	})
	return {
		'Set-Cookie': `${[accessTokenSerial, refreshTokenSerial]}`
	};
};

export const deleteSessionCookies = () => {
	const accessTokenSerial = cookie.serialize('accessToken', '', {
		expires: new Date(0),
		httpOnly: true,
		domain: 'localhost',
		path: '/',
		sameSite: 'lax',
		secure: false
	})
	const refreshTokenSerial = cookie.serialize('refreshToken', '', {
		expires: new Date(0),
		httpOnly: true,
		domain: 'localhost',
		path: '/',
		sameSite: 'lax',
		secure: false
	})
	return {
		'Set-Cookie': `${[accessTokenSerial, refreshTokenSerial]}`
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

	if (!emailRes.contactsId) {
		throw new Error(`email not found`);
	}

	const userRes = await prisma.contacts.findUnique({
		where: {
			id: parseInt(emailRes.contactsId),
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
			id: parseInt(createDBy),
		}
	})
	return session;
}


