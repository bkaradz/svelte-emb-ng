<script lang="ts">
	import suite from '$lib/validation/client/signUp.validate';
	import { goto } from '$app/navigation';
	import logger from '$lib/utility/logger';
	import classnames from 'vest/classnames';
	import { toasts } from '$lib/stores/toasts.store';
	import { svgSignUp } from '$lib/utility/svgLogos';
	import Input from '$lib/components/Input.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import small_logo from '$lib/assets/small_logo.png';
	import type { Contacts, Email } from '@prisma/client';

	let result = suite.get();

	let formData = {
		name: '',
		email: '',
		phone: '',
		address: '',
		password: '',
		confirmPassword: ''
	};

	type formDataKeys =  keyof typeof formData

	const handleInput = (event: any) => {
		let name = (event.target as HTMLInputElement).name as formDataKeys;
		let value = (event.target as HTMLInputElement).value;
		formData[name] = value;
		result = suite(formData, name);
	};

	$: cn = classnames(result, {
		warning: 'warning',
		invalid: 'error',
		valid: 'success'
	});

	$: disabled = !result.isValid();

	const resetForm = () => {
		formData = {
			name: '',
			email: '',
			phone: '',
			address: '',
			password: '',
			confirmPassword: ''
		};
	};

	const handleSignUp = async () => {
		try {
			const res = await fetch('/api/auth/signUp.json', {
				method: 'POST',
				body: JSON.stringify(formData),
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {

				resetForm();

				suite.reset();
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
			<Input
				name="name"
				label="Name"
				bind:value={formData.name}
				onInput={handleInput}
				messages={result.getErrors('name')}
				validityClass={cn('name')}
			/>

			<Input
				name="email"
				label="Email"
				bind:value={formData.email}
				onInput={handleInput}
				type="email"
				messages={result.getErrors('email')}
				validityClass={cn('email')}
			/>

			<Input
				name="phone"
				label="Phone"
				bind:value={formData.phone}
				onInput={handleInput}
				messages={result.getErrors('phone')}
				validityClass={cn('phone')}
			/>

			<Textarea
				name="address"
				label="Address"
				bind:value={formData.address}
				onInput={handleInput}
				messages={result.getErrors('address')}
				validityClass={cn('address')}
			/>

			<Input
				name="password"
				label="Password"
				bind:value={formData.password}
				onInput={handleInput}
				type="password"
				messages={result.getErrors('password')}
				validityClass={cn('password')}
			/>

			<Input
				name="confirmPassword"
				label="Confirm Password"
				bind:value={formData.confirmPassword}
				onInput={handleInput}
				type="password"
				messages={result.getErrors('confirmPassword')}
				validityClass={cn('confirmPassword')}
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
