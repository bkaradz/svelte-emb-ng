/** @type {import('./$types').Actions} */
export const actions = {
	addPet: async ({ request }) => {
		const formItems = await request.formData();
		console.log("🚀 ~ file: +page.server.ts:5 ~ addPet: ~ formItems:", formItems)
		

		const items = [...formItems.entries()];
		console.log("🚀 ~ file: +page.server.ts:8 ~ addPet: ~ items:", items)

		/**
		 * The pets.
		 */
		const pets = [...formItems.getAll('petname[]'), ''];

		return { items, pets };
	},
	removePet: async ({ request, url }) => {
		const formItems = await request.formData();
		const pet = parseInt(String(url.searchParams.get('pet')), 10) || 0;
		console.log("pet Back End", { pet: JSON.stringify(pet) });

		const items = [...formItems.entries()];
		const pets = [...formItems.getAll('petname[]')];

		if (pet > 0) {
			pets.splice(pet, pet);
		}

		return { items, pets };
	},
	submit: async ({ request }) => {
		const formItems = await request.formData();
		console.log("submitted Back End", { formItems: JSON.stringify(formItems) });
		console.log('submitted!');

		return { success: true, formItems: JSON.stringify(formItems) };
	}
};