export function toggleContentEditable(node: {
	contains: (arg0: EventTarget | null) => any;
	dispatchEvent: (arg0: CustomEvent<unknown>) => void;
}) {
	const handleClick = (event: Event) => {
		if (!node.contains(event.target)) {
			node.dispatchEvent(new CustomEvent('toggleContentEditable'));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
