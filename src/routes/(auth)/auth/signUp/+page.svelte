<script lang="ts">
	import { UserSignUpSchema } from '$lib/validation/signUp.validate';
	import { goto } from '$app/navigation';
	import logger from '$lib/utility/logger';
	import { toasts } from '$lib/stores/toasts.store';
	import { svgSignUp } from '$lib/utility/svgLogos';
	import small_logo from '$lib/assets/small_logo.png';
	import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';

	let errorMessages = new Map();

	const resetForm = () => {
		return {
			name: '',
			email: '',
			phone: '',
			address: '',
			password: '',
			confirmPassword: ''
		};
	};

	let formData = resetForm();

	type formDataKeys = keyof typeof formData;

	const handleInput = (event: any) => {
		let name = (event.target as HTMLInputElement).name as formDataKeys;
		let value = (event.target as HTMLInputElement).value;
		formData[name] = value;
	};

	$: disabled = false;

	const handleSignUp = async () => {
		const parsedUser = UserSignUpSchema.safeParse(formData);
		if (!parsedUser.success) {
			const errorMap = zodErrorMessagesMap(parsedUser);

			if (errorMap) {
				errorMessages = errorMap;
			}
			return;
		}
		try {
			const res = await fetch('/api/auth/signUp.json', {
				method: 'POST',
				body: JSON.stringify(formData),
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				formData = resetForm();

				toasts.add({
					message: 'Sign Up was successful',
					type: 'success'
				});
				goto('/auth/signIn');
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({ message: 'An error has occured', type: 'error' });
		}
	};
</script>

<svelte:head>
	<title>Sign Up</title>
</svelte:head>

<div class="h-full w-full max-w-md space-y-8">
	<div>
		<img class="mx-auto h-12 w-auto" src={small_logo} alt="Lilian Logo" />
		<h2 class="mt-6 text-center text-3xl font-bold text-pickled-bluewood-900">Register</h2>
	</div>
	<form class="mt-8 space-y-6" on:submit|preventDefault={handleSignUp}>
		<input type="hidden" name="remember" value="true" />
		<div class="space-y-2 shadow-sm">
			<label for="name" class="flex justify-between text-sm">
				<span>Name</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('name') ? errorMessages.get('name') : ''}</span
				>
			</label>
			<input type="text" name="name" class="input" bind:value={formData.name} />

			<label for="email" class="flex justify-between text-sm">
				<span>Email</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('email') ? errorMessages.get('email') : ''}</span
				>
			</label>
			<input type="email" name="email" class="input" bind:value={formData.email} />

			<label for="phone" class="flex justify-between text-sm">
				<span>Phone</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('phone') ? errorMessages.get('phone') : ''}</span
				>
			</label>
			<input type="text" name="phone" class="input" bind:value={formData.phone} />

			<label for="address" class="flex justify-between text-sm">
				<span>Address</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('address') ? errorMessages.get('address') : ''}</span
				>
			</label>
			<textarea name="address" class="input" bind:value={formData.address} cols="10" rows="5" />

			<label for="password" class="flex justify-between text-sm">
				<span>Password</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('password') ? errorMessages.get('password') : ''}</span
				>
			</label>
			<input type="password" name="password" class="input" bind:value={formData.password} />

			<label for="confirmPassword" class="flex justify-between text-sm">
				<span>Confirm Password</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('confirmPassword') ? errorMessages.get('confirmPassword') : ''}</span
				>
			</label>
			<input
				type="password"
				name="confirmPassword"
				class="input"
				bind:value={formData.confirmPassword}
			/>

			<div>
				<button
					{disabled}
					type="submit"
					class="group relative flex w-full justify-center border border-transparent  bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<span class="absolute inset-y-0 left-0 flex items-center pl-3">
						{@html svgSignUp}
					</span>
					Register
				</button>
			</div>
		</div>
	</form>
</div>
