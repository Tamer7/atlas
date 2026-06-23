/* global React, Icons */

const Sidebar = ({ role, setRole, screen, setScreen, user }) => {
  const studentNav = [
    { group: "Learn", items: [
      { id: "dashboard", label: "Dashboard", icon: Icons.Home },
      { id: "courses", label: "My Courses", icon: Icons.Book, count: 4 },
      { id: "live", label: "Live Classes", icon: Icons.Broadcast, live: true },
      { id: "lesson", label: "Continue Lesson", icon: Icons.Play },
    ]},
    { group: "Assessments", items: [
      { id: "quiz", label: "Quizzes", icon: Icons.ListChecks, count: 2 },
      { id: "exam", label: "Exams", icon: Icons.ClipboardCheck, count: 1 },
      { id: "results", label: "Results", icon: Icons.ChartLine },
    ]},
    { group: "Account", items: [
      { id: "settings", label: "Settings", icon: Icons.Settings },
    ]},
  ];

  const teacherNav = [
    { group: "Teach", items: [
      { id: "t-dashboard", label: "Dashboard", icon: Icons.Home },
      { id: "roster", label: "Students", icon: Icons.Users, count: 8 },
      { id: "courses", label: "My Courses", icon: Icons.Book, count: 4 },
      { id: "live", label: "Live Classes", icon: Icons.Broadcast, live: true },
    ]},
    { group: "Assess", items: [
      { id: "builder", label: "Quiz Builder", icon: Icons.Pencil },
      { id: "grading", label: "Grading Queue", icon: Icons.ClipboardCheck, count: 5 },
      { id: "results", label: "Reports", icon: Icons.ChartLine },
    ]},
    { group: "Account", items: [
      { id: "settings", label: "Settings", icon: Icons.Settings },
    ]},
  ];

  const nav = role === "teacher" ? teacherNav : studentNav;

  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <div className="logo">A</div>
        <div className="name">Atlas</div>
      </div>

      <div className="role-switch" role="tablist" aria-label="Switch role">
        <button className={role === "student" ? "active" : ""} onClick={() => { setRole("student"); setScreen("dashboard"); }}>Student</button>
        <button className={role === "teacher" ? "active" : ""} onClick={() => { setRole("teacher"); setScreen("t-dashboard"); }}>Teacher</button>
      </div>

      {nav.map(grp => (
        <div className="nav-section" key={grp.group}>
          <div className="eyebrow">{grp.group}</div>
          {grp.items.map(it => (
            <button key={it.id}
              className={`nav-item ${screen === it.id ? "active" : ""}`}
              onClick={() => setScreen(it.id)}>
              <it.icon className="nav-icon" />
              <span>{it.label}</span>
              {it.live && <span className="live-pill-sm" style={{ marginLeft: "auto", fontSize: 9, padding: "3px 6px" }}>LIVE</span>}
              {it.count != null && <span className="nav-count">{it.count}</span>}
            </button>
          ))}
        </div>
      ))}

      <div className="sidebar-foot">
        <Avatar name={user.name} color={user.color} />
        <div className="who">
          <b>{user.name}</b>
          <span>{role === "teacher" ? "Instructor" : "Student"}</span>
        </div>
        <button className="btn btn-ghost btn-icon" title="Sign out" onClick={() => window.dispatchEvent(new CustomEvent("atlas-logout"))}>
          <Icons.Logout size={14} />
        </button>
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;
