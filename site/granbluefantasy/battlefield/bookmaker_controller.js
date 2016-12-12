var graphBookmakerApp = angular.module('graphBookmakerApp',['ui.bootstrap']);
graphBookmakerApp.controller('currentController',function($scope,$http){
	_this = hauteclaire;
	$scope.battilefieldSchedules = _this.battlefield.schedules;
	$scope.battilefieldAlgorithm = _this.battlefield.algorithm;
	$scope.battilefieldChart = _this.graph.type;
	
	$scope.init = function(){
		//
	};
	$scope.openGraph = function(){
		var path = $scope.selectedBattlefieldSchedule.bookmaker;
		var algorithm =  $scope.selectedBattlefieldAlgorithm;
		var chart = $scope.selectedBattlefieldChart;
		_this.graph.generate(path,chart,algorithm);
	};
});


