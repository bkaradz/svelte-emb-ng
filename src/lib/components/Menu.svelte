<script lang="ts">
	import { goto } from '$app/navigation';
	import { cartItem } from '$lib/stores/cart.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { currenciesOptions, selectedCurrency } from '$lib/stores/setCurrency.store';
	import logger from '$lib/utility/logger';
	import {
		svgBellSolid,
		svgLogout,
		svgSettings,
		svgShoppingBag,
		svgUser
	} from '$lib/utility/svgLogos';
	import { Menu, MenuButton, MenuItem, MenuItems } from '@rgossiaux/svelte-headlessui';

	let loginMenuOpen = false;

	function handleKeyDown(event: { key: string }) {
		if (event.key === 'Escape') {
			loginMenuOpen = !loginMenuOpen;
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
				{#each $currenciesOptions as currency}
					<option value={currency}>
						{` ${currency.currency} (${currency.symbol})`}
					</option>
				{/each}
			</select>
		</label>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<span
		on:click|preventDefault={() => ($cartItem.size > 0 ? goto(`/cart`) : '')}
		class="relative hover:cursor-pointer mr-8 inline-block text-danger"
	>
		{@html svgShoppingBag}
		<span
			class="absolute top-0 right-0 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full  bg-success px-2 py-1 text-xs font-bold leading-none text-white"
			>{$cartItem.size}</span
		>
	</span>

	<span class="relative mr-8 inline-block text-info">
		{@html svgBellSolid}
		<span
			class="absolute top-0 right-0 inline-flex translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full  bg-success px-2 py-1 text-xs font-bold leading-none text-white"
			>122</span
		>
	</span>

	<Menu as="div" class="relative mr-6">
		<MenuButton
			class="mr-2 flex h-12 w-12 items-center justify-center rounded-full border border-solid border-pickled-bluewood-200 bg-royal-blue-600"
			id="menu-button"
			aria-expanded="true"
			aria-haspopup="true"
		>
			<p class="text-white">B K</p>
		</MenuButton>

		<MenuItems
			class=" absolute right-0 top-9 z-10 mt-2 w-40 origin-top-right divide-y divide-pickled-bluewood-100 bg-white shadow-lg ring-1 ring-royal-blue-300 focus:outline-none"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="menu-button"
		>
			<div class="py-1" role="none">
				<MenuItem>
					<a
						href="/"
						class="flex items-center px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white"
						role="menuitem"
						id="menu-item-0"
					>
						<div class="mr-3">
							{@html svgUser}
						</div>
						Account
					</a>
				</MenuItem>
				<MenuItem>
					<a
						href="/"
						class="flex items-center px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white"
						role="menuitem"
						id="menu-item-1"
					>
						<div class="mr-3">
							{@html svgSettings}
						</div>
						Setting
					</a>
				</MenuItem>
			</div>
			<div class="py-1" role="none">
				<MenuItem let:active>
					<a
						href="/"
						class={`${
							active ? 'bg-royal-blue-500 text-white' : ''
						} flex items-center px-4 py-2 text-sm text-pickled-bluewood-700 hover:bg-royal-blue-500 hover:text-white`}
						role="menuitem"
						id="menu-item-2"
						on:click|preventDefault={handleLogout}
					>
						<div class="mr-3">
							{@html svgLogout}
						</div>
						Logout
					</a>
				</MenuItem>
			</div>
		</MenuItems>
	</Menu>
</div>
