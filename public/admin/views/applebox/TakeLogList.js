"use strict";

angular
  .module("inspinia", [
    {
      files: [
        "/bower_components/moment/min/moment.min.js",
        "/bower_components/bootstrap-daterangepicker/daterangepicker.js",
        "/bower_components/bootstrap-daterangepicker/daterangepicker.css",
      ],
      cache: false,
      serie: true,
    },
  ])
  .controller("TakeLogCtrl", function ($scope, $location, $timeout, $http) {
    // -----------------------------
    // 기본 설정
    // -----------------------------
    $scope.display = 10;
    $scope.currentPage = parseInt($location.search().page) || 1;
    $scope.totalItems = 0;
    $scope.totalPages = 1;

    // -----------------------------
    // 검색 폼 초기값
    // -----------------------------
    $scope.sform = {
      searchText: $location.search().searchText || "",
      receiverHp: $location.search().receiverHp || "",
      startDate: $location.search().startDate || "",
      endDate: $location.search().endDate || "",
      page: $scope.currentPage,
      display: $scope.display,
    };

    $scope.list = [];
    $scope.pagedList = [];

    // -----------------------------
    // 날짜 포맷 헬퍼
    // -----------------------------
    $scope.toLocalDateString = function (s) {
      return moment(new Date(s)).format("YYYY-MM-DD");
    };

    // -----------------------------
    // pagedList 계산
    // -----------------------------
    $scope.updatePagedList = function () {
      const start = ($scope.currentPage - 1) * $scope.display;
      $scope.pagedList = $scope.list.slice(start, start + $scope.display);
      $scope.totalPages = Math.max(
        Math.ceil($scope.list.length / $scope.display),
        1
      );
    };

    // -----------------------------
    // 페이지 이동
    // -----------------------------
    $scope.goPage = function (p) {
      if (p < 1) p = 1;
      if (p > $scope.totalPages) p = $scope.totalPages;
      $scope.currentPage = p;
      $scope.updatePagedList();
    };

    // -----------------------------
    // 검색/조회
    // -----------------------------
    $scope.formSubmit = function () {
      const params = {
        searchText: $scope.sform.searchText,
        receiverHp: $scope.sform.receiverHp,
        startDate: $scope.sform.startDate,
        endDate: $scope.sform.endDate,
      };

      $http
        .get("/api/log/takeLog", { params })
        .then(function (res) {
          $scope.list = res.data.data || [];
          $scope.totalItems = res.data.recordsTotal || $scope.list.length;
          $scope.currentPage = 1;
          $scope.updatePagedList();
        })
        .catch(function (err) {
          console.error(err);
        });
    };

    // -----------------------------
    // daterangepicker 콜백
    // -----------------------------
    $scope.cb = function (start, end) {
      $scope.sform.startDate = start.format("YYYY-MM-DD");
      $scope.sform.endDate = end.format("YYYY-MM-DD");
      $("#daterange span").html(
        $scope.sform.startDate + " ~ " + $scope.sform.endDate
      );
      if (!$scope.$$phase) $scope.$apply();
    };

    // -----------------------------
    // 초기 날짜 설정 + daterangepicker 초기화
    // -----------------------------
    $timeout(function () {
      const start = $scope.sform.startDate
        ? moment($scope.sform.startDate)
        : moment().subtract(7, "days");
      const end = $scope.sform.endDate
        ? moment($scope.sform.endDate)
        : moment();

      $("#daterange").daterangepicker(
        {
          startDate: start,
          endDate: end,
          opens: "right",
          linkedCalendars: false,
          ranges: {
            오늘: [moment(), moment()],
            어제: [moment().subtract(1, "days"), moment().subtract(1, "days")],
            "최근 7일": [moment().subtract(6, "days"), moment()],
            "최근 한달": [moment().subtract(29, "days"), moment()],
          },
          locale: {
            format: "YYYY-MM-DD",
            applyLabel: "확인",
            cancelLabel: "취소",
            fromLabel: "부터",
            toLabel: "까지",
            customRangeLabel: "사용자 지정",
            daysOfWeek: ["일", "월", "화", "수", "목", "금", "토"],
            monthNames: [
              "1월",
              "2월",
              "3월",
              "4월",
              "5월",
              "6월",
              "7월",
              "8월",
              "9월",
              "10월",
              "11월",
              "12월",
            ],
            firstDay: 1,
          },
        },
        $scope.cb
      );

      $scope.cb(start, end);
      $scope.formSubmit();
    });
  });
