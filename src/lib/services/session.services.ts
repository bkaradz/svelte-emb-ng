import * as cookie from 'cookie';
import SessionsModel from '$lib/models/sessions.model';
import type { SessionsDocument } from '$lib/models/sessions.model';
import type { FilterQuery } from 'mongoose';
import ContactsModel from '$lib/models/contacts.model';
import type { ContactsDocument } from '$lib/models/contacts.model';
import omit from 'lodash-es/omit';
import config from 'config';

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

export type signedInUserInterface = Pick<
	ContactsDocument,
	'_id' | 'id' | 'name' | 'email' | 'isUser' | 'isCorporate' | 'isActive' | 'userRole'
>;

export async function validateSessionPassword({
	email,
	password
}: {
	email: ContactsDocument['email'];
	password: ContactsDocument['password'];
}) {
	const user: ContactsDocument = await ContactsModel.findOne(
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
		return false;
	}

	const isValid = await user.comparePassword(password);

	if (!isValid) {
		return false;
	}

	return omit(user.toJSON(), ['password']);
}

export async function deleteSessions(userId: ContactsDocument['_id']) {
	return await SessionsModel.findByIdAndDelete(userId);
}

export async function deleteAllSessionByUserID(userId: ContactsDocument['_id']) {
	return await SessionsModel.deleteMany({ userID: userId });
}
