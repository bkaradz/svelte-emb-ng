import { create, test, enforce } from 'vest';

export function postSuite(data) {
	return create(() => {
		test('name', 'A name is required', () => {
			enforce(data.name).isNotBlank();
		});
		test('name', 'The name must be at least 3 characters', () => {
			enforce(data.name).longerThan(2);
		});
		test('stitches', 'Stitches is required', () => {
			enforce(data.stitches).isNotBlank();
		});
		test('isActive', 'isActive must not be blank', () => {
			enforce(data.isActive).isNotBlank();
		});
		test('isActive', 'isActive must be boolean', () => {
			enforce(data.isActive).isBoolean();
		});
		test('isActive', 'isActive must be true', () => {
			enforce(data.isActive).isTruthy();
		});
	})();
	// Note that we're immediately invoking our suite
	// so what we return is actually the suite result
}

// const result = suite({ username: 'Mike123' });
