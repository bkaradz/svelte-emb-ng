<script lang="ts">
	import { onMount } from 'svelte';
	import suite from '$lib/validation/client/signUp.validate';
	import logger from '$lib/utility/logger';
	import { svgAddUser, svgArrow, svgPlus, svgUpload, svgX } from '$lib/utility/svgLogos';
	import classnames from 'vest/classnames';
	import { goto } from '$app/navigation';
	import { toasts } from '$lib/stores/toasts.store';
	import Input from '$lib/components/Input.svelte';
	import Textarea from '$lib/components/Textarea.svelte';
	import Combobox from '$lib/components/Combobox.svelte';
	import type { OptionsDocument } from '$lib/models/options.models';

	let result = suite.get();

	let productcategories: Array<OptionsDocument>;

	onMount(() => {
		getProductCategories();
	});

	const getProductCategories = async () => {
		try {
			let searchParams = new URLSearchParams({ group: 'productCategories' });
			const res = await fetch('/api/options.json?' + searchParams.toString());
			productcategories = await res.json();
		} catch (err) {
			logger.error(err.message);
			toasts.add({
				message: 'An error has occured while getting product categories',
				type: 'error'
			});
		}
	};

	// interface productInterface {
	// 	name: string;
	// 	title: string;
	// 	description: string;
	// 	unitPrice: number | string;
	// 	productCategories: { name: string; value: string };
	// 	stitches: number | string;
	// 	quantity: number | string;
	// 	isActive: boolean;
	// }

	const initFromData = {
		name: '',
		title: '',
		description: '',
		unitPrice: 0,
		productCategories: { name: '', value: '' },
		stitches: 0,
		quantity: 0,
		isActive: true
	};

	let formData = { ...initFromData };

	$: cn = classnames(result, {
		warning: 'warning',
		invalid: 'error',
		valid: 'success'
	});

	$: resetForm = () => {
		formData = { ...initFromData };
		suite.reset();
		result = suite.get();
	};

	const handleSubmit = async () => {
		try {
			const { productCategories, ...otherData } = formData;
			const finalData = { ...otherData, productCategories: productCategories.value };
			const res = await fetch('/api/products.json', {
				method: 'POST',
				body: JSON.stringify(finalData),
				headers: { 'Content-Type': 'application/json' }
			});

			if (res.ok) {
				resetForm();
				toasts.add({ message: 'The Product was added', type: 'success' });
			}
		} catch (err) {
			logger.error(err.messages);
			toasts.add({ message: 'An error has occured while adding the product', type: 'error' });
		}
	};

	const gotoProducts = async () => {
		await goto(`/products`);
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
		} catch (err) {
			logger.error(err.messages);
			toasts.add({ message: 'An error has occured while uploading products', type: 'error' });
		}
	};

	/**
	 * TODO: impliment filter
	 */
	// const handleComboInput = (e: SubmitEvent) => {
	// 	// onInput={handleComboInput}
	// 	formData = {
	// 		...formData,
	// 		productCategories: e.target.value
	// 	};
	// };
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
				<form on:submit|preventDefault={handleUpload}>
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
		<form class="mt-2 space-y-6" on:submit|preventDefault={handleSubmit}>
			<div class="space-y-2 shadow-sm">
				<Input
					name="name"
					label="Name"
					bind:value={formData.name}
					messages={result.getErrors('name')}
					validityClass={cn('name')}
				/>
				<Input
					name="title"
					label="Title"
					bind:value={formData.title}
					messages={result.getErrors('title')}
					validityClass={cn('title')}
				/>
				<Textarea
					name="description"
					label="Description"
					bind:value={formData.description}
					messages={result.getErrors('description')}
					validityClass={cn('description')}
				/>

				{#if productcategories}
					<Combobox
						name="productCategories"
						label="productCategories"
						list={productcategories}
						bind:value={formData.productCategories}
					/>
				{/if}

				{#if formData?.productCategories?.value === 'embroidery'}
					<Input
						name="stitches"
						label="Stitches"
						type="number"
						bind:value={formData.stitches}
						messages={result.getErrors('stitches')}
						validityClass={cn('stitches')}
					/>
				{/if}

				{#if formData?.productCategories?.value !== 'embroidery'}
					<Input
						name="unitPrice"
						label="Unit Price"
						type="number"
						bind:value={formData.unitPrice}
						messages={result.getErrors('unitPrice')}
						validityClass={cn('unitPrice')}
					/>
				{/if}
				{#if formData?.productCategories?.value !== 'embroidery'}
					<Input
						name="quantity"
						label="Quantity"
						type="number"
						bind:value={formData.quantity}
						messages={result.getErrors('quantity')}
						validityClass={cn('quantity')}
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
