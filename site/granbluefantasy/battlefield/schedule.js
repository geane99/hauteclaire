hauteclaire = function(_this){
	var OperationBuilder = function(){
		this._set = function(name, value){
			return localStorage.setItem(name, value);
		};
		this._get = function(name){
			var r = localStorage.getItem(name);
			return r;
		};
		this.properties = new Array();
		this.defineAccessor = function(name, targets){
			var _t = this;
			this.__defineGetter__(name, function(){
				return this._get(name);
			});
			this.__defineSetter__(name, function(val){
				return this._set(name, val);
			});
			this.properties.push(name);
		};
		this.build = function(){
		};
		this.save = function(t){
			var _t = this;
			var prop = t.properties ? t : _t;
			prop.properties.forEach(function(name){
				if(t[name])
					_t[name] = t[name];
				else
					_t[name] = "";
			});
		};
		this.load = function(t){
			return this.save.apply(t, [this]);
		};
	};
	
	var operationBookmaker = new OperationBuilder();
	operationBookmaker.build = function(){
		this.defineAccessor("bookmakerGraphType");
		this.defineAccessor("bookmakerStartDate");
		this.defineAccessor("bookmakerEndDate");
	};
	operationBookmaker.build();
	
	var operationBookmakerArea = new OperationBuilder();
	operationBookmakerArea.build = function(){
		this.defineAccessor("bookmakerAreaGraphType");
		this.defineAccessor("bookmakerAreaStartDate");
		this.defineAccessor("bookmakerAreaEndDate");
	};
	operationBookmakerArea.build();
	
	var operationQualifying = new OperationBuilder();
	operationQualifying.build = function(){
		this.defineAccessor("qualifyingStartDate");
		this.defineAccessor("qualifyingStartDatetime");
		this.defineAccessor("qualifyingEndDate");
		this.defineAccessor("qualifyingEndDatetime");
	};
	operationQualifying.build();
	
	var operationRanking = new OperationBuilder();
	operationRanking.build = function(){
		this.defineAccessor("rankingStartDate");
		this.defineAccessor("rankingStartDatetime");
		this.defineAccessor("rankingEndDate");
		this.defineAccessor("rankingEndDatetime");
	};
	operationRanking.build();
			
	_this.operation = {
		bookmaker : operationBookmaker,
		bookmakerArea : operationBookmakerArea,
		qualifying:operationQualifying,
		ranking:operationRanking
	};
	return _this;
}(hauteclaire);

hauteclaire = function(_this){
	_this.viewer = {
		graph : {
			dailyLine : {
				method : "lineChart", 
				revert : false,
				options : {
					clamp : true,
					useInteractiveGuideline: true
				},
				spec:function(nv,d3,chart){
				},
				xAxis:function(nv, d3, chart, xAxis, conf){
					xAxis
						.axisLabel("日時")
						.domain([this.startDate,this.endDate])
						.tickFormat(function(val){
							return d3.time.format("%H:%M")(new Date(val));
						})
						;//.ticks(d3.time.minute, 1);
				},
				yAxis:function(nv, d3, chart, yAxis, conf){
					yAxis
						.axisLabel("スコア(1 / 100,000,000)")
						.tickFormat(d3.format(",.2f"));
				}
			},
			ndaysLine : { 
				method : "lineChart", 
				revert : false,
				options : {
					clamp : true,
					useInteractiveGuideline: true
				},
				spec:function(nv,d3,chart){
				},
				xAxis:function(nv, d3, chart, xAxis,conf){
					xAxis
						.axisLabel("日時")
						.domain([conf.startDate,conf.endDate])
						.tickFormat(function(val){
							return d3.time.format("%m/%d %H:%M")(new Date(val));
						})
						.ticks(d3.time.minute,60);
				},
				yAxis:function(nv, d3, chart, yAxis,conf){
					yAxis
						.axisLabel("スコア(1 / 10,000)")
						.tickFormat(d3.format(",.2f"));
				}
			}
		}
	};
	return _this;
}(hauteclaire);

hauteclaire = function(_this){
	_this.label = {
		north : "north",
		north_acceleration : "north(速度)",
		west : "west",
		west_acceleration : "west(速度)",
		east : "east",
		east_acceleration : "east(速度)",
		south : "south",
		south_acceleration : "south(速度)",
		ranking1000 : "1000位",
		ranking3000 : "3000位",
		ranking20000 : "20000位",
		qualifying120 : "予選120位",
		qualifying2400 : "予選2400位",
		qualifying3000 : "予選3000位",
		seed120 : "シード120位",
		seed660 : "シード660位"
	};
	return _this;
}(hauteclaire);

