import { LoaderCircle } from "lucide-react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <LoaderCircle
      size={size}
      className={`spinner${className ? ` ${className}` : ""}`}
      strokeWidth={2.5}
    />
  );
}
