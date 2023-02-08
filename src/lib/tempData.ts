import type { CurrencyType } from "./stores/setCurrency.store";


export type PaymentData = {
  group: string;
  isActive: boolean;
  isDefault: boolean;
  label: string;
  value: string;
  currency: CurrencyType | undefined;
}


export const paymentData: PaymentData[] = [
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": true,
    "label": "Cash",
    "value": "cash",
    "currency": undefined
  },
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": true,
    "label": "Swipe",
    "value": "swipe",
    "currency": undefined
  },
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": false,
    "label": "Mobile Money(RTGS)",
    "value": "mobileMoneyRtgs",
    "currency": undefined
  },
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": false,
    "label": "Mobile Money(USD)",
    "value": "mobileMoneyUsd",
    "currency": undefined
  },
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": false,
    "label": "Transfer(RTGS)",
    "value": "transferRtgs",
    "currency": undefined
  },
  {
    "group": "paymentType",
    "isActive": true,
    "isDefault": false,
    "label": "Transfer(FCA)",
    "value": "transferFca",
    "currency": undefined
  },
  {
    "group": "cash",
    "isActive": true,
    "isDefault": false,
    "label": "Botswana Pula",
    "value": "BotswanaPulaCash",
    "currency": "BWP"
  },
  {
    "group": "cash",
    "isActive": true,
    "isDefault": false,
    "label": "SA Rand",
    "value": "SouthAfricanRandCash",
    "currency": "ZAR"
  },
  {
    "group": "cash",
    "isActive": true,
    "isDefault": true,
    "label": "US Dollar",
    "value": "unitedStatesDollarCash",
    "currency": "USD"
  },
  {
    "group": "cash",
    "isActive": true,
    "isDefault": false,
    "label": "Bond",
    "value": "bondNoteCash",
    "currency": "ZWB"
  },
  {
    "group": "mobileMoneyRtgs",
    "isActive": true,
    "isDefault": false,
    "label": "EcoCash",
    "value": "ecoCashRtgsMobileMoney",
    "currency": "ZWR"
  },
  {
    "group": "mobileMoneyRtgs",
    "isActive": true,
    "isDefault": false,
    "label": "One Money",
    "value": "oneMoneyRtgsMobileMoney",
    "currency": "ZWR"
  },
  {
    "group": "mobileMoneyUsd",
    "isActive": true,
    "isDefault": false,
    "label": "Get Bucks",
    "value": "getBucksUsdMobileMoney",
    "currency": "USD"
  },
  {
    "group": "transferRtgs",
    "isActive": true,
    "isDefault": true,
    "label": "Stewart Bank",
    "value": "stewartBankRtgsTransfer",
    "currency": "ZWR"
  },
  {
    "group": "transferRtgs",
    "isActive": true,
    "isDefault": false,
    "label": "Banc ABC",
    "value": "bancAbcRtgsTransfer",
    "currency": "ZWR"
  },
  {
    "group": "transferFca",
    "isActive": true,
    "isDefault": false,
    "label": "Banc ABC",
    "value": "bancAbcFcaTransfer",
    "currency": "USD"
  },
  {
    "group": "swipe",
    "isActive": true,
    "isDefault": true,
    "label": "Stewart Bank",
    "value": "stewartBankSwipe",
    "currency": "ZWR"
  }
]