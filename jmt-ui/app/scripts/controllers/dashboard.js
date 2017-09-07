angular.module('jmt-ui').controller('dashboardCtrl', function ($rootScope, $scope, $http, $interval) {
  var apiHost = 'http://localhost:3000/metrics/';
  var poolingInterval = 1000;

  var memoirs = {
    heap: {
        metrics: [],
        max: [] // it needs to be in a differente array for compatibility with graph component
    },
    class: {
        metrics: [],
        max: [] 
    },
    code: {
        metrics: [],
        max: [] 
    },
    thread: {
        metrics: [],
        max: [] 
    }
  }

    $scope.showPanel = false;
    $scope.showKubernetes = false;
    

    var crawler = function(){
        $scope.kubernetes = {
            project: 'myproject',
            podname: 'fis-rest-1-8xp34'
        };

        var getUrl = '';
        if ($scope.native.process){
            getUrl = apiHost+$scope.native.process;
        }else{
            getUrl = apiHost+$scope.kubernetes.project+'/'+$scope.kubernetes.podname;
        }
            
        $http({
            method: 'GET',
            url: getUrl,
        }).then(function successCallback(response) {
            var memory = response.data;

            totalGraph(memory);
            graph(memory, 'heap');
            graph(memory, 'class');
            graph(memory, 'code');
            graph(memory, 'thread');
            
            $scope.heapMetrics = data('heap');
            $scope.classMetrics = data('class');
            $scope.codeMetrics = data('code');
            $scope.threadMetrics = data('thread');
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

    var graph = function (memory, type){
        var dt = new Date();
        memoirs[type].metrics.push({y: memory[type].inuse, x: dt});
        memoirs[type].max.push({y: memory[type].max, x:dt});
    }

    var data = function(type){
        return [
            {
                values: memoirs[type].metrics, //values - represents the array of {x,y} data points
                key: 'In use', //key  - the name of the series.
                color: '#0000FF',  //color - optional: choose your own line color.
                area: true
            },
            {
                values: memoirs[type].max,
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

    $scope.options = {
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
                // console.log("!!! lineChart callback !!!");
            }
        }
    };
  
});