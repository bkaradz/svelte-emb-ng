<script lang="ts">
	import { goto } from '$app/navigation';
	import small_logo from '$lib/assets/small_logo.png';
	import { toasts } from '$lib/stores/toasts.store';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';
	import {
		svgEyeClose,
		svgEyeOpen,
		svgMinusCircle,
		svgPlusCircle,
		svgRegister
	} from '$lib/utility/svgLogos';
	import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
	import { userRegisterSchema } from '$lib/validation/userRegister.validate';
	import type { ActionData } from './$types';

	let errorMessages = new Map();

	export let form: ActionData

	const resetForm = () => {
		return { ...initFromData };
	};

	const initFromData = {
		name: undefined,
		email: [{ email: '' }],
		phone: [{ phone: '' }],
		address: [{ address: '' }],
		password: undefined,
		confirmPassword: undefined
	};

	type FormData = {
		name: string | undefined;
		email: { email: string }[];
		phone: { phone: string }[];
		address: { address: string }[];
		password: string | undefined;
		confirmPassword: string | undefined;
	};

	let formData: FormData = { ...initFromData };

	type HandleInputFields = Pick<FormData, 'password' | 'confirmPassword'>;

	type formDataKeys = keyof HandleInputFields;

	const handleInput = (event: any) => {
		let name = (event.target as HTMLInputElement).name as formDataKeys;
		let value = (event.target as HTMLInputElement).value;
		formData[name] = value;
	};

	$: disabled = false;

	let passwordIsVisible = false;
	$: passwordType = passwordIsVisible ? 'text' : 'password';

	let confirmPasswordIsVisible = false;
	$: confirmPasswordType = confirmPasswordIsVisible ? 'text' : 'password';

	const handleRegister = async () => {
		/**
		 * TODO: improve error catching using zod only
		 */
		const parsedUser = userRegisterSchema.safeParse(formData);

		if (!parsedUser.success) {
			const errorMap = zodErrorMessagesMap(parsedUser);

			if (errorMap) {
				errorMessages = errorMap;
			}
			disabled = false;
			return;
		}
		try {
			await trpc().authentication.registerOrUpdateUser.mutate(parsedUser.data);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			formData = resetForm();
			toasts.add({
				message: 'Registration was successful',
				type: 'success'
			});
			goto('/auth/login');
		}
	};

	const addEmailField = (index: number) => {
		if (index === formData.email.length - 1) {
			formData.email = [...formData.email, { email: '' }];
			return;
		}
		formData.email = formData.email.filter((_email, i) => i !== index);
	};

	const addPhoneField = (index: number) => {
		if (index === formData.phone.length - 1) {
			formData.phone = [...formData.phone, { phone: '' }];
			return;
		}
		formData.phone = formData.phone.filter((_phone, i) => i !== index);
	};

	const addAddressField = (index: number) => {
		if (index === formData.address.length - 1) {
			formData.address = [...formData.address, { address: '' }];
			return;
		}
		formData.address = formData.address.filter((_address, i) => i !== index);
	};

	// on:submit|preventDefault={handleRegister}
</script>

<svelte:head>
	<title>Register</title>
</svelte:head>

<div class="h-full w-full max-w-md space-y-8">
	<div>
		<img class="mx-auto h-12 w-auto" src={small_logo} alt="Lilian Logo" />
		<h2 class="mt-6 text-center text-3xl font-bold text-pickled-bluewood-900">Register</h2>
	</div>
	<form class="mt-8 space-y-6" method="POST" action="?/register">
		<input type="hidden" name="remember" value="true" />
		<div class="space-y-2 shadow-sm">
			<label for="name" class="flex justify-between text-sm">
				<span>Name</span>
				<span class="text-xs text-danger">
					{errorMessages.get('name') ? errorMessages.get('name') : ''}
				</span>
			</label>
			<input type="text" name="name" class="input" bind:value={formData.name} />

			<label for="email" class="flex justify-between text-sm">
				<span>Email</span>
				<span class="text-xs text-danger">
					{errorMessages.get('email') ? errorMessages.get('email') : ''}
				</span>
			</label>
			{#each formData.email as v, i (i)}
				<div class="flex items-center space-x-2">
					<input type="email" name="email" class="input" bind:value={v.email} />
					<button on:click|preventDefault={() => addEmailField(i)}>
						{#if i < formData.email.length - 1}
							{@html svgMinusCircle}
						{:else}
							{@html svgPlusCircle}
						{/if}
					</button>
				</div>
			{/each}

			<label for="phone" class="flex justify-between text-sm">
				<span>Phone</span>
				<span class="text-xs text-danger">
					{errorMessages.get('phone') ? errorMessages.get('phone') : ''}
				</span>
			</label>
			{#each formData.phone as v, i (i)}
				<div class=" flex items-center space-x-2">
					<input type="text" name="phone" class="input" bind:value={v.phone} />
					<button on:click|preventDefault={() => addPhoneField(i)}>
						{#if i < formData.phone.length - 1}
							{@html svgMinusCircle}
						{:else}
							{@html svgPlusCircle}
						{/if}
					</button>
				</div>
			{/each}

			<label for="address" class="flex justify-between text-sm">
				<span>Address</span>
				<span class="text-xs text-danger">
					{errorMessages.get('address') ? errorMessages.get('address') : ''}
				</span>
			</label>
			{#each formData.address as v, i (i)}
				<div class=" flex items-center space-x-2">
					<textarea name="address" class="input" bind:value={v.address} cols="10" rows="5" />
					<button on:click|preventDefault={() => addAddressField(i)}>
						{#if i < formData.address.length - 1}
							{@html svgMinusCircle}
						{:else}
							{@html svgPlusCircle}
						{/if}
					</button>
				</div>
			{/each}

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
				<input type={passwordType} name="password" class="input" on:input={handleInput} />
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
					on:input={handleInput}
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
