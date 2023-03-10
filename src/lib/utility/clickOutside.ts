export function clickOutside(node: HTMLElement) {
	const handleClick = (event: MouseEvent) => {
		if (!node.contains(event.target as HTMLElement)) {
			node.dispatchEvent(new CustomEvent('clickOutside'));
		}
	};

	window.addEventListener('click', handleClick, true);

	return {
		destroy() {
			window.removeEventListener('click', handleClick, true);
		}
	};
}
