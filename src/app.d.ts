/// <reference types="@sveltejs/kit" />
// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces

declare global {
	declare namespace App {
		interface userInterface {
			id: string;
			name: string;
			isActive: boolean;
			isUser: boolean;
			userRole: string;
			sessionID: string;
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
			user?: userInterface | Record<string, never> | null;
		}

		interface Platform { }

		interface Session {
			user?: userInterface | Record<string, never>;
		}

		interface Stuff { }
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
