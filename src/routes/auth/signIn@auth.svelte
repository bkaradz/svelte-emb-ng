<script lang="ts">
	import { session } from '$app/stores';
	import suite from '$lib/validation/client/signIn.validate';
	import logger from '$lib/utility/logger';
	import classnames from 'vest/classnames';
	import { goto } from '$app/navigation';
	import { toasts } from '$lib/stores/toasts.store';
	import { svgSignIn } from '$lib/utility/svgLogos';
	import Input from '$lib/components/Input.svelte';
	import small_logo from '$lib/assets/small_logo.png';

	let result = suite.get();

	interface formDataType {
		email: string;
		password: string;
	}

	let formData: formDataType = {
		email: '',
		password: ''
	};

	const handleInput = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		let name = (event.target as HTMLInputElement).name;
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
			email: '',
			password: ''
		};
	};

	const handleSignIn = async () => {
		try {
			const res = await fetch('/api/auth/signIn.json', {
				method: 'POST',
				body: JSON.stringify(formData),
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				const sessionData = await res.json();
				resetForm();
				suite.reset();
				$session = sessionData;
				toasts.add({
					message: `Sign In successful <bold class="pl-1 text-danger text-base">Welcome ${sessionData.user.name}</bold>`,
					type: 'success'
				});
				await goto('/');
			}
		} catch (err) {
			logger.error(err.messages);
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

	<form class="mt-8 space-y-6" on:submit|preventDefault={handleSignIn}>
		<input type="hidden" name="remember" value="true" />
		<div class="space-y-2 shadow-sm">
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
				name="password"
				label="Password"
				bind:value={formData.password}
				onInput={handleInput}
				type="password"
				messages={result.getErrors('password')}
				validityClass={cn('password')}
			/>
		</div>

		<div>
			<button
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
