(function () {
  angular
    .module("inspinia", [
      "ui.router", // Routing
      "oc.lazyLoad", // ocLazyLoad
      "ui.bootstrap", // Ui Bootstrap
      "ngCookies",
      "ngResource",
      "ngSanitize",
    ])
    .factory(
      "MyCache",
      function (
        $cacheFactory,
        $http,
        $q,
        $rootScope,
        $ocLazyLoad,
        $modal,
        $window
      ) {
        $rootScope.onMemberView = function (item) {
          var myWindow = $window.open(
            "/shared/user/index.html?memberSq=" + item.memberSq,
            item.memberSq,
            "width=800,height=600"
          );
        };
        function viewModal(jsUrl, templateUrl, size, ctrlName, item) {
          $ocLazyLoad.load([jsUrl]).then(function () {
            $modal
              .open({
                animation: true,
                templateUrl: templateUrl,
                size: size,
                scope: $rootScope,
                controller: ctrlName,
                resolve: {
                  item: function () {
                    return item;
                  },
                },
              })
              .result.then(
                function (item) {},
                function (err) {}
              );
          });
        }
        $rootScope.onOrderView = function (item) {
          //if(angular.isObject(item)){
          viewModal(
            "/shared/controller/modal.order.view.js",
            "/shared/views/modal.order.view.html",
            "lg",
            "ModalOrderViewCtrl",
            item
          );
        };
        $rootScope.onMxView = function (item) {
          //if(angular.isObject(item)){
          viewModal(
            "/shared/controller/modal.mx.view.js",
            "/shared/views/modal.mx.view.html",
            "lg",
            "ModalMxViewCtrl",
            item
          );
        };
        $rootScope.onTraceView = function (item) {
          //if(angular.isObject(item)){
          viewModal(
            "/shared/controller/modal.trace.view.js",
            "/shared/views/modal.trace.view.html",
            "lg",
            "ModalTraceViewCtrl",
            item
          );
        };
        $rootScope.onThingsView = function (item) {
          //if(angular.isObject(item)){
          viewModal(
            "/shared/controller/modal.things.view.js",
            "/shared/views/modal.things.view.html",
            "lg",
            "ModalThingsViewCtrl",
            item
          );
        };
        $rootScope.onShopView = function (item) {
          $ocLazyLoad
            .load(["/shared/controller/modal.shop.view.js"])
            .then(function () {
              $modal
                .open({
                  animation: true,
                  templateUrl: "/shared/views/modal.shop.view.html",
                  size: "lg",
                  scope: $rootScope,
                  controller: "ModalShopViewCtrl",
                  resolve: {
                    item: function () {
                      return item;
                    },
                  },
                })
                .result.then(
                  function (item) {},
                  function (err) {}
                );
            });
        };
        $rootScope.onAppleboxView = function (item) {
          $ocLazyLoad
            .load(["/shared/controller/modal.applebox.view.js"])
            .then(function () {
              $modal
                .open({
                  animation: true,
                  templateUrl: "/shared/views/modal.applebox.view.html",
                  size: "lg",
                  scope: $rootScope,
                  controller: "ModalAppleboxViewCtrl",
                  resolve: {
                    item: function () {
                      return item;
                    },
                  },
                })
                .result.then(
                  function (item) {},
                  function (err) {}
                );
            });
        };
        $rootScope.onProductView = function (item) {
          $ocLazyLoad
            .load(["/shared/controller/modal.product.view.js"])
            .then(function () {
              $modal
                .open({
                  animation: true,
                  templateUrl: "/shared/views/modal.product.view.html",
                  size: "lg",
                  scope: $rootScope,
                  controller: "ModalProductViewCtrl",
                  resolve: {
                    item: function () {
                      return item;
                    },
                  },
                })
                .result.then(
                  function (item) {},
                  function (err) {}
                );
            });
        };

        var factory = {};
        factory.pcode = ["pcode"];
        for (var i = 0; i < 9; i++) {
          factory.pcode.push("pcode.0" + i);
        }
        factory.cache = $cacheFactory("someCache", {
          //capacity: 100 // optional - turns the cache into LRU cache
        });
        factory.get = function (gCode) {
          return factory.cache.get(gCode);
        };
        factory.getSmsStatus = function (sms) {
          if (sms.STATUS == 1) {
            //발송중
            if (sms.CALL_STATUS == 9) {
              return "발송중";
            } else {
              return "발송(" + sms.CALL_STATUS + ")";
            }
          } else if (sms.STATUS == 2) {
            //발송 결과
            if (sms.CALL_STATUS == 4100) {
              return "성공";
            } else {
              return "실패(" + sms.CALL_STATUS + ")";
            }
          } else {
            return "대기중";
          }
        };
        factory.getValue = function (gCode, key) {
          var codeList = factory.cache.get(gCode);
          for (var idx in codeList) {
            if (codeList[idx].key == key) {
              return codeList[idx].name;
            }
          }
          return key;
        };
        factory.patch = function (dataList, codes) {
          if (!dataList.length) dataList = [dataList];
          for (var idx in dataList) {
            var item = dataList[idx];
            for (var cidx in codes) {
              var gCode = codes[cidx];
              var fieldName = gCode.split(".")[1];
              var codeList = factory.cache.get(gCode);
              for (var code in codeList) {
                if (item[fieldName] === codeList[code].key) {
                  item[fieldName + "Desc"] = codeList[code].name;
                  break;
                }
              }
            }
          }
        };
        factory.loadGCode = function (codes) {
          //console.log(codes);
          var deferred = $q.defer();
          var pArray = [];

          for (var cv in codes) {
            var codeList = factory.cache.get(codes[cv]);
            if (codeList == null) pArray.push(codes[cv]);
          }

          if (pArray.length == 0) {
            deferred.resolve(codes);
          } else {
            $http
              .get("/v1/CodeTbl", {
                params: { gCode: pArray },
              })
              .then(
                function (res) {
                  var datas = res.data;

                  $.each(datas, function (key, value) {
                    factory.cache.put(key, value);
                  });
                  deferred.resolve(codes);
                  // Request completed successfully
                },
                function (x) {
                  deferred.reject(x);
                  // Request error
                }
              );
          }

          return deferred.promise;
        };

        return factory;
      }
    )
    .factory("CodeTbl", function ($resource) {
      return $resource(
        "/admin/CodeTbl/:gCode",
        { gCode: "@gCode" },
        {
          query: { method: "GET", cache: false, isArray: false },
        }
      );
    })
    .filter("tel", function () {
      return function (tel) {
        if (!tel) {
          return "";
        }

        var value = tel.toString().trim().replace(/^\+/, "");

        if (value.match(/[^0-9]/)) {
          return tel;
        }

        var country, city, number;

        switch (value.length) {
          case 10: // +1PPP####### -> C (PPP) ###-####
            country = 1;
            city = value.slice(0, 3);
            number = value.slice(3);
            break;

          case 11: // +CPPP####### -> CCC (PP) ###-####
            /*country = value[0];
					city = value.slice(1, 4);
					number = value.slice(4);*/
            country = value.slice(0, 3);
            city = value.slice(3, 7);
            number = value.slice(7);
            break;

          case 12: // +CCCPP####### -> CCC (PP) ###-####
            country = value.slice(0, 4);
            city = value.slice(4, 8);

            number = value.slice(8);
            break;

          default:
            return tel;
        }

        if (country == 1) {
          country = "";
        }

        return country + "-" + city + "-" + number;
        //number = number.slice(0, 3) + '-' + number.slice(3);

        //return (country + " (" + city + ") " + number).trim();
      };
    })
    .directive("phoneInput", function () {
      return {
        restrict: "A",
        link: function (scope, element, attrs) {
          function checkForErrors(input) {
            var errors = "";
            if (!new RegExp(input.attr("pattern")).test(input.val())) {
              errors += `Field must contain ${input.attr(
                "maxlength"
              )} numbers!\n`;
            }
            return errors;
          }
          element.on("input", "input", function () {
            var trigger = $(this);
            if (trigger.val().length >= trigger.attr("maxlength")) {
              trigger.blur().next().focus();
            }
          });

          element.on("blur", "input", function () {
            var trigger = $(this);
            var errors = checkForErrors(trigger);
            trigger.attr("title", errors);
            if (trigger.val().trim() === "") {
              trigger.addClass("invalid-field");
              trigger.attr("title", "Field cannot be empty!");
            } else if (errors === "") {
              trigger.removeClass("invalid-field");
            } else {
              trigger.addClass("invalid-field");
              trigger.focus();
            }
          });
        },
      };
    });
})();
