<script lang="ts">
	import { svgEyeClose, svgEyeOpen } from "$lib/utility/svgLogos";

    let errorMessages = new Map([
        ['password', 'Invalid password']
    ])

    let isVisible = false
    $: type = isVisible ? 'text' : 'password'

</script>

<div class="container items-center px-4 py-8 m-auto mt-5 space-y-5 bg-gray-200 dark:bg-gray-800">
    <div class="w-full md:w-2/3 shadow px-5 py-4 bg-white mx-auto">
      <div class="relative">
        <div class="absolute flex right-4 mt-1.5 items-center ml-2 h-full">
          <button class="pt-2" on:click|preventDefault={() => isVisible = !isVisible}>
            {#if isVisible}          
            <div>
                {@html svgEyeOpen}
            </div>
            {:else}
            <div>
                {@html svgEyeClose}
            </div>
            {/if}
          </button>
        </div>
        <label class="flex justify-between text-sm" for="password1">
          <span
            class="">Password</span>
            <span class="text-xs text-danger"
					>{errorMessages.get('password') ? errorMessages.get('password') : ''}</span
				>
        </label>
        <input id="password1" placeholder="password" {type}
          class="input"
          >
      </div>
    </div>
   
  </div>