import mongoose, { model, Schema, Document } from 'mongoose';
import { optionsGroupsValuesDefaults } from '$lib/models/options.models';
import { getMonetaryValue, setMonetaryValue } from '$lib/services/monetary';

export interface ProductsDocument extends Document {
	_id: mongoose.Schema.Types.ObjectId;
	userID: mongoose.Schema.Types.ObjectId;
	name: string;
	productID: string;
	title?: string;
	description?: string;
	unitPrice?: string;
	productCategories?: string;
	stitches?: number;
	quantity?: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const productsSchema: Schema = new Schema<ProductsDocument>(
	{
		userID: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
		name: { type: String, required: true, unique: true, index: true },
		productID: {
			// of the form xxx-xxx-xxxx /^([0-9]{3}-){2}[0-9]{4}$/
			type: String,
			match: /^([0-9]{3}-){2}[0-9]{4}$/,
			required: true,
			unique: true,
			index: true
		},
		title: {
			type: String
		},
		description: {
			type: String
		},
		unitPrice: {
			type: String,
			get: (v: string) => getMonetaryValue(v),
			set: (v: number) => setMonetaryValue(v)
			// required: function () {
			// 	return this.productCategories !== optionsGroupsValuesDefaults.DEF_PRODUCT_CATEGORIES;
			// }
		},
		productCategories: {
			type: String,
			default: optionsGroupsValuesDefaults.DEF_PRODUCT_CATEGORIES,
			required: true
		},
		stitches: {
			type: Number
			// required: function () {
			// 	return this.productCategories === optionsGroupsValuesDefaults.DEF_PRODUCT_CATEGORIES;
			// }
		},
		quantity: {
			type: Number
			// required: function () {
			// 	return this.productCategories !== optionsGroupsValuesDefaults.DEF_PRODUCT_CATEGORIES;
			// }
		},
		isActive: { type: Boolean, required: true, default: true },
		createdAt: { type: Date },
		updatedAt: { type: Date }
	},
	{ timestamps: true }
);

productsSchema.pre('validate', async function (next) {
	const product = this as ProductsDocument;

	/**
	 * TODO: test this when updating a product, The productID must not Change
	 */
	if (product?.productID) {
		return next();
	}

	const oldProductID = await getCurrentProductID();
	const currentProductID = incProductID(oldProductID);

	product.productID = currentProductID;

	return next();
});

const ProductsModel = model<ProductsDocument>('Products', productsSchema);

export default ProductsModel;
/**
 * Note using Methods is too slow does not give expected results
 */
export const incProductID = (productID: string): string => {
	const oldProductID = productID.replace(/-/g, ''); // remove - from string
	const strProductID = (parseInt(oldProductID) + 1).toString(); // convert to int and add one then covert to string
	productID = `${strProductID.slice(0, 3)}-${strProductID.slice(3, 6)}-${strProductID.slice(6)}`;
	return productID;
};
/**
 * Note using Methods is too slow does not give expected results
 */
export const getCurrentProductID = async (): Promise<string> => {
	try {
		const products = await ProductsModel.find({}).sort({ _id: -1 }).limit(1).select('productID');
		let productID = '';
		if (products.length === 0) {
			// set the productID to the initial Value xxx-xxx-xxxx (xxyxxyxxxx)
			productID = '100-000-0000';
		} else {
			productID = products[0].productID;
		}
		return productID;
	} catch (err) {
		throw new Error(`Error ${err.message}`);
	}
};
