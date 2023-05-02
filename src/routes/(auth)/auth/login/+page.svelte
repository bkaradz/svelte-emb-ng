<script lang="ts">
	// import { goto } from '$app/navigation';
	import small_logo from '$lib/assets/small_logo.png';
	import { toasts } from '$lib/stores/toasts.store';
	// import logger from '$lib/utility/logger';
	import { svgEyeClose, svgEyeOpen, svgLogin } from '$lib/utility/svgLogos';
	import type { ActionData } from './$types';
	// import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
	// import { loginCredentialsSchema, type LoginCredentials } from '$lib/validation/login.validate';

	let errorMessages = new Map();

	export let form: ActionData
	$: console.log("🚀 ~ file: +page.svelte:14 ~ form:", form)

	// type FormData = {
	// 	email: string | undefined;
	// 	password: string | undefined;
	// };

	// const resetForm = () => {
	// 	return structuredClone(initFromData);
	// };

	const initFromData = {
		email: undefined,
		password: undefined
	};

	let formData: FormData = structuredClone(initFromData);

	// type formDataKeys = keyof LoginCredentials;

	const handleInput = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		let name = (event.target as HTMLInputElement).name as formDataKeys;
		let value = (event.target as HTMLInputElement).value;
		formData[name] = value;
	};

	$: disabled = false;

	// const handleLogin = async () => {
	// 	const parsedUser = loginCredentialsSchema.safeParse(formData);
	// 	if (!parsedUser.success) {
	// 		const errorMap = zodErrorMessagesMap(parsedUser);

	// 		if (errorMap) {
	// 			errorMessages = errorMap;
	// 		}
	// 		disabled = false;
	// 		return;
	// 	}
	// 	try {
	// 		const res = await fetch('/api/auth/login.json', {
	// 			method: 'POST',
	// 			body: JSON.stringify(formData),
	// 			headers: { 'Content-Type': 'application/json' },
	// 			credentials: 'include'
	// 		});

	// 		if (res.ok) {
	// 			const sessionData = await res.json();

	// 			formData = resetForm();
	// 			toasts.add({
	// 				message: `Login successful <bold class="pl-1 text-danger text-base">Welcome ${sessionData?.name}</bold>`,
	// 				type: 'success'
	// 			});
	// 			goto('/');
	// 		}
	// 		if (!res.ok) {
	// 			const errorMessage = await res.json();

	// 			formData = resetForm();
	// 			toasts.add({
	// 				message: `${errorMessage.message}`,
	// 				type: 'error'
	// 			});
	// 		}
	// 	} catch (err: any) {
	// 		logger.error(`Error: ${err}`);
	// 		toasts.add({ message: 'An error has occurred', type: 'error' });
	// 	}
	// };
	let isVisible = false;
	$: type = isVisible ? 'text' : 'password';

	// on:submit|preventDefault={handleLogin}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="h-full w-full max-w-md space-y-8">
	<div>
		<img class="mx-auto h-12 w-auto" src={small_logo} alt="Lilian Logo" />
		<h2 class="mt-6 text-center text-3xl font-bold text-pickled-bluewood-900">Login</h2>
	</div>

	<form class="mt-8 space-y-6"  method="POST" action="?/login">
		<div class="space-y-2 shadow-sm">
			<label for="email" class="flex justify-between text-sm">
				<span>Email</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('email') ? errorMessages.get('email') : ''}</span
				>
			</label>
			<input id="email" type="email" name="email" class="input" bind:value={formData.email} />

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
				<input id="password" {type} name="password" class="input" on:input={handleInput} />
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
