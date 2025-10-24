angular.module("inspinia").run(function ($timeout) {
  // AngularJS 환경에서 DOM Ready 후 실행
  $timeout(function () {
    $("body").scrollspy({ target: ".navbar-fixed-top", offset: 80 });
    $("a.page-scroll").on("click", function (event) {
      var link = $(this);
      $("html, body")
        .stop()
        .animate(
          {
            scrollTop: $($(link).attr("href")).offset().top - 70,
          },
          500
        );
      event.preventDefault();
    });
    new WOW().init();
  });
});
