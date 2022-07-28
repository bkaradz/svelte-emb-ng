import jwt from 'jsonwebtoken';
import config from 'config';
import type { ContactsDocument } from '$lib/models/contacts.model';
import type { SessionsDocument } from '$lib/models/sessions.model';

const privateKey = Buffer.from(config.get<string>('privateKeyBase64'), 'base64');
const publicKey = Buffer.from(config.get<string>('publicKeyBase64'), 'base64');

interface userInterface {
	_id: ContactsDocument['_id'];
	name: ContactsDocument['name'];
	isCorporate: ContactsDocument['isCorporate'];
	email: ContactsDocument['email'];
	isActive: ContactsDocument['isActive'];
	isUser: ContactsDocument['isUser'];
	userRole: ContactsDocument['userRole'];
	sessionId: SessionsDocument['_id'];
	authenticated: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const signJwt = (object: Object, options?: jwt.SignOptions | undefined) => {
	return jwt.sign(object, privateKey, { ...(options && options), algorithm: 'RS256' });
};

export const verifyJwt = (token: string) => {
	try {
		const decoded = jwt.verify(token, publicKey) as userInterface;
		return {
			valid: true,
			expired: false,
			decoded
		};
	} catch (err) {
		return {
			valid: false,
			expired: err.message === 'jwt must be provided',
			decoded: null
		};
	}
};
