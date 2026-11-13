import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, Check,
  ChevronDown, CircleDollarSign, ClipboardList, Clock3, FileBarChart,
  Fingerprint, Globe2, LayoutDashboard, LogOut, Menu, Search, Settings,
  ShieldCheck, UserRound, Users, Wallet, X
} from "lucide-react";
import { nhost, nhostConfigured } from "./lib/nhost";

type Lang = "ar" | "en";
type ModuleKey =
  | "dashboard" | "employees" | "assignments" | "advances" | "payroll"
  | "deductions" | "attendance" | "overtime" | "leaves" | "notifications"
  | "reports" | "users" | "settings";

const copy = {
  ar: {
    brand: "أمازون",
    subtitle: "الموارد البشرية والمالية",
    dashboard: "لوحة المعلومات",
    employees: "الموظفون",
    assignments: "التكليفات",
    advances: "السلف",
    payroll: "الرواتب",
    deductions: "الاستقطاعات",
    attendance: "الحضور والانصراف",
    overtime: "العمل الإضافي",
    leaves: "الإجازات",
    notifications: "الإشعارات",
    reports: "التقارير",
    users: "المستخدمون والصلاحيات",
    settings: "الإعدادات",
    search: "بحث في النظام...",
    welcome: "مرحباً بك في نظام الموارد البشرية والمالية",
    overview: "نظرة عامة",
    employeesCount: "إجمالي الموظفين",
    advancesMonth: "سلف هذا الشهر",
    payrollPending: "رواتب قيد الإعداد",
    unread: "إشعارات غير مقروءة",
    quickAccess: "الوصول السريع",
    recentActivity: "آخر الحركات",
    noData: "لا توجد بيانات فعلية بعد. ستظهر هنا بعد ربط قاعدة البيانات وإدخال السجلات.",
    setupTitle: "اربط مشروع Nhost لإكمال التهيئة",
    setupText: "الواجهة جاهزة كبداية. أدخل Subdomain وRegion الخاصين بمشروع Nhost في ملف .env قبل تشغيل الاتصال.",
    signIn: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signInButton: "دخول آمن",
    signOut: "تسجيل الخروج",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    loginError: "تعذر تسجيل الدخول. تحقق من بيانات الحساب وإعدادات Nhost.",
    loginRequired: "يلزم تسجيل الدخول لعرض بيانات النظام.",
    connection: "حالة الاتصال",
    connected: "إعداد الاتصال مكتمل",
    notConnected: "لم تتم تهيئة الاتصال",
    language: "English",
    systemStatus: "النسخة التأسيسية",
    secure: "اتصال آمن وصلاحيات خادمية مطلوبة",
    moduleNote: "هذه الوحدة ضمن مخطط النظام، وسيتم تفعيل عملياتها بعد تجهيز صلاحيات Hasura واختبار قاعدة البيانات.",
    currencyRule: "الراتب حسب عملة الاتفاق، والعمل الإضافي بالدينار العراقي وبسعر ساعة تحدده الإدارة.",
    giverRule: "كل مانح فعّال يمكنه إنشاء سلفة لأي موظف، وتُسجل العملية بهوية المانح المصادق عليه.",
    biometricRule: "Passkeys/WebAuthn لا تنقل البصمة إلى الخادم؛ تُخزّن بيانات اعتماد تشفيرية فقط عند تفعيلها.",
    notificationsRule: "الإشعارات تشمل تفاصيل الحدث والمستلم والمنفذ والمبلغ والعملة والحالة والوقت والسبب، مع سجل إرسال وقراءة.",
    moduleTitle: "وحدة",
    signInHint: "يتم إنشاء حسابات المستخدمين وإسناد الأدوار من لوحة إدارة Nhost، ولا يوجد تسجيل عام.",
    passwordReset: "تغيير كلمة المرور يتم من خلال جلسة المستخدم المصادق عليها.",
    quick: "إجراءات سريعة",
    newAdvance: "إضافة سلفة",
    addEmployee: "إضافة موظف",
    openNotifications: "فتح مركز الإشعارات",
  },
  en: {
    brand: "Amazon",
    subtitle: "HR & Finance",
    dashboard: "Dashboard",
    employees: "Employees",
    assignments: "Assignments",
    advances: "Advances",
    payroll: "Payroll",
    deductions: "Deductions",
    attendance: "Attendance",
    overtime: "Overtime",
    leaves: "Leaves",
    notifications: "Notifications",
    reports: "Reports",
    users: "Users & Permissions",
    settings: "Settings",
    search: "Search the system...",
    welcome: "Welcome to HR & Finance",
    overview: "Overview",
    employeesCount: "Total employees",
    advancesMonth: "Advances this month",
    payrollPending: "Payroll in progress",
    unread: "Unread notifications",
    quickAccess: "Quick access",
    recentActivity: "Recent activity",
    noData: "No live data yet. Records will appear here after database connection and setup.",
    setupTitle: "Connect your Nhost project",
    setupText: "The foundation UI is ready. Add your Nhost Subdomain and Region to .env before enabling the connection.",
    signIn: "Sign in",
    email: "Email",
    password: "Password",
    signInButton: "Secure sign in",
    signOut: "Sign out",
    showPassword: "Show password",
    hidePassword: "Hide password",
    loginError: "Sign in failed. Check credentials and Nhost configuration.",
    loginRequired: "Sign in to access system data.",
    connection: "Connection",
    connected: "Connection configured",
    notConnected: "Not configured",
    language: "العربية",
    systemStatus: "Foundation release",
    secure: "Secure connection and server-side permissions required",
    moduleNote: "This module is included in the system blueprint. Its operations will be enabled after Hasura permissions and database tests.",
    currencyRule: "Salary follows the agreed currency; overtime is paid in IQD at an admin-defined hourly rate.",
    giverRule: "Every active giver can create an advance for any employee, attributed to the authenticated giver.",
    biometricRule: "Passkeys/WebAuthn do not send fingerprints to the server; only cryptographic credentials are stored when enabled.",
    notificationsRule: "Notifications include event, recipient, actor, amount, currency, status, time and reason, with delivery/read history.",
    moduleTitle: "Module:",
    signInHint: "Accounts and roles are provisioned through Nhost administration. Public sign-up is disabled.",
    passwordReset: "Password changes require an authenticated user session.",
    quick: "Quick actions",
    newAdvance: "New advance",
    addEmployee: "Add employee",
    openNotifications: "Open notification center",
  }
};

