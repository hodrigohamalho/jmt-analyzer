angular.module('jmt-ui').controller('dashboardCtrl', function ($rootScope, $scope, $http, $interval) {
  var apiHost = 'http://localhost:3000/';
  var poolingInterval = 1000;

  var heap = {
      inuse: [],
      max: []
  };

  var crawler = function(kubernetes){
    var kubernetes = {
        project: 'myproject',
        podname: 'fis-rest-1-8xp34'
    };

      
    $http({
        method: 'GET',
        url: apiHost+kubernetes.project+'/'+kubernetes.podname,
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
            "ranges": [0,memory['total']['max']],
            "measures": [memory['total']['inuse']]
        }
    }

    var heapGraph = function (memory){
        heap['inuse'].push({ y: memory['heap']['inuse'], x: heap['inuse'].length });
        heap['max'].push({ y: memory['heap']['max'], x: heap['max'].length });

        $scope.heapMetrics = heapData();
    }

    var heapData = function(){
        return [
            {
                values: heap['inuse'],      //values - represents the array of {x,y} data points
                key: 'In use', //key  - the name of the series.
                color: '#ff7f0e'  //color - optional: choose your own line color.
            },
            {
                values: heap['max'],
                key: 'Memory available',
                color: '#2ca02c'
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
                axisLabel: 'Time (minute)'
            },
            yAxis: {
                axisLabel: 'Memory (MB)',
                axisLabelDistance: -10
            },
            callback: function(chart){
                console.log("!!! lineChart callback !!!");
            }
        },
        title: {
            enable: true,
            text: 'Memory Heap'
        }
    };
  
});