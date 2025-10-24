"use strict";

// ---------------------------------------------------------------------
// 공용 서비스 모듈: AppleboxServices
// 모든 화면에서 재사용 가능한 CRUD 서비스들을 정의
// AngularJS 1.2 호환, JWT 인증 헤더 포함
// ---------------------------------------------------------------------
angular
  .module("AppleboxServices", [])

  // -----------------------------
  // AuthHeader (JWT 토큰 자동 주입)
  // -----------------------------
  .factory("AuthHeader", function () {
    return {
      get: function () {
        var token = localStorage.getItem("token"); // 토큰 저장 위치 확인
        return token ? { Authorization: "Bearer " + token } : {};
      },
    };
  })

  // -----------------------------
  // Applebox (보관함 그룹 CRUD)
  // -----------------------------
  .factory("Applebox", function ($resource, AuthHeader) {
    return $resource(
      "/api/applebox/appleboxCrud/:yid",
      { yid: "@yid" },
      {
        update: { method: "PUT", headers: AuthHeader.get() },
        get: { method: "GET", cache: false, headers: AuthHeader.get() },
        query: {
          method: "GET",
          cache: false,
          isArray: false,
          headers: AuthHeader.get(),
        },
        delete: { method: "DELETE", headers: AuthHeader.get() },
        save: { method: "POST", headers: AuthHeader.get() },
      }
    );
  })

  // -----------------------------
  // Locker (보관함 CRUD)
  // -----------------------------
  .factory("Locker", function ($resource, AuthHeader) {
    return $resource(
      "/api/locker/lockerCrud/:lockerId",
      { lockerId: "@lockerId" },
      {
        update: { method: "PUT", headers: AuthHeader.get() },
        get: { method: "GET", cache: false, headers: AuthHeader.get() },
        query: {
          method: "GET",
          cache: false,
          isArray: false,
          headers: AuthHeader.get(),
        },
        delete: { method: "DELETE", headers: AuthHeader.get() },
        save: { method: "POST", headers: AuthHeader.get() },
      }
    );
  })

  // -----------------------------
  // SaveLog (보관 로그)
  // -----------------------------
  .factory("SaveLog", function ($resource, AuthHeader) {
    return $resource(
      "/api/log/saveLog/:saveSq",
      { saveSq: "@saveSq" },
      {
        update: { method: "PUT", headers: AuthHeader.get() },
        get: { method: "GET", cache: false, headers: AuthHeader.get() },
        query: {
          method: "GET",
          cache: false,
          isArray: false,
          headers: AuthHeader.get(),
        },
        delete: { method: "DELETE", headers: AuthHeader.get() },
        save: { method: "POST", headers: AuthHeader.get() },
      }
    );
  })

  // -----------------------------
  // TakeLog (수령 로그)
  // -----------------------------
  .factory("TakeLog", function ($resource, AuthHeader) {
    return $resource(
      "/api/log/takeLog/:takeSq",
      { takeSq: "@takeSq" },
      {
        update: { method: "PUT", headers: AuthHeader.get() },
        get: { method: "GET", cache: false, headers: AuthHeader.get() },
        query: {
          method: "GET",
          cache: false,
          isArray: false,
          headers: AuthHeader.get(),
        },
        delete: { method: "DELETE", headers: AuthHeader.get() },
        save: { method: "POST", headers: AuthHeader.get() },
      }
    );
  })

  // -----------------------------
  // LockerAction (보관함 동작)
  // -----------------------------
  .factory("LockerAction", function ($resource, AuthHeader) {
    return $resource(
      "/api/locker/lockerAction/:actionId",
      { actionId: "@actionId" },
      {
        update: { method: "PUT", headers: AuthHeader.get() },
        query: {
          method: "GET",
          cache: false,
          isArray: false,
          headers: AuthHeader.get(),
        },
        delete: { method: "DELETE", headers: AuthHeader.get() },
        save: { method: "POST", headers: AuthHeader.get() },
      }
    );
  })

  // -----------------------------
  // File Upload
  // -----------------------------
  .factory("FileUpload", function ($resource, AuthHeader) {
    return $resource(
      "/api/files/upload",
      {},
      { upload: { method: "POST", headers: AuthHeader.get() } }
    );
  })

  // -----------------------------
  // MyCache (공용 캐시 서비스)
  // -----------------------------
  .factory("MyCache", function ($cacheFactory) {
    const cache = $cacheFactory("myCache");

    /**
     * setCache
     * @param {string} key
     * @param {*} value
     */
    cache.setCache = function (key, value) {
      cache.put(key, value);
    };

    /**
     * getCache
     * @param {string} key
     * @returns {*} 캐시에 없으면 undefined
     */
    cache.getCache = function (key) {
      return cache.get(key);
    };

    return cache;
  });
