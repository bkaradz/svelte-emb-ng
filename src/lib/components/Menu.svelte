<script lang="ts">
	import { goto } from '$app/navigation';
	import { cartItem } from '$lib/stores/cart.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { currenciesOptions, selectedCurrency } from '$lib/stores/setCurrency.store';
	import logger from '$lib/utility/logger';
	import { svgBellSolid, svgShoppingBag } from '$lib/utility/svgLogos';
	import { clickOutside } from '$lib/utility/clickOutside';
	import type { userSessionInterface } from '$lib/utility/jwt.utils';

	export let data: { user: userSessionInterface };

	let loginMenuOpen = false;

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

	function handleKeyDown(event: { key: string }) {
		if (event.key === 'Escape') {
			loginMenuOpen = false;
		}
	}

	const handleLogout = async () => {
		try {
			const res = await fetch('/api/auth/logout.json', {
				method: 'POST'
			});

			if (res.ok) {
				const data = await res.json();
				toasts.add({
					message: `${data.message}`,
					type: 'success'
				});
				goto('/auth/login');
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
		}
	};
</script>

<svelte:window on:keydown={handleKeyDown} />

<div
	class="menu z-10 flex flex-row items-center justify-end  bg-gradient-to-tl from-royal-blue-500 to-royal-blue-200 drop-shadow-md"
>
	<div class="flex items-center mr-6">
		<label class="mr-3 text-sm whitespace-nowrap text-white">
			Select a currency
			<select
				class="py-1 pl-1 bg-white text-danger text-sm border-gray-300 rounded-md shadow-sm pr-7 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
				id="currency"
				name="currency"
				bind:value={$selectedCurrency}
			>
				{#each Array.from($currenciesOptions.values()) as currency}
					<option value={currency}>
						{` ${currency.currency} (${currency.symbol})`}
					</option>
				{/each}
			</select>
		</label>
	</div>

	<span class="relative mr-8 inline-block text-info">
		{@html svgBellSolid}
		<span
			class="absolute top-0 right-0 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full  bg-success px-2 py-1 text-xs font-bold leading-none text-white"
			>122</span
		>
	</span>

	<div class="relative">
		<button
			use:clickOutside
			on:clickOutside|preventDefault={() => (loginMenuOpen = false)}
			class="mr-2 w-14 h-14 btn bg-royal-blue-700 rounded-full outline-royal-blue-400 border border-royal-blue-400 focus:border-none active:border-none cursor-pointer"
			on:click|preventDefault={(e) => (loginMenuOpen = !loginMenuOpen)}
		>
			{userInitials(data)}
		</button>

		<!-- Dropdown menu -->
		<div
			class={`${
				loginMenuOpen ? '' : 'hidden'
			} absolute right-2 top-14 mt-2 z-10 bg-white divide-y divide-pickled-bluewood-100 rounded shadow w-44 dark:bg-pickled-bluewood-700 dark:divide-pickled-bluewood-600`}
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
						href="/"
						class="block px-4 py-2 hover:bg-pickled-bluewood-100 dark:hover:bg-pickled-bluewood-600 dark:hover:text-white"
					>
						Account
					</a>
				</li>
				<li>
					<a
						href="/"
						class="block px-4 py-2 hover:bg-pickled-bluewood-100 dark:hover:bg-pickled-bluewood-600 dark:hover:text-white"
					>
						Settings
					</a>
				</li>
			</ul>
			<div class="py-1">
				<a
					href="/"
					on:click|preventDefault={handleLogout}
					class="block px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-pickled-bluewood-100 dark:hover:bg-pickled-bluewood-600 dark:text-pickled-bluewood-200 dark:hover:text-white"
				>
					Logout
				</a>
			</div>
		</div>
	</div>
</div>
