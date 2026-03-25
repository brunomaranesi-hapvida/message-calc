"use client";

import { useCallback, useRef, useState } from "react";
import { SimulationConfig } from "@/lib/types";
import { readAndValidateFile } from "@/lib/validateImport";

interface Props {
  onImport: (config: SimulationConfig) => void;
  disabled?: boolean;
}

export default function ImportDropzone({ onImport, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      const result = await readAndValidateFile(file);
      if (result.ok) {
        onImport(result.config);
      } else {
        setError(result.error);
      }
    },
    [onImport],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [disabled, processFile],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFile],
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed
        py-14 transition-colors select-none
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
        ${
          dragOver
            ? "border-primary bg-blue-50"
            : error
              ? "border-red-400 bg-red-50"
              : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      <svg
        className={`w-10 h-10 ${dragOver ? "text-primary" : error ? "text-red-400" : "text-slate-400"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>

      {error ? (
        <p className="text-sm text-red-600 font-medium text-center px-4">
          {error}
        </p>
      ) : (
        <p className="text-sm text-slate-500 text-center px-4">
          Arraste um JSON ou clique para importar uma régua
        </p>
      )}
    </div>
  );
}
