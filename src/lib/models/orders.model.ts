import mongoose, { model, Schema, Document } from 'mongoose';
import logger from '$lib/utility/logger';
import dayjs from 'dayjs';
import { optionsGroupsValuesDefaults } from '$lib/models/options.models';
dayjs().format();

const oneWeek = dayjs().add(7, 'day').toDate();
const date = dayjs().toDate();

export interface OrderLineDocument extends Document {
	_id: mongoose.Schema.Types.ObjectId;
	productID: string;
	name: string;
	quantity: number;
	unitPrice: string;
	total: string;
	productCategories: string;
	embroideryTypes?: string;
	embroideryPositions?: string;
	manufacturingStatus?: string;
	stitches?: number;
	createdAt: Date;
	updatedAt: Date;
}

const orderLineSchema: Schema = new Schema<OrderLineDocument>(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Products'
		},
		productID: {
			// of the form xxx-xxx-xxxx /^([0-9]{3}-){2}[0-9]{4}$/gm
			type: String,
			match: /^([0-9]{3}-){2}[0-9]{4}$/,
			required: true
		},
		name: {
			type: String,
			required: true
		},
		quantity: {
			type: Number,
			required: true
		},
		unitPrice: {
			type: String,
			required: true
			// get: (v: string) => getMonetaryValue(v),
			// set: (v: number) => setMonetaryValue(v)
		},
		total: {
			type: String,
			required: true
			// get: (v: string) => getMonetaryValue(v),
			// set: (v: number) => setMonetaryValue(v)
		},
		productCategories: {
			type: String,
			required: true
			// validate: (value: string) => {
			// 	return optionContainsName(optionsGroupsNames.PRODUCT_CATEGORIES, value);
			// }
		},
		embroideryTypes: {
			type: String,
			// validate: (value: string) => {
			//   return optionContainsName(optionsGroupsNames.EMBROIDERY_TYPES, value)
			// },
			required: function () {
				return this.productCategories === optionsGroupsValuesDefaults.DEF_PRODUCT_CATEGORIES;
			}
		},
		embroideryPositions: {
			type: String,
			// validate: (value: string) => {
			//   return optionContainsName(optionsGroupsNames.EMBROIDERY_POSITIONS, value)
			// },
			required: function () {
				return this.productCategories === optionsGroupsValuesDefaults.DEF_PRODUCT_CATEGORIES;
			}
		},
		stitches: {
			type: Number,
			required: function () {
				return this.productCategories === optionsGroupsValuesDefaults.DEF_PRODUCT_CATEGORIES;
			}
		},
		manufacturingStatus: {
			type: String
			// validate: (value: string) => {
			//   return optionContainsName(optionsGroupsNames.MANUFACTURING_STATUS, value)
			// },
		},
		createdAt: { type: Date },
		updatedAt: { type: Date }
	},
	{ timestamps: true, toJSON: { getters: true } }
);

export interface OrdersDocument extends Document {
	userID: mongoose.Schema.Types.ObjectId;
	customerID: mongoose.Schema.Types.ObjectId;
	pricelistID: mongoose.Schema.Types.ObjectId;
	orderID: string;
	comment?: string;
	accountsStatus: string;
	orderDate?: Date;
	quoteExpiryDate?: Date;
	requiredDate?: Date;
	subTotal: string;
	tax?: string;
	taxRate?: string;
	discount?: string;
	balance: string;
	discountRate?: string;
	isActive: boolean;
	orderLine: Array<Partial<OrderLineDocument>>;
	createdAt: Date;
	updatedAt: Date;
}

const ordersSchema: Schema = new Schema<OrdersDocument>(
	{
		userID: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Users'
		},
		customerID: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Contacts'
		},
		pricelistID: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Pricelists'
		},
		orderID: {
			// of the form SO 0000001 /SO\s[0-9]{7}$/gm
			type: String,
			match: /SO\s[0-9]{7}$/,
			required: true,
			unique: true,
			index: true
		},
		comment: {
			type: String
		},
		orderDate: {
			type: Date,
			required: true,
			default: date
		},
		quoteExpiryDate: {
			type: Date,
			required: true,
			default: oneWeek
		},
		requiredDate: {
			type: Date,
			required: true,
			default: oneWeek
		},
		subTotal: {
			type: String,
			required: true
			// get: (v: string) => getMonetaryValue(v),
			// set: (v: number) => setMonetaryValue(v)
		},
		tax: {
			type: String,
			required: true
			// get: (v: string) => getMonetaryValue(v),
			// set: (v: number) => setMonetaryValue(v)
		},
		taxRate: {
			type: String,
			required: true
		},
		discount: {
			type: String,
			required: true
			// get: (v: string) => getMonetaryValue(v),
			// set: (v: number) => setMonetaryValue(v)
		},
		discountRate: {
			type: String,
			required: true
		},
		balance: {
			type: String,
			required: true
			// get: (v: string) => getMonetaryValue(v),
			// set: (v: number) => setMonetaryValue(v)
		},
		isActive: {
			type: Boolean,
			required: true,
			default: false
		},
		orderLine: [orderLineSchema],
		accountsStatus: {
			type: String,
			required: true
			// validate: (value: string) => {
			//   return optionContainsName(optionsGroupsNames.ACCOUNTS_STATUS, value)
			// },
		}
	},
	{ timestamps: true }
);

ordersSchema.pre('validate', async function (next) {
	const order = this as OrdersDocument;

	if (order?.orderID) {
		return next();
	}

	const oldOrderID = await getCurrentOrderID();
	const currentOrderID = incOrderID(oldOrderID);

	order.orderID = currentOrderID;

	return next();
});

const OrdersModel = model<OrdersDocument>('Orders', ordersSchema);

export default OrdersModel;

export const incOrderID = (orderID: string) => {
	const numOrderID = orderID.slice(2); // remove characters SO from string
	const strOrderID = (parseInt(numOrderID) + 1).toString(); // convert to int and add one then covert to string
	const zeroBuffer = '0000000';
	const newOrderID = `SO ${zeroBuffer.slice(strOrderID.length)}${strOrderID}`;
	return newOrderID;
};

export const getCurrentOrderID = async () => {
	try {
		const quotation = await OrdersModel.find({}).sort({ _id: -1 }).limit(1).select('orderID');
		let orderID = '';
		if (quotation.length === 0) {
			// set the orderID to the initial Value so xxxxxxx
			orderID = 'SO 0000000';
		} else {
			orderID = quotation[0].orderID;
		}
		return orderID;
	} catch (err) {
		logger.error(err.message);
		throw new Error(`Error ${err.message}`);
	}
};
