export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <h3 className="text-xl">{title}</h3>
      {description && <p className="max-w-sm text-sm text-kiyomi-muted">{description}</p>}
      {action}
    </div>
  );
}
