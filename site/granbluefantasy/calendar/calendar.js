hauteclaire = function(_this){
	_this.operation = {
		_set : function(name, value){
			return localStorage.setItem(name, value);
		},
		_get : function(name){
			var r = eval(localStorage.getItem(name));
			if(r == null)
				return true;
			return r;
		},
		rules : new Array(),
		properties : new Array(),
		defineAccessor : function(name, targets){
			var _t = this;
			this.__defineGetter__(name, function(){
				return this._get(name);
			});
			this.__defineSetter__(name, function(val){
				return this._set(name, val);
			});
			this.properties.push(name);
			if(targets != null)
				this.rules.push(function(item){
					var isOk = false;
					if(_t._get(name))
						targets.forEach(function(target){
							if(item.className == target)
								isOk = true;
						});
					return isOk;
				});
		},
		build :function(){
			this.defineAccessor("heloDisplay");
			this.defineAccessor("heloGroupId");
			this.defineAccessor("heloMorning", ["element_morning"]);
			this.defineAccessor("heloNoon", ["element_noon"]);
			this.defineAccessor("heloNight", ["element_night"]);
			this.defineAccessor("subjugationDisplay");
			this.defineAccessor("subjugationFire",["subjugation_fire"]);
			this.defineAccessor("subjugationWater",["subjugation_water"]);
			this.defineAccessor("subjugationEarth",["subjugation_earth"]);
			this.defineAccessor("subjugationWind",["subjugation_wind"]);
			this.defineAccessor("subjugationShine",["subjugation_shine"]);
			this.defineAccessor("subjugationDarkness",["subjugation_darkness"]);
			this.defineAccessor("ordealDisplay");
			this.defineAccessor("ordealFire",["element_fire"]);
			this.defineAccessor("ordealWater",["element_water"]);
			this.defineAccessor("ordealEarth",["element_earth"]);
			this.defineAccessor("ordealWind",["element_wind"]);
			this.defineAccessor("ordealShine",["element_shine"]);
			this.defineAccessor("ordealDarkness",["element_darkness"]);
			this.defineAccessor("eventsDisplay");
			this.defineAccessor("eventsHiroicBattleFields",["historic_battlefield"]);
			this.defineAccessor("eventsSisyo",["sisyou"]);
			this.defineAccessor("eventsStory",["story_events"]);
			this.defineAccessor("eventsSubjugation",["subjugation"]);
			this.defineAccessor("eventsCollaboration",["collaboration"]);
			this.defineAccessor("eventsDiffendOrder",["diffend_order"]);
			this.defineAccessor("eventsArcarum",["arcarum"]);
			this.defineAccessor("eventsOther",["other"]);
			this.defineAccessor("systemDisplay");
			this.defineAccessor("systemDiscount",["discount"]);
			this.defineAccessor("systemMaintenance",["maintenance"]);
		},
		save : function(t){
			var _t = this;
			_this.operation.properties.forEach(function(name){
				_t[name] = t[name];
			});
		},
		load : function(t){
			return this.save.apply(t, [this]);
		},
		match :function(item){
			for(i = 0; i < this.rules.length; i++)
				if(this.rules[i](item))
					return true;
			return false;
		}
	};
	_this.operation.build();
	return _this;
}(hauteclaire);


//build events
hauteclaire = function(_this){
	_this.events = {
		cache:new Array(),
		resources:[{
			url:"./granbluefantasy/calendar/data_event.json",
			process:function(data){
				return data.events;
			}
		},{
			url:"./granbluefantasy/calendar/data_system.json",
			process:function(data){
				return data.events;
			}
		}],
		generate : function(callback){
			if(this.cache != null && this.cache.length > 0)
				return callback();
				
			this.cache.addAll = function(data){
				var _parent = this;
				data.forEach(function(item,index,array){
					_parent.push(item);
				});
			};
			
			var uuid = _this.UUID.generate(1);
			_this.util.load(this, uuid, this.resources.slice(0), callback);
		}
	};
	return _this;
}(hauteclaire);


