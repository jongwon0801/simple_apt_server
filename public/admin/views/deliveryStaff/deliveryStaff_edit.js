"use strict";

angular
  .module("inspinia")
  .controller(
    "DeliveryStaffEditCtrl",
    function ($scope, $http, $stateParams, $state) {
      $scope.staff = {
        hp: "",
      };

      $scope.isEdit = !!$stateParams.staffSq;

      // -----------------------------
      // 기존 택배기사 로드 (수정용)
      // -----------------------------
      if ($scope.isEdit) {
        $http
          .get(`/api/deliveryStaff/deliveryStaffCrud/${$stateParams.staffSq}`)
          .then((res) => {
            $scope.staff = res.data;
          })
          .catch((err) => {
            console.error("택배기사 로드 오류:", err);
            toastr.error("택배기사 데이터 로드 실패");
          });
      }

      // -----------------------------
      // 저장 (등록/수정)
      // -----------------------------
      $scope.saveStaff = function () {
        if (!$scope.staff.hp) {
          toastr.warning("휴대폰 번호를 입력하세요.");
          return;
        }

        const request = $scope.isEdit
          ? $http.put(
              `/api/deliveryStaff/deliveryStaffCrud/${$stateParams.staffSq}`,
              $scope.staff
            )
          : $http.post("/api/deliveryStaff/deliveryStaffCrud", $scope.staff);

        request
          .then(() => {
            toastr.success(
              $scope.isEdit ? "택배기사 수정 완료" : "택배기사 등록 완료"
            );
            $state.go("deliveryStaff.deliveryStaff_list");
          })
          .catch((err) => {
            console.error("저장 오류:", err);
            if (err.data?.message) {
              toastr.error(err.data.message);
            } else {
              toastr.error("저장 실패");
            }
          });
      };
    }
  );
