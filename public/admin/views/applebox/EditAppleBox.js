angular
  .module("inspinia")
  .controller(
    "AppleboxEditCtrl",
    function ($scope, $http, $location, $stateParams) {
      $scope.isEdit = !!$stateParams.yid;
      $scope.item = {}; // Applebox 단말기 정보

      // 데이터 로드 (수정 시)
      if ($scope.isEdit) {
        $http
          .get("/api/applebox/appleboxCrud/:yid" + $stateParams.yid)
          .then((res) => {
            $scope.item = res.data.applebox || {};
          });
      }

      // 제출
      $scope.formSubmit = function () {
        const payload = { applebox: $scope.item };

        if ($scope.isEdit) {
          $http
            .put("/api/applebox/appleboxCrud/:yid" + $scope.item.yid, payload)
            .then(
              () => {
                toastr.success("수정 완료");
                $location.path("/applebox/list");
              },
              (err) =>
                toastr.error(
                  "수정 실패: " + (err.data?.message || "알 수 없는 오류")
                )
            );
        } else {
          $http.post("/api/applebox/appleboxCrud/", payload).then(
            () => {
              toastr.success("등록 완료");
              $location.path("/applebox/list");
            },
            (err) =>
              toastr.error(
                "등록 실패: " + (err.data?.message || "알 수 없는 오류")
              )
          );
        }
      };
    }
  );
