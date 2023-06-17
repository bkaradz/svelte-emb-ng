import type { Actions } from '@sveltejs/kit';

export const actions: Actions = {
	addPet: async ({ request }) => {
		const formItems = await request.formData();
		

		const items = [...formItems.entries()];

		/**
		 * The pets.
		 */
		const pets = [...formItems.getAll('petname[]'), ''];

		return { items, pets };
	},
	removePet: async ({ request, url }) => {
		const formItems = await request.formData();
		const pet = parseInt(String(url.searchParams.get('pet')), 10) || 0;

		const items = [...formItems.entries()];
		const pets = [...formItems.getAll('petname[]')];

		if (pet > 0) {
			pets.splice(pet, pet);
		}

		return { items, pets };
	},
	submit: async ({ request }) => {
		const formItems = await request.formData();

		return { success: true, formItems: JSON.stringify(formItems) };
	}
};