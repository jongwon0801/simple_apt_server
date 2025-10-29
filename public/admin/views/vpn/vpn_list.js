"use strict";

angular.module("inspinia").controller("VpnListCtrl", function ($scope, $http) {
  $scope.list = []; // 전체 VPN 데이터
  $scope.filteredList = []; // 검색 필터 적용 데이터
  $scope.pagedList = []; // 현재 페이지 데이터
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
  // VPN 전체 목록 조회
  // -----------------------------
  $scope.loadVpn = function () {
    $http
      .get("/api/vpn/vpnCrud", { params: { display: 9999 } })
      .then((res) => {
        $scope.list = res.data.data || [];
        $scope.filterList(); // 필터 적용 후 페이지네이션
      })
      .catch((err) => {
        console.error("VPN 목록 조회 오류:", err);
        toastr.error("VPN 목록 데이터 로드 실패.");
      });
  };

  // -----------------------------
  // IP / 위치 필터링
  // -----------------------------
  $scope.filterList = function () {
    const keyword = ($scope.keyword || "").toLowerCase();
    $scope.filteredList = $scope.list.filter(
      (item) =>
        (item.ip && item.ip.toLowerCase().includes(keyword)) ||
        (item.location && item.location.toLowerCase().includes(keyword))
    );
    $scope.currentPage = 1; // 검색 시 첫 페이지로 초기화
    $scope.updatePagedList();
  };

  // -----------------------------
  // VPN 삭제
  // -----------------------------
  $scope.deleteVpn = function (ip) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    $http
      .delete(`/api/vpn/vpnCrud/${ip}`)
      .then(() => {
        toastr.success("삭제 성공");
        $scope.loadVpn();
      })
      .catch((err) => {
        console.error("삭제 오류:", err);
        toastr.error("삭제 실패");
      });
  };

  // -----------------------------
  // 초기 로드
  // -----------------------------
  $scope.loadVpn();
});
