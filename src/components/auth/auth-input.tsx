"use client";

type Props = {
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

export default function AuthInput({
  label,
  type = "text",
  value,
  placeholder,
  autoComplete,
  onChange,
}: Props) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-aibeop-text">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-aibeop-line bg-aibeop-surface px-4 py-3 text-aibeop-text outline-none transition focus:border-aibeop-green"
      />
    </label>
  );
}
