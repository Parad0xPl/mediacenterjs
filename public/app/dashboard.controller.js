angular
.module('dashboardApp')
.controller('dashboardCtrl', function($scope, $http) {
    $scope.apps = [];
    $http.get('/apps')
    .then(function(resp) {
        $scope.apps = resp.data;
    });
    $http.get('/checkForUpdate')
    .then(function(resp){
        $scope.newVersion = resp.data.version;
    });

    $scope.doUpdate = function () {
        $scope.updating = true;
        $http.get('/doUpdate')
        .then(function (resp) {
            $scope.updating = false;
            if(resp.data === "restarting") {
                setTimeout(function () {
                    window.location = "/";
                }, 20000);
            }
        });
    };

});
