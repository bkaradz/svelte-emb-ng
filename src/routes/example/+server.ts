import fetch from 'cross-fetch';

interface Post {
	createDBy: number;
	id: number;
	title: string;
	body: string;
}

export const fetchPosts = async () => {
	const res = await fetch('https://jsonplaceholder.typicode.com/posts');
	return res.json();
};

// in-source testing
if (import.meta.vitest) {
	const { it, expect } = import.meta.vitest;

	it.skip('Test fetchPosts', async () => {
		const { posts } = await import('../../mocks/handlers');
		const result = await fetchPosts();
		expect(result).toEqual(posts);
	});
}
