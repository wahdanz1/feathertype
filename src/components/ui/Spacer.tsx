interface SpacerProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Spacer({ width, height, className }: SpacerProps) {
  return (
    <div
      className={className}
      style={{
        ...(width && { width: `${width * 0.25}rem` }),
        ...(height && { height: `${height * 0.25}rem` }),
      }}
      aria-hidden
    />
  );
}
