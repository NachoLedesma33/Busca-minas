import './LeverSwitch.css'

export default function LeverSwitch({ checked = false, onChange }) {
  const handleToggle = () => onChange?.(!checked)

  return (
    <div className={`toggle-container ${checked ? 'toggle-on' : ''}`}>
      <input
        className="toggle-input"
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
      />
      <div className="toggle-handle-wrapper" onClick={handleToggle}>
        <div className="toggle-handle">
          <div className="toggle-handle-knob" />
          <div className="toggle-handle-bar-wrapper">
            <div className="toggle-handle-bar" />
          </div>
        </div>
      </div>
      <div className="toggle-base">
        <div className="toggle-base-inside" />
        <div className="toggle-label toggle-label-left">OFF</div>
        <div className="toggle-label toggle-label-right">ON</div>
      </div>
    </div>
  )
}
