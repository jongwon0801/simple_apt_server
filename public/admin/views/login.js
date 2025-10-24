"use strict";

// 기존 inspinia 모듈 가져오기 (새 모듈 생성 X)
angular
  .module("inspinia")
  .controller(
    "LoginCtrl",
    function ($scope, $rootScope, $state, $http, AuthenticationService) {
      // 로그인 초기화
      AuthenticationService.ClearCredentials();

      $scope.tryLogin = function () {
        $scope.dataLoading = true;
        const form = {
          uid: $scope.userId,
          passwd: $scope.password,
        };

        $http
          .post("/api/auth/login/authenticate", form)
          .then((res) => {
            if (res.data.token) {
              AuthenticationService.SetCredentials(
                form.uid,
                form.passwd,
                res.data.token
              );

              // ✅ 변경: $location.path -> $state.go
              $state.go("applebox.list");
            } else {
              toastr.error(res.data.message || "로그인 실패");
            }
          })
          .catch((err) => {
            toastr.error(err.data?.message || "로그인 실패");
          })
          .finally(() => {
            $scope.dataLoading = false;
          });
      };
    }
  )
  .factory("AuthenticationService", function ($http, $rootScope, $window) {
    const service = {};

    service.SetCredentials = function (uid, passwd, token) {
      $rootScope.globals = { currentUser: { uid, token } };
      $http.defaults.headers.common.Authorization = "Bearer " + token;
      $window.localStorage.setItem(
        "globals",
        angular.toJson($rootScope.globals)
      );
    };

    service.ClearCredentials = function () {
      $rootScope.globals = {};
      $window.localStorage.removeItem("globals");
      $http.defaults.headers.common.Authorization = "Bearer";
    };

    return service;
  });
