angular
  .module("inspinia") // 기존 앱 모듈에 통합
  .controller(
    "AppleboxViewCtrl",
    function (
      $timeout,
      $rootScope,
      $scope,
      $http,
      $location,
      $filter,
      $q,
      Locker,
      Applebox,
      $stateParams,
      $state,
      $modal,
      MyCache
    ) {
      // lockMerge 함수
      $scope.lockMerge = function (cabinets, lockerStatus) {
        angular.forEach(cabinets.cabinet, function (value) {
          angular.forEach(value.box, function (val) {
            angular.forEach(lockerStatus, function (status) {
              if (val.serial == status.serial && val.jumper == status.jumper) {
                val.closed = status.closed;
                return false;
              }
            });
          });
        });
      };

      // 데이터 조회
      $q.all([$http.get("/v1/AppleboxAll/" + $stateParams.yid)]).then(
        function (results) {
          var cabinets = results[0].data.data;
          $scope.title = cabinets.applebox.name;

          const colors = [
            "#ff0000",
            "#00ffff",
            "#ff00ff",
            "#ffff00",
            "#0000ff",
          ];
          const sw = 500 / 2.5;
          const wh = 1800 / 2.5;
          $scope.list = init_viewport(cabinets, colors, sw, wh);

          // -------------------------
          // 컨텍스트 메뉴
          // -------------------------
          $timeout(function () {
            $.contextMenu({
              selector: ".cabinet_panel",
              trigger: "left",
              callback: function (key, opt) {
                const locker = $(opt.$trigger).data("locker");

                if (key === "open") {
                  // 보관함-문열기 (A 상태일 때만)
                  if (locker.status === "A") {
                    $http.post("/v1/OpenToAdmin/" + locker.yid, locker, {
                      headers: {
                        "applebox-host":
                          "applebox-" + $stateParams.yid + ".apple-box.kr",
                      },
                    });
                  }
                } else if (key === "statusChange") {
                  // 보관함-상태변경
                  $scope.changeLockerStatus(locker);
                } else {
                  // 상세정보
                  $scope.editLocker(locker, key);
                }
              },
              items: {
                view: { name: "상세정보" },
                open: {
                  name: "보관함-문열기",
                  disabled: function (key, opt) {
                    const locker = $(opt.$trigger).data("locker");
                    return locker.status !== "A"; // A일 때만 활성
                  },
                },
                statusChange: {
                  name: "보관함-상태변경",
                  disabled: function (key, opt) {
                    const locker = $(opt.$trigger).data("locker");
                    return locker.status === "A"; // A일 때 비활성
                  },
                },
              },
            });
          });
        },
        function (err) {
          ERROR($state, err);
        }
      );

      // 전체 삭제
      $scope.onDeleteAll = function () {
        if (confirm("전체가 삭제됩니다. 삭제하시겠습니까?")) {
          $http.delete("/v1/AppleboxAllDelete/" + $stateParams.yid).then(
            function () {
              alert("성공적으로 삭제하였습니다.");
            },
            function (err) {
              alert(err);
            }
          );
        }
      };

      // 락커 편집 모달
      $scope.editLocker = function (item, action) {
        $modal.open({
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
        });
      };

      // 설치 파일 모달
      $scope.onInstallFile = function () {
        $modal.open({
          animation: true,
          templateUrl: "views/applebox/modal.install.file.html",
          controller: "InstallFileCtrl",
          resolve: {
            item: function () {
              return $stateParams;
            },
          },
        });
      };

      // 상태변경 함수
      $scope.changeLockerStatus = function (locker) {
        // 예시: prompt로 상태 선택
        const newStatus = prompt(
          "새 상태를 선택하세요:\nA:보관중, B:사용가능, C:사용불가, D:보관하는중, E:찾으려는중",
          locker.status
        );
        if (newStatus && ["A", "B", "C", "D", "E"].includes(newStatus)) {
          $http
            .post("/v1/ChangeLockerStatus/" + locker.yid, { status: newStatus })
            .then(
              function (res) {
                locker.status = newStatus; // 화면 갱신
                toastr.success("상태가 변경되었습니다.");
              },
              function (err) {
                toastr.error("상태 변경 실패");
              }
            );
        }
      };
    }
  )
  .controller(
    "InstallFileCtrl",
    function ($scope, $http, $modalInstance, item) {
      $scope.close = function () {
        $modalInstance.dismiss("cancel");
      };

      $http.get("/v1/AppleboxAll/" + item.yid).then(function (results) {
        $scope.item = results.data;
        angular.forEach($scope.item.cabinet, function (cabinet) {
          angular.forEach(cabinet.box, function (box) {
            // 불필요한 필드 제거
            delete box.yid;
            delete box.saveHp;
            delete box.saveName;
            delete box.saveDate;
            delete box.pwd;
            delete box.toHp;
            delete box.toName;
            delete box.usage;
            delete box.thingsSq;
            delete box.uuid;
          });
        });
      });
    }
  )
  .controller(
    "LockerCtrl",
    function ($scope, $http, $modalInstance, item, action, MyCache, Locker) {
      $scope.close = function () {
        $modalInstance.dismiss("cancel");
      };
      $scope.action = action;
      $scope.myCache = MyCache;
      $scope.myCache.loadGCode(["locker.status"]);
      $scope.item = item;

      $scope.trySave = function () {
        if (action === "save") {
          if ($scope.item.status !== "B") {
            toastr.error("사용 가능한 보관함만 보관할 수 있습니다.");
            return;
          }
          $http
            .post("/v1/OpenToSave/" + $scope.item.yid, $scope.item, {
              headers: {
                "applebox-host":
                  "applebox-" + $scope.item.yid + ".apple-box.kr",
              },
            })
            .then(function (rs) {
              if (rs.data.success) {
                toastr.success("보관 완료");
                $modalInstance.close($scope.item);
              }
            });
        } else if (action === "take") {
          if ($scope.item.status !== "A") {
            toastr.error("보관중인 물건만 수령할 수 있습니다.");
            return;
          }
          $http
            .post("/v1/OpenToTake/" + $scope.item.yid, $scope.item, {
              headers: {
                "applebox-host":
                  "applebox-" + $scope.item.yid + ".apple-box.kr",
              },
            })
            .then(function (rs) {
              if (rs.data.success) {
                toastr.success("수령 완료");
                $modalInstance.close($scope.item);
              }
            });
        } else if (action === "view") {
          Locker.update($scope.item, function () {
            toastr.success("성공적으로 수정하였습니다.");
            $modalInstance.close($scope.item);
          });
        }
      };
    }
  );
