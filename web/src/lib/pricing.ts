import { Channel, Provider } from "./types";

type PricingTable = Partial<Record<Channel, Partial<Record<Provider, number>>>>;

export const PRICING: PricingTable = {
  SMS: {
    Zenvia: 0.065,
    Twilio: 0.07,
    Gupshup: 0.06,
    "Health ID": 0.055,
    Sapios: 0.058,
    Docusign: 0.08,
    ASC: 0.062,
    Salesforce: 0.075,
    Interaxa: 0.068,
    Bemobi: 0.059,
  },
  RCS: {
    Zenvia: 0.08,
    Twilio: 0.09,
    Gupshup: 0.075,
    "Health ID": 0.07,
    Sapios: 0.072,
    Docusign: 0.095,
    ASC: 0.078,
    Salesforce: 0.088,
    Interaxa: 0.082,
    Bemobi: 0.074,
  },
  "HSM - Marketing": {
    Zenvia: 0.052,
    Twilio: 0.055,
    Gupshup: 0.048,
    "Health ID": 0.045,
    Sapios: 0.047,
    Docusign: 0.06,
    ASC: 0.05,
    Salesforce: 0.058,
    Interaxa: 0.053,
    Bemobi: 0.046,
  },
  "HSM - Utility": {
    Zenvia: 0.035,
    Twilio: 0.038,
    Gupshup: 0.032,
    "Health ID": 0.03,
    Sapios: 0.031,
    Docusign: 0.042,
    ASC: 0.034,
    Salesforce: 0.04,
    Interaxa: 0.036,
    Bemobi: 0.029,
  },
  Email: {
    Zenvia: 0.005,
    Twilio: 0.006,
    Gupshup: 0.0045,
    "Health ID": 0.004,
    Sapios: 0.0042,
    Docusign: 0.007,
    ASC: 0.0048,
    Salesforce: 0.0055,
    Interaxa: 0.005,
    Bemobi: 0.0038,
  },
  "Push Notification": {
    Zenvia: 0.002,
    Twilio: 0.0025,
    Gupshup: 0.0018,
    "Health ID": 0.0015,
    Sapios: 0.0016,
    Docusign: 0.003,
    ASC: 0.0019,
    Salesforce: 0.0022,
    Interaxa: 0.002,
    Bemobi: 0.0014,
  },
};

export function getUnitPrice(channel: Channel, provider: Provider): number {
  return PRICING[channel]?.[provider] ?? 0;
}
