"use client";

import { useState, useEffect } from "react";
import { CalculatorConfig, FALLBACK_CHANNELS, FALLBACK_PROVIDERS } from "@/lib/types";
import { FALLBACK_PRICING } from "@/lib/pricing";
import { FALLBACK_DEFAULT_PROVIDERS, FALLBACK_DEFAULTS } from "@/lib/defaults";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const FALLBACK_CONFIG: CalculatorConfig = {
  channels: FALLBACK_CHANNELS,
  providers: FALLBACK_PROVIDERS,
  defaultProviders: FALLBACK_DEFAULT_PROVIDERS,
  prices: FALLBACK_PRICING,
  defaults: FALLBACK_DEFAULTS,
};

export function useCalculatorConfig() {
  const [calcConfig, setCalcConfig] = useState<CalculatorConfig>(FALLBACK_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/calculator-config`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        const apiDefaults = data.defaults;
        setCalcConfig({
          channels: data.channels ?? FALLBACK_CHANNELS,
          providers: data.providers ?? FALLBACK_PROVIDERS,
          defaultProviders: data.default_providers ?? FALLBACK_DEFAULT_PROVIDERS,
          prices: data.prices ?? FALLBACK_PRICING,
          defaults: apiDefaults
            ? {
                peopleReached: apiDefaults.people_reached,
                startMonth: apiDefaults.start_month,
                optInRate: apiDefaults.opt_in_rate,
                whatsappDeliveryRate: apiDefaults.whatsapp_delivery_rate,
                smsDeliveryRate: apiDefaults.sms_delivery_rate,
              }
            : FALLBACK_DEFAULTS,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { calcConfig, loading };
}
