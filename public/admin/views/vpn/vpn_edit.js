"use strict";

angular
  .module("inspinia")
  .controller("VpnEditCtrl", function ($scope, $http, $stateParams, $state) {
    $scope.vpn = {
      ip: "",
      location: "",
      publicKey: "",
      privateKey: "",
      address: "",
      status: "inactive"
    };

    $scope.isEdit = !!$stateParams.ip;

    // -----------------------------
    // 기존 VPN 서버 로드 (수정용)
    // -----------------------------
    if ($scope.isEdit) {
      $http
        .get(`/api/vpn/vpnCrud/${$stateParams.ip}`)
        .then((res) => {
          $scope.vpn = res.data;
        })
        .catch((err) => {
          console.error("VPN 서버 로드 오류:", err);
          toastr.error("VPN 단일 데이터 로드 실패");
        });
    }

    // -----------------------------
    // 저장 (등록/수정)
    // -----------------------------
    $scope.saveVpn = function () {
      if (!$scope.vpn.ip) {
        toastr.warning("IP 주소를 입력하세요.");
        return;
      }

      const request = $scope.isEdit
        ? $http.put(`/api/vpn/vpnCrud/${$scope.vpn.ip}`, $scope.vpn)
        : $http.post("/api/vpn/vpnCrud", $scope.vpn);

      request
        .then(() => {
          toastr.success($scope.isEdit ? "VPN 수정 완료" : "VPN 등록 완료");
          $state.go("vpn.vpn_list");
        })
        .catch((err) => {
          console.error("VPN 저장 오류:", err);
          toastr.error("VPN 단일 저장 실패");
        });
    };
  });
