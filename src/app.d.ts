/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces

declare namespace App {
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
		user: import('$lib/types').User;
	}

	interface Platform {}

	interface Session {
		user?: import('$lib/types').User;
	}

	interface Stuff {}
}

// declare namespace svelte.JSX {
// 	interface DOMAttributes<T extends EventHandler> {
// 		onclickOutside?: MouseEventHandler<T> | undefined | null;
// 	}

// 	interface HTMLProps<T> {
// 		onclick_outside?: (e: CustomEvent) => void;
// 	}
// }
