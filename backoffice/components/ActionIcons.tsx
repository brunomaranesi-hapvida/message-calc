interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

const VARIANT_CLASSES: Record<string, string> = {
  default: "text-slate-400 hover:text-primary hover:bg-primary-50",
  success: "text-slate-400 hover:text-green-600 hover:bg-green-50",
  warning: "text-slate-400 hover:text-orange-600 hover:bg-orange-50",
  danger: "text-slate-400 hover:text-red-600 hover:bg-red-50",
};

function ActionButton({ onClick, disabled, title, children, variant = "default" }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </button>
  );
}

export function EditButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <ActionButton onClick={onClick} disabled={disabled} title="Editar" variant="default">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </ActionButton>
  );
}

export function ToggleActiveButton({ active, onClick, disabled }: { active: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <ActionButton
      onClick={onClick}
      disabled={disabled}
      title={active ? "Desativar" : "Ativar"}
      variant={active ? "warning" : "success"}
    >
      {active ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </ActionButton>
  );
}

export function DeleteButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <ActionButton onClick={onClick} disabled={disabled} title="Excluir" variant="danger">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </ActionButton>
  );
}

export function ApproveButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <ActionButton onClick={onClick} disabled={disabled} title="Aprovar" variant="success">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </ActionButton>
  );
}

export function RejectButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <ActionButton onClick={onClick} disabled={disabled} title="Rejeitar" variant="warning">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    </ActionButton>
  );
}
