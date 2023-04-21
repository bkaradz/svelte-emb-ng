import { z } from 'zod';

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


//  type Currency<TAmount> = {
// 	readonly code: string;
// 	readonly base: TAmount;
// 	readonly exponent: TAmount;
// };


//  type DineroOptions<TAmount> = {
//     readonly amount: TAmount;
//     readonly currency: Currency<TAmount>;
//     readonly scale?: TAmount;
// };


