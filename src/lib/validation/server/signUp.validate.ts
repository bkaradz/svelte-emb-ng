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
		test('email', 'An email is required', () => {
			enforce(data.email).isNotBlank();
		});
		test('email', 'must be a valid email', () => {
			enforce(data.email).isEmail();
		});
		test('phone', 'A phone number is required', () => {
			enforce(data.phone).isNotBlank();
		});
		test('phone', 'must be of the form +263772 345 678', () => {
			enforce(data.phone).isMobilePhone();
		});
		test('address', 'An address is required', () => {
			enforce(data.address).isNotBlank();
		});
		test('password', 'A password is required', () => {
			enforce(data.password).isNotBlank();
		});
		test('password', 'The password must be at least 7 characters', () => {
			enforce(data.password).longerThan(6);
		});
	})();
	// Note that we're immediately invoking our suite
	// so what we return is actually the suite result
}

// const result = suite({ username: 'Mike123' });
