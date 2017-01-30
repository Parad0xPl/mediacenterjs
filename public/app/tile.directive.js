angular
  .module('dashboardApp')
  .directive('tile', function () {
    return {
      templateUrl: "app/tile_template",
      scope:{
        item:"="
      },
      link: function (scope, el) {
        // el.addClass('tile')
        scope.size = scope.item.tileSize || scope.size;
        el.addClass(`col-md-${(scope.size * 3)%13}`);
        el.addClass(`col-sm-${(scope.size * 4)%13}`);
        el.addClass(`col-sm-${(scope.size * 6)%13}`);
        el.attr('style', scope.item.tileCSS);
      },
      controller: function ($scope) {
          $scope.openApp = function(event) {
              event.preventDefault();
              var target = $(event.currentTarget);
              target.parent().addClass('grow');
              setTimeout(function(){
                  window.location.href = target.attr('href');
              },200);
          };
      }
    };
  });