const navItems: { key: ModuleKey; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", icon: LayoutDashboard },
  { key: "employees", icon: Users },
  { key: "assignments", icon: ClipboardList },
  { key: "advances", icon: Wallet },
  { key: "payroll", icon: CircleDollarSign },
  { key: "deductions", icon: ArrowDownLeft },
  { key: "attendance", icon: Clock3 },
  { key: "overtime", icon: Activity },
  { key: "leaves", icon: CalendarDays },
  { key: "notifications", icon: Bell },
  { key: "reports", icon: FileBarChart },
  { key: "users", icon: ShieldCheck },
  { key: "settings", icon: Settings },
];

function App() {
  const [lang, setLang] = useState<Lang>("ar");
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(() => nhost?.getUserSession() ?? null);
  const t = copy[lang];
  const rtl = lang === "ar";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [lang, rtl]);

  const activeLabel = useMemo(
    () => t[active as keyof typeof t] ?? active,
    [active, t]
  );

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!nhost) {
      setError(t.setupText);
      return;
    }
    setBusy(true);
    try {
      const response = await nhost.auth.signInEmailPassword({ email, password });
      if (response.body?.session) {
        setSession(nhost.getUserSession());
        setPassword("");
      } else {
        setError(t.loginError);
      }
    } catch {
      setError(t.loginError);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    if (nhost && session?.refreshTokenId) {
      try {
        await nhost.auth.signOut({ refreshToken: session.refreshTokenId });
      } catch {
        nhost.clearSession();
      }
    }
    setSession(null);
    setActive("dashboard");
  }

  const isSetup = !nhostConfigured;

  return (
    <div className={`app-shell ${rtl ? "rtl" : "ltr"}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-name">{t.brand} <span>HR</span></div>
            <div className="brand-subtitle">{t.subtitle}</div>
          </div>
          <button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18}/></button>
        </div>

        <div className="workspace">
          <div className="workspace-icon"><ShieldCheck size={17}/></div>
          <div className="workspace-copy">
            <strong>Amazon Hypermarket</strong>
            <span>{t.systemStatus}</span>
          </div>
          <ChevronDown size={15} className="muted-icon"/>
        </div>

        <div className="nav-caption">{t.overview}</div>
        <nav className="nav-list">
          {navItems.map(({ key, icon: Icon }) => (
            <button
              key={key}
              className={`nav-item ${active === key ? "active" : ""}`}
              onClick={() => { setActive(key); setSidebarOpen(false); }}
            >
              <Icon size={18} strokeWidth={1.8}/>
              <span>{t[key]}</span>
              {key === "notifications" && <i className="nav-dot"/>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="secure-note"><ShieldCheck size={16}/><span>{t.secure}</span></div>
          <div className="version">FAMILY STORE · FOUNDATION V1</div>
        </div>
      </aside>

      {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"/>}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-start">
            <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20}/></button>
            <div className="breadcrumb"><span>{t.brand} HR</span><b>/</b><strong>{activeLabel}</strong></div>
          </div>
          <div className="topbar-actions">
            <label className="search-box"><Search size={16}/><input placeholder={t.search}/><kbd>⌘ K</kbd></label>
            <button className="icon-button language-button" onClick={() => setLang(lang === "ar" ? "en" : "ar")} title={t.language}><Globe2 size={18}/><span>{lang.toUpperCase()}</span></button>
            <button className="icon-button notification-button" onClick={() => setActive("notifications")} aria-label={t.notifications}><Bell size={18}/><i/></button>
            {session ? (
              <div className="profile-chip">
                <div className="avatar"><UserRound size={17}/></div>
                <div className="profile-name"><strong>{session.user?.displayName || session.user?.email || "User"}</strong><span>{t.users}</span></div>
                <button className="icon-button" onClick={handleSignOut} title={t.signOut}><LogOut size={17}/></button>
              </div>
            ) : (
              <button className="login-top" onClick={() => document.getElementById("login-card")?.scrollIntoView({ behavior: "smooth" })}>{t.signIn}</button>
            )}
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot"/>{t.systemStatus}</div>
              <h1>{active === "dashboard" ? t.welcome : activeLabel}</h1>
              <p>{active === "dashboard" ? t.overview : `${t.moduleTitle} ${activeLabel}`}</p>
            </div>
            <div className="date-chip"><CalendarDays size={16}/><span>{new Date().toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span></div>
          </div>

          {active === "dashboard" ? (
            <>
              {isSetup && (
                <section className="setup-banner">
                  <div className="setup-icon"><Settings size={20}/></div>
                  <div className="setup-copy"><strong>{t.setupTitle}</strong><p>{t.setupText}</p></div>
                  <span className="status-pill warning">{t.notConnected}</span>
                </section>
              )}

              <div className="metrics-grid">
                {[
                  { label: t.employeesCount, value: "—", icon: Users, tone: "blue", sub: t.noData },
                  { label: t.advancesMonth, value: "—", icon: Wallet, tone: "purple", sub: t.noData },
                  { label: t.payrollPending, value: "—", icon: CircleDollarSign, tone: "green", sub: t.noData },
                  { label: t.unread, value: "—", icon: Bell, tone: "amber", sub: t.noData },
                ].map((item) => (
                  <article className="metric-card" key={item.label}>
                    <div className={`metric-icon ${item.tone}`}><item.icon size={19}/></div>
                    <span className="metric-label">{item.label}</span>
                    <strong className="metric-value">{item.value}</strong>
                    <span className="metric-foot">{item.sub}</span>
                  </article>
                ))}
              </div>

              <div className="dashboard-grid">
                <section className="panel activity-panel">
                  <div className="panel-header"><div><h2>{t.recentActivity}</h2><p>{t.noData}</p></div><span className="panel-icon"><Activity size={18}/></span></div>
                  <div className="empty-state"><div className="empty-illustration"><ClipboardList size={27}/></div><strong>{lang === "ar" ? "بانتظار أول حركة" : "Waiting for the first activity"}</strong><span>{t.noData}</span></div>
                </section>
                <section className="panel quick-panel">
                  <div className="panel-header"><div><h2>{t.quickAccess}</h2><p>{lang === "ar" ? "انتقل مباشرة إلى الوحدات الأساسية" : "Jump to core modules"}</p></div><span className="panel-icon"><ArrowUpRight size={18}/></span></div>
                  <div className="quick-actions">
                    <button onClick={() => setActive("advances")}><Wallet size={18}/><span>{t.newAdvance}</span><ArrowUpRight size={15}/></button>
                    <button onClick={() => setActive("employees")}><Users size={18}/><span>{t.addEmployee}</span><ArrowUpRight size={15}/></button>
                    <button onClick={() => setActive("notifications")}><Bell size={18}/><span>{t.openNotifications}</span><ArrowUpRight size={15}/></button>
                  </div>
                </section>
              </div>

              <div className="rules-grid">
                <div className="rule-card"><CircleDollarSign size={18}/><span>{t.currencyRule}</span></div>
                <div className="rule-card"><Wallet size={18}/><span>{t.giverRule}</span></div>
                <div className="rule-card"><Fingerprint size={18}/><span>{t.biometricRule}</span></div>
                <div className="rule-card"><Bell size={18}/><span>{t.notificationsRule}</span></div>
              </div>
            </>
          ) : (
            <section className="module-panel panel">
              <div className="module-panel-head">
                <div className="module-symbol">{(() => { const Item = navItems.find(x => x.key === active)?.icon ?? LayoutDashboard; return <Item size={25}/>; })()}</div>
                <div><h2>{activeLabel}</h2><p>{t.moduleNote}</p></div>
              </div>
              {active === "notifications" && (
                <div className="notification-spec">
                  <h3>{lang === "ar" ? "تفاصيل سجل الإشعارات المعتمد" : "Notification record specification"}</h3>
                  <div className="spec-tags">
                    {(lang === "ar"
                      ? ["نوع الحدث","عنوان الإشعار","التفاصيل","المستلم","الموظف","المنفذ","المبلغ","العملة","الحالة","الوقت","السبب","رابط الحركة","قناة الإرسال","وقت القراءة"]
                      : ["Event type","Title","Details","Recipient","Employee","Actor","Amount","Currency","Status","Time","Reason","Entity link","Delivery channel","Read time"]
                    ).map(x => <span key={x}>{x}</span>)}
                  </div>
                </div>
              )}
              <div className="module-empty"><ClipboardList size={25}/><strong>{lang === "ar" ? "الوحدة مُدرجة في الهيكل" : "Module included in the blueprint"}</strong><span>{t.moduleNote}</span></div>
            </section>
          )}

          <section className="login-section panel" id="login-card">
            <div className="login-intro">
              <div className="login-mark"><ShieldCheck size={22}/></div>
              <div><h2>{t.signIn}</h2><p>{t.signInHint}</p></div>
              <span className={`status-pill ${nhostConfigured ? "success" : "warning"}`}>{nhostConfigured ? t.connected : t.notConnected}</span>
            </div>
            {!session ? (
              <form className="login-form" onSubmit={handleSignIn}>
                <label>{t.email}<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" required autoComplete="username"/></label>
                <label>{t.password}<div className="password-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"/><button type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? t.hidePassword : t.showPassword}</button></div></label>
                <button className="primary-button" type="submit" disabled={busy || !nhostConfigured}>{busy ? "..." : t.signInButton}</button>
                {error && <div className="form-error">{error}</div>}
              </form>
            ) : (
              <div className="signed-in-state"><Check size={18}/><span>{t.loginRequired}</span><button className="secondary-button" onClick={handleSignOut}>{t.signOut}</button></div>
            )}
            <div className="login-foot"><ShieldCheck size={14}/>{t.passwordReset}</div>
          </section>

          <footer className="footer"><span>© {new Date().getFullYear()} Amazon Hypermarket</span><span>HR & Finance · Foundation V1</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
