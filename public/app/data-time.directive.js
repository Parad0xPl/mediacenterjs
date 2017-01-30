angular.module('dashboardApp').directive('dateTime', function($interval, dateFilter) {

    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            var format,
            timeoutId;

            function updateTime() {
                element.text(dateFilter(new Date(), format));
            }

            attrs.$observe('format', function(value) {
                format = value;
                updateTime();
            });

            element.on('$destroy', function() {
                $interval.cancel(timeoutId);
            });

            timeoutId = $interval(function() {
                updateTime();
            }, 1000);
        }
    };
});
