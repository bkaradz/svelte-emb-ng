<script lang="ts">
	import Toast from '$lib/components/Toast.svelte';
	import { toasts } from '$lib/stores/toasts.store';
</script>

<!-- fixed top-20 right-4 z-50 flex flex-col opacity-50 -->
{#if $toasts.length}
	<div>
		{#each $toasts as { id, message, type } (id)}
			<Toast {message} {type} {id} removeToast={toasts.remove} />
		{/each}
	</div>
{/if}

<style lang="postcss">
	div {
		/* position: fixed;
		opacity: 0.9;
		z-index: 100;
		top: 70px;
		right: 0rem;
		display: flex;
		flex-direction: column;
		margin: 0.5rem; */
		@apply fixed top-[70px] right-0 z-[100] m-2 flex flex-col opacity-90;
	}
</style>
