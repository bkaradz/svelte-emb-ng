<script lang="ts">
	import logger from '$lib/utility/logger';
	import { svgAddUser, svgArrow, svgPlus, svgUpload, svgX } from '$lib/utility/svgLogos';
	import { goto } from '$app/navigation';
	import { toasts } from '$lib/stores/toasts.store';
	import type { Options, Products } from '@prisma/client';
	import { selectTextOnFocus } from '$lib/utility/inputSelectDirective';
	import { zodErrorMessagesMap } from '$lib/validation/format.zod.messages';
	import { saveProductsSchema } from '$lib/validation/saveProduct.validate';
	import { trpc } from '$lib/trpc/client';
	import { handleErrors } from '$lib/utility/errorsHandling';

	export let data: { productCategories: Options[] };

	let errorMessages = new Map();

	let productCategories = data.productCategories;

	const getProductCategories = async (searchParams = { group: 'productCategories' }) => {
		try {
			productCategories = await trpc().options.getOptions.query(searchParams);
		} catch (err: any) {
			handleErrors(err);
		}
	};

	const resetForm = () => {
		formData = structuredClone(initFromData);
	};

	const initFromData: Partial<Products> = {
		name: undefined,
		description: undefined,
		unitPrice: undefined,
		productCategories: undefined,
		stitches: undefined,
		units: undefined,
		isActive: true
	};

	let formData = structuredClone(initFromData);

	$: disabled = false;

	const handleSubmit = async () => {
		disabled = true;

		const parsedProducts = saveProductsSchema.safeParse(formData);

		if (!parsedProducts.success) {
			const errorMap = zodErrorMessagesMap(parsedProducts);

			if (errorMap) {
				errorMessages = errorMap;
			}
			disabled = false;
			return;
		}
		try {
			const res = await trpc().products.saveOrUpdateProducts.mutate(parsedProducts.data);
		} catch (err: any) {
			handleErrors(err);
		} finally {
			resetForm();
			toasts.add({ message: 'The Product was added', type: 'success' });
		}
	};

	const gotoProducts = async () => {
		goto(`/products`);
	};

	const handleUpload = async (e: SubmitEvent) => {
		try {
			const formElm = e.target as HTMLFormElement;
			const formData = new FormData(formElm);

			const res = await fetch('/api/products/upload.json', {
				method: 'POST',
				body: formData
			});

			if (res.ok) {
				formElm.reset();
				toasts.add({ message: 'Products uploaded', type: 'success' });
			}
		} catch (err: any) {
			logger.error(`Error: ${err}`);
			toasts.add({ message: 'An error has occurred while uploading products', type: 'error' });
		}
	};
</script>

<svelte:head>
	<title>Add Product</title>
</svelte:head>

<div class="flex flex-1 flex-col">
	<!-- Use This -->
	<div>
		<!-- Heading and Buttons Bar -->
		<div class="main-header flex flex-row items-center justify-between">
			<div class="flex">
				<button class="mr-3" on:click={gotoProducts}>
					{@html svgArrow}
				</button>
				<h1 class="text-slate-700 text-2xl font-medium">Products</h1>
			</div>
			<!-- Right -->
			<div class="flex items-center">
				<form on:submit|preventDefault={handleUpload} method="POST">
					<div class="relative">
						<button
							class="absolute border border-royal-blue-500 bg-royal-blue-500 p-2 text-white"
							for="uploadCSV">{@html svgUpload}</button
						>
						<input
							class="w-72 border border-pickled-bluewood-300 bg-pickled-bluewood-100 text-pickled-bluewood-500 ring-royal-blue-500 file:w-10 file:p-1 file:opacity-0"
							type="file"
							name="products"
							id="uploadCSV"
							accept=".csv, .CSV"
						/>
						<button
							class="absolute right-0 border border-royal-blue-500 bg-royal-blue-500 p-2 text-white"
							type="submit">{@html svgPlus}</button
						>
					</div>
				</form>
			</div>
		</div>

		<!-- Search and View Bar -->
		<div class="z-10 mt-4 flex h-14 w-full flex-row items-center justify-center bg-white">
			<div>
				<h2 class="text-center text-2xl font-bold text-pickled-bluewood-600">Add Product</h2>
			</div>
		</div>
	</div>
	<!-- End This -->

	<div class="mx-auto mt-2 h-full w-full max-w-md space-y-8">
		<form class="mt-2 space-y-6" on:submit|preventDefault={handleSubmit} method="POST">
			<div class="space-y-2 shadow-sm">
				<label for="name" class="flex justify-between text-sm">
					<span>Name</span>
					<span class="text-xs text-danger">
						{errorMessages.get('name') ? errorMessages.get('name') : ''}
					</span>
				</label>
				<input
					use:selectTextOnFocus
					type="text"
					name="name"
					class="input"
					bind:value={formData.name}
				/>

				<label for="description" class="flex justify-between text-sm">
					<span>Description</span>
					<span class="text-xs text-danger">
						{errorMessages.get('description') ? errorMessages.get('description') : ''}
					</span>
				</label>
				<textarea
					use:selectTextOnFocus
					name="description"
					class="input"
					bind:value={formData.description}
					cols="10"
					rows="5"
				/>

				{#if Array.isArray(productCategories)}
					<label for="productCategories" class="flex justify-between text-sm">
						<span>Product Category</span>
						<span class="text-xs text-danger">
							{errorMessages.get('productCategories') ? errorMessages.get('productCategories') : ''}
						</span>
					</label>
					<select bind:value={formData.productCategories} name="productCategories" class="input">
						{#each productCategories as type}
							<option value={type.value}>
								{type.label}
							</option>
						{/each}
					</select>
				{/if}

				{#if formData?.productCategories === 'embroidery'}
					<label for="stitches" class="flex justify-between text-sm">
						<span>Stitches</span>
						<span class="text-xs text-danger">
							{errorMessages.get('stitches') ? errorMessages.get('stitches') : ''}
						</span>
					</label>
					<input
						use:selectTextOnFocus
						type="number"
						name="stitches"
						class="input"
						bind:value={formData.stitches}
					/>
				{/if}

				{#if formData?.productCategories !== 'embroidery'}
					<label for="unitPrice" class="flex justify-between text-sm">
						<span>Unit Price</span>
						<span class="text-xs text-danger">
							{errorMessages.get('unitPrice') ? errorMessages.get('unitPrice') : ''}
						</span>
					</label>
					<input
						use:selectTextOnFocus
						type="number"
						name="unitPrice"
						class="input"
						bind:value={formData.unitPrice}
					/>
				{/if}
				{#if formData?.productCategories !== 'embroidery'}
					<label for="units" class="flex justify-between text-sm">
						<span>Quantity</span>
						<span class="text-xs text-danger">
							{errorMessages.get('units') ? errorMessages.get('units') : ''}
						</span>
					</label>
					<input
						use:selectTextOnFocus
						type="number"
						name="units"
						class="input"
						bind:value={formData.unitPrice}
					/>
				{/if}
				<div class="mt-6 flex space-x-2">
					<button
						type="submit"
						class="group relative flex w-full justify-center border border-transparent bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							{@html svgAddUser}
						</span>
						Add Product
					</button>
					<button
						on:click|preventDefault={() => resetForm()}
						class="group relative flex w-full justify-center  border border-transparent bg-royal-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-royal-blue-700 focus:outline-none focus:ring-2 focus:ring-royal-blue-500 focus:ring-offset-2"
					>
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							{@html svgX}
						</span>
						Reset
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
