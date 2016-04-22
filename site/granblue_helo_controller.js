var eventCalendarApp = angular.module('heloCalendarApp',['ui.calendar','ui.bootstrap']);
eventCalendarApp.controller('currentController',function($scope,$http){
	_this = hauteclaire;
	
	_this.app.config.calendar.events = function(start,end,timezone,callback){
		_this.app.clean();
		_this.app.addAll(_this.ordeal.generate());
		_this.app.addAll(_this.subjugation.generate());
		_this.app.addAll(_this.helo.generate($("#groupComponent").val()));
		return callback(_this.app.events);
	};
	$('#calendar').fullCalendar(_this.app.config.calendar);
	$("#groupComponent").change(function(){
		$('#calendar').fullCalendar('refetchEvents');
	});

});