import { create, test, enforce, only } from 'vest';
import isEmail from 'validator/lib/isEmail';

enforce.extend({ isEmail });

const suite = create((data = {}, currentField) => {
	only(currentField);
	test('email', 'An email is required', () => {
		enforce(data.email).isNotBlank();
	});
	test('email', 'must be a valid email', () => {
		enforce(data.email).isEmail();
	});
	test('password', 'A password is required', () => {
		enforce(data.password).isNotBlank();
	});
});

export default suite;
