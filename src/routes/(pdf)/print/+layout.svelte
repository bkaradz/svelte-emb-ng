<script lang="ts">
	import '../../../styles/app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	if ($page.data?.user?.authenticated) {
		if (browser) {
			goto('/');
		}
	}
</script>

<slot />
