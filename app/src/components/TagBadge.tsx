const DEFAULT_COLOR = "#1d4ed8";

/**
 * Computes WCAG relative luminance for a hex color.
 * Returns a value between 0 (black) and 1 (white).
 */
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastText(hex: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return "#000000";
  return luminance(hex) > 0.179 ? "#000000" : "#ffffff";
}

type TagBadgeProps = {
  name: string;
  color?: string;
  className?: string;
  onRemove?: () => void;
};

export default function TagBadge({
  name,
  color = DEFAULT_COLOR,
  className = "",
  onRemove,
}: TagBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: color, color: contrastText(color) }}
    >
      {name}
      {onRemove && (
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 leading-none opacity-60 hover:opacity-100"
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
