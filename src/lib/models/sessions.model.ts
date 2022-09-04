import mongoose, { model, Schema, Document } from 'mongoose';

export interface SessionsDocument extends Document {
	id: mongoose.Schema.Types.ObjectId;
	user: mongoose.Schema.Types.ObjectId;
	valid: boolean;
	userAgent: string;
	createdAt: Date;
	updatedAt: Date;
	expireAt: Date;
}

const sessionsSchema: Schema = new Schema<SessionsDocument>(
	{
		user: { type: Schema.Types.ObjectId, ref: 'Contacts' },
		valid: { type: Boolean, required: true, default: true },
		userAgent: { type: String },
		createdAt: { type: Date, expires: '24h' },
		updatedAt: { type: Date },
		expireAt: { type: Date, expires: 86400 },
	},
	{ timestamps: true }
);

const SessionsModel = model<SessionsDocument>('Sessions', sessionsSchema);

export default SessionsModel;

// const User = mongoose.models.User as UserModelInterface || mongoose.model<UserDoc, UserModelInterface>('User', UserSchema)