hauteclaire = function(_this){
	_this.calc = {
		to2dimension : function(key, data, revert, round){
			var r = new Array();
			
			rounding = function(val){
				if(round != null && round > 0)
					return parseInt(val) / round;
				return parseInt(val);
			};
			
			//x : time
			//y : score
			data.forEach(function(element,idx, array){
				if(revert)
					r.push({y:_this.util.stringToDatetime(element.time), x:rounding(element[key])});
				else
					r.push({x:_this.util.stringToDatetime(element.time), y:rounding(element[key])});
			});
			return r;
		},
		bookmaker : {
			correct : function(data){
				var bookmakerTerm = 20;
				
				var score = data.score;
				if(score.length == 0)
					return data;
				
				var keys = ["east","west","south","north"];
				keys.maxValue = function(val){
					return Math.max.apply(null, this.map(function(elem){
						return parseInt(val[elem]);
					}));
				};
				keys.toNumber = function(val){
					return parseInt(val);
				};
				var cscore = [];
				//generate fake data
				if(score.length > 1){
					accelertor = function(before,after,gapTotal,term){
						var acceleration = after - before;
						return Math.round(before + ((acceleration * term) / gapTotal));
					};
					score.forEach(function(element, idx, array){
						if(idx > 0){
							before = array[idx-1];
							bdate = _this.util.stringToDatetime(before.time);
							ndate = _this.util.stringToDatetime(element.time);
							gapMillsec = ndate - bdate;
							gapMinutes = gapMillsec / 1000 / 60;
							gapTerm = (gapMinutes / bookmakerTerm) -1;
							acceleratorKeys = [];
							keys.forEach(function(key,idx,array){
								acceleratorKeys[key] = accelertor.bind(null,keys.toNumber(before[key]), keys.toNumber(element[key]), gapTerm+1);
							});
							if(gapTerm > 0){
								for(var i=1; i<=gapTerm; i++){
									gdate = _this.util.integerToDate(bdate + (i*1000*60*bookmakerTerm));
									generated = {};
									keys.forEach(function(key,idx,array){
										generated[key] = acceleratorKeys[key](i);
									});
									generated.time = _this.util.datetimeToString(gdate);
									generated.isFake = true;
									cscore.push(generated);
								}
							}
						}
						cscore.push(element);
					});
				}

				cscore.forEach(function(element,idx, array){
					var maxValue = keys.maxValue(element);
					keys.forEach(function(key,i,ar){
						//calc top gap
						var xVal = keys.toNumber(element[key]);
						element[key+"_gap"] = maxValue - xVal;
						if(element[key+"_gap"] != 0)
							element[key+"_gap"] *= -1;
						
						//calc acceleration
						if(idx > 0)
							element[key+"_acceleration"] = xVal - keys.toNumber(array[idx-1][key]);
						else
							element[key+"_acceleration"] = 0;
					});
					if(!element.isFake)
						element.isFake = false;
				});
				data.score = cscore;
				return data;
			},
			filter :function(data,conf){
				var strstart = conf.datetime + " "+conf.from;
				var strend = null;
				if(conf.to != "00:00" && conf.to != "0:00" && conf.to != "0:0")
					strend = conf.datetime + " "+conf.to;
				else
					strend = _this.util.nextDateByStringDate(conf.datetime) + " "+conf.to
					
				var start = _this.util.stringToDatetime(strstart);
				var end = _this.util.stringToDatetime(strend);
				
				var r = [];
				data.score.forEach(function(element,idx,array){
					var target = _this.util.stringToDatetime(element.time);
					if(start <= target && target <= end)
						r.push(element);
				});
				data.score = r;
				return data;
			},
			aggregateDay : function(data, revert, keys, rounding){
				var result = new Array();
				var aggregate = function(array, target, data){
					array.push({
						key: _this.label[target],
						values : _this.calc.to2dimension(target,data,revert,rounding)
					});
				};
				keys.forEach(function(element,idx,array){
					aggregate(result,element,data);
				});
				return result;
			},
			aggregateArea : function(area, dataArray, revert){
				rounds = dataArray.filter(function(e){ return e!=null && e.score != null && e.score.length > 0});
				var result = new Array();
				if(rounds.length == 0)
					return result;
				rounds.forEach(function(each,index,array){
					each.score.forEach(function(e,idx,ar){
						spdate = e.time.split(" ");
						if(idx+1 == ar.length && spdate[1] == "00:00:00")
							e.time = _this.util.nextDateByStringDate(rounds[0].datetime) + " 00:00:00";
						else
							e.time = rounds[0].datetime + " "+spdate[1];
					});
					
					result.push({
						key: (index+1)+"日目",
						values : _this.calc.to2dimension(area,each.score,revert,100000000)
					});
				});
				return result;
			},
			createAlgorithm :function(conf){
				return {
					name : conf.name,
					type:conf.type,
					graph : conf.graph,
					conf:function(data){
						if(data!=null){
							scores = this.select(data).score;
							if(scores != null && scores.length > 0){
								conf.startDate = _this.util.stringToDatetime(scores[0].time);
								conf.endDate = _this.util.stringToDatetime(scores[scores.length-1].time);
							}
						}
						return conf;
					},
					calc : function(data, revert, type){
						if(type == "total" || type == null)
							return _this.calc.bookmaker.aggregateDay(conf.selectRound(data).score, revert, ["east","west","south","north"],100000000);
						else if(type == "acceleration")
							return _this.calc.bookmaker.aggregateDay(conf.selectRound(data).score, revert, ["east_acceleration","west_acceleration","south_acceleration","north_acceleration"],100000000);
					},
					correct:function(data){
						var r = _this.calc.bookmaker.correct(conf.selectRound(data));
						conf.updateRound(data,r);
						return data;
					},
					select:function(data){
						return conf.selectRound(data);
					},
					filter:function(data,filterconf){
						filterconf.datetime = conf.selectRound(data).datetime;
						var r = _this.calc.bookmaker.filter(conf.selectRound(data),filterconf);
						conf.updateRound(data,r);
						return data;
					}
				};
			},
			createAreaAlgorithm:function(conf){
				return {
					name : conf.name,
					type:conf.type,
					graph : conf.graph,
					conf:function(data){
						if(data!=null){
							scores = data.round1.score;
							if(scores != null && scores.length > 0){
								conf.startDate = _this.util.stringToDatetime(scores[0].time);
								conf.endDate = _this.util.stringToDatetime(scores[scores.length-1].time);
							}
						}
						return conf;
					},
					correct:function(data){
						["round1","round2","round3","round4","round5"].forEach(function(element,idx,array){
							data[element] = _this.calc.bookmaker.correct(data[element]);
						});
						return data;
					},
					calc : function(data, revert, type){
						var area = null;
						if(type == "total" || type == null)
							area = conf.area;
						else if(type == "acceleration")
							area = conf.area + "_acceleration";
						return _this.calc.bookmaker.aggregateArea(area, [data.round1,data.round2,data.round3,data.round4,data.round5], revert);
					},
					select:function(data){
						["round1","round2","round3","round4","round5"].forEach(function(element,idx,array){
							data[element] = _this.calc.bookmaker.correct(data[element]);
						});
						return data;
					},
					filter:function(data,filterconf){
						filterconf.datetime = data.round1.datetime;
						["round1","round2","round3","round4","round5"].forEach(function(element,idx,array){
							data[element] = _this.calc.bookmaker.filter(data[element],filterconf);
						});
						return data;
					}
				}
			}
		},
		ranking : {
			aggregateTotal :function(data, revert){
				var result = [];
				var aggregate = function(array, target, data){
					array.push({
						key: _this.label[target],
						values : _this.calc.to2dimension(target,data,revert,100000)
					});
				};
				aggregate(result,"ranking1000", data);
				aggregate(result,"ranking3000", data);
				aggregate(result,"ranking20000", data);
				return result;
			},
			filter:function(data,filterconf){
				var start = _this.util.stringToDatetime(filterconf.fromDate + " "+filterconf.fromTime);
				var end = _this.util.stringToDatetime(filterconf.toDate + " "+filterconf.toTime);
				
				var r = [];
				data.score.forEach(function(element,idx,array){
					var target = _this.util.stringToDatetime(element.time);
					if(start <= target && target <= end)
						r.push(element);
				});
				return r;
			},
			createAlgorithm :function(conf){
				return {
					name : conf.name,
					type:conf.type,
					graph : conf.graph,
					conf:function(data){
						if(data!=null){
							scores = this.select(data);
							if(scores != null && scores.length > 0){
								conf.startDate = _this.util.stringToDatetime(scores[0].time);
								conf.endDate = _this.util.stringToDatetime(scores[scores.length-1].time);
							}
						}
						return conf;
					},
					correct:function(data){
						return data;
					},
					calc : function(data, revert, type){
						return _this.calc.ranking.aggregateTotal(data.score, revert);
					},
					select:function(data){
						return data.score;
					},
					filter:function(data,filterconf){
						data.score = _this.calc.ranking.filter(data, filterconf);
						return data;
					}
				}
			},
			search:{
				cache : [],
				config : [
					{ "key" : "name", "label" : "名前" },
					{ "key" : "level", "label" :"ランク" },
					{ "key" : "defeat", "label" : "討伐数" },
					{ "key" : "point", "label" : "スコア" },
					{ "key" : "rank", "label" : "順位" },
					{ "key" : "user_id", "label" : "ID" }
				],
				operator : [
					{ "key" : "equals", "label" : "一致", "test" : function(was,expect){ return was == expect; } },
					{ "key" : "contains", "label" : "含む", "test" : function(was,expect){ return was.indexOf(expect) > 0; } },
					{ "key" : "greaterThan", "label" : "より大きい", "test" :function(was, expect){ return parseInt(was) > parseInt(expect); } },
					{ "key" : "greaterThanEquals", "label" : "以上", "test" : function(was, expect){ return parseint(was) >= parseInt(expect); } },
 					{ "key" : "lessThan", "label" :"未満", "test" :function(was,expect){ return parseInt(was) <= parseInt(expect); } },
					{ "key" : "lessThanEquals", "label" : "以下", "test" : function(was,expect){ return parseInt(was) < parseInt(expect); } }
				],
				condition : function(conditionarray, and){
					var exec = function(was, expect, test){
						try{
							return test(was,expect);
						}
						catch(error){
							return false;
						}
					};
					return function(element){
						var r = null;
						conditionarray.forEach(function(each,idx,array){
							var eachr = exec(element[each.condition.key], each.value, each.operator.test);
							if(r == null){
								r = eachr
							}
							else{
								if(and)
									r &= eachr;
								else
									r |= eachr;
							}
						});
						return r;
					};
				},
				idSearch : function(id, url, callback){
					var condition = {
						condition : this.config[5],
						operator : this.operator[0],
						value : id
					};
					this.simple([condition], url, callback);
				},
				simple : function(conditionarray, url, callback){
					var tester = this.condition(conditionarray, true);
					return this._exec(tester, url, callback);
				},
				_exec : function(filter,path, callback){
					var _s = function(data){
						var r = [];
						data.forEach(function(element,idx,array){
							if(filter(element))
								r.push(element);
						});
						return r;
					};
					var _t = this;
					if(this.cache.length == 0){
						var uuid = _this.UUID.generate(1);
						_this.util.load(this, uuid, [{ url : path, process : function(serverData){ 
							_t.cache = serverData;
							var r = _s(serverData);
							callback(r, false);
						}}], function(){});
					}
					else{
						var r = _s(this.cache);
						callback(r, true);
					}
				}
			}
		},
		qualifying : {
			aggregateTotal : function(data, revert){
				if(data == null || data.length == 0)
					return [];
				var result = [];
				var aggregate = function(array, target, data){
					array.push({
						key: _this.label[target],
						values : _this.calc.to2dimension(target,data,revert,100000)
					});
				};
				aggregate(result,"qualifying120", data);
				aggregate(result,"qualifying3000", data);
				aggregate(result,"seed120", data);
				aggregate(result,"seed660", data);
				return result;
			},
			filter:function(data,filterconf){
				var start = _this.util.stringToDatetime(filterconf.fromDate + " "+filterconf.fromTime);
				var end = _this.util.stringToDatetime(filterconf.toDate + " "+filterconf.toTime);
				
				var r = [];
				data.score.forEach(function(element,idx,array){
					var target = _this.util.stringToDatetime(element.time);
					if(start <= target && target <= end)
						r.push(element);
				});
				return r;
			},
			createAlgorithm:function(conf){
				return {
					name : conf.name,
					type:conf.type,
					graph : conf.graph,
					conf:function(data){
						if(data!=null){
							scores = this.select(data);
							if(scores != null && scores.length > 0){
								conf.startDate = _this.util.stringToDatetime(scores[0].time);
								conf.endDate = _this.util.stringToDatetime(scores[scores.length-1].time);
							}
						}
						return conf;
					},
					correct:function(data){
						return data;
					},
					calc : function(data, revert, type){
						return _this.calc.qualifying.aggregateTotal(data.score, revert);
					},
					select:function(data){
						return data.score;
					},
					filter:function(data,filterconf){
						data.score = _this.calc.qualifying.filter(data, filterconf);
						return data;
					}
				}
			}
		}
	};
	return _this;
}(hauteclaire);	
	
