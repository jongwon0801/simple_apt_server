"use strict";

// 기존 inspinia 모듈 가져오기
var inspinia = angular.module("inspinia");

// -------------------------
// UI-Router & LazyLoad 설정
// -------------------------
inspinia
  .config(function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/login");

    // Lazy Load 기본 설정 (modules 배열 제거)
    $ocLazyLoadProvider.config({
      debug: false,
    });

    // -------------------------
    // 로그인 화면
    // -------------------------
    $stateProvider.state("login", {
      url: "/login",
      controller: "LoginCtrl",
      templateUrl: "/admin/views/login.html",
    });

    // -------------------------
    // Applebox (보관함)
    // -------------------------
    $stateProvider.state("applebox", {
      abstract: true,
      url: "/applebox",
      template: "<div ui-view></div>",
    });

    // 대쉬보드
    $stateProvider.state("applebox.dashboard", {
      url: "/dashboard",
      templateUrl: "/admin/views/applebox/DashBoard.html",
      controller: "DashBoardCtrl",
      authenticate: true,
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/applebox/DashBoard.js");
          },
        ],
      },
    });

    // 목록
    $stateProvider.state("applebox.list", {
      url: "/list",
      templateUrl: "/admin/views/applebox/List.html",
      controller: "AppleboxListCtrl",
      authenticate: true,
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/applebox/List.js");
          },
        ],
      },
    });

    // 상세
    $stateProvider.state("applebox.detail", {
      url: "/detail/:yid?",
      templateUrl: "/admin/views/applebox/Detail.html",
      controller: "LockerDetailCtrl",
      authenticate: true,
      resolve: {
        loadCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/applebox/Detail.js");
          },
        ],
      },
    });

    // 등록 / 수정
    $stateProvider.state("applebox.edit", {
      url: "/edit/:yid?",
      templateUrl: "/admin/views/applebox/EditAppleBox.html",
      controller: "AppleboxEditCtrl",
      authenticate: true,
      resolve: {
        loadCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/applebox/EditAppleBox.js");
          },
        ],
      },
    });

    // 상태
    $stateProvider.state("applebox.status", {
      url: "/status/:yid",
      templateUrl: "/admin/views/applebox/Status.html",
      controller: "LockerStatusCtrl",
      authenticate: true,
      resolve: {
        loadCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/applebox/Status.js");
          },
        ],
      },
    });

    // 설정
    $stateProvider.state("applebox.setting", {
      url: "/setting/:yid",
      templateUrl: "/admin/views/applebox/setting.html",
      controller: "AppleboxSettingCtrl",
      authenticate: true,
      resolve: {
        loadCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/applebox/setting.js");
          },
        ],
      },
    });

    // 현황
    $stateProvider.state("applebox.view", {
      url: "/view/:yid",
      templateUrl: "/admin/views/applebox/view.html",
      controller: "AppleboxViewCtrl",
      authenticate: true,
      resolve: {
        loadCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/applebox/view.js");
          },
        ],
      },
    });

    // 보관 로그
    $stateProvider.state("applebox.saveloglist", {
      url: "/saveloglist",
      templateUrl: "/admin/views/applebox/SaveLogList.html",
      controller: "SaveLogCtrl",
      authenticate: true,
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/applebox/SaveLogList.js");
          },
        ],
      },
    });

    // 수령 로그
    $stateProvider.state("applebox.takeloglist", {
      url: "/takeloglist",
      templateUrl: "/admin/views/applebox/TakeLogList.html",
      controller: "TakeLogCtrl",
      authenticate: true,
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/applebox/TakeLogList.js");
          },
        ],
      },
    });

    // -------------------------
    // 택배기사
    // -------------------------
    $stateProvider.state("deliveryStaff", {
      abstract: true,
      url: "/deliveryStaff",
      template: "<div ui-view></div>",
    });

    // 택배기사 리스트
    $stateProvider.state("deliveryStaff.deliveryStaff_list", {
      url: "/deliveryStaff_list",
      templateUrl: "/admin/views/deliveryStaff/deliveryStaff_list.html",
      controller: "DeliveryStaffListCtrl",
      authenticate: true,
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load(
              "/admin/views/deliveryStaff/deliveryStaff_list.js"
            );
          },
        ],
      },
    });

    // 택배기사 수정
    $stateProvider.state("deliveryStaff.deliveryStaff_edit", {
      url: "/deliveryStaff_edit/:staffSq?",
      templateUrl: "/admin/views/deliveryStaff/deliveryStaff_edit.html",
      controller: "DeliveryStaffEditCtrl",
      authenticate: true,
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load(
              "/admin/views/deliveryStaff/deliveryStaff_edit.js"
            );
          },
        ],
      },
    });

    // -------------------------
    // 공지사항
    // -------------------------
    $stateProvider.state("notice", {
      abstract: true,
      url: "/notice",
      template: "<div ui-view></div>",
    });

    // 공지 리스트
    $stateProvider.state("notice.notice_list", {
      url: "/notice_list",
      templateUrl: "/admin/views/notice/notice_list.html",
      controller: "NoticeListCtrl",
      authenticate: true,
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/notice/notice_list.js");
          },
        ],
      },
    });

    // 공지 수정
    $stateProvider.state("notice.notice_edit", {
      url: "/notice_edit/:noticeSq?",
      templateUrl: "/admin/views/notice/notice_edit.html",
      controller: "NoticeEditCtrl",
      authenticate: true,
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/notice/notice_edit.js");
          },
        ],
      },
    });

    // -------------------------
    // VPN
    // -------------------------
    $stateProvider.state("vpn", {
      abstract: true,
      url: "/vpn",
      template: "<div ui-view></div>",
    });

    // VPN 리스트
    $stateProvider.state("vpn.vpn_list", {
      url: "/vpn_list",
      templateUrl: "/admin/views/vpn/vpn_list.html",
      controller: "VpnListCtrl",
      authenticate: true,
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/vpn/vpn_list.js");
          },
        ],
      },
    });

    // VPN 수정
    $stateProvider.state("vpn.vpn_edit", {
      url: "/vpn_edit/:ip?", // ? 붙이면 선택적 ip 라우트 파라미터
      templateUrl: "/admin/views/vpn/vpn_edit.html",
      controller: "VpnEditCtrl",
      authenticate: true,
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load("/admin/views/vpn/vpn_edit.js");
          },
        ],
      },
    });
  })

  // -------------------------
  // Angular 초기화
  // -------------------------
  .run(function ($rootScope, $state, $stateParams, $window, $http) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // localStorage에서 로그인 정보 로딩
    $rootScope.globals =
      angular.fromJson($window.localStorage.getItem("globals")) || {};

    // 로그인 정보가 있으면 Authorization 헤더 설정
    if ($rootScope.globals.currentUser) {
      $http.defaults.headers.common.Authorization =
        "Bearer " + $rootScope.globals.currentUser.authdata;
    }

    // 로그인 필요 페이지 접근 시 체크
    $rootScope.$on("$stateChangeStart", function (event, toState) {
      if (toState.authenticate && !$rootScope.globals.currentUser) {
        event.preventDefault();
        $state.go("login");
      }
    });

    // toastr 설정
    toastr.options = {
      closeButton: true,
      progressBar: true,
      preventDuplicates: true,
      positionClass: "toast-bottom-center",
      showDuration: "400",
      hideDuration: "1000",
      timeOut: "7000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
  });
