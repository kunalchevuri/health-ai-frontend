interface ContextBadgeProps {
  occupation?: string | null
  userContext?: string | null
}

export function ContextBadge({ occupation, userContext }: ContextBadgeProps) {
  if (!occupation) return null
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: "rgba(34,197,94,0.10)",
        border: "1px solid rgba(34,197,94,0.25)",
        color: "#22c55e",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: "#22c55e" }}
      />
      {occupation}
      {userContext ? ` · ${userContext}` : ""}
    </div>
  )
}
