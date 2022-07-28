import mongoose, { model, Schema, Document } from 'mongoose';

export interface OptionsDocument extends Document {
	_id: mongoose.Schema.Types.ObjectId | string;
	userID: mongoose.Schema.Types.ObjectId | string;
	group: string;
	name: string;
	value: string;
	isActive: boolean;
	isDefault: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
}

const optionsSchema: Schema = new Schema<OptionsDocument>(
	{
		userID: { type: Schema.Types.ObjectId, ref: 'Contacts', required: true },
		group: {
			type: String,
			required: true
		},
		isActive: {
			type: Boolean,
			required: true,
			default: true
		},
		isDefault: {
			type: Boolean,
			required: true,
			default: false
		},
		name: {
			type: String,
			required: true,
			unique: true
		},
		value: {
			type: String,
			required: true,
			unique: true
		}
	},
	{ timestamps: true }
);

optionsSchema.pre(/^(save)/, async function (next) {
	const option = this as OptionsDocument;

	if (option.isDefault === false) {
		return next();
	}

	const getGroupDefault = await OptionsModel.find({ group: option.group, isDefault: true });

	if (getGroupDefault.length >= 1) {
		// reset all values to false
		await OptionsModel.updateMany({ group: option.group }, { isDefault: false });
	}

	return next();
});

optionsSchema.pre(/^(updateOne|findOneAndUpdate|findByIdAndUpdate)/, async function (next) {
	const option = { ...this.getUpdate() };

	if (option.isDefault === false) {
		return next();
	}

	const getGroupDefault = await OptionsModel.find({ group: option.group, isDefault: true });

	if (getGroupDefault.length >= 1) {
		// reset all values to false
		await OptionsModel.updateMany({ group: option.group }, { isDefault: false });
	}

	return next();
});

const OptionsModel = model<OptionsDocument>('Options', optionsSchema);

export default OptionsModel;

// const User = mongoose.models.User as UserModelInterface || mongoose.model<UserDoc, UserModelInterface>('User', UserSchema)
export const optionsGroupsNames = {
	USER_ROLES: 'userRoles',
	PRODUCT_CATEGORIES: 'productCategories',
	EMBROIDERY_TYPES: 'embroideryTypes',
	EMBROIDERY_POSITIONS: 'embroideryPositions',
	CUSTOMER_TYPES: 'customerTypes',
	ACCOUNTS_STATUS: 'accountsStatus',
	MANUFACTURING_STATUS: 'manufacturingStatus'
};

export const optionsGroupsValuesDefaults = {
	// Default values
	DEF_USER_ROLE: 'USER',
	DEF_PRODUCT_CATEGORIES: 'embroidery',
	DEF_EMBROIDERY_TYPE: 'flat',
	DEF_EMBROIDERY_POSITIONS: 'frontLeft',
	DEF_CUSTOMER_TYPE: 'individual',
	DEF_ACCOUNTS_STATUS: 'quotation',
	DEF_MANUFACTURING_STATUS: 'awaitingEmbroidery'
};

export const optionContainsName = async (group: string, value: string) => {
	return !!(await OptionsModel.findOne({ group, isActive: true, value }));
};

export const getOptionsNameValueArray = async (group: string) => {
	return (await OptionsModel.find({ group, isActive: true })).map((option) => {
		option.name, option.value;
	});
};
