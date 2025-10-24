"use strict";

angular
  .module("inspinia")
  .controller(
    "AppleboxStatusCtrl",
    function ($scope, $stateParams, $state, Locker) {
      $scope.maxSize = 5;
      $scope.display = 10;

      // -----------------------------
      // 검색/상태 폼 초기값
      // -----------------------------
      $scope.sform = {
        page: $stateParams.page || 1,
        status: $stateParams.status || "",
        display: $scope.display,
        yid: $stateParams.yid || null, // 반드시 yid 포함
      };

      // -----------------------------
      // 초기 데이터
      // -----------------------------
      $scope.list = [];
      $scope.totalItems = 0;
      $scope.currentPage = $scope.sform.page;

      // -----------------------------
      // 페이지 변경
      // -----------------------------
      $scope.pageChanged = function (p) {
        if (p < 1) return;
        $scope.sform.page = p;
        $state.go("applebox.status", $scope.sform);
        $scope.doSearch();
      };

      // -----------------------------
      // 데이터 조회
      // -----------------------------
      $scope.doSearch = function () {
        if (!$scope.sform.yid) {
          $scope.list = [];
          $scope.totalItems = 0;
          return; // yid 없으면 조회 안 함
        }

        Locker.query($scope.sform)
          .$promise.then(function (res) {
            // 데이터가 없거나 잘못된 경우 기본값 처리
            $scope.list = Array.isArray(res.data) ? res.data : [];
            $scope.totalItems =
              typeof res.recordsTotal === "number" ? res.recordsTotal : 0;
            $scope.currentPage = $scope.sform.page;

            // 상태 라벨 매핑 (리스트가 비어있어도 안전)
            ($scope.list || []).forEach(function (item) {
              var statusObj =
                ($scope.lockerStatus || []).find(
                  (s) => s.codeKey === item.status
                ) || {};
              item.statusLabel =
                statusObj.codeValue || item.status || "알수없음";
            });
          })
          .catch(function (err) {
            console.error("락커 목록 조회 실패:", err);
            $scope.list = [];
            $scope.totalItems = 0;
          });
      };

      // -----------------------------
      // 초기 데이터 조회
      // -----------------------------
      $scope.doSearch();
    }
  );