//build helo
hauteclaire = function(_this){
	_this.helo = {
		id:1000,
		range:120,
		rule:{
			size:9,
			current:new Date(2016,0,6),
			pattern:["morning","noon","morning","noon","night","noon","night","morning","night"],
			variate : function(d){
				var target = d;
				var range = target.getTime() - _this.helo.rule.current.getTime();
				var dev = Math.floor(range/(1000*60*60*24));
				return dev++;
			}
		},
		groups:[
			{ name:"グループA&E", variate:0, id:0 },
			{ name:"グループB&F", variate:1, id:1 },
			{ name:"グループC&G", variate:2, id:2 },
			{ name:"グループD&H", variate:3, id:3 }
		],
		getGroupById : function(id){
			var r = null;
			this.groups.forEach(function(item,index,array){
				if(item.id == id)
					r = item;
			});
			return r;
		},
		timeline:{
			current:new Date(2016,0,5),
			size:6,
			morning:{ min: 6, max:11, styleName:"element_morning" },
			noon:{    min:12, max:17, styleName:"element_noon" },
			night:{   min:18, max:23, styleName:"element_night" },
			variate : function(d,current){
				var target = d;
				var range = target.getTime() - this.current.getTime();
				var dev = Math.floor(range/(1000*60*60*24));
				return dev;
			}
		},
		cache : new Array(),
		prefix : '★ヘイロー:',
		suffix : '時',
		title : function(v){
			return this.prefix + v + this.suffix;
		},
		element : function(dateString,zone,group,variateTimeline){
			var timeline = zone.min+variateTimeline+group.variate;
			if(timeline>zone.max){
				timeline=timeline-zone.max+zone.min-1;
			}
			var r = {
				start:dateString + " 00:00:00",
				end:dateString + " 23:59:59",
				className:zone.styleName,
				title:this.title(timeline)
			};
			return r;
		},
		generate : function(groupId){
			var group = groupId ? this.getGroupById(groupId) : this.groups[0];
			group = group ? group : this.groups[0];
			if(this.cache[group.id] && this.cache[group.id].length > 0)
				return this.cache[group.id];
			
			var baseDate = new Date();
			var result = new Array();

			var ruleSize = this.rule.size;
			var ruleVariation = this.rule.variate(baseDate);
			if(ruleVariation >= ruleSize)
				ruleVariation = ruleVariation % ruleSize;
			
			var timelineSize = this.timeline.size;
			var timelineVariation = this.timeline.variate(baseDate);

			if(timelineVariation > timelineSize)
				timelineVariation = timelineVariation % timelineSize;

			for(var i=0; i< this.range; i++){
				var dString = _this.util.dateToString(baseDate);
				var zoneInfo = this.rule.pattern[ruleVariation++];
				var zone = this.timeline[zoneInfo];
					
				var element = this.element(dString,zone,group,timelineVariation++);
				element.id = this.id + i;

				result[i] = element;
				baseDate.setDate(baseDate.getDate() + 1);

				if(ruleVariation >= ruleSize)
					ruleVariation = ruleVariation % ruleSize;
				if(timelineVariation > timelineSize)
					timelineVariation = timelineVariation % timelineSize;
			}
			this.cache[group.id] = result;
			return result;
		}
	};
	return _this;
}(hauteclaire);


