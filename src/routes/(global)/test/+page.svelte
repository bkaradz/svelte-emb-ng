<!-- <script lang="ts">
	import { svgChevronDown, svgEyeClose, svgEyeOpen, svgSearch, svgSearchIcon } from '$lib/utility/svgLogos';
	import type { Options } from '@prisma/client';

	export let data: { embroideryTypes: Options };

	let embroideryTypes: string;

	let errorMessages = new Map([['password', 'Invalid password']]);

	let isVisible = false;
	$: type = isVisible ? 'text' : 'password';
</script>

<div
	class="container items-center px-4 py-8 m-auto mt-5 space-y-5 bg-pickled-bluewood-200 dark:bg-pickled-bluewood-800"
>
	<div class="w-full md:w-2/3 shadow px-5 py-4 bg-white mx-auto">
		<div class="relative">
			<div class="absolute flex right-4 mt-1.5 items-center ml-2 h-full">
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
			<label class="flex justify-between text-sm" for="password1">
				<span class="">Password</span>
				<span class="text-xs text-danger"
					>{errorMessages.get('password') ? errorMessages.get('password') : ''}</span
				>
			</label>
			<input id="password1" placeholder="password" {type} class="input" />
		</div>
	</div>

	<div class=" bg-pickled-bluewood-100 flex items-center">
		<div class="space-y-10">
			<div
				class="flex items-center bg-white shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-500"
			>
				<div class="relative text-pickled-bluewood-100">
					<input
						class="input w-full pl-8 pr-3 text-base bg-pickled-bluewood-50 placeholder-pickled-bluewood-400 outline-none border-none focus:border-none"
						type="text"
						placeholder="Search..."
						
					/>
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-pickled-bluewood-400">
						{@html svgSearch}
					</div>
				</div>
				<div
					class="flex items-center text-sm pl-3 text-pickled-bluewood-500 font-semibold cursor-pointer"
				>
					<span>
						{#if Array.isArray(data.embroideryTypes)}
							<select
								bind:value={embroideryTypes}
								class="text-sm w-full border-none cursor-pointer bg-white input"
							>
								{#each data.embroideryTypes as type}
									<option value={type.value}>
										{type.label}
									</option>
								{/each}
							</select>
						{/if}
					</span>
				</div>
				<button class="  bg-pickled-bluewood-600 text-white text-sm px-3 mx-1 py-1 font-semibold hover:shadow-lg transition duration-3000">
					Search
				</button>
			</div>
		</div>
	</div>
</div> -->
<script lang="ts">
	import { page } from '$app/stores';
	import { trpc } from '$lib/trpc/client';
	import { clickOutside } from '$lib/utility/clickOutside';
	import type { userSessionInterface } from '$lib/utility/jwt.utils';

	export let data: { user: userSessionInterface };
	// $: console.log('🚀 ~ file: +page.svelte:89 ~ data', data);

	// const userNameArray = data.user.name.split(' ');
	// const usersInitials = userNameArray.map((item) => item[0]);
	// const userJoin = usersInitials.join(' ');
	// $: console.log('🚀 ~ file: +page.svelte:94 ~ userInitials', usersInitials);
	// $: console.log('🚀 ~ file: +page.svelte:95 ~ userJoin', userJoin);
	// $: console.log('🚀 ~ file: +page.svelte:93 ~ userNameArray', userNameArray);

	const userInitials = (data: { user: userSessionInterface }) => {
		const userName = data?.user?.name;
		if (!userName) {
			return;
		}
		return userName
			.split(' ')
			.map((item) => item[0])
			.join(' ');
	};

	$: console.log('userInitials', userInitials(data));

	let greeting: {
		id: number;
		name: string;
	}[];
	let loading = false;

	const loadData = async () => {
		loading = true;
		greeting = await trpc().test.getContacts.query();
		loading = false;
	};

	let showMenu = false;
</script>

<!-- <div class="flex flex-col space-y-5">
	<h6>Loading data in<br /><code>+page.svelte</code></h6>
	<div>
		<a
			href="#load"
			role="button"
			class="btn btn-primary"
			aria-busy={loading}
			on:click|preventDefault={loadData}>Load</a
		>
	</div>
	{#if Array.isArray(greeting)}
		{#each greeting as test}
			{test.name}
		{/each}
	{/if}
</div> -->
<div>
	<button
		use:clickOutside
		on:clickOutside|preventDefault={(e) => (showMenu = false)}
		class=" w-14 h-14 btn bg-royal-blue-700 rounded-full outline-royal-blue-400 border border-royal-blue-400 focus:border-none active:border-none cursor-pointer"
		on:click|preventDefault={(e) => (showMenu = !showMenu)}
	>
		{userInitials(data)}
	</button>

	<!-- Dropdown menu -->
	<div
		class={`${
			showMenu ? '' : 'hidden'
		} z-10 bg-white divide-y divide-pickled-bluewood-100 rounded shadow w-44 dark:bg-pickled-bluewood-700 dark:divide-pickled-bluewood-600`}
	>
		<div class="px-4 py-3 text-sm text-pickled-bluewood-900 dark:text-white">
			<div>{data?.user?.name}</div>
		</div>
		<ul
			class="py-1 text-sm text-pickled-bluewood-700 dark:text-pickled-bluewood-200"
			aria-labelledby="avatarButton"
		>
			<li>
				<a
					href="#"
					class="block px-4 py-2 hover:bg-pickled-bluewood-100 dark:hover:bg-pickled-bluewood-600 dark:hover:text-white"
				>
					Account
				</a>
			</li>
			<li>
				<a
					href="#"
					class="block px-4 py-2 hover:bg-pickled-bluewood-100 dark:hover:bg-pickled-bluewood-600 dark:hover:text-white"
				>
					Settings
				</a>
			</li>
		</ul>
		<div class="py-1">
			<a
				href="#"
				class="block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-pickled-bluewood-100 dark:hover:bg-pickled-bluewood-600 dark:text-pickled-bluewood-200 dark:hover:text-white"
			>
				Logout
			</a>
		</div>
	</div>
</div>
