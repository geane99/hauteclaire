var battlefieldApp = angular.module('battlefieldApp',['ui.bootstrap']);
battlefieldApp.controller('currentController',function($scope,$http){
	_this = hauteclaire;
	$scope.battilefieldSchedules = _this.battlefield.schedules;
	$scope.battilefieldTypes = _this.battlefield.algorithm.types;
	$scope.battilefieldAlgorithm = [];
	$scope.init = function(){
		_this.util.removeAd();
	};
	$scope.visibleTableBookmaker = false;
	$scope.bookmakerAllScore = [];
	$scope.selectedAlgorith = function(){
		selected = $scope.selectedBattlefieldType;
		$scope.battilefieldAlgorithm = _this.battlefield.algorithm[selected.id];
	};
	
	$scope.openGraph = function(){
		selected = $scope.selectedBattlefieldType;
		var path = $scope.selectedBattlefieldSchedule[selected.id];
		$scope.algorithm =  $scope.selectedBattlefieldAlgorithm;
		$scope.chart = $scope.algorithm.graph;
		_this.graph.generate(path,$scope.chart,$scope.algorithm, function(calcData, data){
			$scope.graphBaseData = data;
			$scope.graphData = calcData;
			if($scope.algorithm.type == "bookmaker"){
				$scope.visibleTableBookmaker = true;
				$scope.$apply(function(){
					angular.copy($scope.algorithm.round(data), $scope.bookmakerAllScore);
				});
			}
			else if($scope.algorithm.type == "ranking"){
				$scope.$apply(function(){
					$scope.visibleTableBookmaker = false;
				});
			}
			else if($scope.algorithm.type == "qualifying"){
				$scope.$apply(function(){
					$scope.visibleTableBookmaker = false;
				});
			}
		});
	};
});


