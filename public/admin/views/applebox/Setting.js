'use strict';

angular.module('inspinia',
    [{ files: [
        // 필요한 JS/CSS 파일만 추가 가능
    ], cache: true, serie: true }]
)
.controller('AppleboxSettingCtrl', function($rootScope, $scope, $http, $location, $filter, $q, Locker, $stateParams, $state, $modal) {

    $scope.maxSize = 5;
    $scope.display = 10;

    // 초기 검색 폼 설정
    $scope.sform = $location.search();
    $scope.sform.page = $scope.sform.page || 1;
    $scope.sform.status = $scope.sform.status || '';
    $scope.sform.display = $scope.display;

    // 페이지 변경 시
    $scope.pageChanged = function(p) {
        $scope.sform.page = p;
        $state.go('applebox.setting', $scope.sform);
    };

    // 데이터 조회
    $scope.doSearch = function() {
        Locker.query($scope.sform).$promise
            .then(function(res) {
                $scope.list = res.data || [];
                $scope.totalItems = res.recordsTotal || 0;
                $scope.currentPage = $scope.sform.page;
            })
            .catch(function(err) {
                ERROR($state, err);
            });
    };

    // 검색 버튼 클릭 시
    $scope.formSubmit = function() {
        $scope.sform.page = '';
        $state.go('applebox.setting', $scope.sform);
    };

    // 페이지 로드 시 바로 검색
    $scope.doSearch();

    // 락커 편집 모달 열기
    $scope.editLocker = function(item) {
        $modal.open({
            animation: true,
            templateUrl: "views/applebox/modal.locker.html",
            controller: 'LockerCtrl',
            resolve: {
                item: function() { return item; },
                yid: function() { return $stateParams.yid; }
            }
        }).result.then(function(selectedItem) {
            $scope.doSearch();
        }, function(err) {
            // 모달 닫기 시 별도 처리 없음
        });
    };

})
.controller('LockerCtrl', function($scope, $modalInstance, $resource, item, yid, Locker) {

    $scope.item = angular.copy(item) || {}; // 새로운 항목이면 빈 객체 생성

    // 모달 닫기
    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };

    // 저장/수정
    $scope.trySave = function() {
        if ($scope.item.yid) {
            // 기존 항목 수정
            Locker.update($scope.item, function(res) {
                toastr.success('성공적으로 수정하였습니다!');
                $modalInstance.close($scope.item);
            }, function(err) {
                toastr.error('수정 중 오류가 발생했습니다.');
            });
        } else {
            // 신규 항목 추가
            $scope.item.yid = yid;
            Locker.save($scope.item, function(res) {
                toastr.success('성공적으로 입력하였습니다!');
                $modalInstance.close($scope.item);
            }, function(err) {
                toastr.error('저장 중 오류가 발생했습니다.');
            });
        }
    };

});
