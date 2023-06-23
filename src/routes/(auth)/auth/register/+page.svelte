<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import small_logo from '$lib/assets/small_logo.png';
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import { svgEyeClose, svgEyeOpen, svgRegister } from '$lib/utility/svgLogos';
	import type { ActionData } from './$types';

	let errorMessages = new Map();

	export let form: ActionData;

	$: disabled = false;

	let passwordIsVisible = false;
	$: passwordType = passwordIsVisible ? 'text' : 'password';

	let confirmPasswordIsVisible = false;
	$: confirmPasswordType = confirmPasswordIsVisible ? 'text' : 'password';
</script>

<svelte:head>
	<title>Register</title>
</svelte:head>

<div class="h-full w-full max-w-md space-y-8">
	<div>
		<img class="mx-auto h-12 w-auto" src={small_logo} alt="Lilian Logo" />
		<h2 class="mt-6 text-center text-3xl font-bold text-pickled-bluewood-900">Register</h2>
	</div>
	<form class="mt-8 space-y-6" method="POST" action="?/register" use:enhance>
		<input type="hidden" name="remember" value="true" />
		<div class="space-y-2 shadow-sm">
			<label for="name" class="flex justify-between text-sm">
				<span>Name</span>
				<span class="text-xs text-danger">
					{errorMessages.get('name') ? errorMessages.get('name') : ''}
				</span>
			</label>
			<input type="text" name="name" class="input" value={form?.name ?? ''} />

			<label for="username" class="flex justify-between text-sm">
				<span>Username</span>
				<span class="text-xs text-danger">
					{errorMessages.get('username') ? errorMessages.get('username') : ''}
				</span>
			</label>
			<input type="text" name="username" class="input" value={form?.username ?? ''} />

			<label for="password" class="flex justify-between text-sm">
				<span>Password</span>
				<span class="text-xs text-danger">
					{errorMessages.get('password') ? errorMessages.get('password') : ''}
				</span>
			</label>
			<div class="relative block w-full">
				<div class="absolute right-4 items-center ml-2 h-full">
					<button
						class="pt-2"
						on:click|preventDefault={() => (passwordIsVisible = !passwordIsVisible)}
					>
						{#if passwordIsVisible}
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
				<input name="password" type={passwordType} class="input" value={form?.password ?? ''} />
			</div>

			<label for="confirmPassword" class="flex justify-between text-sm">
				<span>Confirm Password</span>
				<span class="text-xs text-danger">
					{errorMessages.get('confirmPassword') ? errorMessages.get('confirmPassword') : ''}
				</span>
			</label>
			<div class="relative block w-full">
				<div class="absolute right-4 items-center ml-2 h-full">
					<button
						class="pt-2"
						on:click|preventDefault={() => (confirmPasswordIsVisible = !confirmPasswordIsVisible)}
					>
						{#if confirmPasswordIsVisible}
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
				<input
					type={confirmPasswordType}
					name="confirmPassword"
					class="input"
					value={form?.confirmPassword ?? ''}
				/>
			</div>

			<div>
				<button
					{disabled}
					on:change|preventDefault={() => (disabled = true)}
					type="submit"
					class="group relative flex w-full mt-5 justify-center border border-transparent bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<span class="absolute inset-y-0 left-0 flex items-center pl-3">
						{@html svgRegister}
					</span>
					Register
				</button>
			</div>
		</div>
	</form>
</div>