hauteclaire = function(_this){
	_this.algorithm = {
		types : [
			{id : "bookmaker", name:"ブックメーカー"},
			{id : "qualifying", name:"予選ランキング"},
			{id : "ranking", name:"個人ランキング"}
		],
		bookmaker: [
			_this.calc.bookmaker.createAlgorithm({
				name : '1日目',
				type:"bookmaker",
				graph : _this.viewer.graph.dailyLine,
				selectRound : function(data){
					return data.round1;
				},
				updateRound :function(data,round){
					data.round1 = round;
				}
			}),
			_this.calc.bookmaker.createAlgorithm({
				name : '2日目',
				type:"bookmaker",
				graph : _this.viewer.graph.dailyLine,
				selectRound : function(data){
					return data.round2;
				},
				updateRound :function(data,round){
					data.round2 = round;
				}
			}),
			_this.calc.bookmaker.createAlgorithm({
				name : '3日目',
				type:"bookmaker",
				graph : _this.viewer.graph.dailyLine,
				selectRound : function(data){
					return data.round3;
				},
				updateRound :function(data,round){
					data.round3 = round;
				}
			}),
			_this.calc.bookmaker.createAlgorithm({
				name : '4日目',
				type:"bookmaker",
				graph : _this.viewer.graph.dailyLine,
				selectRound : function(data){
					return data.round4;
				},
				updateRound :function(data,round){
					data.round4 = round;
				}
			}),
			_this.calc.bookmaker.createAlgorithm({
				name : '5日目',
				type:"bookmaker",
				graph : _this.viewer.graph.dailyLine,
				selectRound : function(data){
					return data.round5;
				},
				updateRound :function(data,round){
					data.round5 = round;
				}
			}),
			_this.calc.bookmaker.createAreaAlgorithm({
				name : 'east',
				area : 'east',
				type:"bookmaker_area",
				graph : _this.viewer.graph.dailyLine
			}),
			_this.calc.bookmaker.createAreaAlgorithm({
				name : 'west',
				area : 'west',
				type:"bookmaker_area",
				graph : _this.viewer.graph.dailyLine
			}),
			_this.calc.bookmaker.createAreaAlgorithm({
				name : 'south',
				area : 'south',
				type:"bookmaker_area",
				graph : _this.viewer.graph.dailyLine
			}),
			_this.calc.bookmaker.createAreaAlgorithm({
				name : 'north',
				area : 'north',
				type:"bookmaker_area",
				graph : _this.viewer.graph.dailyLine
			}),			
		],
		qualifying : [
			_this.calc.qualifying.createAlgorithm({
				name : 'トータルスコア',
				type:"qualifying",
				graph : _this.viewer.graph.ndaysLine
			})
		],
		ranking:[
			_this.calc.ranking.createAlgorithm({
				name : 'トータルスコア',
				type:"ranking",
				graph : _this.viewer.graph.ndaysLine
			})
		]
	};
	return _this;
}(hauteclaire);
	
hauteclaire = function(_this){
	_this.schedules = [
		{
			name:'2016年12月',
			bookmaker:'./granbluefantasy/battlefield/data/bookmaker_26.json',
			ranking:'./granbluefantasy/battlefield/data/ranking_26.json',
			qualifying:'./granbluefantasy/battlefield/data/qualifying_26.json',
			rankingAll:'./granbluefantasy/battlefield/data/ranking_all_26.json'
		},
		{
			name:'2017年01月',
			bookmaker:'./granbluefantasy/battlefield/data/bookmaker_27.json',
			ranking:'./granbluefantasy/battlefield/data/ranking_27.json',
			qualifying:'./granbluefantasy/battlefield/data/qualifying_27.json',
			rankingAll:'./granbluefantasy/battlefield/data/ranking_all_27.json'
		}
	];
	return _this;
}(hauteclaire);