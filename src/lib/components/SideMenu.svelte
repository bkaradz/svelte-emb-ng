<script lang="ts">
	import { page } from '$app/stores';
	import { svgArrow, svgMenu } from '$lib/utility/svgLogos';
	import { toggleMenu, anchorList } from '$lib/stores/sideMenu.store';
	import small_logo from '$lib/assets/small_logo.png';
</script>

<nav
	class="sidebar relative z-40 flex flex-col bg-gradient-to-tl from-royal-blue-900 to-royal-blue-700"
>
	<img src={small_logo} class="h-16 object-scale-down p-1 pt-3" alt="Company Logo" />
	<input
		type="checkbox"
		class="hidden"
		name="humberger"
		id="humberger"
		bind:checked={$toggleMenu}
	/>
	<label for="humberger" class="absolute top-6 -right-8 text-danger hover:cursor-pointer">
		{#if $toggleMenu}
			{@html svgArrow}
		{:else}
			{@html svgMenu}
		{/if}
	</label>
	<div>
		<ul class="flex flex-col pl-1">
			{#each $anchorList as tag, index (tag.id)}
				<li class="mt-2 flex w-full">
					<a
						href={tag.url}
						class="flex w-full flex-row rounded-l-lg p-4 {($page.url.pathname.includes(tag.url) &&
							index !== 0) ||
						($page.url.pathname === '/' && index === 0)
							? `bg-royal-blue-50 text-royal-blue-600 hover:bg-royal-blue-100 hover:text-royal-blue-700 font-bold`
							: `bg-royal-blue-300 text-royal-blue-700 hover:bg-royal-blue-400 hover:text-royal-blue-800 font-bold`}"
					>
						<span>{@html tag.icon}</span> <span class="ml-3">{$toggleMenu ? tag.name : ''}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>

<style lang="postcss">
</style>
