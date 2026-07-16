export default function Pill({ label, variant }) {
  const cls = `pill${variant ? ` pill-${variant}` : ''}`
  return <span className={cls}>{label}</span>
}
