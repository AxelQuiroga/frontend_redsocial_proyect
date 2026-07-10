interface SkeletonProps {
  variant: "post-card" | "avatar" | "text" | "title" | "profile-header" | "image";
  count?: number;
  className?: string;
}

function SkeletonItem({ variant, className }: { variant: SkeletonProps["variant"]; className?: string }) {
  return <div className={`skeleton skeleton--${variant}${className ? ` ${className}` : ""}`} />;
}

export function Skeleton({ variant, count = 1, className }: SkeletonProps) {
  if (count === 1) {
    return <SkeletonItem variant={variant} className={className} />;
  }

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonItem key={i} variant={variant} className={className} />
      ))}
    </>
  );
}
