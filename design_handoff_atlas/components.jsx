/* global React */
// Shared atomic components for Atlas

const Button = ({ variant = "secondary", size = "md", icon: Icon, iconRight: IconR, block, children, ...rest }) => {
  const cls = `btn btn-${variant}${size !== "md" ? " btn-" + size : ""}${block ? " btn-block" : ""}${!children ? " btn-icon" : ""}`;
  return (
    <button className={cls} {...rest}>
      {Icon && <Icon size={size === "lg" ? 16 : 14} />}
      {children}
      {IconR && <IconR size={size === "lg" ? 16 : 14} />}
    </button>
  );
};

const Badge = ({ tone = "default", dot, children, style }) => (
  <span className={`badge${tone !== "default" ? " badge-" + tone : ""}${dot ? " badge-dot" : ""}`} style={style}>
    {children}
  </span>
);

const Avatar = ({ name = "??", size = "md", color, src }) => {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const cls = `avatar${size === "lg" ? " avatar-lg" : size === "sm" ? " avatar-sm" : ""}`;
  return (
    <span className={cls} style={{ background: color || undefined, color: color ? "#fff" : undefined }}>
      {src ? <img src={src} alt={name} style={{width: "100%", height: "100%", objectFit: "cover"}} /> : initials}
    </span>
  );
};

const Progress = ({ value = 0, variant = "default", thick }) => (
  <div className={`progress${variant === "brand" ? " brand" : ""}${thick ? " thick" : ""}`}>
    <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

const Tabs = ({ tabs, value, onChange }) => (
  <div className="tabs">
    {tabs.map(t => (
      <button key={t.id} className={value === t.id ? "active" : ""} onClick={() => onChange(t.id)}>
        {t.label}{t.count != null && <span style={{marginLeft: 6, color: "var(--muted)", fontWeight: 500}}>{t.count}</span>}
      </button>
    ))}
  </div>
);

const Field = ({ label, help, children, hint }) => (
  <div style={{display: "flex", flexDirection: "column"}}>
    {label && <label className="label">{label}{hint && <span style={{color: "var(--muted)", fontWeight: 400, marginLeft: 8}}>{hint}</span>}</label>}
    {children}
    {help && <div className="help">{help}</div>}
  </div>
);

const Stat = ({ label, value, sub, accent }) => (
  <div style={{flex: 1}}>
    <div className="eyebrow" style={{marginBottom: 6}}>{label}</div>
    <div style={{display: "flex", alignItems: "baseline", gap: 8}}>
      <div style={{fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em", color: accent ? "var(--brand)" : "var(--ink)"}}>{value}</div>
      {sub && <div style={{fontSize: 12, color: "var(--muted)", fontWeight: 500}}>{sub}</div>}
    </div>
  </div>
);

const Empty = ({ icon: Icon, title, body, action }) => (
  <div style={{display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", textAlign: "center", color: "var(--muted)"}}>
    {Icon && <Icon size={28} />}
    <div style={{marginTop: 12, fontSize: 15, fontWeight: 600, color: "var(--ink)"}}>{title}</div>
    {body && <div style={{marginTop: 4, maxWidth: 320}}>{body}</div>}
    {action && <div style={{marginTop: 16}}>{action}</div>}
  </div>
);

const SegControl = ({ options, value, onChange }) => (
  <div style={{display: "inline-flex", padding: 3, background: "var(--paper-2)", borderRadius: "var(--r-md)", gap: 2}}>
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(o.value)} style={{
        background: value === o.value ? "var(--card)" : "transparent",
        boxShadow: value === o.value ? "var(--sh-sm)" : "none",
        border: 0, padding: "6px 12px", borderRadius: "var(--r-sm)",
        fontWeight: 600, fontSize: 12, cursor: "pointer",
        color: value === o.value ? "var(--ink)" : "var(--muted)",
      }}>{o.label}</button>
    ))}
  </div>
);

// Decorative course thumbnail using gradient + glyph
const CourseThumb = ({ course, size = "md" }) => {
  const gradients = ["grad-1", "grad-2", "grad-3", "grad-4", "grad-5", "grad-6"];
  const grad = gradients[course.id % gradients.length];
  return (
    <div className={`thumb ${grad}`} style={size === "sm" ? {fontSize: 14} : {}}>
      <div className="thumb-tag">{course.tag}</div>
      <div className="thumb-title" style={size === "sm" ? {fontSize: 16} : {}}>{course.title}</div>
      <div style={{position: "absolute", top: -20, right: -20, opacity: 0.18, fontFamily: "var(--font-display)", fontSize: 140, lineHeight: 1, color: "#fff", userSelect: "none"}}>
        {course.glyph || course.title[0]}
      </div>
    </div>
  );
};

Object.assign(window, {
  Button, Badge, Avatar, Progress, Tabs, Field, Stat, Empty, SegControl, CourseThumb,
});
