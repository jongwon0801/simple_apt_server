"use strict";

// ---------------------------------------------------------------------
// 공용 서비스 모듈: AppleboxServices
// 모든 화면에서 재사용 가능한 CRUD 서비스들을 정의
// AngularJS 1.2 이상 호환, JWT 인증 헤더 포함
// ---------------------------------------------------------------------
angular
  .module("AppleboxServices", [])

  // -----------------------------
  // AuthHeader (JWT 토큰 자동 주입)
  // -----------------------------
  .factory("AuthHeader", function () {
    return {
      get: function () {
        const globals = localStorage.getItem("globals");
        if (!globals) return {};
        try {
          const currentUser = JSON.parse(globals).currentUser;
          if (currentUser && currentUser.token) {
            return { Authorization: "Bearer " + currentUser.token };
          }
        } catch (e) {
          console.error("Invalid globals in localStorage", e);
        }
        return {};
      },
    };
  })

  // -----------------------------
  // AuthInterceptor (모든 $http / $resource 요청에 JWT 적용)
  // -----------------------------
  .factory("AuthInterceptor", function (AuthHeader) {
    return {
      request: function (config) {
        const headers = AuthHeader.get();
        config.headers = Object.assign({}, config.headers, headers);
        return config;
      },
    };
  })
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push("AuthInterceptor");
  })

  // -----------------------------
  // 헬퍼: $resource + AuthHeader (기본 CRUD)
  // -----------------------------
  .factory("ResourceWithAuth", function ($resource) {
    return function (url, paramDefaults = {}, actions = {}) {
      Object.keys(actions).forEach((key) => {
        // headers는 interceptor가 처리하므로 비워둬도 됨
        actions[key].isArray = actions[key].isArray || false;
        actions[key].cache = actions[key].cache || false;
      });
      return $resource(url, paramDefaults, actions);
    };
  })

  // -----------------------------
  // Applebox (보관함 그룹 CRUD)
  // -----------------------------
  .factory("Applebox", function (ResourceWithAuth) {
    return ResourceWithAuth("/api/applebox/appleboxCrud/:yid", { yid: "@yid" }, {
      update: { method: "PUT" },
      get: { method: "GET" },
      query: { method: "GET" },
      delete: { method: "DELETE" },
      save: { method: "POST" },
    });
  })

  // -----------------------------
  // Locker (보관함 CRUD)
  // -----------------------------
  .factory("Locker", function (ResourceWithAuth) {
    return ResourceWithAuth("/api/locker/lockerCrud/:lockerId", { lockerId: "@lockerId" }, {
      update: { method: "PUT" },
      get: { method: "GET" },
      query: { method: "GET" },
      delete: { method: "DELETE" },
      save: { method: "POST" },
    });
  })

  // -----------------------------
  // SaveLog (보관 로그)
  // -----------------------------
  .factory("SaveLog", function (ResourceWithAuth) {
    return ResourceWithAuth("/api/log/saveLog/:saveSq", { saveSq: "@saveSq" }, {
      update: { method: "PUT" },
      get: { method: "GET" },
      query: { method: "GET" },
      delete: { method: "DELETE" },
      save: { method: "POST" },
    });
  })

  // -----------------------------
  // TakeLog (수령 로그)
  // -----------------------------
  .factory("TakeLog", function (ResourceWithAuth) {
    return ResourceWithAuth("/api/log/takeLog/:takeSq", { takeSq: "@takeSq" }, {
      update: { method: "PUT" },
      get: { method: "GET" },
      query: { method: "GET" },
      delete: { method: "DELETE" },
      save: { method: "POST" },
    });
  })

  // -----------------------------
  // LockerAction (보관함 동작)
  // -----------------------------
  .factory("LockerAction", function (ResourceWithAuth) {
    return ResourceWithAuth("/api/locker/lockerAction/:actionId", { actionId: "@actionId" }, {
      update: { method: "PUT" },
      query: { method: "GET" },
      delete: { method: "DELETE" },
      save: { method: "POST" },
    });
  })

  // -----------------------------
  // LockerCount (보관함 개수)
  // -----------------------------
  .factory("LockerCount", function (ResourceWithAuth) {
    return ResourceWithAuth("/api/locker/lockerCount", {}, {
      get: { method: "GET" },
    });
  })

  // -----------------------------
  // File Upload
  // -----------------------------
  .factory("FileUpload", function (ResourceWithAuth) {
    return ResourceWithAuth("/api/files/upload", {}, {
      upload: { method: "POST" },
    });
  })

  // -----------------------------
  // MyCache (공용 캐시 서비스)
  // -----------------------------
  .factory("MyCache", function ($cacheFactory) {
    const cache = $cacheFactory("myCache");

    cache.setCache = function (key, value) {
      cache.put(key, value);
    };

    cache.getCache = function (key) {
      return cache.get(key);
    };

    return cache;
  });
