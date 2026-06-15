/* ============================================================
   App router + mount
   ============================================================ */
(function () {
const { useState, useEffect } = React;
const { ToastHost } = window;

function App() {
  const [nav, setNav] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hff_nav")) || { route: "landing", params: {} }; }
    catch (e) { return { route: "landing", params: {} }; }
  });
  const go = (route, params = {}) => {
    setNav({ route, params });
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    try { localStorage.setItem("hff_nav", JSON.stringify(nav)); } catch (e) {}
  }, [nav]);

  const { route, params } = nav;
  let view;
  if (route === "landing") view = <window.Landing nav={go} />;
  else if (route === "login") view = <window.Login nav={go} params={params} />;
  else if (route.startsWith("carrier")) view = <window.CarrierApp route={route} params={params} nav={go} />;
  else if (route.startsWith("admin")) view = <window.AdminApp route={route} params={params} nav={go} />;
  else if (route.startsWith("broker")) view = <window.BrokerApp route={route} params={params} nav={go} />;
  else view = <window.Landing nav={go} />;

  return <ToastHost>{view}</ToastHost>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
