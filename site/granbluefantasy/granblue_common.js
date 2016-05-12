var hauteclaire = {};

//build core
hauteclaire = function(_this){
	_this.app = {
		cache : new Array(),
		findAll : function(){
			return this.cache;
		},
		addAll : function(data){
			data.forEach(function(item,index,array){
				_this.app.cache.push(item);
			});
		},
		clean : function(){
			this.cache = new Array();
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
			_this.app.schedule.forEach(function(item,index,array){
				if(contain(arg,item.type))
					result.push(item);
			});
			return result;
		}
	};
	
	_this.UUID = {
		_state : null,
		_rand : function(max){
	 		var B32 = 4294967296;
			if(max <= B32){
				return Math.floor(Math.random() * max);
			}
			else{
				var d0 = Math.floor(Math.random() * B32);
				var d1 = Math.floor(Math.random() * Math.floor(max / B32));
				return d0 + d1 * B32;
			}
		},
		_intToPaddedHex : function(n, length){
			var hex = n.toString(16);
			while(hex.length < length){
				hex = '0' + hex;
			}
			return hex;
		},
		generate : function(){
			var rand = this._rand; 
			var hex = this._intToPaddedHex;
			//version 1
			if(arguments && (arguments[0] == 1)) {
				var timestamp = new Date() - Date.UTC(1582, 9, 15);
				if(this._state == null){
					this._state = {
						timestamp: timestamp,
						sequence: rand(16384),
						node: hex(rand(256) | 1, 2) + hex(rand(1099511627776), 10) 
					};
				}
				else{
					if(timestamp <= this._state.timestamp)
						this._state.sequence++;
					else
						this._state.timestamp = timestamp;
				}
				var ts  = hex(timestamp * 10000, 15);
				var seq = 32768 | (16383 & this._state.sequence); 
				return [
					ts.substr(7),
					ts.substr(3, 4),
					'1' + ts.substr(0, 3),
					hex(seq, 4),
					this._state.node
				].join('-');
			}
			else {
				//version 4
				return [
					hex(rand(4294967296), 8),
					hex(rand(65536), 4),
					'4' + hex(rand(4096), 3),
					hex(8 | rand(4), 1) + hex(rand(4096), 3),
					hex(rand(281474976710656), 12)
				].join('-');
			}
		}
	};
	
	_this.Semaphore = function(){
		this.release = function(arg){
			if(this.uuid == arg){
				this.uuid = null;
//				alert("release:"+arg);
			}
		};
		this.await = function(data){
			var _t = this;
			if(this.uuid == null){
//				alert("register:"+data.uuid);
				this.uuid = data.uuid;
				return false;
			}
			
			if(this.uuid == data.uuid)
				return false;
			
			setTimeout(function(){
//				alert("await(this):"+_t.uuid+"\narg:"+data.uuid);
				data.executor.apply(data.target, data.arguments);
			},2000);
			return true;
		};
	};
	
	
	_this.util = {
		semaphore : new _this.Semaphore(),
		load : function(target, uuid, array, finalize){
			_semaphore = this.semaphore;
			if(_semaphore.await({
				uuid : uuid,
				executor : _this.util.load,
				target : _this.util,
				arguments : arguments
			}))
				return;
			
			var _t = this;
			var complete = function(callback){
				callback();
			};

			if(target.cache && target.cache.length > 0)
				return complete(finalize);
			var site = array.pop();
			var surl = site.url;
			
			return $.ajax({
				url:surl,
				dataType:'json',
				success:function(data){
					var results = site.process(data);
					target.cache.addAll(results);
					if(array.length===0)
						complete(finalize);
						_semaphore.release(uuid);
					_t.load(target, uuid, array, finalize);
				},
				error:function(XMLHttpRequest, textStatus, errorThrown){
					alert(errorThrown);
				}
			});
		},
		openWindow:function(url){
			if(url == null)
				return;
			window.open(url);
		},
		dateToString : function(baseDate){
			return [baseDate.getFullYear(),(baseDate.getMonth()+1)<10?"0"+(baseDate.getMonth()+1):(baseDate.getMonth()+1),(baseDate.getDate()<10?"0"+baseDate.getDate():baseDate.getDate())].join("-");	
		},
		cloneElement : function(elem){
			return {
				minVariation:elem.minVariation,
				maxVariation:elem.maxVariation,
				title:elem.title,
				className:elem.className,
				isReprint:elem.isReprint,
				isCollaboration:elem.isCollaboration,
				type:elem.type
			};
		}
	};
	
	_this.config = {
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
	};
	return _this;
}(hauteclaire);


hauteclaire = function(_this){
	_this.operation = {
		get group(){
			return localStorage.group;
		},
		set group(group){
			return localStorage.group;
		}
	};

	return _this;
}(hauteclaire);


//build events
hauteclaire = function(_this){
	_this.events = {
		cache:new Array(),
		resources:[{
			url:"./granbluefantasy/granblue_event_data.json",
			process:function(data){
				return data.events;
		}}],
		target:[
			"currency","battelefield","subjugation","other","sisyou","arena","discount","maintenance","element"
		],
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
		range:90,
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
		generate : function(agroup){
			var group = agroup ? agroup : _this.helo.groups[0];
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


//build helo
hauteclaire = function(_this){
	_this.subjugation = {
		id:2000,
		cache:new Array(),
		current:new Date(2016,3,12),
		range:90,
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


//build helo
hauteclaire = function(_this){
	_this.ordeal = {
		current:new Date(2015,9,18),
		range:90,
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