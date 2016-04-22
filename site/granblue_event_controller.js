var eventCalendarApp = angular.module('eventCalendarApp',['ui.calendar','ui.bootstrap']);
eventCalendarApp.controller('currentController',function($scope,$http){
	_this = hauteclaire;

	_this.app.config.calendar.events = function(start,end,timezone,callback){
		_this.app.load(_this.app.config.resources,_this.app.config.target,callback);
	};
	
	_this.app.config.calendar.eventClick = function(item,jsEvent,view){
		_this.app.openWindow(item.wiki);
	}
	$('#calendar').fullCalendar(_this.app.config.calendar);
});