import { create, test, enforce } from 'vest';

export function postSuite(data) {
	return create(() => {
		test('group', 'group is required', () => {
			enforce(data.group).isNotBlank();
		});
		test('group', 'group must be a string', () => {
			enforce(data.group).isString();
		});
		test('isActive', 'isActive is required', () => {
			enforce(data.isActive).isNotBlank();
		});
		test('isActive', 'isActive must be boolean', () => {
			enforce(data.isActive).isBoolean();
		});
		test('isDefault', 'isDefault is required', () => {
			enforce(data.isDefault).isNotBlank();
		});
		test('isDefault', 'isDefault must be boolean', () => {
			enforce(data.isDefault).isBoolean();
		});
		test('name', 'name is required', () => {
			enforce(data.name).isNotBlank();
		});
		test('name', 'name must be a string', () => {
			enforce(data.name).isString();
		});
		test('value', 'value is required', () => {
			enforce(data.value).isNotBlank();
		});
		test('value', 'value must be a string', () => {
			enforce(data.value).isString();
		});
	})();
	// Note that we're immediately invoking our suite
	// so what we return is actually the suite result
}
