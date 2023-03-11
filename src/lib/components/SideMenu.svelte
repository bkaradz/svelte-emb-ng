<script lang="ts">
	import { page } from '$app/stores';
	import small_logo from '$lib/assets/small_logo.png';
	import { anchorList } from '$lib/stores/sideMenu.store';
</script>

<nav
	class="sidebar relative z-40 flex flex-col bg-gradient-to-tl from-royal-blue-900 to-royal-blue-700"
>
	<img src={small_logo} class="h-16 object-scale-down p-1 pt-3" alt="Company Logo" />
	<div>
		<ul class="flex flex-col pl-1">
			{#each $anchorList as tag, index (tag.id)}
				<li class="mt-2 flex w-full">
					<a
						data-sveltekit-preload-data="hover"
						href={tag.url}
						class="flex w-full flex-row rounded-l-lg p-4 {($page.url.pathname.includes(tag.url) &&
							index !== 0) ||
						($page.url.pathname === '/' && index === 0)
							? `bg-royal-blue-50 text-royal-blue-600 hover:bg-royal-blue-100 hover:text-royal-blue-700 font-bold`
							: `bg-royal-blue-300 text-royal-blue-700 hover:bg-royal-blue-400 hover:text-royal-blue-800 font-bold`}"
					>
						<span>{@html tag.icon}</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>

<style lang="postcss">
</style>
