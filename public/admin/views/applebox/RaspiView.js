angular
  .module("inspinia", [
    {
      files: [
        "/bower_components/moment/min/moment.min.js",
        "/bower_components/jQuery-contextMenu/dist/jquery.contextMenu.min.css",
        "/bower_components/jQuery-contextMenu/dist/jquery.contextMenu.min.js",
        "/bower_components/jQuery-contextMenu/dist/jquery.ui.position.min.js",
        "/bower_components/datetimepicker/jquery.datetimepicker.css",
        "/bower_components/datetimepicker/build/jquery.datetimepicker.full.min.js",
        "/js/lockerScript.js",
      ],
      cache: false,
      serie: true,
    },
  ])
  .controller(
    "RaspiViewCtrl",
    function ($timeout, $scope, $http, $q, $stateParams, $modal, Locker) {
      const statusColorMap = {
        B: "#00ffff", // 사용가능
        S: "#ff0000", // 보관중
        N: "#ff00ff", // 사용불가
        P: "#ffff00", // 보관하려는중
        F: "#0000ff", // 찾으려는중
      };

      // locker 상태 병합
      $scope.lockMerge = function (cabinets, lockerStatus) {
        angular.forEach(cabinets.cabinet, function (cab) {
          angular.forEach(cab.box, function (box) {
            angular.forEach(lockerStatus, function (status) {
              if (
                box.serial === status.serial &&
                box.jumper === status.jumper
              ) {
                box.closed = status.closed;
                box.status = status.status;
                box.senderHp = status.senderHp;
                box.receiverHp = status.receiverHp;
                box.authNum = status.authNum;
                return false;
              }
            });
          });
        });
      };

      // 데이터 가져오기
      $q.all([
        $http.post("/v1/AppleboxAll/" + $stateParams.yid, null, {
          headers: {
            "applebox-host": "applebox-" + $stateParams.yid + ".apple-box.kr",
          },
        }),
        $http.post("/v1/Status/" + $stateParams.yid, null, {
          headers: {
            "applebox-host": "applebox-" + $stateParams.yid + ".apple-box.kr",
          },
        }),
      ]).then(
        function (results) {
          const cabinets = results[0].data.data;
          const lockerStatus = results[1].data.data;

          $scope.lockMerge(cabinets, lockerStatus);

          // 화면 렌더링 (칸 크기)
          const sw = 500 / 2.5;
          const wh = 1800 / 2.5;
          $scope.list = init_viewport(cabinets, statusColorMap, sw, wh);

          // 컨텍스트 메뉴 설정
          $timeout(function () {
            $.contextMenu({
              selector: ".cabinet_panel",
              trigger: "left",
              callback: function (key, opt) {
                const locker = $(opt.$trigger).data("locker");
                if (key === "open") {
                  $http
                    .post("/v1/OpenToAdmin/" + locker.yid, locker, {
                      headers: {
                        "applebox-host":
                          "applebox-" + $stateParams.yid + ".apple-box.kr",
                      },
                    })
                    .then(
                      function (rs) {
                        console.log(rs);
                      },
                      function (err) {
                        console.log(err);
                      }
                    );
                } else {
                  $scope.editLocker(locker, key);
                }
              },
              items: {
                view: { name: "상세정보" },
                save: {
                  name: "열기-보관",
                  disabled: function (key, opt) {
                    const locker = $(opt.$trigger).data("locker");
                    return !(locker.closed && locker.status === "B");
                  },
                },
                take: {
                  name: "열기-수령",
                  disabled: function (key, opt) {
                    const locker = $(opt.$trigger).data("locker");
                    return !(locker.closed && locker.status === "A");
                  },
                },
                open: {
                  name: "열기-관리",
                  disabled: function (key, opt) {
                    const locker = $(opt.$trigger).data("locker");
                    return !locker.closed;
                  },
                },
              },
            });
          });
        },
        function (err) {
          console.error(err);
        }
      );

      // 모달 열기
      $scope.editLocker = function (item, action) {
        $modal
          .open({
            animation: true,
            templateUrl:
              action === "view"
                ? "views/applebox/modal.locker.html"
                : "views/applebox/modal.locker.open.html",
            controller: "LockerCtrl",
            resolve: {
              item: function () {
                return item;
              },
              action: function () {
                return action;
              },
            },
          })
          .result.then(
            function (selectedItem) {},
            function (err) {}
          );
      };
    }
  )
  .controller(
    "LockerCtrl",
    function ($scope, $modalInstance, $http, item, action) {
      $scope.item = item;
      $scope.action = action;

      $scope.close = function () {
        $modalInstance.dismiss("cancel");
      };

      $scope.trySave = function () {
        if (action === "save") {
          if ($scope.item.status !== "B") {
            alert("비워있는 보관함에만 보관할 수 있습니다.");
            return;
          }
          $http
            .post("/v1/OpenToSave/" + $scope.item.yid, $scope.item)
            .then(function (rs) {
              if (rs.data.success) {
                $modalInstance.close($scope.item);
              }
            });
        } else if (action === "take") {
          if ($scope.item.status !== "A") {
            alert("보관중인 물건만 찾을 수 있습니다.");
            return;
          }
          $http
            .post("/v1/OpenToTake/" + $scope.item.yid, $scope.item)
            .then(function (rs) {
              if (rs.data.success) {
                $modalInstance.close($scope.item);
              }
            });
        } else if (action === "view") {
          $http
            .put("/v1/Locker/" + $scope.item.yid, $scope.item)
            .then(function (rs) {
              if (rs.data.success) {
                $modalInstance.close($scope.item);
              }
            });
        }
      };
    }
  );
