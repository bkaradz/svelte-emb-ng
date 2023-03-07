import { expect, it } from "vitest";
import { savePricelistSchema, type SavePricelists } from "./savePricelists.validate";

export const validateFormInput = (values: Partial<SavePricelists>) => {
  const parsedData = savePricelistSchema.parse(values);

  return parsedData;
};

// TESTS

it("Should fail if name is not provided", async () => {
  expect(() =>
    validateFormInput({
      isActive: true,
      isDefault: true,
      pricelistDetails: [
        {
          embroideryTypes: "flat",
          minimumPrice: 0.0,
          minimumQuantity: 0,
          pricePerThousandStitches: 0.0
        }
      ]
    }),
  ).toThrowError("Name is required");
});
it("Should fail if isActive is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "pricelist1",
      isDefault: true,
      pricelistDetails: [
        {
          embroideryTypes: "flat",
          minimumPrice: 0.0,
          minimumQuantity: 0,
          pricePerThousandStitches: 0.0
        }
      ]
    }),
  ).toThrowError("isActive is required");
});
it("Should fail if isDefault is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "pricelist1",
      isActive: true,
      pricelistDetails: [
        {
          embroideryTypes: "flat",
          minimumPrice: 0.0,
          minimumQuantity: 0,
          pricePerThousandStitches: 0.0
        }
      ]
    }),
  ).toThrowError("isDefault is required");
});
it("Should fail if pricelistDetails is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "pricelist1",
      isActive: true,
      isDefault: true,
    }),
  ).toThrowError("pricelistDetails is required");
});
it("Should fail if embroideryTypes is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "pricelist1",
      isActive: true,
      isDefault: true,
      pricelistDetails: [
        {
          minimumPrice: 0.0,
          minimumQuantity: 0,
          pricePerThousandStitches: 0.0
        }
      ]
    }),
  ).toThrowError("embroideryTypes is required");
});
it("Should fail if minimumPrice is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "pricelist1",
      isActive: true,
      isDefault: true,
      pricelistDetails: [
        {
          embroideryTypes: "flat",
          minimumQuantity: 0,
          pricePerThousandStitches: 0.0
        }
      ]
    }),
  ).toThrowError("Minimum Price is required");
});
it("Should fail if minimumQuantity is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "pricelist1",
      isActive: true,
      isDefault: true,
      pricelistDetails: [
        {
          embroideryTypes: "flat",
          minimumPrice: 0.0,
          pricePerThousandStitches: 0.0
        }
      ]
    }),
  ).toThrowError("Minimum Quantity is required");
});
it("Should fail if pricePerThousandStitches is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "pricelist1",
      isActive: true,
      isDefault: true,
      pricelistDetails: [
        {
          embroideryTypes: "flat",
          minimumPrice: 0.0,
          minimumQuantity: 0,
        }
      ]
    }),
  ).toThrowError("Price Per Thousand Stitches is required");
});
it("Should fail if pricePerThousandStitches is not provided", async () => {
  expect(() =>
    validateFormInput({
      name: "pricelist1",
      isActive: true,
      isDefault: true,
      pricelistDetails: [
        {
          embroideryTypes: "flat",
          minimumPrice: 0.0,
          minimumQuantity: 0,
          pricePerThousandStitches: 0.0
        },
        {
          embroideryTypes: "flat",
          minimumPrice: 0.0,
          minimumQuantity: 0,
        }
      ]
    }),
  ).toThrowError("Price Per Thousand Stitches is required");
});
it("Should pass if all fields are provided", async () => {
  expect(() =>
    validateFormInput({
      name: "pricelist1",
      isActive: true,
      isDefault: true,
      pricelistDetails: [
        {
          embroideryTypes: "flat",
          minimumPrice: 0.0,
          minimumQuantity: 0,
          pricePerThousandStitches: 0.0
        }
      ]
    }),
  ).not.toThrowError();
});


