var allCalendarApp = angular.module('allCalendarApp',['ui.calendar','ui.bootstrap']);
allCalendarApp.directive('ngCalendar', function(){
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
});

allCalendarApp.controller('currentController',function($scope,$http){
	_this = hauteclaire;
	_this.events.generate(function(){
		$scope.changeHeloGroup = function(){
			alert("change");
			_this.operation.group = $scope.heloGroupSelected;
			$('#calendar').fullCalendar('refetchEvents');
		};
		$scope.heloGroups = _this.helo.groups;

		_this.config.calendar.events = function(start,end,timezone,callback){
				_this.app.clean();
				_this.app.addAll(_this.ordeal.generate());
				_this.app.addAll(_this.subjugation.generate());
				_this.app.addAll(_this.helo.generate(_this.operation.group));
				_this.app.addAll(_this.events.cache);
				callback(_this.app.findAll());
			});
		};

		$scope.init = function(){
			alert("init");
			$scope.heloGroupSelected = _this.operation.group != null ? _this.operation.group : _this.helo.groups[0];
			$('#calendar').fullCalendar(_this.config.calendar);
		};
	);
	_this.config.calendar.eventClick = function(item,jsEvent,view){
		_this.app.openWindow(item.wiki);
	};
});