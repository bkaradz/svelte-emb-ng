import { create, test, enforce, warn, only } from 'vest';
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';

enforce.extend({ isEmail, isMobilePhone });

const suite = create((data = {}, currentField) => {
	only(currentField);
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
	test('password', 'Password is weak, Maybe add a number?', () => {
		warn();
		enforce(data.password).matches(/[0-9]/);
	});
	test('confirmPassword', 'Confirm password is required', () => {
		enforce(data.confirmPassword).isNotBlank();
	});
	test('confirmPassword', 'Passwords do not match', () => {
		enforce(data.confirmPassword).equals(data.password);
	});
});

export default suite;
