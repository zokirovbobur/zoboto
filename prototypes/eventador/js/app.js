/* ======================= src/App.jsx ======================= */

function ScrollTop() {
  const loc = useLocation();
  useEffect(() => { const m = document.querySelector('main'); if (m) m.scrollTop = 0; }, [loc.pathname]);
  return null;
}

function Splash({ error, onRetry }) {
  return (
    <div className="splash">
      <div className="splash-box">
        <div className="brand" style={{ fontSize: 22, justifyContent: 'center' }}><span className="dot" /> eventador</div>
        {error ? (
          <>
            <div className="splash-err">Could not reach the mock API</div>
            <div className="splash-sub mono">{error}</div>
            <button className="btn pri" onClick={onRetry} style={{ marginTop: 14 }}>Retry</button>
          </>
        ) : (
          <>
            <div className="spinner" />
            <div className="splash-sub">Loading workspace…</div>
          </>
        )}
      </div>
    </div>
  );
}

function Shell() {
  const { authed, db, dbError, reloadDb } = useApp();
  if (!authed) return <Login />;
  if (dbError) return <Splash error={dbError} onRetry={reloadDb} />;
  if (!db) return <Splash />;
  return (
    <BrowserRouter>
      <ScrollTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flows" element={<Flows />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/designer" element={<Designer />} />
          <Route path="/designer/:id" element={<Designer />} />
          <Route path="/functions" element={<Functions />} />
          <Route path="/scheduler" element={<Scheduler />} />
          <Route path="/deployments" element={<Deployments />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/visualizer" element={<Visualizer />} />
          <Route path="/dlq" element={<Dlq />} />
          <Route path="/org" element={<Org />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<Profile />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/protos" element={<Protos />} />
          <Route path="/middleware-protos" element={<MiddlewareProtos />} />
          <Route path="/endpoints" element={<Endpoints />} />
          <Route path="/apikeys" element={<ApiKeys />} />
          <Route path="/routegroups" element={<RouteGroups />} />
          <Route path="/env-report" element={<EnvReport />} />
          <Route path="/env" element={<Navigate to="/env-report" replace />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      <CommandPalette />
      <Drawer />
      <Confirm />
      <Toasts />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}


/* ======================= bootstrap ======================= */
const __boot = document.getElementById('boot');
if (__boot) __boot.remove();
ReactDOM.createRoot(document.getElementById('root')).render(<App />);