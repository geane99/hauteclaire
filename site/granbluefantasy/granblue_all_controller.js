var eventCalendarApp = angular.module('allCalendarApp',['ui.calendar','ui.bootstrap']);
eventCalendarApp.controller('currentController',function($scope,$http){
	_this = hauteclaire;
	
	_this.app.config.calendar.events = function(start,end,timezone,callback){
		_this.app.clean();
		_this.app.addAll(_this.ordeal.generate());
		_this.app.addAll(_this.subjugation.generate());
		_this.app.addAll(_this.helo.generate($("#groupComponent").val()));
		_this.app.load(_this.app.config.resources, callback);
	};

	_this.app.config.calendar.eventClick = function(item,jsEvent,view){
		_this.app.openWindow(item.wiki);
	}
	
	$('#calendar').fullCalendar(_this.app.config.calendar);
	$("#groupComponent").change(function(){
		$('#calendar').fullCalendar('refetchEvents');
	});

});