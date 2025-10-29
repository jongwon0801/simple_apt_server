"use strict";

angular
  .module("inspinia")
  // -----------------------------
  // 택배기사 리스트 (hp 검색 + 페이지네이션)
  // -----------------------------
  .controller("DeliveryStaffListCtrl", function ($scope, $http) {
    $scope.list = []; // 전체 택배기사 데이터
    $scope.filteredList = []; // 필터 적용된 리스트
    $scope.pagedList = []; // 현재 페이지에 보여질 리스트
    $scope.keyword = ""; // 검색어

    // -----------------------------
    // 페이지네이션
    // -----------------------------
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.totalPages = 1;

    $scope.updatePagedList = function () {
      const start = ($scope.currentPage - 1) * $scope.pageSize;
      const end = start + $scope.pageSize;
      $scope.pagedList = $scope.filteredList.slice(start, end);
      $scope.totalPages =
        Math.ceil($scope.filteredList.length / $scope.pageSize) || 1;
    };

    $scope.goPage = function (page) {
      if (page < 1) page = 1;
      if (page > $scope.totalPages) page = $scope.totalPages;
      $scope.currentPage = page;
      $scope.updatePagedList();
    };

    // -----------------------------
    // 택배기사 전체 목록 조회
    // -----------------------------
    $scope.loadStaffList = function () {
      $http
        .get("/api/deliveryStaff/deliveryStaffCrud", {
          params: { display: 9999 },
        })
        .then((res) => {
          $scope.list = res.data.data || [];
          $scope.filterList(); // 필터 적용 후 페이지네이션
        })
        .catch((err) => {
          console.error("택배기사 목록 조회 오류:", err);
          toastr.error("택배기사 목록 조회 실패.");
        });
    };

    // -----------------------------
    // hp 필터링
    // -----------------------------
    $scope.filterList = function () {
      const keyword = ($scope.keyword || "").toLowerCase();
      $scope.filteredList = $scope.list.filter((item) =>
        item.hp.toLowerCase().includes(keyword)
      );
      $scope.currentPage = 1; // 검색 시 첫 페이지로 초기화
      $scope.updatePagedList();
    };

    // -----------------------------
    // 택배기사 삭제
    // -----------------------------
    $scope.deleteStaff = function (staffSq) {
      if (!confirm("정말 삭제하시겠습니까?")) return;

      $http
        .delete(`/api/deliveryStaff/deliveryStaffCrud/${staffSq}`)
        .then(() => {
          toastr.success("삭제되었습니다.");
          $scope.loadStaffList();
        })
        .catch((err) => {
          console.error("삭제 오류:", err);
          toastr.error("삭제 실패: " + (err.data?.message || "서버 오류"));
        });
    };

    // -----------------------------
    // 초기 로드
    // -----------------------------
    $scope.loadStaffList();
  });
