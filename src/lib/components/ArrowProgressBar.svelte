<script lang="ts">
	export let list = ['Add list Array'];
	export let currentSelection = 0;

	export let onClick = (x: number) => {
		console.log(x);
	};

</script>

<div>
	<div class="container">
		<div class="wrapper">
			<div class="arrow-steps clearfix">
				{#each list as item, index (item)}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						on:click={() => onClick(index)}
						class="step {index === currentSelection ? 'current' : ''} {index < currentSelection
							? 'done cursor-not-allowed'
							: 'cursor-pointer'}"
					>
						<span> {item}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
<div />

<style lang="postcss">
	.clearfix:after {
		clear: both;
		content: '';
		display: block;
		height: 0;
	}

	.container {
		font-family: 'Lato', sans-serif;
		/* width: 1000px; */

		margin: 0 auto;
		margin-right: 20px;
	}

	.wrapper {
		display: table-cell;
		height: 43px;
		vertical-align: middle;
	}

	/* Breadcrumps CSS */

	.arrow-steps .step {
		font-size: 14px;
		text-align: center;
		color: #2f3a9e;
		cursor: default;
		margin: 0 3px;
		padding: 10px 10px 10px 30px;
		min-width: 180px;
		float: left;
		position: relative;
		background-color: #9fbbf1;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		transition: background-color 0.2s ease;
	}

	.arrow-steps .step:after,
	.arrow-steps .step:before {
		content: ' ';
		position: absolute;
		top: 0;
		right: -17px;
		width: 0;
		height: 0;
		border-top: 19px solid transparent;
		border-bottom: 17px solid transparent;
		border-left: 17px solid #9fbbf1;
		z-index: 2;
		transition: border-color 0.2s ease;
	}

	.arrow-steps .step:before {
		right: auto;
		left: 0;
		border-left: 17px solid #fff;
		z-index: 0;
	}

	.arrow-steps .step:first-child:before {
		border: none;
	}

	.arrow-steps .step:first-child {
		border-top-left-radius: 4px;
		border-bottom-left-radius: 4px;
	}

	.arrow-steps .step span {
		position: relative;
	}

	.arrow-steps .step span:before {
		opacity: 0;
		content: '✔';
		position: absolute;
		top: -2px;
		left: -20px;
	}

	.arrow-steps .step.done span:before {
		opacity: 1;
		-webkit-transition: opacity 0.3s ease 0.5s;
		-moz-transition: opacity 0.3s ease 0.5s;
		-ms-transition: opacity 0.3s ease 0.5s;
		transition: opacity 0.3s ease 0.5s;
	}

	.arrow-steps .step.current {
		color: #fff;
		background-color: #3c57d4;
	}

	.arrow-steps .step.current:after {
		border-left: 17px solid #3c57d4;
	}
</style>
