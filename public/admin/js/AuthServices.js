"use strict";

// ---------------------------------------------------------------------
// 공용 서비스 모듈: AuthServices
// 모든 화면에서 재사용 가능한 CRUD 서비스들을 정의
// AngularJS 1.2 이상 호환, JWT 인증 헤더 포함
// ---------------------------------------------------------------------
angular
  .module("AuthServices", [])

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
  });
