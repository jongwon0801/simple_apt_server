angular
  .module("inspinia")
  .controller("AppleboxEditCtrl", function ($scope, $http, $location, $stateParams) {
    $scope.isEdit = !!$stateParams.yid;

    // 1️⃣ item 초기화
    $scope.item = {
      yid: null,
      location: "",
      addr: "",
      ip: "",
      hp: "",
      boardCnt: 0,
      installDate: ""
    };

    // 2️⃣ 수정 모드: 기존 데이터 로드
    if ($scope.isEdit) {
      $http
        .get("/api/applebox/appleboxCrud/" + $stateParams.yid)
        .then((res) => {
          if (res.data) $scope.item = res.data;
        })
        .catch((err) => {
          toastr.error("데이터 로드 실패: " + (err.data?.message || "알 수 없는 오류"));
        });
    }

    // 3️⃣ 제출 (등록 / 수정)
    $scope.formSubmit = function () {
      const payload = angular.copy($scope.item);

      if ($scope.isEdit) {
        // 수정
        $http
          .put("/api/applebox/appleboxCrud/" + payload.yid, payload)
          .then(() => {
            toastr.success("수정 완료");
            $location.path("/applebox/list");
          })
          .catch((err) => {
            toastr.error("수정 실패: " + (err.data?.message || "알 수 없는 오류"));
          });
      } else {
        // 등록
        $http
          .post("/api/applebox/appleboxCrud/", payload)
          .then(() => {
            toastr.success("등록 완료");
            $location.path("/applebox/list");
          })
          .catch((err) => {
            toastr.error("등록 실패: " + (err.data?.message || "알 수 없는 오류"));
          });
      }
    };
  });
