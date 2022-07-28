import mongoose, { model, Schema, Document } from 'mongoose'

// type rateInterface = {
//   [key: string]: { amount: number; scale: number }
// }

export interface ExchangeRatesDocument extends Document {
  user: mongoose.Schema.Types.ObjectId
  isActive: boolean
  currency: string
  symbol: string
  rates: Array<string>
  createdAt: Date
  updatedAt: Date
}

const exchangeRatesSchema: Schema = new Schema<ExchangeRatesDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'Contacts' },
    isActive: { type: Boolean, required: true },
    currency: { type: String, required: true },
    symbol: { type: String, required: true },
    rates: [{ type: String, required: true }], // To JSON stringify file
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true, toJSON: { getters: true } }
)

const exchangeRatesModel = model<ExchangeRatesDocument>('Sessions', exchangeRatesSchema)

export default exchangeRatesModel

// [
//   {
//     "currency": "USD",
//     "symbol": "$"
//     "rate": { USD: { amount: 89, scale: 2 } };
//   },
//   {
//     "currency": "EUR",
//     "symbol": "€"
//     "rate": { EUR: { amount: 89, scale: 2 } };
//   }
// ]
