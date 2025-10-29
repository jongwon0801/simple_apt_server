"use strict";

angular
  .module("inspinia")
  .controller("LockerStatusCtrl", function ($scope, $http, $stateParams) {
    $scope.list = []; // 전체 데이터
    $scope.filteredList = []; // 검색 필터 적용 후
    $scope.pagedList = []; // 현재 페이지 데이터
    $scope.yid = $stateParams.yid;
    $scope.keyword = "";

    $scope.currentPage = 1; // 현재 페이지
    $scope.pageSize = 10; // 페이지당 아이템 수
    $scope.totalPages = 1;

    // 락커 목록 로드
    $scope.loadLockers = function () {
      if (!$scope.yid) {
        toastr.warning("yid가 URL에 없습니다.");
        return;
      }

      $http
        .get(`/api/locker/lockerCrud/${$scope.yid}`)
        .then((res) => {
          $scope.list = res.data || [];
          $scope.filterList(); // 로드 후 필터 적용
          console.log(res);
        })
        .catch((err) => {
          toastr.error(
            "락커 조회 실패: " + (err.data?.message || "알 수 없는 오류")
          );
        });
    };

    // 검색 버튼 클릭 시 호출
    $scope.filterList = function () {
      const keyword = ($scope.keyword || "").toLowerCase();

      $scope.filteredList = $scope.list.filter((locker) => {
        return (
          (locker.label &&
            locker.label.toString().toLowerCase().includes(keyword)) ||
          (locker.senderHp &&
            locker.senderHp.toLowerCase().includes(keyword)) ||
          (locker.receiverHp &&
            locker.receiverHp.toLowerCase().includes(keyword))
        );
      });

      $scope.currentPage = 1; // 검색 시 첫 페이지로 초기화
      $scope.updatePagedList();
    };

    // 페이지네이션 처리
    $scope.updatePagedList = function () {
      $scope.totalPages =
        Math.ceil($scope.filteredList.length / $scope.pageSize) || 1;
      const start = ($scope.currentPage - 1) * $scope.pageSize;
      const end = start + $scope.pageSize;
      $scope.pagedList = $scope.filteredList.slice(start, end);
    };

    // 페이지 이동
    $scope.goPage = function (page) {
      if (page < 1 || page > $scope.totalPages) return;
      $scope.currentPage = page;
      $scope.updatePagedList();
    };

    // 초기 로드
    $scope.loadLockers();
  });
