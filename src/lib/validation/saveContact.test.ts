import { expect, it } from "vitest";
import { saveContactsSchema, type SaveContact } from "./saveContact.validate";


export const validateFormInput = (values: Partial<SaveContact>) => {
  const parsedData = saveContactsSchema.parse(values);

  return parsedData;
};

// TESTS

it("Should fail if phone is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "Jane Williams",
      isCorporate: false,
    }),
  ).toThrowError("Phone is required");
});
it("Should fail if name is not provided", async () => {
  expect(() =>
    validateFormInput({
      isCorporate: false,
      phone: [{ phone: "0733251281" }],
    }),
  ).toThrowError("Name is required");
});
it("Should fail isCorporate is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "Jane Williams",
      phone: [{ phone: "0733251281" }],
    }),
  ).toThrowError("Corporate or Individual is required");
});
it("Should pass if isCorporate and phone are provided", async () => {
  expect(() =>
    validateFormInput({
      name: "Jane Williams",
      isCorporate: false,
      phone: [{ phone: "0733251281" }]
    }),
  ).not.toThrowError();
});
