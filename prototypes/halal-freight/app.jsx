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
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("hff_lang") || "en"; } catch(e) { return "en"; }
  });
  window._lang = lang;
  window.setLang = setLang;

  const go = (route, params = {}) => {
    setNav({ route, params });
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    try { localStorage.setItem("hff_nav", JSON.stringify(nav)); } catch (e) {}
  }, [nav]);
  useEffect(() => {
    try { localStorage.setItem("hff_lang", lang); } catch(e) {}
  }, [lang]);

  const { route, params } = nav;
  let view;
  if (route === "landing") view = <window.Landing nav={go} lang={lang} />;
  else if (route === "login") view = <window.Login nav={go} params={params} lang={lang} />;
  else if (route.startsWith("carrier")) view = <window.CarrierApp route={route} params={params} nav={go} lang={lang} />;
  else if (route.startsWith("admin")) view = <window.AdminApp route={route} params={params} nav={go} lang={lang} />;
  else if (route.startsWith("broker")) view = <window.BrokerApp route={route} params={params} nav={go} lang={lang} />;
  else view = <window.Landing nav={go} lang={lang} />;

  return <ToastHost>{view}</ToastHost>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
