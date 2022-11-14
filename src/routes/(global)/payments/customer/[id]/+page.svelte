<script lang="ts">
	export let data;
	console.log('🚀 ~ file: +page.svelte ~ line 3 ~ data', data);
	let customer = data.customer;
</script>

<svelte:head>
	<title>Payments</title>
</svelte:head>

<div class="w-full flex">
	<div class="customer">
		<div class="flex items-center justify-between pb-5 border-b border-royal-blue-500">
			<h1 class="text-2xl font-semibold capitalize">Customer</h1>
		</div>
		<ul class="py-4">
			<li class="flex w-full items-center px-4 py-2">
				<div class="justify-self-auto grid w-full grid-cols-2 gap-2">
					<span class="f">ID Number: </span>
					<span class="">{customer.id}</span>
				</div>
			</li>
			<li class="flex w-full items-center px-4 py-2">
				<div class="justify-self-auto grid w-full grid-cols-2 gap-2">
					<span class="f">Name: </span>
					<span class="">{customer.name}</span>
				</div>
			</li>
		</ul>
	</div>
	<div class="cart">
		<div class="flex items-center justify-between pb-5 border-b border-royal-blue-500">
			<h1 class="text-2xl font-semibold capitalize">Payments Details</h1>
		</div>
	</div>
</div>

<style lang="postcss">
	.cart {
		flex-grow: 9;
		border-radius: 4px 0 0 4px;
		@apply bg-pickled-bluewood-50 p-4;
	}
	.customer {
		flex-grow: 3;
		border-radius: 0 4px 4px 0;
		@apply bg-royal-blue-100 p-4;
	}
	/* .scrollHeight {
		height: calc(100% - 75px);
	} */
</style>
