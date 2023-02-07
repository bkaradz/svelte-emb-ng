import type { CurrencyType } from "./stores/setCurrency.store";


type PaymentData = {
  group: string;
  isActive: boolean;
  isDefault: boolean;
  label: string;
  value: string;
  paymentMethod: string
  currency: CurrencyType | undefined;
}


export const paymentData: PaymentData[] = [
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": true,
    "label": "Cash",
    "value": "cashOptions",
    "paymentMethod": "",
    "currency": undefined
  },
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": false,
    "label": "Mobile Money(RTGS)",
    "value": "mobileMoneyRtgsOptions",
    "paymentMethod": "",
    "currency": undefined
  },
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": false,
    "label": "Mobile Money(USD)",
    "value": "mobileMoneyUsdOptions",
    "paymentMethod": "",
    "currency": undefined
  },
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": false,
    "label": "Transfer(RTGS)",
    "value": "transferRtgsOptions",
    "paymentMethod": "",
    "currency": undefined
  },
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": false,
    "label": "Transfer(FCA)",
    "value": "transferFcaOptions",
    "paymentMethod": "",
    "currency": undefined
  },
  {
    "group": "cashOptions",
    "isActive": true,
    "isDefault": false,
    "label": "Botswana Pula",
    "value": "BotswanaPula",
    "paymentMethod": "",
    "currency": "BWP"
  },
  {
    "group": "cashOptions",
    "isActive": true,
    "isDefault": false,
    "label": "SA Rand",
    "value": "SouthAfricanRand",
    "paymentMethod": "",
    "currency": "ZAR"
  },
  {
    "group": "cashOptions",
    "isActive": true,
    "isDefault": true,
    "label": "US Dollar",
    "value": "unitedStatesDollar",
    "paymentMethod": "",
    "currency": "USD"
  },
  {
    "group": "cashOptions",
    "isActive": true,
    "isDefault": false,
    "label": "Bond",
    "value": "bondNote",
    "paymentMethod": "",
    "currency": "ZWB"
  },
  {
    "group": "mobileMoneyRtgsOptions",
    "isActive": true,
    "isDefault": false,
    "label": "EcoCash",
    "value": "ecoCash",
    "paymentMethod": "",
    "currency": "ZWR"
  },
  {
    "group": "mobileMoneyRtgsOptions",
    "isActive": true,
    "isDefault": false,
    "label": "One Money",
    "value": "oneMoney",
    "paymentMethod": "",
    "currency": "ZWR"
  },
  {
    "group": "mobileMoneyUsdOptions",
    "isActive": true,
    "isDefault": false,
    "label": "Get Bucks",
    "value": "getBucks",
    "paymentMethod": "",
    "currency": "USD"
  },
  {
    "group": "transferRtgsOptions",
    "isActive": true,
    "isDefault": true,
    "label": "Stewart Bank",
    "value": "stewartBank",
    "paymentMethod": "",
    "currency": "ZWR"
  },
  {
    "group": "transferRtgsOptions",
    "isActive": true,
    "isDefault": false,
    "label": "Banc ABC",
    "value": "bancAbc",
    "paymentMethod": "",
    "currency": "ZWR"
  },
  {
    "group": "transferFcaOptions",
    "isActive": true,
    "isDefault": false,
    "label": "Banc ABC",
    "value": "bancAbc",
    "paymentMethod": "",
    "currency": "USD"
  },
  {
    "group": "cashSwipeOptions",
    "isActive": true,
    "isDefault": true,
    "label": "Stewart Bank",
    "value": "stewartBank",
    "paymentMethod": "",
    "currency": "ZWR"
  },
  {
    "group": "cashSwipeOptions",
    "isActive": true,
    "isDefault": true,
    "label": "Banc ABC",
    "value": "bancAbc",
    "paymentMethod": "",
    "currency": "ZWR",
  },
]