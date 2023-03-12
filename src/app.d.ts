/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces

declare namespace App {
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
