<script>
	import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@rgossiaux/svelte-headlessui';
</script>

<svelte:head>
	<title>Settings: Dashboad</title>
</svelte:head>

<TabGroup class="flex h-full flex-col">
	<TabList class="mb-4 grow-0 rounded-lg border border-pickled-bluewood-400 p-2">
		<Tab class="btn btn-primary rounded-full px-3 py-1">Tab 1</Tab>
		<Tab class="btn btn-primary rounded-full px-3 py-1">Tab 2</Tab>
		<Tab class="btn btn-primary rounded-full px-3 py-1">Tab 3</Tab>
	</TabList>
	<TabPanels class="h-full grow rounded-lg border border-pickled-bluewood-400">
		<TabPanel>Content 1</TabPanel>
		<TabPanel>Content 2</TabPanel>
		<TabPanel>Content 3</TabPanel>
	</TabPanels>
</TabGroup>
