export const platform = {
  country: "SA",
  timeZone: "Asia/Riyadh",
  baseCurrency: "SAR",
  supportedDisplayCurrencies: ["SAR", "USD"],
  stage: "accounts-development",
  // These are implementation gates, not evidence of provider activation.
  capabilities: {
    authentication: "implemented_requires_configuration",
    bookings: "not_implemented",
    payments: "provider_pending",
    exchangeRates: "source_pending",
    email: "provider_pending",
    maps: "provider_pending",
  },
} as const;
