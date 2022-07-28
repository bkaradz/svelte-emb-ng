/// <reference types="@sveltejs/kit" />

import type { ContactsDocument } from '$lib/models/contacts.model';
import type { SessionsDocument } from '$lib/models/sessions.model';

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces

declare global {
	declare namespace App {
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

		// interface DOMAttributes<T> {
		// 	onclickOutside?: CompositionEventHandler<T>;
		// }

		// interface HTMLAttributes<T> {
		// 	onclickOutside: () => void;
		// }

		// interface DOMAttributes<T extends EventHandler> {
		// 	onclickOutside?: MouseEventHandler<T> | undefined | null;
		// }

		interface HTMLProps<T> {
			onclickOutside?: (e: CustomEvent) => void;
		}
		interface Locals {
			user?: userInterface | Record<string, never>;
		}

		interface Platform {}

		interface Session {
			user?: userInterface | Record<string, never>;
		}

		interface Stuff {}
	}
}

// declare namespace svelte.JSX {
// 	interface DOMAttributes<T extends EventHandler> {
// 		onclickOutside?: MouseEventHandler<T> | undefined | null;
// 	}

// 	interface HTMLProps<T> {
// 		onclick_outside?: (e: CustomEvent) => void;
// 	}
// }
