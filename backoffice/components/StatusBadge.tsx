interface Props {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export default function StatusBadge({
  active,
  activeLabel = "Ativo",
  inactiveLabel = "Inativo",
}: Props) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
