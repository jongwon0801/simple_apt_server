/**
 * INSPINIA - Responsive Admin Theme
 *
 */

/**
 * MainCtrl - controller
 */
function MainCtrl($ocLazyLoad) {
	/*$ocLazyLoad.load([ '/bower_components/toastr/toastr.min.css',
                      '/bower_components/toastr/toastr.min.js'
    ]);*/
    this.userName = 'Example user';
    this.helloText = 'Welcome in SeedProject';
    this.descriptionText = 'It is an application skeleton for a typical AngularJS web app. You can use it to quickly bootstrap your angular webapp projects and dev environment for these projects.';
    
   

};

angular
    .module('inspinia')
    .controller('MainCtrl', MainCtrl)