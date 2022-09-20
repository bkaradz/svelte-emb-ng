<script lang="ts">
	import { cartItem } from '$lib/stores/cart.store';
	import logger from '$lib/utility/logger';
	import { onMount } from 'svelte';

	let products = [];
	$: console.log('🚀 ~ file: +page.svelte ~ line 7 ~ products', products);

	const getProducts = async (paramsObj: any) => {
		try {
			let searchParams = new URLSearchParams(paramsObj);
			const res = await fetch('/api/cart.json?' + searchParams.toString());
			products = await res.json();
		} catch (err: any) {
			logger.error(err.message);
		}
	};

	onMount(() => {
		const query = {
			id: [...$cartItem].join(',')
		};
		getProducts(query);
	});
</script>

<div class="container">
	<div class="cart">
		{#each products as item (item.id)}
			<div class=" inline-flex">
				<p>{item.id}</p>
				<p>{item.name}</p>
			</div>
		{/each}
	</div>
	<div class="customer">
		<h1>customer</h1>
	</div>
</div>

<style lang="postcss">
	.container {
		display: flex;
		gap: 0.5em;
		margin-inline: auto;
	}
	.cart {
		flex-grow: 8;
		border-radius: 4px;
		@apply bg-pickled-bluewood-200 p-4;
	}
	.customer {
		flex-grow: 4;
		border-radius: 4px;
		@apply bg-pickled-bluewood-200 p-4;
	}
</style>
