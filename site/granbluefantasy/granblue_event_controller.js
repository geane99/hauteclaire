var eventCalendarApp = angular.module('eventCalendarApp',['ui.calendar','ui.bootstrap']);
eventCalendarApp.controller('currentController',function($scope,$http){
	_this = hauteclaire;

	_this.config.calendar.events = function(start,end,timezone,callback){
		_this.app.clean();
		_this.events.generate(function(){
			_this.app.addAll(_this.events.cache);
			callback(_this.app.findAll());
		});
	};
	
	_this.config.calendar.eventClick = function(item,jsEvent,view){
		_this.util.openWindow(item.wiki);
	}
	$('#calendar').fullCalendar(_this.config.calendar);
});