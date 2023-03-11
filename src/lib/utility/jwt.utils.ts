import config from 'config';
import jwt from 'jsonwebtoken';

const privateKey = Buffer.from(config.get<string>('privateKeyBase64'), 'base64');
const publicKey = Buffer.from(config.get<string>('publicKeyBase64'), 'base64');

export interface userSessionInterface {
	id: number;
	name: string;
	isActive: boolean;
	isUserActive: boolean;
	isUser: boolean;
	userRole: 'ADMIN' | 'USER';
	sessionID: number;
	authenticated: boolean;
	iat: number;
	exp: number;
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
