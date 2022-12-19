import { expect, it } from "vitest";
import { userRegisterSchema, type UserRegister } from "./userRegister.validate";


export const validateFormInput = (values: Partial<UserRegister>) => {
	const parsedData = userRegisterSchema.parse(values);

	return parsedData;
};

// TESTS

it("Should pass if all fields are provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: 'jane@example.com' }],
			phone: [{ phone: '0733159753' }],
			address: [{ address: '257 North' }],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).not.toThrowError("Phone is required");
});
it("Should fail if password and confirmPassword do not match", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: 'jane@example.com' }],
			phone: [{ phone: '0733159753' }],
			address: [{ address: '257 North' }],
			password: 'jane1234',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Passwords do not match");
});
it("Should fail if name is not provided", async () => {
	expect(() =>
		validateFormInput({
			email: [{ email: 'jane@example.com' }],
			phone: [{ phone: '0733159753' }],
			address: [{ address: '257 North' }],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Name is required");
});
it("Should fail if password is not provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: 'jane@example.com' }],
			phone: [{ phone: '0733159753' }],
			address: [{ address: '257 North' }],
			confirmPassword: 'jane123'
		}),
	).toThrowError("Password is required");
});
it("Should fail if confirmPassword is not provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: 'jane@example.com' }],
			phone: [{ phone: '0733159753' }],
			address: [{ address: '257 North' }],
			password: 'jane123',
		}),
	).toThrowError("Confirm Password is required");
});
it("Should fail if email is not provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			phone: [{ phone: '0733159753' }],
			address: [{ address: '257 North' }],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Required");
});
it("Should fail if email with empty string is provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: '' }],
			phone: [{ phone: '0733159753' }],
			address: [{ address: '257 North' }],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Invalid email");
});
it("Should fail if email with empty array is provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [],
			phone: [{ phone: '0733159753' }],
			address: [{ address: '257 North' }],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Email array must have at least one email");
});
it("Should fail if phone is not provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: 'jane@example.com' }],
			address: [{ address: '257 North' }],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Required");
});
it("Should fail if phone with empty string is provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: 'jane@example.com' }],
			phone: [{ phone: '' }],
			address: [{ address: '257 North' }],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Invalid input");
});
it("Should fail if phone with empty array is provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: 'jane@example.com' }],
			phone: [],
			address: [{ address: '257 North' }],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Phone array must have at least one phone number");
});
it("Should fail if address is not provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: 'jane@example.com' }],
			phone: [{ phone: '0733159753' }],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Required");
});
it("Should fail if address with empty string is provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: 'jane@example.com' }],
			phone: [{ phone: '0758123654' }],
			address: [{ address: '' }],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Invalid input");
});
it("Should fail if address with empty array is provided", async () => {
	expect(() =>
		validateFormInput({
			name: "Jane Williams",
			email: [{ email: 'jane@example.com' }],
			phone: [{ phone: '0758123654' }],
			address: [],
			password: 'jane123',
			confirmPassword: 'jane123'
		}),
	).toThrowError("Address array must have at least one address");
});

