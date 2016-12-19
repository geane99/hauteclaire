var battlefieldApp = angular.module('battlefieldApp',['ui.bootstrap']);
battlefieldApp.controller('currentController',function($scope,$http){
	_this = hauteclaire;
	$scope.battilefieldSchedules = _this.battlefield.schedules;
	$scope.battilefieldTypes = _this.battlefield.algorithm.types;
	$scope.battilefieldAlgorithm = [];
	$scope.battilefieldChart = _this.graph.type;
	$scope.init = function(){
		//
	};
	$scope.selectedAlgorith = function(){
		selected = $scope.selectedBattlefieldType;
		$scope.battilefieldAlgorithm = _this.battlefield.algorithm[selected.id];
	};
	
	$scope.openGraph = function(){
		selected = $scope.selectedBattlefieldType;
		var path = $scope.selectedBattlefieldSchedule[selected.id];
		var algorithm =  $scope.selectedBattlefieldAlgorithm;
		var chart = $scope.selectedBattlefieldChart;
		_this.graph.generate(path,chart,algorithm);
	};
});


