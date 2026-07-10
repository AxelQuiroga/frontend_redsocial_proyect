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
      {/* Círculo exterior */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="31.4 31.4"
        strokeLinecap="round"
        className="spinner-outer"
      />
      {/* Círculo interior (rota al revés) */}
      <circle
        cx="12"
        cy="12"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="15.7 15.7"
        strokeLinecap="round"
        className="spinner-inner"
      />
    </svg>
  );
}
