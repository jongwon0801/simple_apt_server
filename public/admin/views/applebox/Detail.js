"use strict";

angular
  .module("inspinia")
  .controller("LockerDetailCtrl", function ($scope, $http, $location, $state) {
    // JSON 입력값
    $scope.templates = "";

    // 뒤로가기
    $scope.back = function () {
      $state.go("applebox.list");
    };

    // 등록 처리
    $scope.formSubmit = function () {
      if (!$scope.templates.trim()) {
        toastr.error("JSON 데이터를 입력하세요.");
        return;
      }

      let jsonData;
      try {
        jsonData = JSON.parse($scope.templates);
      } catch (e) {
        toastr.error("유효한 JSON 형식이 아닙니다.");
        return;
      }

      // JSON이 배열 또는 객체인지 확인
      let lockers = Array.isArray(jsonData) ? jsonData : jsonData.locker;
      if (!lockers || !lockers.length) {
        toastr.error("등록할 락커 데이터 없음.");
        return;
      }

      const yid = lockers[0].yid;
      if (!yid) {
        toastr.error("각 락커 데이터에 yid 필요");
        return;
      }

      // 처리 중 알림
      const loadingToast = toastr.info("락커 등록 중", "", {
        timeOut: 0,
        extendedTimeOut: 0,
        tapToDismiss: false,
      });

      // 병렬 등록 (Promise.all)
      const requests = lockers.map((locker) =>
        $http.post(`/api/locker/lockerCrud/${locker.yid}`, locker)
      );

      Promise.all(requests)
        .then(() => {
          toastr.clear(loadingToast);
          toastr.success("락커 등록이 완료되었습니다.");
          $location.path("/applebox/list");
        })
        .catch((err) => {
          toastr.clear(loadingToast);
          toastr.error("등록 중 오류 발생");
        });
    };
  });
