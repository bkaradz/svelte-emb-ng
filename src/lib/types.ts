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

export type User = userSessionInterface | null;
