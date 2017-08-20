angular.module('jmt-ui').controller('dashboardCtrl', function ($rootScope, $scope, $http, $interval) {
  var apiHost = 'http://localhost:3000/';
  var poolingInterval = 1000;

  var memoirs = {
    heap: {
        metrics: [],
        max: [] // it needs to be in a differente array for compatibility with graph component
    }
  }

  var crawler = function(kubernetes){
    $scope.kubernetes = {
        project: 'myproject',
        podname: 'fis-rest-1-8xp34'
    };
      
    $http({
        method: 'GET',
        url: apiHost+$scope.kubernetes.project+'/'+$scope.kubernetes.podname,
    }).then(function successCallback(response) {
        console.log('data collected');
        var memory = response.data;

        totalGraph(memory);
        heapGraph(memory);
    }, function errorCallback(response) {
        console.log(response);
    });
  };

    $scope.collect = function (){
        $interval(function() {
            var memory = crawler($scope.kubernetes);
        }, poolingInterval);  // 1 seconds
    };

    var totalGraph = function(memory){
        $scope.totalMetrics = {
            "title": "Total Memory",
            "subtitle": "in MB",
            "ranges": [0,memory.total.max],
            "measures": [memory.total.inuse]
        }
    }

    var heapGraph = function (memory){
        var dt = new Date();
        memoirs.heap.metrics.push({y: memory.heap.inuse, x: dt});
        memoirs.heap.max.push({y: memory.heap.max, x:dt});
        $scope.heapMetrics = heapData();
    }

    var heapData = function(){
        return [
            {
                values: memoirs.heap.metrics, //values - represents the array of {x,y} data points
                key: 'In use', //key  - the name of the series.
                color: '#0000FF',  //color - optional: choose your own line color.
                area: true
            },
            {
                values: memoirs.heap.max,
                key: 'Memory available',
                color: '#2ca02c',
                area: true
            }
        ];
    };

    $scope.totalOptions = {
        chart: {
            "type": "bulletChart"
        }
    };

    $scope.heapOptions = {
        chart: {
            type: 'lineChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 40,
                left: 55
            },
            lines: {
                forceY: 0
            },
            x: function(d){ return d.x; },
            y: function(d){ return d.y; },
            useInteractiveGuideline: true,
            dispatch: {
                stateChange: function(e){ console.log("stateChange"); },
                changeState: function(e){ console.log("changeState"); },
                tooltipShow: function(e){ console.log("tooltipShow"); },
                tooltipHide: function(e){ console.log("tooltipHide"); }
            },
            xAxis: {
                axisLabel: 'Time (minute)',
                tickFormat: function(d) {
                    return d3.time.format('%H:%m:%S')(new Date(d))
                },
            },
            yAxis: {
                axisLabel: 'Memory (MB)',
                axisLabelDistance: -10
            },
            callback: function(chart){
                console.log("!!! lineChart callback !!!");
            }
        }
    };
  
});