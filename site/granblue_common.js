var hauteclaire = {};

hauteclaire = function(_this){
	_this.app = {
		events : new Array(),
		addAll : function(data){
			data.forEach(function(item,index,array){
				_this.app.events.push(item);
			});
		},
		clean : function(){
			_this.app.events = new Array();
		},
		cache : new Array(),
		load : function(urls,types,callback){
			if(_this.app.cache && _this.app.cache.length > 0)
				return callback(_this.app.cache);

			var us = urls.filter(function(){return true;});
			var site = us.pop();
			return $.ajax({
				url:site.url,
				dataType:'json',
				success:function(data){
					var domains = site.process(data);
					_this.app.addAll(domains);
					if(us.length===0){
						_this.app.cache = _this.app.filter(types);
						return callback(_this.app.cache);
					}
					_this.app.load(us,callback);
				},
				error:function(XMLHttpRequest, textStatus, errorThrown){
					alert(errorThrown);
				}
			});
		},
		filter : function(arg){
			var contain = function(array, target){
				var result = false;
				array.forEach(function(item,index,array){
					if(!result && item === target)
						result = true;
				});
				return result;
			};
			var result = new Array();
			_this.app.events.forEach(function(item,index,array){
				if(contain(arg,item.type))
					result.push(item);
			});
			return result;
		},
		openWindow:function(url){
			if(url == null)
				return;
			window.open(url);
		},
		config : {
			resources:[{
				url:"./granblue_event_data.json",
				process:function(data){
					return data.events;
			}}],
			target:[
				"currency","battelefield","subjugation","other","sisyou","arena","discount","maintenance","element"
			],
			calendar:{
				height: 700,
				width:600,
				editable: false,
				header:{
					left: 'title',
					right: 'today prev,next'
				},
				monthNames : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
				monthNamesShort : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
				dayNames : ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
				dayNamesShort : ['日','月','火','水','木','金','土'],
				axisFormat: 'H:mm',
				timeFormat: { agenda: 'H:mm{ - H:mm}' },
				displayEventTime :false,
				eventOrder:"id"
			}
		}
	};
	

	_this.dateToString = function(baseDate){
		return [baseDate.getFullYear(),(baseDate.getMonth()+1)<10?"0"+(baseDate.getMonth()+1):(baseDate.getMonth()+1),(baseDate.getDate()<10?"0"+baseDate.getDate():baseDate.getDate())].join("-");	
	};

	_this.cloneElement = function(elem){
		return {
			minDeviation:elem.minDeviation,
			maxDeviation:elem.maxDeviation,
			title:elem.title,
			className:elem.className,
			isReprint:elem.isReprint,
			isCollaboration:elem.isCollaboration,
			type:elem.type
		};
	};

	_this.helo = {
		id:1000,
		range:90,
		rule:{
			size:9,
			current:new Date(2016,0,6),
			pattern:["morning","noon","morning","noon","night","noon","night","morning","night"]
		},
		groups:[
			{ name:"グループA&E", deviation:0 },
			{ name:"グループB&F", deviation:1 },
			{ name:"グループC&G", deviation:2 },
				{ name:"グループD&H", deviation:3 }
		],
		timeline:{
			current:new Date(2016,0,5),
			size:6,
			morning:{ min: 6, max:11, styleName:"element_morning" },
			noon:{    min:12, max:17, styleName:"element_noon" },
			night:{   min:18, max:23, styleName:"element_night" }
		},
		cache : new Array()
	};

	_this.helo.rule.deviation = function(d){
		var target = d;
		var range = target.getTime() - _this.helo.rule.current.getTime();
		var dev = Math.floor(range/(1000*60*60*24));
		return dev++;
	};
	_this.helo.timeline.deviation = function(d,current){
		var target = d;
		var range = target.getTime() - _this.helo.timeline.current.getTime();
		var dev = Math.floor(range/(1000*60*60*24));
		return dev;
	};

	_this.helo.element = function(dateString,zone,group,deviationTimeline){
		var timeline = zone.min+deviationTimeline+group.deviation;
		if(timeline>zone.max){
			timeline=timeline-zone.max+zone.min-1;
		}
		var r = {
			start:dateString + " 00:00:00",
			end:dateString + " 23:59:59",
			className:zone.styleName,
			title:timeline+"時"
		};
		return r;
	};

	_this.helo.generate = function(groupindex){
		var group = _this.helo.groups[groupindex];
		if(_this.helo.cache[group] && _this.helo.cache[group].length > 0)
			return _this.helo.cache[groupindex];
		
		var baseDate = new Date();
		var result = new Array();

		var ruleSize = _this.helo.rule.size;
		var ruleDeviation = _this.helo.rule.deviation(baseDate);
		if(ruleDeviation >= ruleSize)
			ruleDeviation = ruleDeviation % ruleSize;
		
		var timelineSize = _this.helo.timeline.size;
		var timelineDeviation = _this.helo.timeline.deviation(baseDate);

		if(timelineDeviation > timelineSize)
			timelineDeviation = timelineDeviation % timelineSize;

		for(var i=0; i<_this.helo.range; i++){
			var dString = _this.dateToString(baseDate);
			var zoneInfo = _this.helo.rule.pattern[ruleDeviation++];
			var zone = _this.helo.timeline[zoneInfo];
				
			var element = _this.helo.element(dString,zone,group,timelineDeviation++);
			element.id = _this.helo.id + i;

			result[i] = element;
			baseDate.setDate(baseDate.getDate() + 1);

			if(ruleDeviation >= ruleSize)
				ruleDeviation = ruleDeviation % ruleSize;
			if(timelineDeviation > timelineSize)
				timelineDeviation = timelineDeviation % timelineSize;
		}
		_this.helo.cache[groupindex] = result;
		return result;
	};

	_this.subjugation = {
		id:2000,
		cache:new Array(),
		current:new Date(2016,3,12),
		range:90,
		size:18,
		pattern:[{
				minDeviation:0,
				maxDeviation:2,
				title:"イフリート",
				className:"subjugation_fire",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			},{
				minDeviation:3,
				maxDeviation:5,
				title:"コキュートス",
				className:"subjugation_water",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			},{
				minDeviation:6,
				maxDeviation:8,
				title:"ウォフマナフ",
				className:"subjugation_earth",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			},{
				minDeviation:9,
				maxDeviation:11,
				title:"サジタリウス",
				className:"subjugation_wind",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			},{
				minDeviation:12,
				maxDeviation:14,
				title:"コロゥ",
				className:"subjugation_shine",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			},{
				minDeviation:15,
				maxDeviation:17,
				title:"ディアボロス",
				className:"subjugation_darkness",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
	}]};

	_this.subjugation.findElement = function(dev){
		var found = null;
		_this.subjugation.pattern.forEach(function(item,index,array){
			if(item.minDeviation <= dev && item.maxDeviation >= dev)
				found = item;
		});	
		if(!found)
			return found;
		return _this.cloneElement(found);
	};

	_this.subjugation.deviation = function(d){
		var target = d;
		var range = target.getTime() - _this.subjugation.current.getTime();
		var dev = Math.floor(range/(1000*60*60*24));
		return dev++;
	};
		
	_this.subjugation.generate = function(){
		if(_this.subjugation.cache && _this.subjugation.cache.length>0)
			return _this.subjugation.cache;
			
		var size = _this.subjugation.size;
		var result = new Array();
		var baseDate = new Date();
		var deviation = _this.subjugation.deviation(baseDate);
		if(deviation >= size)
			deviation = deviation % size;

		for(var i=0;i<_this.subjugation.range;i++){
			var element = _this.subjugation.findElement(deviation++);

			var dString = _this.dateToString(baseDate);
			element.start = dString + " 00:00:00";
			element.end = dString + " 23:59:59";
			baseDate.setDate(baseDate.getDate() + 1);
			element.id = _this.subjugation.id + i;
			result[i] = element;

			if(deviation >= size)
				deviation = deviation % size;
		}
		_this.subjugation.cache = result;
		return _this.subjugation.cache;
	};


	_this.ordeal = {
		current:new Date(2015,9,18),
		range:90,
		id:3000,
		cache:new Array(),
		size:12,
		pattern:[{
				minDeviation:0,
				maxDeviation:1,
				title:"業火の試練",
				className:"element_fire",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			},{
				minDeviation:2,
				maxDeviation:3,
				title:"玉水の試練",
				className:"element_water",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			},{
				minDeviation:4,
				maxDeviation:5,
				title:"荒土の試練",
				className:"element_earth",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			},{
				minDeviation:6,
				maxDeviation:7,
				title:"狂風の試練",
				className:"element_wind",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			},{
				minDeviation:8,
				maxDeviation:9,
				title:"極光の試練",
				className:"element_shine",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			},{
				minDeviation:10,
				maxDeviation:11,
				title:"幽闇の試練",
				className:"element_darkness",
				isReprint:false,
				isCollaboration:false,
				type:"element"
	}]};

	_this.ordeal.deviation = function(d){
		var target = d;
		var range = target.getTime() - _this.ordeal.current.getTime();
		var dev = Math.floor(range/(1000*60*60*24));
		return dev++;
	};

	_this.ordeal.findElement = function(dev){
		var found = null;
		_this.ordeal.pattern.forEach(function(item,index,array){
			if(item.minDeviation <= dev && item.maxDeviation >= dev)
				found = item;
		});	
		if(!found)
			return found;
		return _this.cloneElement(found);
	};

	_this.ordeal.generate = function(){
		if(_this.ordeal.cache && _this.ordeal.cache.length > 0)
			return _this.ordeal.cache;

		var size = _this.ordeal.size;
		var result = new Array();
		var baseDate = new Date();

		var deviation = _this.ordeal.deviation(baseDate);
		if(deviation >= size)
			deviation = deviation % size;

		for(var i=0;i<_this.ordeal.range;i++){
			var element = _this.ordeal.findElement(deviation++);
			var dString = _this.dateToString(baseDate);
			
			element.start = dString + " 00:00:00";
			element.end = dString + " 23:59:59";
			baseDate.setDate(baseDate.getDate() + 1);
			element.id = _this.ordeal.id + i;
			result[i] = element;
			if(deviation >= size)
				deviation = deviation % size;
		}
		
		_this.ordeal.cache = result;
		return _this.ordeal.cache;
	};
	
	return _this;
}(hauteclaire);

