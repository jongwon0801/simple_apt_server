function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
  $urlRouterProvider.otherwise("login");
  $ocLazyLoadProvider.config({
    debug: false,
    modules: [
      { name: "MessageConfigModule", files: ["views/message/config.js"] },
      { name: "AppleboxMessageModule", files: ["views/applebox/message.js"] },
      { name: "AppleboxListModule", files: ["views/applebox/list.js"] },
      { name: "SaveLogModule", files: ["views/applebox/saveloglist.js"] },
      { name: "TakeLogModule", files: ["views/applebox/takeloglist.js"] },

      { name: "AppleboxEditModule", files: ["views/applebox/edit.js"] },
      { name: "AppleboxDetailModule", files: ["views/applebox/detail.js"] },
      { name: "AppleboxViewModule", files: ["views/applebox/view.js"] },
      { name: "RaspiViewModule", files: ["views/applebox/raspiview.js"] },
      { name: "AppleboxSettingModule", files: ["views/applebox/setting.js"] },
      { name: "AppleboxStatusModule", files: ["views/applebox/status.js"] },
      { name: "AppleboxLogModule", files: ["views/applebox/log.js"] },
    ],
  });

  $stateProvider
    // goods 스테이트 부분 삭제 후 바로 다음 스테이트로 시작

    .state("member", {
      abstract: true,
      url: "/member",
      templateUrl: "views/common/content.html",
      controller: "MemberCtrl",
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load(["views/member/member.js"]);
          },
        ],
      },
    })

    .state("config", {
      abstract: true,
      url: "/config",
      templateUrl: "views/common/content.html",
    })

    .state("message", {
      abstract: true,
      url: "/message",
      templateUrl: "views/common/content.html",
      authenticate: true,
    })

    .state("message.config", {
      url: "/config",
      templateUrl: "views/message/config.html",
      authenticate: true,
    })

    .state("applebox", {
      abstract: true,
      url: "/applebox",
      templateUrl: "views/common/content.html",
      controller: "AppleboxCtrl",
      resolve: {
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load(["views/applebox/applebox.js"]);
          },
        ],
      },
    })
    .state("applebox.list", {
      url: "/list?page&startDate&endDate&companyName&status&buyerSq",
      templateUrl: "views/applebox/list.html",
    })

    .state("applebox.saveloglist", {
      url: "/saveloglist?page&startDate&endDate&companyName&status&buyerSq&yid&uuid&saveHp&toHp&usage",
      templateUrl: "views/applebox/saveloglist.html",
    })
    .state("applebox.takeloglist", {
      url: "/takeloglist?page&startDate&endDate&companyName&status&buyerSq&yid&uuid",
      templateUrl: "views/applebox/takeloglist.html",
    })
    .state("applebox.edit", {
      url: "/edit/:yid",
      templateUrl: "views/applebox/edit.html",
    })
    .state("applebox.detail", {
      url: "/detail/:buyerSq",
      templateUrl: "views/applebox/detail.html",
    })
    .state("applebox.view", {
      url: "/view/:yid",
      templateUrl: "views/applebox/view.html",
    })
    .state("applebox.raspiview", {
      url: "/raspiview/:yid",
      templateUrl: "views/applebox/raspiview.html",
    })
    .state("applebox.setting", {
      url: "/setting/:yid",
      templateUrl: "views/applebox/setting.html",
    })
    .state("applebox.status", {
      url: "/status/:yid",
      templateUrl: "views/applebox/status.html",
    })

    .state("applebox.message", {
      url: "/message",
      templateUrl: "views/applebox/message.html",
    })

    .state("login", {
      url: "/login",

      controller: "LoginCtrl", // This view will use AppCtrl loaded below in the resolve
      templateUrl: "views/login.html",
      //data: { pageTitle: 'Login', specialClass: 'gray-bg' },
      resolve: {
        // Any property in resolve should return a promise and is executed before the view is loaded
        loadMyCtrl: [
          "$ocLazyLoad",
          function ($ocLazyLoad) {
            return $ocLazyLoad.load(["views/login.js"]);
          },
        ],
      },
    })
    .state("logout", {
      url: "/logout",
      controller: function ($rootScope, $cookieStore, $http, $location) {
        $rootScope.globals = {};
        $cookieStore.remove("globals");
        $http.defaults.headers.common.Authorization = "Bearer";
        $location.path("/login");
      },
    });
}
angular
  .module("inspinia")
  .config(config)
  .run(function (
    $rootScope,
    $state,
    $stateParams,
    $cookieStore,
    $http,
    $location,
    $ocLazyLoad,
    $window
  ) {
    console.log(11);
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on(
      "$stateChangeStart",
      function (event, toState, toParams, fromState, fromParams) {
        if (toState.authenticate) {
          $rootScope.$on(
            "$locationChangeStart",
            function (event, next, current) {
              if (
                $location.path() !== "/login" &&
                !$rootScope.globals.currentUser
              ) {
                $location.path("/login");
              }
            }
          );
        }
      }
    );

    $rootScope.globals = angular.fromJson(
      $window.localStorage.getItem("globals")
    );
    if ($rootScope.globals && $rootScope.globals.currentUser) {
      $http.defaults.headers.common.Authorization =
        "Bearer " + $rootScope.globals.currentUser.authdata;
    }

    toastr.options = {
      closeButton: true,
      debug: false,
      progressBar: true,
      preventDuplicates: true,
      positionClass: "toast-bottom-center",
      onclick: null,
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
