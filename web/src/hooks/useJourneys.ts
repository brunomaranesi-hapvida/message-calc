"use client";

import { useState, useEffect, useCallback } from "react";
import { Step } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface Journey {
  id: number;
  code: string;
  name: string;
  base_volume: number;
  opt_in_rate: number;
  wa_delivery: number;
  sms_delivery: number;
  steps: Step[];
  category: string | null;
  owner: string | null;
  status: "pending" | "approved" | "rejected";
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJourneyPayload {
  name: string;
  base_volume: number;
  opt_in_rate: number;
  wa_delivery: number;
  sms_delivery: number;
  steps: Step[];
  category: string;
  owner: string;
}

export function useJourneys() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/journeys`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Journey[] = await res.json();
      setJourneys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar réguas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createJourney = useCallback(
    async (payload: CreateJourneyPayload): Promise<Journey> => {
      const res = await fetch(`${API_URL}/journeys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const journey: Journey = await res.json();
      await refresh();
      return journey;
    },
    [refresh],
  );

  const deleteJourney = useCallback(
    async (code: string): Promise<void> => {
      const res = await fetch(`${API_URL}/journeys/${code}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
    },
    [refresh],
  );

  return { journeys, loading, error, refresh, createJourney, deleteJourney };
}

export async function fetchJourneyByCode(code: string): Promise<Journey> {
  const res = await fetch(`${API_URL}/journeys/${code}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
