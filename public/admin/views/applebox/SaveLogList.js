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

  // -----------------------------
  // SaveLog (보관 로그) 컨트롤러
  // -----------------------------
  .controller(
    "SaveLogCtrl",
    function (
      $scope,
      $http,
      $location,
      $q,
      $timeout,
      SaveLog,
      $stateParams,
      $state
    ) {
      $scope.maxSize = 5;
      $scope.display = 10;

      // -----------------------------
      // 검색 폼 초기값
      // -----------------------------
      $scope.sform = angular.extend(
        {
          page: 1,
          display: $scope.display,
          searchText: "",
          startDate: "",
          endDate: "",
        },
        $location.search()
      );

      $scope.list = [];
      $scope.totalItems = 0;
      $scope.currentPage = $scope.sform.page;

      // -----------------------------
      // 페이지 이동
      // -----------------------------
      $scope.pageChanged = function (p) {
        $scope.sform.page = p;
        $state.go("applebox.saveloglist", $scope.sform);
      };

      // -----------------------------
      // 검색폼 제출
      // -----------------------------
      $scope.formSubmit = function () {
        $scope.sform.page = 1;
        $state.go("applebox.saveloglist", $scope.sform);
      };

      // -----------------------------
      // 초기 데이터 로드
      // -----------------------------
      $scope.doSearch = function () {
        SaveLog.query($scope.sform)
          .$promise.then(function (res) {
            $scope.list = res.data || [];
            $scope.totalItems = res.recordsTotal || 0;
            $scope.currentPage = $scope.sform.page;
          })
          .catch(function (err) {
            console.error(err);
          });
      };

      // -----------------------------
      // 날짜 범위 선택기 콜백
      // -----------------------------
      $scope.cb = function (start, end) {
        const updateDates = function () {
          $scope.sform.startDate = start.format("YYYY-MM-DD");
          $scope.sform.endDate = end.format("YYYY-MM-DD");
        };

        if (!$scope.$$phase) {
          $scope.$apply(updateDates);
        } else {
          updateDates();
        }

        $("#daterange span").html(
          start.format("YYYY-MM-DD") + " ~ " + end.format("YYYY-MM-DD")
        );
      };

      // -----------------------------
      // daterangepicker 초기화
      // -----------------------------
      $("#daterange").daterangepicker(
        {
          ranges: {
            오늘: [new Date(), new Date()],
            어제: [moment().subtract(1, "days"), moment().subtract(1, "days")],
            "최근 일주일": [moment().subtract(6, "days"), new Date()],
            "최근 한달": [moment().subtract(29, "days"), new Date()],
            이번달: [moment().startOf("month"), moment().endOf("month")],
            지난달: [
              moment().subtract(1, "month").startOf("month"),
              moment().subtract(1, "month").endOf("month"),
            ],
          },
          opens: "right",
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

      // -----------------------------
      // 초기값 안전하게 설정
      // -----------------------------
      const startDate = $scope.sform.startDate
        ? moment($scope.sform.startDate, "YYYY-MM-DD")
        : moment();
      const endDate = $scope.sform.endDate
        ? moment($scope.sform.endDate, "YYYY-MM-DD")
        : moment();

      $timeout(function () {
        $scope.cb(startDate, endDate);
      });

      // -----------------------------
      // 초기 데이터 검색
      // -----------------------------
      $scope.doSearch();

      // -----------------------------
      // 날짜 포맷 헬퍼
      // -----------------------------
      $scope.toLocalDateString = function (s) {
        return moment(new Date(s)).format("YYYY-MM-DD HH:mm:ss");
      };
    }
  );
