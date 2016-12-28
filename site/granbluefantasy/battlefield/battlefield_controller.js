angular.module('battlefieldApp',['ui.bootstrap'])
.directive('ngTimepicker', function(){
	return {
		restrict: 'EAC',
		priority:0,
		transclude:false,
		replace:false,
		template:'<input type="text" class="{{class}} timepicker" />',
		scope:{
			ngTimepicker:'=',
			onChange:'='
		},
		link:function postLink(scope,element,attrs,control){
			$(element).timepicker({
				showSeconds:false,
				showMeridian:false,
				modalBackdrop:false,
				minuteStep:20,
				showInputs :true,
				defaultTime:false
			});
		},
		controller:['$scope',function($scope){
		}]
	};
})
.directive('ngDatepicker', function(){
	return {
		restrict: 'EAC',
		priority:0,
		transclude:false,
		replace:false,
		template:'<input type="text" class="{{class}} datepicker" />',
		scope:{
			ngTimepicker:'=',
			onChange:'='
		},
		link:function postLink(scope,element,attrs,control){
			var sdate = scope.$parent[attrs.ngModel];
			var $target = $(element).datepicker({
			    format: "yyyy-mm-dd",
			    update: "2016-12-15",
				autoclose: true,
				todayHighlight: true,
				language: "ja"
			});
			if(sdate != null && sdate != ""){
				var d = _this.util.stringToDate(sdate);
				$target.datepicker("setDate", d);
			}
		},
		controller:['$scope',function($scope){
		}]
	};
})

