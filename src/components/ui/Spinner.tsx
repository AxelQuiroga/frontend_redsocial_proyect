interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`spinner${className ? ` ${className}` : ""}`}
    >
      {/* Círculo base (indigo) */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="15.7 31.4"
        strokeLinecap="round"
        className="spinner-arc"
      />
      {/* Punto brillante */}
      <circle
        cx="12"
        cy="2"
        r="2"
        fill="currentColor"
        className="spinner-dot"
      />
    </svg>
  );
}
