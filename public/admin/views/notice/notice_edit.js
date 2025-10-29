"use strict";

angular
  .module("inspinia")
  .controller("NoticeEditCtrl", function ($scope, $http, $stateParams, $state) {
    $scope.notice = {
      title: "",
      content: ""
    };

    $scope.isEdit = !!$stateParams.noticeSq;

    // -----------------------------
    // 기존 공지 로드 (수정용)
    // -----------------------------
    if ($scope.isEdit) {
      $http
        .get(`/api/notice/noticeCrud/${$stateParams.noticeSq}`)
        .then((res) => {
          $scope.notice = res.data;
        })
        .catch((err) => {
          console.error("공지 로드 오류:", err);
          toastr.error("공지사항 데이터 로드 실패");
        });
    }

    // -----------------------------
    // 저장 (등록/수정)
    // -----------------------------
    $scope.saveNotice = function () {
      if (!$scope.notice.title || !$scope.notice.content) {
        toastr.warning("제목과 내용을 입력하세요.");
        return;
      }

      const request = $scope.isEdit
        ? $http.put(`/api/notice/noticeCrud/${$stateParams.noticeSq}`, $scope.notice)
        : $http.post("/api/notice/noticeCrud", $scope.notice);

      request
        .then(() => {
          toastr.success($scope.isEdit ? "공지 수정 완료" : "공지 등록 완료");
          $state.go("notice.notice_list");
        })
        .catch((err) => {
          console.error("저장 오류:", err);
          toastr.error("저장 실패");
        });
    };
  });
