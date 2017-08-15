'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('jmt-ui', [
  'ngResource',
  'ngRoute',
  'ngSanitize'
]);

app.config(function($routeProvider) {
  $routeProvider
  .when('/', {
    redirectTo: '/dashboard'
  })
  .when('/dashboard', {
    templateUrl: 'views/dashboard.html',
    controller: 'DashboardCtrl'
  })
  .otherwise({
      redirectTo: '/dashboard'
  });
});
