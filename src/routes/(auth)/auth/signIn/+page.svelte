<script lang="ts">
	import logger from '$lib/utility/logger';
	import { toasts } from '$lib/stores/toasts.store';
	import { svgSignIn } from '$lib/utility/svgLogos';
	import small_logo from '$lib/assets/small_logo.png';
	import { goto } from '$app/navigation';
	import { loginCredentialsSchema, type loginCredentials } from '$lib/validation/signIn.validate';
	import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';

	let errorMessages = new Map();

	const resetForm = () => {
		return {
			email: '',
			password: ''
		};
	};

	let formData = resetForm();

	type formDataKeys = keyof loginCredentials;

	const handleInput = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		let name = (event.target as HTMLInputElement).name as formDataKeys;
		let value = (event.target as HTMLInputElement).value;
		formData[name] = value;
		// result = suite(formData, name);
		// const parsedUser = loginCredentialsSchema.safeParse(formData);
		// console.log('🚀 ~ file: +page.svelte ~ line 27 ~ handleInput ~ parsedUser', parsedUser);
	};

	$: disabled = false;

	const handleSignIn = async () => {
		const parsedUser = loginCredentialsSchema.safeParse(formData);
		if (!parsedUser.success) {
			const errorMap = zodErrorMessagesMap(parsedUser);

			if (errorMap) {
				errorMessages = errorMap;
			}
			return;
		}
		try {
			const res = await fetch('/api/auth/signIn.json', {
				method: 'POST',
				body: JSON.stringify(formData),
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include'
			});

			if (res.ok) {
				const sessionData = await res.json();

				formData = resetForm();
				toasts.add({
					message: `Sign In successful <bold class="pl-1 text-danger text-base">Welcome ${sessionData?.name}</bold>`,
					type: 'success'
				});
				goto('/');
			}
			if (!res.ok) {
				const errorMessage = await res.json();

				formData = resetForm();
				toasts.add({
					message: `${errorMessage.message}`,
					type: 'error'
				});
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({ message: 'An error has occured', type: 'error' });
		}
	};
</script>

<svelte:head>
	<title>Sign In</title>
</svelte:head>

<div class="h-full w-full max-w-md space-y-8">
	<div>
		<img class="mx-auto h-12 w-auto" src={small_logo} alt="Lilian Logo" />
		<h2 class="mt-6 text-center text-3xl font-bold text-pickled-bluewood-900">Login</h2>
	</div>

	<form novalidate class="mt-8 space-y-6" on:submit|preventDefault={handleSignIn}>
		<input type="hidden" name="remember" value="true" />
		<div class="space-y-2 shadow-sm">
			<label for="email" class="flex justify-between text-sm">
				<span>Email</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('email') ? errorMessages.get('email') : ''}</span
				>
			</label>
			<input type="email" name="email" class="input" bind:value={formData.email} />

			<label for="password" class="flex justify-between text-sm">
				<span>Password</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('password') ? errorMessages.get('password') : ''}</span
				>
			</label>
			<input type="email" name="password" class="input" bind:value={formData.password} />
		</div>

		<div>
			<button
				id="submit"
				{disabled}
				type="submit"
				class="relative flex w-full justify-center border border-transparent bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
			>
				<span class="absolute inset-y-0 left-0 flex items-center pl-3">
					{@html svgSignIn}
				</span>
				Login
			</button>
		</div>
	</form>
</div>
