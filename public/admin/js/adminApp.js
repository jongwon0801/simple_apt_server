// adminApp.js
var inspinia = angular.module("inspinia", [
  "ui.router",
  "oc.lazyLoad",
  "ui.bootstrap",
  "ngCookies",
  "ngResource",
  "ngSanitize",
]);

// AuthServices 모듈 주입
inspinia.requires.push("AuthServices");

// run 블록
inspinia.run(function ($rootScope, $http, $window, $state) {
  const stored = $window.localStorage.getItem("globals");
  if (stored) {
    $rootScope.globals = angular.fromJson(stored);
  } else {
    $state.go("login");
  }
});
