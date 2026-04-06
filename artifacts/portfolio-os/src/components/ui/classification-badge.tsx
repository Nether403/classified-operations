interface ClassificationBadgeProps {
  classification: string;
  className?: string;
}

const classMap: Record<string, string> = {
  RESTRICTED: "classification-badge classification-restricted",
  CONFIDENTIAL: "classification-badge classification-confidential",
  UNCLASSIFIED: "classification-badge classification-unclassified",
};

export function ClassificationBadge({ classification, className = "" }: ClassificationBadgeProps) {
  const cls = classMap[classification] ?? "classification-badge classification-unclassified";
  return (
    <span className={`${cls} ${className}`}>
      {classification}
    </span>
  );
}
