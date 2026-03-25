export const FALLBACK_CHANNELS = [
  "SMS",
  "RCS",
  "HSM - Marketing",
  "HSM - Utility",
  "Email",
  "Push Notification",
];

export const FALLBACK_PROVIDERS = [
  "Zenvia",
  "Twilio",
  "Gupshup",
  "Health ID",
  "Sapios",
  "Docusign",
  "ASC",
  "Salesforce",
  "Interaxa",
  "Bemobi",
];

export type Channel = string;
export type Provider = string;

export type OffsetUnit = "hours" | "days" | "months";
export type OffsetDirection = "before" | "after";
export type VolumeMode = "percentage" | "absolute";

export interface Trigger {
  id: string;
  slug: string;
  name: string;
}

export interface Step {
  id: string;
  channel: Channel;
  triggerId: string | null;
  offsetValue: number;
  offsetUnit: OffsetUnit;
  offsetDirection: OffsetDirection;
  volumeMode: VolumeMode;
  volumeValue: number;
  fallbackChannel: Channel | null;
  fallbackPercentage: number;
}

export interface SimulationConfig {
  journeyName: string;
  peopleReached: number;
  startMonth: number;
  providersByChannel: Record<string, string>;
  optInRate: number;
  deliveryRateWhats: number;
  deliveryRateSMS: number;
  steps: Step[];
}

export interface StepCost {
  step: Step;
  volume: number;
  unitPrice: number;
  cost: number;
  fallbackVolume: number;
  fallbackUnitPrice: number;
  fallbackCost: number;
}

export interface CalculatorDefaults {
  peopleReached: number;
  startMonth: number;
  optInRate: number;
  whatsappDeliveryRate: number;
  smsDeliveryRate: number;
}

export interface CalculatorConfig {
  channels: string[];
  providers: string[];
  defaultProviders: Record<string, string>;
  prices: Record<string, Record<string, number>>;
  defaults: CalculatorDefaults;
}
