// Generated by CoffeeScript 1.7.1
'use strict';
angular.module('newBetaApp').factory('downloadUrl', function($routeParams, api) {
  return api.urlForStatsExportFileDownload($routeParams.teamId, null);
});
