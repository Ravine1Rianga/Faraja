import Icon from './Icon'
export default function Widget({ icon, value, label, trend, onClick }) {
  return (
    <div className="widget" onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <div className="widget-icon-wrap">{typeof icon === 'string' ? <Icon name={icon} size={28} /> : icon}</div>
      <div className="widget-value">{value}</div>
      <div className="widget-label">{label}</div>
      {trend !== undefined && (
        <div className={`widget-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}
