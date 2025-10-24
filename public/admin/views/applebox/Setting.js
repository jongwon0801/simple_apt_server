angular
  .module("inspinia")
  .controller("AppleboxSettingCtrl", function ($scope, $http, $stateParams) {
    $scope.lockers = []; // 필수! 초기화

    // 서버에서 locker 데이터 불러오기
    $http.get("/api/locker/" + $stateParams.yid).then(
      function (res) {
        const lockersData = res.data;

        // HSCApplebox 구조 만들기
        const cabinet = {
          cabinet: [
            {
              box: lockersData.map((l) => ({
                label: l.label,
                col: l.col,
                row: l.row,
                width: l.width || 1,
                height: l.height || 1,
                status: l.status || "B",
                jumper: l.jumper,
                serial: l.serial,
              })),
            },
          ],
          applebox: {
            name: "Applebox " + $stateParams.yid,
          },
        };

        const colors = ["#00ffff", "#ff00ff", "#ffff00"];
        const sw = 500 / 2.5;
        const wh = 1800 / 2.5;

        $scope.lockers = init_viewport(cabinet, colors, sw, wh);
      },
      function (err) {
        console.error("사물함 데이터 로드 오류:", err);
      }
    );

    // 시각화 클릭 처리
    $scope.editLockerByVisual = function (box) {
      alert("선택된 락커: " + box.label + ", 상태: " + box.status);
    };
  });
