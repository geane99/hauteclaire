angular.module('allCalendarApp',['ui.calendar','ui.bootstrap'])

.directive('ngCalendar', function(){
	return {
		restrict : 'AEC',
		transclude : true,
		compile : function(element,attributes){
			_this = hauteclaire;
			element.addClass('calendar');
		},
		link : function(scope, element){
		}
	};
})

.controller('currentController',function($scope, $uibModal, $log){
	var _this = hauteclaire;
	
	var generateCalendarElements = function(){
		_this.app.clean();
		_this.app.addAll(_this.ordeal.generate());
		_this.app.addAll(_this.subjugation.generate());
		_this.app.addAll(_this.helo.generate(_this.operation.groupId));
		_this.app.addAll(_this.events.cache);
	};
	
	_this.config.calendar.events = function(start,end,timezone,callback){
		callback(_this.app.filter(_this.operation));
	};
	_this.config.calendar.eventClick = function(item,jsEvent,view){
		_this.util.openWindow(item.wiki);
	};
		
	_this.events.generate(function(){
		generateCalendarElements();
		$('#calendar').fullCalendar('refetchEvents');
	});
	
	$scope.init = function(){
		$('#calendar').fullCalendar(_this.config.calendar);
	};
	
	$scope.openModal = function(){
		var modal = $uibModal.open({
			animation:false,
			templateUrl:'modal.html',
			controller:'modalController',
			backdrop : 'static',
			size:'lg'
		});
		
		modal.result.then(function(data){
			_this.app.filter(_this.operation, true);
			$('#calendar').fullCalendar('refetchEvents');
		},function(){
			//dismiss
		});
	};
})

angular.module('ui.bootstrap').controller('modalController', ['$scope', '$modalInstance', function($scope, $uibModalInstance){
	var _this = hauteclaire;
	
	$scope.heloGroups = _this.helo.groups;
	$scope.ok = function(){
		var r = {
			heloDisplay : $scope.heloDisplay,
			heloGroupId : $scope.selectedHeloGroup.id,
			heloMorning : !$scope.heloDisplay ? false : $scope.heloMorning,
			heloNoon : !$scope.heloDisplay ? false : $scope.heloNoon,
			heloNight : !$scope.heloDisplay ? false : $scope.heloNight,
			subjugationDisplay : $scope.subjugationDisplay,
			subjugationFire : !$scope.subjugationDisplay ? false : $scope.subjugationFire,
			subjugationWater : !$scope.subjugationDisplay ? false : $scope.subjugationWater,
			subjugationEarth : !$scope.subjugationDisplay ? false : $scope.subjugationEarth,
			subjugationWind : !$scope.subjugationDisplay ? false : $scope.subjugationWind,
			subjugationShine : !$scope.subjugationDisplay ? false : $scope.subjugationShine,
			subjugationDarkness : !$scope.subjugationDisplay ? false : $scope.subjugationDarkness,
			ordealDisplay : $scope.ordealDisplay,
			ordealFire : !$scope.ordealDisplay ? false : $scope.ordealFire,
			ordealWater : !$scope.ordealDisplay ? false : $scope.ordealWater,
			ordealEarth : !$scope.ordealDisplay ? false : $scope.ordealEarth,
			ordealWind : !$scope.ordealDisplay ? false : $scope.ordealWind,
			ordealShine : !$scope.ordealDisplay ? false : $scope.ordealShine,
			ordealDarkness : !$scope.ordealDisplay ? false :$scope.ordealDarkness,
			eventsDisplay : $scope.eventsDisplay,
			eventsHiroicBattleFields : !$scope.eventsDisplay ? false : $scope.eventsHiroicBattleFields,
			eventsSisyo : !$scope.eventsDisplay ? false : $scope.eventsSisyo,
			eventsStory : !$scope.eventsDisplay ? false : $scope.eventsStory,
			eventsSubjugation : !$scope.eventsDisplay ? false : $scope.eventsSubjugation,
			eventsCollaboration :!$scope.eventsDisplay ? false : $scope.eventsCollaboration,
			eventsOther : !$scope.eventsDisplay ? false : $scope.eventsOther,
			systemDiscount : !$scope.eventsDisplay ? false : $scope.systemDiscount,
			systemMaintenance : !$scope.eventsDisplay ? false : $scope.systemMaintenance
		};
		_this.operation.save(r);
		$uibModalInstance.close(r);
	};
	
	$scope.cancel = function(){
		 $uibModalInstance.close();
	};
	
	$scope.checkHelo = function($event){
		if(!$event.target.checked)
			$scope.heloDisplay = false;
		else
			$scope.heloDisplay = true;
	};
	
	$scope.checkSubjugation = function($event){
		if(!$event.target.checked)
			$scope.subjugationDisplay = false;
		else
			$scope.subjugationDisplay = true;
	};
	
	$scope.checkOrdeal = function($event){
		if(!$event.target.checked)
			$scope.ordealDisplay = false;
		else
			$scope.ordealDisplay = true;
	};	

	$scope.checkEvents = function($event){
		if(!$event.target.checked)
			$scope.eventsDisplay = false;
		else
			$scope.eventsDisplay = true;
	};
	
	$scope.checkSystem = function($event){
		if(!$event.target.checked)
			$scope.systemDisplay = false;
		else
			$scope.systemDisplay = true;
	};
	
	$scope.toggleChecks = function($event, name){
		$scope[name] = $event.target.checked;
	};
	
	_this.operation.load($scope);
	
	$scope.selectedHeloGroup = 
		_this.operation.heloGroupId != null ? 
			_this.helo.getGroupById(_this.operation.heloGroupId) : 
			_this.helo.groups[0];
	

}]);
