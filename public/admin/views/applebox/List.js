"use strict";

angular
  .module("inspinia") // 기존 앱 모듈에 통합
  .controller(
    "AppleboxListCtrl",
    function (
      $rootScope,
      $scope,
      $http,
      $state,
      $filter,
      $q,
      Applebox,
      $stateParams,
      $window,
      AuthenticationService
    ) {
      /** ================================
       * 🔐 인증 상태 확인 및 로그인 유지
       * ================================ */
      $scope.checkAuth = function () {
        const stored = $window.localStorage.getItem("globals");
        if (!stored) {
          $state.go("login");
          return;
        }
        $rootScope.globals = angular.fromJson(stored);
        $scope.currentUser = $rootScope.globals.currentUser;

        if (!$scope.currentUser || !$scope.currentUser.token) {
          $state.go("login");
        } else {
          $http.defaults.headers.common.Authorization =
            "Bearer " + $scope.currentUser.token;
        }
      };

      // 로그아웃 처리
      $scope.logout = function () {
        AuthenticationService.ClearCredentials();
        $state.go("login");
      };

      // 컨트롤러 시작 시 인증 체크
      $scope.checkAuth();

      /** ================================
       * 📄 리스트 기능
       * ================================ */
      $scope.maxSize = 5;
      $scope.display = 10;
      $scope.sform = angular.copy($stateParams) || {};
      $scope.sform.page = $scope.sform.page || 1;
      $scope.sform.status = $scope.sform.status || "";
      $scope.sform.display = $scope.display;

      // 페이지 이동
      $scope.pageChanged = function (p) {
        $scope.sform.page = p;
        $state.go("applebox.list", $scope.sform);
      };

      // 초기 데이터 로드
      $scope.doSearch = function () {
        Applebox.query($scope.sform)
          .$promise.then((res) => {
            $scope.totalItems = res.recordsTotal;
            $scope.list = res.data;
            $scope.currentPage = $scope.sform.page;
            console.log($scope.list);
          })
          .catch((err) => {
            console.error(err);
          });
      };

      // 검색버튼 클릭 시
      $scope.formSubmit = function () {
        $scope.sform.page = 1;
        $state.go("applebox.list", $scope.sform);
      };

      // 첫 로딩 시 데이터 검색
      $scope.doSearch();
    }
  );
