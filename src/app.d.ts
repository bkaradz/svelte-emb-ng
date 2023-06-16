// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('$lib/types').User;
			auth: import("lucia-auth").AuthRequest;
		}
		
		// interface PageData {}
		// interface Platform {}
	}
	// This is not working
	namespace svelteHTML {
		interface HTMLAttributes<T> {
			'on:clickOutside'?: (e: CustomEvent) => void;
		}
	}
	// This is working
	namespace svelte.JSX {
		interface HTMLAttributes<T> {
			onclickOutside?: (e: CustomEvent) => void;
		}
	}

	namespace Lucia {
		type Auth = import("$lib/lucia").Auth;
		type UserAttributes = {
			username: string;
		};
	}
}

export {};
