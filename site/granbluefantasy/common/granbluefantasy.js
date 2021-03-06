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
		filter : function(rule, force){
			if(!force && this.cache2nd && this.cache2nd.length > 0)
				return this.cache2nd;
			var array = new Array();
			this.cache.forEach(function(item){
				if(rule.match(item))
					array.push(item);
			});
			this.cache2nd = array;
			return array;
		},
		cache2nd : new Array()
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
			}
		};
		this.await = function(data){
			var _t = this;
			if(this.uuid == null){
				this.uuid = data.uuid;
				return false;
			}
			
			if(this.uuid == data.uuid)
				return false;
			
			setTimeout(function(){
				data.executor.apply(data.target, data.arguments);
			},2000);
			return true;
		};
	};
	
	
	_this.util = {
		semaphore : new _this.Semaphore(),
		load : function(target, uuid, array, finalize, recursive){
			if(!recursive && target.cache && target.cache.length > 0)
				return finalize();
			var _semaphore = this.semaphore;
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

			var site = array.pop();
			var surl = site.url;
			
			return $.ajax({
				url:surl,
				dataType:'text',
				  xhrFields: {
					withCredentials: true
				},
				headers:{
					'X-Requested-With':true,
					'Content-Type': 'application/json'
				},
				success:function(text){
					stext = text.replace(/\?/g,"");
					data = (new Function("return " + stext))();
					var results = site.process(data);
					if(target.cache != null && target.cache.addAll != null)
						target.cache.addAll(results);
					if(array.length===0){
						complete(finalize);
						return _semaphore.release(uuid);
					}
					_t.load(target, uuid, array, finalize,true);
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
			return [
				baseDate.getFullYear(),
				(baseDate.getMonth()+1)<10?"0"+(baseDate.getMonth()+1):(baseDate.getMonth()+1),
				(baseDate.getDate()<10?"0"+baseDate.getDate():baseDate.getDate())
			].join("-");
		},
		datetimeToString : function(baseDate){
			return this.dateToString(baseDate) + " " + ([
				(baseDate.getHours()<10?"0"+baseDate.getHours():baseDate.getHours()),
				(baseDate.getMinutes()<10?"0"+baseDate.getMinutes():baseDate.getMinutes()),
				(baseDate.getSeconds()<10?"0"+baseDate.getSeconds():baseDate.getSeconds())
			].join(":"));
		},
		nextDateByStringDate:function(stringDate){
			base = this.stringToDatetime(stringDate);
			basedate = this.integerToDate(base + (24*60*60*1000));
			return this.dateToString(basedate);
		},
		stringToDatetime:function(sdate){
			return Date.parse(sdate);
		},
		stringToDate:function(sdate){
			return new Date(sdate);
		},
		integerToDate:function(val){
			return new Date(val);
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
		},
		removeAd : function(){
			if(document.location.href.indexOf("fc2") > 0){
				$("#root ~").remove();
			}
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

//build graph
hauteclaire = function(_this){
	_this.graph = {
		id : "graph_main",
		element : "svg",
		cache:new Array(),
		clear : function(){
			this.cache = new Array();
		},
		chart : function(g, data, conf){
			d3.select("svg").selectAll("*").remove();
			nv.addGraph({
				generate: function() {
					var chart = nv.models[g.method]()
						.width(nv.utils.windowSize().width-30)
						.height(nv.utils.windowSize().height-65)
						.rightAlignYAxis(true)
						.margin({right:100, bottom:100});
					chart.options(g.options);
					g.spec(nv,d3,chart);
					
					if(!g.revert){
						g.xAxis(nv,d3,chart,chart.xAxis, conf);
						g.yAxis(nv,d3,chart,chart.yAxis, conf);
					}
					else{
						g.xAxis(nv,d3,chart,chart.yAxis, conf);
						g.yAxis(nv,d3,chart,chart.xAxis, conf);
					}
					
					chart.dispatch.on('renderEnd', function(){
					});
					var svg = d3.select('#'+_this.graph.id+' '+_this.graph.element).datum(data);
					svg.transition().duration(100).call(chart);
					return chart;
				},
				callback: function(graph) {
					nv.utils.windowResize(function(){
						graph
							.width(nv.utils.windowSize().width-30)
							.height(nv.utils.windowSize().height-65);
						d3
							.select('#'+_this.graph.id+' '+_this.graph.element)
							.attr('width', nv.utils.windowSize().width)
							.attr('height', _this.graph.height)
							.transition().duration(0)
							.call(graph);
					});
				}
			});
		},
		generate : function(path, g, algorithm, callback){
			var uuid = _this.UUID.generate(1);
			_this.util.load(this, uuid, [{ url : path, process : function(serverData){ 
				var correctData = algorithm.correct(serverData);
				callback(correctData);
				var graphData = algorithm.calc(correctData, g.revert);
				var conf = algorithm.conf(correctData);
				_this.graph.chart(g, graphData, conf);
				return data;
			}}], function(){
			});
		},
		bind:function(data, g, algorithm, filterconf, callback){
			var fdata = algorithm.filter(data,filterconf);
			callback(fdata);
			var conf = algorithm.conf(fdata);
			var cdata = algorithm.calc(fdata, g.revert, filterconf.type);
			_this.graph.chart(g, cdata, conf);
			return fdata;
		},
		locale : {
			"decimal": ".",
			"thousands": ",",
			"grouping": [3],
			"currency": ["", "円"],
			"dateTime": "%a %b %e %X %Y",
			"date": "%Y/%m/%d",
			"time": "%H:%M:%S",
			"periods": ["AM", "PM"],
			"days": ["日", "月", "火", "水", "木", "金", "土"],
			"shortDays": ["日", "月", "火", "水", "木", "金", "土"],
			"months": ["01月", "02月", "03月", "04月", "05月", "06月", "07月", "08月", "09月", "10月", "11月", "12月"],
			"shortMonths": ["01月", "02月", "03月", "04月", "05月", "06月", "07月", "08月", "09月", "10月", "11月", "12月"]
		}
	};
	
	return _this;
}(hauteclaire);