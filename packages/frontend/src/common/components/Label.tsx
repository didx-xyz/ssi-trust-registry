export function Label({
  children,
  error,
}: {
  children: React.ReactNode
  error?: boolean
}) {
  return (
    <label className={`label p-0`}>
      <span
        className={`label-text normal ${error && '!text-error'} text-primary`}
      >
        {children}
      </span>
    </label>
  )
}
