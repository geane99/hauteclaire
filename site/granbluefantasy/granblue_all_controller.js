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
	_this = hauteclaire;
	
	_this.config.calendar.events = function(start,end,timezone,callback){
		_this.app.clean();
		_this.app.addAll(_this.ordeal.generate());
		_this.app.addAll(_this.subjugation.generate());
		_this.app.addAll(_this.helo.generate(_this.operation.groupId));
		_this.app.addAll(_this.events.cache);
		callback(_this.app.findAll());
	};
	_this.config.calendar.eventClick = function(item,jsEvent,view){
		_this.util.openWindow(item.wiki);
	};
		
	_this.events.generate(function(){
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
			$('#calendar').fullCalendar('refetchEvents');
			//ok
		},function(){
			alert("dismiss");
			//dismiss
		});
	};
})

angular.module('ui.bootstrap').controller('modalController', ['$scope', '$modalInstance', function($scope, $uibModalInstance){
	_this = hauteclaire;
	
	$scope.heloGroups = _this.helo.groups;
	$scope.ok = function(){
		var r = {
			heloDisplay : $scope.heloDisplay,
			heloGroupId : $scope.selectedHeloGroup.id,
			heloMorning : $scope.heloMorning,
			heloNoon : $scope.heloNoon,
			heloNight : $scope.heloNight,
			subjugationDisplay : $scope.subjugationDisplay,
			subjugationFire : $scope.subjugationFire,
			subjugationWater : $scope.subjugationWater,
			subjugationEarth : $scope.subjugationEarth,
			subjugationWind : $scope.subjugationWind,
			subjugationShine :$scope.subjugationShine,
			subjugationDarkness :$scope.subjugationDarkness,
			ordealDisplay : $scope.ordealDisplay,
			ordealFire : $scope.ordealFire,
			ordealWater : $scope.ordealWater,
			ordealEarth : $scope.ordealEarth,
			ordealWind : $scope.ordealWind,
			ordealShine :$scope.ordealShine,
			ordealDarkness :$scope.ordealDarkness,
			eventsDisplay : $scope.eventsDisplay,
			eventsHiroicBattleFields : $scope.eventsHiroicBattleFields,
			eventsSisyo :$scope.eventsSisyo,
			eventsStory : $scope.eventsStory,
			eventsSubjugation :$scope.eventsSubjugation,
			eventsCollaboration :$scope.eventsCollaboration,
			eventsDiffendOrder : $scope.eventsDiffendOrder,
			eventsOther : $scope.eventsOther
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
	
	$scope.toggleChecks = function($event, name){
		$scope[name] = $event.target.checked;
	};
	
	_this.operation.load($scope);
	
	$scope.selectedHeloGroup = 
		_this.operation.heloGroupId != null ? 
			_this.helo.getGroupById(_this.operation.heloGroupId) : 
			_this.helo.groups[0];
	

}]);