.controller('currentController',function($scope,$http, $uibModal, $log){
	_this = hauteclaire;
	$scope.battilefieldSchedules = _this.schedules;
	$scope.battilefieldTypes = _this.algorithm.types;
	$scope.battilefieldAlgorithm = [];
	$scope.init = function(){
		_this.util.removeAd();
	};
	$scope.visibleBookmaker = false;
	$scope.visibleBookmakerArea = false;
	$scope.visibleRanking = false;
	$scope.visibleQualifying = false;
	$scope.visibleRankingSearch = false;
	
	$scope.bookmakerAllScore = [];
	$scope.bookmakerAreaScore = [];
	$scope.rankingAllScore = [];
	$scope.rankingSearchAllScore = [];
	$scope.qualifyingAllScore = [];
	
	$scope.selectedAlgorith = function(){
		selected = $scope.selectedBattlefieldType;
		$scope.battilefieldAlgorithm = _this.algorithm[selected.id];
	};
	
	$scope.openGraph = function(){
		selected = $scope.selectedBattlefieldType;
		var path = $scope.selectedBattlefieldSchedule[selected.id];
		$scope.algorithm =  $scope.selectedBattlefieldAlgorithm;
		$scope.chart = $scope.algorithm.graph;
		_this.graph.generate(path,$scope.chart,$scope.algorithm, function(data){
			$scope.data = data;
			if($scope.algorithm.type == "bookmaker"){
				$scope.$apply(function(){
					//set view mode
					$scope.visibleBookmaker = true;
					$scope.visibleBookmakerArea = false;
					$scope.visibleRanking = false;
					$scope.visibleQualifying = false;
					$scope.bookmakerGraphType = "total";
					angular.copy($scope.algorithm.select(data), $scope.bookmakerAllScore);
				});
			}
			else if($scope.algorithm.type == "ranking"){
				$scope.$apply(function(){
					//set view mode
					$scope.visibleBookmaker = false;
					$scope.visibleBookmakerArea = false;
					$scope.visibleRanking = true;
					$scope.visibleQualifying = false;
					angular.copy($scope.algorithm.select(data), $scope.rankingAllScore);
				});
			}
			else if($scope.algorithm.type == "qualifying"){
				$scope.$apply(function(){
					//set view mode
					$scope.visibleBookmaker = false;
					$scope.visibleBookmakerArea = false;
					$scope.visibleRanking = false;
					$scope.visibleQualifying = true;
					angular.copy($scope.algorithm.select(data), $scope.qualifyingAllScore);
				});
			}
			else if($scope.algorithm.type == "bookmaker_area"){
				$scope.$apply(function(){
					//set view mode
					$scope.visibleBookmaker = false;
					$scope.visibleBookmakerArea = true;
					$scope.visibleRanking = false;
					$scope.visibleQualifying = false;
					data.choise = function(round,index){
						var area = $scope.bookmakerAreaGraphType != null && $scope.bookmakerAreaGraphType == "accleration" ? $scope.algorithm.conf().area + "_acceleration" : $scope.algorithm.conf().area;
						var r = data["round"+round].score[index][area];
						return r;
					};
					angular.copy($scope.algorithm.select(data), $scope.bookmakerAllScore);
				});
			}
		});
	};
	
	$scope.configBookmaker = function(){
		var modal = $uibModal.open({
			animation:false,
			templateUrl:'configBookmaker.html',
			controller:'configBookmakerController',
			backdrop : 'static',
			size:'lg'
		});
		
		modal.result.then(function(conf){
			//ok
			if(conf.bookmakerStartDate == null || conf.bookmakerStartDate == "")
				conf.bookmakerStartDate = "07:00";
			if(conf.bookmakerEndDate == null || conf.bookmakerEndDate == "")
				conf.bookmakerStartDate = "00:00";
			_this.graph.bind(angular.copy($scope.data,{}),$scope.chart,$scope.algorithm,{"from":conf.bookmakerStartDate,"to":conf.bookmakerEndDate,"type":conf.bookmakerGraphType},function(d){
				$scope.bookmakerGraphType = conf.bookmakerGraphType;
				angular.copy($scope.algorithm.select(d), $scope.bookmakerAllScore);
			});
		},function(){
			//dismiss
		});
	};
	
	$scope.configBookmakerArea = function(){
		var modal = $uibModal.open({
			animation:false,
			templateUrl:'configBookmakerArea.html',
			controller:'configBookmakerAreaController',
			backdrop : 'static',
			size:'lg'
		});
		
		modal.result.then(function(conf){
			//ok
			if(conf.bookmakerAreaStartDate == null || conf.bookmakerAreaStartDate == "")
				conf.bookmakerAreaStartDate = "07:00";
			if(conf.bookmakerAreaEndDate == null || conf.bookmakerAreaEndDate == "")
				conf.bookmakerAreaStartDate = "00:00";
			$scope.bookmakerAreaGraphType = conf.bookmakerAreaGraphType;
			var d2 = angular.copy($scope.data,{});
			_this.graph.bind(d2,$scope.chart,$scope.algorithm,{"from":conf.bookmakerAreaStartDate,"to":conf.bookmakerAreaEndDate,"type":conf.bookmakerAreaGraphType},function(d){
				$scope.bookmakerGraphType = conf.bookmakerGraphType;
				angular.copy(d, $scope.bookmakerAllScore);
			});
		},function(){
			//dismiss
		});
	};
	
	$scope.configQualifying = function(){
		var modal = $uibModal.open({
			animation:false,
			templateUrl:'configQualifying.html',
			controller:'configQualifyingController',
			backdrop : 'static',
			size:'lg'
		});
		
		modal.result.then(function(conf){
			//ok
			if(conf.qualifyingStartDate == null || conf.qualifyingStartDate == "")
				conf.qualifyingStartDate = $scope.data.qualifying_start_date.split(" ")[0];
			if(conf.qualifyingStartDatetime == null || conf.qualifyingStartDatetime == "")
				conf.qualifyingStartDatetime = $scope.data.qualifying_start_date.split(" ")[1];
			
			if((conf.qualifyingEndDate == null || conf.qualifyingEndDate == "") && (conf.qualifyingEndDatetime == null || conf.qualifyingEndDatetime == "")){
				conf.qualifyingEndDate = _this.util.nextDateByStringDate($scope.data.qualifying_end_date.split(" ")[0]);
				conf.qualifyingEndDatetime = "00:00";
			}
			
			if(conf.qualifyingEndDate == null || conf.qualifyingEndDate == "")
				conf.qualifyingEndDate = $scope.data.qualifying_end_date.split(" ")[0];
			if(conf.qualifyingEndDatetime == null || conf.qualifyingEndDatetime == "")
				conf.qualifyingEndDatetime = $scope.data.qualifying_end_date.split(" ")[1];
			
			var d2 = angular.copy($scope.data,{});
			_this.graph.bind(d2,$scope.chart,$scope.algorithm,{"fromDate":conf.qualifyingStartDate,"toDate":conf.qualifyingEndDate,"fromTime":conf.qualifyingStartDatetime,"toTime":conf.qualifyingEndDatetime},function(d){
				angular.copy($scope.algorithm.select(d), $scope.qualifyingAllScore);
			});
		},function(){
			//dismiss
		});
	};
	
	$scope.configRanking = function(){
		var modal = $uibModal.open({
			animation:false,
			templateUrl:'configRanking.html',
			controller:'configRankingController',
			backdrop : 'static',
			size:'lg'
		});
		
		modal.result.then(function(conf){
			//ok
			if(conf.rankingStartDate == null || conf.rankingStartDate == "")
				conf.rankingStartDate = $scope.data.start_date.split(" ")[0];
			if(conf.rankingStartDatetime == null || conf.rankingStartDatetime == "")
				conf.rankingStartDatetime = $scope.data.start_date.split(" ")[1];
			
			if(conf.rankingEndDate == null || conf.rankingEndDate == "")
				conf.rankingEndDate = $scope.data.end_date.split(" ")[0];
			if(conf.rankingEndDatetime == null || conf.rankingEndDatetime == "")
				conf.rankingEndDatetime = $scope.data.end_date.split(" ")[1];
			
			var d2 = angular.copy($scope.data,{});
			_this.graph.bind(d2,$scope.chart,$scope.algorithm,{"fromDate":conf.rankingStartDate,"toDate":conf.rankingEndDate,"fromTime":conf.rankingStartDatetime,"toTime":conf.rankingEndDatetime},function(d){
				angular.copy($scope.algorithm.select(d), $scope.rankingAllScore);
			});
		},function(){
			//dismiss
		});
	};
	
	$scope.searchRanking = function(){
		var $button = $("#searchSimpleId");
		$button.button("loading");
		$scope.visibleRankingSearch = true;
		_this.calc.ranking.search.idSearch($scope.rankingSearchSimpleId,$scope.selectedBattlefieldSchedule.rankingAll,function(d, useCache){
			$button.button("reset");
			if(useCache)
				angular.copy(d, $scope.rankingSearchAllScore);
			else
				$scope.$apply(function(){
					angular.copy(d, $scope.rankingSearchAllScore);
				});
		});
	};
	
	$scope.searchRankingDetail = function(){
		var modal = $uibModal.open({
			animation:false,
			templateUrl:'searchRankingDetail.html',
			controller:'searchRankingDetailController',
			backdrop : 'static',
			size:'lg'
		});
		
		modal.result.then(function(condition){
			//ok
			console.log(condition);
			var $button = $("#searchComplex");
			$button.button("loading");
			$scope.visibleRankingSearch = true;
			_this.calc.ranking.search.simple(condition,$scope.selectedBattlefieldSchedule.rankingAll,function(d, useCache){
				$button.button("reset");
				if(useCache)
					angular.copy(d, $scope.rankingSearchAllScore);
				else
					$scope.$apply(function(){
						angular.copy(d, $scope.rankingSearchAllScore);
					});
			});
		},function(){
			//dismiss
		});
	};
})
.controller('searchRankingDetailController', ['$scope', '$modalInstance', function($scope, $uibModalInstance){
	var _this = hauteclaire;
	$scope.conditions = [{}];
	$scope.keys = _this.calc.ranking.search.config;
	$scope.operators = _this.calc.ranking.search.operator;
	$scope.ok = function(){
		var r = [];
		$scope.conditions.forEach(function(elem,idx,array){
			if(elem.condition != null && elem.operator != null && elem.value != null)
				r.push(elem);
		});
		$uibModalInstance.close(r);
	};
	$scope.cancel = function(){
		$uibModalInstance.dismiss();
	};
	$scope.appendCondition = function(){
		$scope.conditions.push({});
	};
}])
.controller('configRankingController', ['$scope', '$modalInstance', function($scope, $uibModalInstance){
	var _this = hauteclaire;
	_this.operation.ranking.load($scope);

	$scope.ok = function(){
		var conf = {
			rankingStartDate : $scope.rankingStartDate,
			rankingStartDatetime :$scope.rankingStartDatetime,
			rankingEndDate:$scope.rankingEndDate,
			rankingEndDatetime:$scope.rankingEndDatetime
		};
		_this.operation.ranking.save(conf);
		$uibModalInstance.close(conf);
	};
	$scope.cancel = function(){
		 $uibModalInstance.dismiss();
	};
}])
.controller('configQualifyingController', ['$scope', '$modalInstance', function($scope, $uibModalInstance){
	var _this = hauteclaire;
	_this.operation.qualifying.load($scope);

	$scope.ok = function(){
		var conf = {
			qualifyingStartDate : $scope.qualifyingStartDate,
			qualifyingStartDatetime :$scope.qualifyingStartDatetime,
			qualifyingEndDate:$scope.qualifyingEndDate,
			qualifyingEndDatetime:$scope.qualifyingEndDatetime
		};
		_this.operation.qualifying.save(conf);
		$uibModalInstance.close(conf);
	};
	$scope.cancel = function(){
		 $uibModalInstance.dismiss();
	};
}])
.controller('configBookmakerController', ['$scope', '$modalInstance', function($scope, $uibModalInstance){
	var _this = hauteclaire;
	_this.operation.bookmaker.load($scope);

	if(!$scope.bookmakerGraphType){
		$scope.bookmakerGraphType = "total";
		$scope.bookmakerStartDate = "07:00";
		$scope.bookmakerEndDate = "00:00";
	}
	$scope.ok = function(){
		var conf = {
			bookmakerGraphType : $scope.bookmakerGraphType,
			bookmakerStartDate :$scope.bookmakerStartDate,
			bookmakerEndDate:$scope.bookmakerEndDate
		};
		_this.operation.bookmaker.save(conf);
		$uibModalInstance.close(conf);
	};
	$scope.cancel = function(){
		 $uibModalInstance.dismiss();
	};
}])
.controller('configBookmakerAreaController', ['$scope', '$modalInstance', function($scope, $uibModalInstance){
	var _this = hauteclaire;
	_this.operation.bookmakerArea.load($scope);
	if(!$scope.bookmakerAreaGraphType){
		$scope.bookmakerAreaGraphType = "total";
		$scope.bookmakerAreaStartDate = "07:00";
		$scope.bookmakerAreaEndDate = "00:00";
	}
	$scope.ok = function(){
		var conf = {
			bookmakerAreaGraphType : $scope.bookmakerAreaGraphType,
			bookmakerAreaStartDate :$scope.bookmakerAreaStartDate,
			bookmakerAreaEndDate:$scope.bookmakerAreaEndDate
		};
		_this.operation.bookmakerArea.save(conf);
		$uibModalInstance.close(conf);
	};
	$scope.cancel = function(){
		 $uibModalInstance.dismiss();
	};
}]);

