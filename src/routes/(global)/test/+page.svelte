<script>
	import { enhance } from '$app/forms';

	/** @type {import('./$types').ActionData} */
	export let form;
</script>

<svelte:head>
	<title>Dynamic form!</title>
</svelte:head>

<div>

	<h1>Dynamic form</h1>
	
	{#if form?.success === true}
		<p><strong>You did it!</strong></p>
	{/if}
	
	<form method="POST" action="?/submit" use:enhance data-sveltekit-noscroll>
		<label>
			Your name
			<input name="name" type="text" value={form?.items?.name ?? ''} />
		</label>
	
		<fieldset>
			<legend>How many pets do you have?</legend>
	
			<label>
				<input type="radio" name="pets" value="0" />
				0
			</label>
			<label>
				<input type="radio" name="pets" value="1" />
				1
			</label>
			<label>
				<input type="radio" name="pets" value="2" />
				2
			</label>
			<label>
				<input type="radio" name="pets" value="3" />
				3+
			</label>
		</fieldset>
		<br />
		{#each form?.pets || [''] as pet, i}
			<label for="petname-{i}">Pet #{i + 1}'s name</label>
			<input id="petname-{i}" type="text" name="petname[]" value={pet} />
			<button class="btn btn-primary remove" formaction="?/removePet&pet={i}">Remove pet #{i + 1}</button>
		{/each}
		<div>
			<button class="btn btn-primary" style="--color-link: #444;" formaction="?/addPet">Add pet name</button>
			<button class="btn btn-primary">Submit form!</button>
		</div>
	</form>
</div>


<style>
	.remove {
		padding: 0.5rem;
		--color-link: darkred;
	}
	input:has(+ .remove) {
		margin-bottom: 0.25rem;
	}
	input + .remove {
		margin-bottom: 1.5rem;
	}
</style>