import { create, test, enforce } from 'vest';
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';

enforce.extend({ isEmail, isMobilePhone });

export function postSuite(data) {
	return create(() => {
		test('name', 'A name is required', () => {
			enforce(data.name).isNotBlank();
		});
		test('name', 'The name must be at least 3 characters', () => {
			enforce(data.name).longerThan(2);
		});
		test('phone', 'A phone number is required', () => {
			enforce(data.phone).isNotBlank();
		});
		test('phone', 'must be of the form +263772345678', () => {
			enforce(data.phone).isMobilePhone();
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
