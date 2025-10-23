angular
  .module("inspinia") // 기존 앱 모듈에 통합
  .controller(
    "AppleboxStatusCtrl",
    function ($scope, $stateParams, $state, Locker, $q) {
      $scope.maxSize = 5;
      $scope.display = 10;

      // yid 받아오기
      $scope.sform = {
        page: $stateParams.page || 1,
        status: $stateParams.status || "",
        display: $scope.display,
        yid: $stateParams.yid || null, // 반드시 yid 포함
      };

      // 페이지 변경
      $scope.pageChanged = function (p) {
        $scope.sform.page = p;
        $state.go("applebox.status", $scope.sform);
      };

      // 초기 데이터 조회
      $scope.doSearch = function () {
        if (!$scope.sform.yid) return; // yid 없으면 조회 안 함

        Locker.query($scope.sform)
          .$promise.then(function (res) {
            $scope.totalItems = res.recordsTotal;
            $scope.list = res.data;
            $scope.currentPage = $scope.sform.page;

            // -----------------------------
            // 상태 라벨 매핑 (DB에서 가져온 상태 사용)
            // -----------------------------
            $scope.list.forEach((item) => {
              // status 컬럼 그대로 사용하거나
              // 서버에서 상태 라벨 포함해서 내려주면 바로 사용 가능
              item.statusLabel = item.status;
            });
          })
          .catch(function (err) {
            console.error(err);
          });
      };

      $scope.doSearch();
    }
  );
