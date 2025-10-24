"use strict";

angular.module("inspinia").controller("AppleboxDetailCtrl", [
  function ($scope, $http, $state) {
    $scope.templates = "";
    $scope.resultMessage = "";

    console.log("AppleboxDetailCtrl 초기화");

    // 뒤로가기
    $scope.back = () => $state.go("applebox.list");

    // 폼 제출
    $scope.formSubmit = function () {
      if (!$scope.templates) {
        toastr.warning("JSON 데이터를 입력하세요.");
        $scope.resultMessage = "JSON 데이터를 입력하세요.";
        return;
      }

      let jsonData;
      try {
        jsonData = JSON.parse($scope.templates);
      } catch (e) {
        toastr.error("유효한 JSON 형식이 아닙니다.");
        $scope.resultMessage = "유효한 JSON 형식이 아닙니다.";
        return;
      }

      const yid = jsonData.yid;
      const cabinets = jsonData.cabinet || [];

      if (!yid) {
        toastr.warning("yid를 입력해야 합니다.");
        $scope.resultMessage = "yid를 입력해야 합니다.";
        return;
      }

      // Locker 객체 생성
      const lockers = [];
      cabinets.forEach((cab) => {
        (cab.box || []).forEach((box) => {
          lockers.push({
            yid,
            label: box.label,
            col: box.col,
            row: box.row,
            jumper: box.jumper,
            serial: box.serial,
            status: box.status || "B",
            width: box.width,
            height: box.height,
            senderHp: box.senderHp || null,
            receiverHp: box.receiverHp || null,
            authNum: box.authNum || null,
          });
        });
      });

      if (lockers.length === 0) {
        toastr.warning("등록할 Locker가 없습니다.");
        $scope.resultMessage = "등록할 Locker가 없습니다.";
        return;
      }

      $scope.resultMessage = `Locker(${lockers.length}개) 등록 중...`;
      console.log("등록할 Locker 데이터:", lockers);

      // 각 Locker를 API로 등록
      const requests = lockers.map((locker) =>
        $http.post("/api/locker/" + locker.yid, locker)
      );

      Promise.all(requests)
        .then((responses) => {
          const count = responses.length;
          toastr.success(`Locker(${count}개) 등록 완료!`);
          $scope.resultMessage = `Locker(${count}개) 등록 완료!`;
        })
        .catch((err) => {
          console.error("Locker 등록 에러:", err);
          toastr.error(
            "Locker 등록 중 오류가 발생했습니다: " +
              (err.data?.message || "알 수 없는 오류")
          );
          $scope.resultMessage = "Locker 등록 중 오류가 발생했습니다.";
        });
    };
  },
]);
