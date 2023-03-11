export interface userInterface {
	sessionID: string;
	authenticated: boolean;
	id: string;
	name: string;
	isActive: boolean;
	isUser: boolean;
	userRole: string;
}

export type User = userInterface | null;
