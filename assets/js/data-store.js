/**
 * Loads site content: localStorage preview overrides assets/data/site.json
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "oracle-site-data-v1";
  var JSON_URL = "assets/data/site.json";

  function mergeDeep(target, src) {
    if (!src || typeof src !== "object") return target;
    var out = target && typeof target === "object" ? target : {};
    Object.keys(src).forEach(function (k) {
      var sv = src[k];
      if (
        sv &&
        typeof sv === "object" &&
        !Array.isArray(sv) &&
        typeof out[k] === "object" &&
        out[k] !== null &&
        !Array.isArray(out[k])
      ) {
        out[k] = mergeDeep(out[k], sv);
      } else {
        out[k] = sv;
      }
    });
    return out;
  }

  function OracleDataStore() {}

  OracleDataStore.getFromStorage = function () {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  OracleDataStore.saveToStorage = function (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  OracleDataStore.clearStorage = function () {
    localStorage.removeItem(STORAGE_KEY);
  };

  OracleDataStore.fetchDefault = function () {
    return fetch(JSON_URL, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("site.json " + r.status);
      return r.json();
    });
  };

  /**
   * @returns {Promise<object>}
   */
  OracleDataStore.load = function () {
    var stored = OracleDataStore.getFromStorage();
    return OracleDataStore.fetchDefault()
      .then(function (base) {
        return stored ? mergeDeep(JSON.parse(JSON.stringify(base)), stored) : base;
      })
      .catch(function () {
        return stored || {};
      });
  };

  OracleDataStore.STORAGE_KEY = STORAGE_KEY;
  OracleDataStore.JSON_URL = JSON_URL;

  global.OracleDataStore = OracleDataStore;
})(typeof window !== "undefined" ? window : this);
