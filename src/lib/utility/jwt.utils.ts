import jwt from 'jsonwebtoken';
import config from 'config';

const privateKey = Buffer.from(config.get<string>('privateKeyBase64'), 'base64');
const publicKey = Buffer.from(config.get<string>('publicKeyBase64'), 'base64');

interface userInterface {
	id: string;
	name: string;
	isCorporate: boolean;
	email: string;
	isActive: boolean;
	isUser: boolean;
	userRole: string;
	sessionID: string;
	authenticated: boolean;
}

export const signJwt = (object: Object, options?: jwt.SignOptions | undefined) => {
	return jwt.sign(object, privateKey, { ...(options && options), algorithm: 'RS256' });
};

export const verifyJwt = (token: string) => {
	try {
		const decoded = jwt.verify(token, publicKey);
		return {
			valid: true,
			expired: false,
			decoded
		};
	} catch (err: any) {
		return {
			valid: false,
			expired: err.message === 'jwt must be provided',
			decoded: null
		};
	}
};
