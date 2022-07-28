<script lang="ts">
	import { page } from '$app/stores';
	import { settingsAsideList } from '$lib/stores/settingsAside.store';
</script>

<div class="flex w-full space-x-4">
	<div class="w-40 grow-0 rounded bg-pickled-bluewood-200 py-4 px-3 ">
		<aside class="w-full" aria-label="Sidebar">
			<ul class="space-y-2">
				{#each $settingsAsideList as tag (tag.id)}
					<li>
						<a
							href={tag.url}
							class="flex items-center rounded border border-pickled-bluewood-100 p-2 text-sm font-normal text-pickled-bluewood-900 hover:bg-pickled-bluewood-100 dark:text-white dark:hover:bg-pickled-bluewood-700 {$page
								.url.pathname === tag.url
								? `bg-pickled-bluewood-100 hover:bg-pickled-bluewood-300 border-royal-blue-400`
								: ''}"
						>
							{@html tag.icon}

							<span class="ml-3 text-sm">{tag.name}</span>
						</a>
					</li>
				{/each}
			</ul>
		</aside>
	</div>
	<div class="p-4 grow rounded bg-pickled-bluewood-200">
		<slot />
	</div>
</div>

<style>
</style>
