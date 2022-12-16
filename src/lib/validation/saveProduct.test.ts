import { expect, it } from "vitest";
import { addProductsSchema, type AddProduct } from "./saveProduct.validate";


export const validateFormInput = (values: AddProduct) => {
  const parsedData = addProductsSchema.parse(values);

  return parsedData;
};

// TESTS

it("Should fail if productCategories is embroidery but stitches are not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "New Product",
      productCategories: "embroidery",
    }),
  ).toThrowError("Stitches are required");
});
it("Should pass if productCategories is embroidery and stitches are provided", async () => {
  expect(() =>
    validateFormInput({
      name: "New Product",
      productCategories: "embroidery",
      stitches: 12345,
    }),
  ).not.toThrowError();
});
it("Should fail if productCategories is not embroidery and unitPrice and units are not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "New Product",
      productCategories: "golfShirt",
    }),
  ).toThrowError("Unit Price and Units are required");
});
it("Should fail if productCategories is not embroidery and units are not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "New Product",
      productCategories: "golfShirt",
      unitPrice: 10,
    }),
  ).toThrowError("Unit Price and Units are required");
});
it("Should fail if productCategories is not embroidery and unitPrice is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "New Product",
      productCategories: "golfShirt",
      units: 10,
    }),
  ).toThrowError("Unit Price and Units are required");
});
it("Should pass if productCategories is not embroidery and unitPrice and units are provided", async () => {
  expect(() =>
    validateFormInput({
      name: "New Product",
      productCategories: "golfShirt",
      unitPrice: 10,
      units: 10,
    }),
  ).not.toThrowError();
});


