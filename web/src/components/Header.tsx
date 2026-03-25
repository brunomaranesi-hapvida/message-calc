"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onSave: () => void;
  onCopy?: () => void;
  onSaveCopy?: () => void;
  isApproved?: boolean;
  isCopied?: boolean;
  onExportPDF: () => void;
  onExportJSON: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({
  onSave,
  onCopy,
  onSaveCopy,
  isApproved,
  isCopied,
  onExportPDF,
  onExportJSON,
  fileInputRef,
  onImportJSON,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const renderPrimaryAction = () => {
    if (isCopied) {
      return (
        <button
          onClick={onSaveCopy}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-all animate-fade-scale-in"
        >
          Salvar Régua
        </button>
      );
    }

    if (isApproved) {
      return (
        <button
          onClick={onCopy}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition"
        >
          Copiar Régua
        </button>
      );
    }

    return (
      <button
        onClick={onSave}
        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition"
      >
        Salvar Régua
      </button>
    );
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Calculadora de Mensageria
          </h2>
          <p className="text-sm text-slate-500">
            Simulador de custos de réguas de mensageria
          </p>
        </div>

        <div className="flex items-center gap-2">
          {renderPrimaryAction()}
          <button
            onClick={onExportPDF}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
          >
            Exportar PDF
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 text-slate-600 hover:bg-slate-50 transition flex items-center gap-1"
            >
              Mais ações
              <svg
                className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => {
                    onExportJSON();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  Exportar JSON
                </button>
                <label
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => setDropdownOpen(false)}
                >
                  Importar JSON
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={onImportJSON}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
