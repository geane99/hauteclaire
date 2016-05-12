var eventCalendarApp = angular.module('heloCalendarApp',['ui.calendar','ui.bootstrap']);
eventCalendarApp.controller('currentController',function($scope,$http){
	_this = hauteclaire;
	
	_this.config.calendar.events = function(start,end,timezone,callback){
		_this.app.clean();
		_this.app.addAll(_this.ordeal.generate());
		_this.app.addAll(_this.subjugation.generate());
		_this.app.addAll(_this.helo.generate($scope.heloGroupSelected));
		return callback(_this.app.findAll());
	};
	
	$scope.heloGroups = _this.helo.groups;
	$scope.heloGroupSelected = _this.helo.groups[0];
	$scope.changeHeloGroup = function(){
		$('#calendar').fullCalendar('refetchEvents');
	};
	$scope.init = function(){
		$('#calendar').fullCalendar(_this.config.calendar);
	};

});