"use strict";

angular
  .module("inspinia")
  .controller("AppleboxDetailCtrl", function ($scope, $http, $location, $state) {
    // JSON 입력값
    $scope.templates = "";

    // 뒤로가기
    $scope.back = function () {
      $state.go("applebox.list");
    };

    // 등록/수정 처리
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

      const applebox = jsonData.applebox;
      const cabinets = jsonData.cabinet || [];

      // yid 필수 체크
      if (!applebox?.yid) {
        toastr.error("yid는 필수입니다.");
        return;
      }

      const payload = {
        applebox: {
          yid: applebox.yid,
          name: applebox.name || "",
          addr:
            typeof applebox.addr === "object"
              ? JSON.stringify(applebox.addr)
              : applebox.addr || "",
          ip: applebox.ip || "",
          hp: applebox.hp || "",
          regDate: applebox.regDate || "",
        },
        cabinet: cabinets,
      };

      const loadingToast = toastr.info("처리 중입니다...", "", {
        timeOut: 0,
        extendedTimeOut: 0,
        tapToDismiss: false,
      });

      $http
        .post("/api/applebox/appleboxCrud/detail", payload)
        .then((res) => {
          toastr.clear(loadingToast);

          if (res.data && res.data.success === false) {
            toastr.error(res.data.message || "처리 실패");
            return;
          }

          toastr.success("처리 완료");
          $location.path("/applebox/list");
        })
        .catch((err) => {
          toastr.clear(loadingToast);
          toastr.error("오류 발생: " + (err.data?.message || "알 수 없는 오류"));
        });
    };
  });
