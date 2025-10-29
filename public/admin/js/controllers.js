/**
 * MainCtrl - 앱 전역 컨트롤러
 */
function MainCtrl($ocLazyLoad, $rootScope, $location) {
  var main = this;

  // 로그인 사용자 정보
  main.currentUser = $rootScope.globals?.currentUser || null;

  // 로그아웃
  main.logout = function () {
    $rootScope.globals = {};
    main.currentUser = null;
    $location.path("/login"); // 로그인 페이지 이동
  };

  // 로그인 페이지 제외, 공통 헤더/사이드바 표시 여부
  main.showHeader = function () {
    return $location.path() !== "/login";
  };

  // body 클래스 토글 (Sidebar 여백 적용)
  $rootScope.$on("$locationChangeSuccess", function () {
    if (main.showHeader()) {
      angular.element(document.body).addClass("has-sidebar");
    } else {
      angular.element(document.body).removeClass("has-sidebar");
    }
  });
}

// Angular 모듈에 등록
angular.module("inspinia").controller("MainCtrl", MainCtrl);