//build subjugation
hauteclaire = function(_this){
	_this.subjugation = {
		id:2000,
		cache:new Array(),
		current:new Date(2016,7,16),
		range:120,
		size:18,
		pattern:[{
				minVariation:0,
				maxVariation:2,
				title:"イフリート",
				className:"subjugation_fire",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			},{
				minVariation:3,
				maxVariation:5,
				title:"コキュートス",
				className:"subjugation_water",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			},{
				minVariation:6,
				maxVariation:8,
				title:"ウォフマナフ",
				className:"subjugation_earth",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			},{
				minVariation:9,
				maxVariation:11,
				title:"サジタリウス",
				className:"subjugation_wind",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			},{
				minVariation:12,
				maxVariation:14,
				title:"コロゥ",
				className:"subjugation_shine",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			},{
				minVariation:15,
				maxVariation:17,
				title:"ディアボロス",
				className:"subjugation_darkness",
				isReprint:false,
				isCollaboration:false,
				type:"subjugation"
			}
		],
		findElement : function(dev){
			var found = null;
			this.pattern.forEach(function(item,index,array){
				if(item.minVariation <= dev && item.maxVariation >= dev)
					found = item;
			});	
			if(!found)
				return found;
			return _this.util.cloneElement(found);
		},
		variate : function(d){
			var target = d;
			var range = target.getTime() - this.current.getTime();
			var dev = Math.floor(range/(1000*60*60*24));
			return dev++;
		},
		generate : function(){
			if(this.cache && this.cache.length>0)
				return this.cache;
				
			var size = this.size;
			var result = new Array();
			var baseDate = new Date();
			var variate = this.variate(baseDate);
			if(variate >= size)
				variate = variate % size;

			for(var i=0;i<this.range;i++){
				var element = this.findElement(variate++);

				var dString = _this.util.dateToString(baseDate);
				element.start = dString + " 00:00:00";
				element.end = dString + " 23:59:59";
				baseDate.setDate(baseDate.getDate() + 1);
				element.id = this.id + i;
				result[i] = element;

				if(variate >= size)
					variate = variate % size;
			}
			this.cache = result;
			return this.cache;
		}
	};
	return _this;
}(hauteclaire);


//build ordeal
hauteclaire = function(_this){
	_this.ordeal = {
		current:new Date(2015,9,18),
		range:120,
		id:3000,
		cache:new Array(),
		size:12,
		pattern:[{
				minVariation:0,
				maxVariation:1,
				title:"業火の試練",
				className:"element_fire",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			},{
				minVariation:2,
				maxVariation:3,
				title:"玉水の試練",
				className:"element_water",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			},{
				minVariation:4,
				maxVariation:5,
				title:"荒土の試練",
				className:"element_earth",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			},{
				minVariation:6,
				maxVariation:7,
				title:"狂風の試練",
				className:"element_wind",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			},{
				minVariation:8,
				maxVariation:9,
				title:"極光の試練",
				className:"element_shine",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			},{
				minVariation:10,
				maxVariation:11,
				title:"幽闇の試練",
				className:"element_darkness",
				isReprint:false,
				isCollaboration:false,
				type:"element"
			}
		],
		variate : function(d){
			var target = d;
			var range = target.getTime() - this.current.getTime();
			var dev = Math.floor(range/(1000*60*60*24));
			return dev++;
		},
		findElement : function(dev){
			var found = null;
			this.pattern.forEach(function(item,index,array){
				if(item.minVariation <= dev && item.maxVariation >= dev)
					found = item;
			});	
			if(!found)
				return found;
			return _this.util.cloneElement(found);
		},
		generate : function(){
			if(this.cache && this.cache.length > 0)
				return this.cache;

			var size = this.size;
			var result = new Array();
			var baseDate = new Date();

			var variate = this.variate(baseDate);
			if(variate >= size)
				variate = variate % size;

			for(var i=0;i<this.range;i++){
				var element = this.findElement(variate++);
				var dString = _this.util.dateToString(baseDate);
				
				element.start = dString + " 00:00:00";
				element.end = dString + " 23:59:59";
				baseDate.setDate(baseDate.getDate() + 1);
				element.id = _this.ordeal.id + i;
				result[i] = element;
				if(variate >= size)
					variate = variate % size;
			}
			
			this.cache = result;
			return this.cache;
		}
	};
	return _this;
}(hauteclaire);
