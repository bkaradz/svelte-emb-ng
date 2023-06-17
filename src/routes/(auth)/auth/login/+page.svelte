<script lang="ts">
	import { enhance } from '$app/forms';
	import small_logo from '$lib/assets/small_logo.png';
	import { toasts } from '$lib/stores/toasts.store';
	import { svgEyeClose, svgEyeOpen, svgLogin } from '$lib/utility/svgLogos';
	import type { ActionData } from './$types';


	let errorMessages = new Map();

	export let form: ActionData

	$: disabled = false;

	let isVisible = false;
	$: type = isVisible ? 'text' : 'password';

</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="h-full w-full max-w-md space-y-8">
	<div>
		<img class="mx-auto h-12 w-auto" src={small_logo} alt="Lilian Logo" />
		<h2 class="mt-6 text-center text-3xl font-bold text-pickled-bluewood-900">Login</h2>
	</div>

	<form class="mt-8 space-y-6"  method="POST" action="?/login" use:enhance>
		<div class="space-y-2 shadow-sm">
			<label for="username" class="flex justify-between text-sm">
				<span>Username</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('username') ? errorMessages.get('username') : ''}</span
				>
			</label>
			<input id="username" type="text" name="username" class="input" value={form?.username ?? ''} />

			<label for="password" class="flex justify-between text-sm">
				<span>Password</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('password') ? errorMessages.get('password') : ''}</span
				>
			</label>
			<div class="relative block w-full">
				<div class="absolute right-4 items-center ml-2 h-full">
					<button class="pt-2" on:click|preventDefault={() => (isVisible = !isVisible)}>
						{#if isVisible}
							<div>
								{@html svgEyeOpen}
							</div>
						{:else}
							<div>
								{@html svgEyeClose}
							</div>
						{/if}
					</button>
				</div>
				<input id="password" {type} name="password" class="input"  value={form?.password ?? ''}/>
			</div>
		</div>

		<div>
			<button
				id="submit"
				{disabled}
				on:change|preventDefault={() => (disabled = true)}
				type="submit"
				class="relative flex w-full justify-center border border-transparent bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
			>
				<span class="absolute inset-y-0 left-0 flex items-center pl-3">
					{@html svgLogin}
				</span>
				Login
			</button>
		</div>
	</form>
</div>
