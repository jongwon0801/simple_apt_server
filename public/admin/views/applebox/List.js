"use strict";

angular
  .module("inspinia")
  .controller("AppleboxListCtrl", function ($scope, $http) {
    // -----------------------------
    // 상태 변수
    // -----------------------------
    $scope.list = []; // 전체 데이터
    $scope.filteredList = []; // 검색/필터 적용된 데이터
    $scope.pagedList = []; // 현재 페이지 데이터
    $scope.keyword = ""; // 검색 키워드

    $scope.currentPage = 1; // 현재 페이지
    $scope.pageSize = 10; // 페이지당 항목 수
    $scope.totalPages = 1; // 총 페이지 수

    // -----------------------------
    // 데이터 로드
    // -----------------------------
    $scope.loadList = function () {
      $http
        .get("/api/applebox/appleboxCrud", { params: { display: 9999 } })
        .then(function (res) {
          // 실제 배열만 $scope.list에 담기
          $scope.list = Array.isArray(res.data.data) ? res.data.data : [];
          $scope.applyFilter(); // 필터 + 페이지네이션 적용
        })
        .catch(function (err) {
          console.error("리스트 조회 오류:", err);
          toastr.error("리스트 조회 실패");
        });
    };

    // -----------------------------
    // 검색 / 필터 적용
    // -----------------------------
    $scope.applyFilter = function () {
      if (!Array.isArray($scope.list)) {
        console.warn("list is not an array", $scope.list);
        $scope.filteredList = [];
        $scope.updatePagedList();
        return;
      }

      const keyword = ($scope.keyword || "").toLowerCase();

      $scope.filteredList = $scope.list.filter((item) => {
        return (
          (item.location &&
            item.location.toString().toLowerCase().includes(keyword)) ||
          (item.yid && item.yid.toString().toLowerCase().includes(keyword))
        );
      });

      $scope.currentPage = 1; // 검색 시 첫 페이지로 초기화
      $scope.updatePagedList();
    };

    // -----------------------------
    // 페이지네이션 처리
    // -----------------------------
    $scope.updatePagedList = function () {
      $scope.totalPages =
        Math.ceil($scope.filteredList.length / $scope.pageSize) || 1;

      const start = ($scope.currentPage - 1) * $scope.pageSize;
      const end = start + $scope.pageSize;
      $scope.pagedList = $scope.filteredList.slice(start, end);
    };

    $scope.goPage = function (page) {
      if (page < 1 || page > $scope.totalPages) return;
      $scope.currentPage = page;
      $scope.updatePagedList();
    };

    // -----------------------------
    // 초기 실행
    // -----------------------------
    $scope.loadList();
  });
