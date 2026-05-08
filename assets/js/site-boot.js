/**
 * Load site data, render public page, then wire interactions.
 */
(function () {
  "use strict";

  function bootMain() {
    if (typeof window.__oracleBootMain === "function") {
      window.__oracleBootMain();
    }
  }

  if (!window.OracleDataStore || !window.OracleSiteRender) {
    bootMain();
    return;
  }

  OracleDataStore.load()
    .then(function (data) {
      window.__ORACLE_SITE__ = data;
      OracleSiteRender.render(data);
      bootMain();
    })
    .catch(function (err) {
      console.warn("[oracle] site data:", err);
      bootMain();
    });
})();
