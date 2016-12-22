hauteclaire = function(_this){
	_this.viewer = {
		graph : {
			dailyLine : {
				init : function(startd,endd){
					this.startDate = startd;
					this.endDate = endd;
				},
				method : "lineChart", 
				revert : false,
				options : {
					clamp : true,
					useInteractiveGuideline: true
				},
				spec:function(nv,d3,chart){
				},
				xAxis:function(nv, d3, chart, xAxis){
					xAxis
						.axisLabel("日時")
						.domain([this.startDate,this.endDate])
						.tickFormat(function(val){
							return d3.time.format("%H:%M")(new Date(val));
						})
						;//.ticks(d3.time.minute, 1);
				},
				yAxis:function(nv, d3, chart, yAxis){
					yAxis
						.axisLabel("スコア(1 / 100,000,000)")
						.tickFormat(d3.format(",.2f"));
				}
			},
			ndaysLine : { 
				init : function(startd,endd){
					this.startDate = startd;
					this.end_date = endd;
				},
				method : "lineChart", 
				revert : false,
				options : {
					clamp : true,
					useInteractiveGuideline: true
				},
				spec:function(nv,d3,chart){
				},
				xAxis:function(nv, d3, chart, xAxis){
					xAxis
						.axisLabel("日時")
						.domain([this.startDate,this.endDate])
						.tickFormat(function(val){
							return d3.time.format("%m/%d %H:%M")(new Date(val));
						})
						.ticks(d3.time.minute,60);
				},
				yAxis:function(nv, d3, chart, yAxis){
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
	_this.battlefield = {
		label : {
			north : "north",
			west : "west",
			east : "east",
			south : "south",
			ranking1000 : "1000位",
			ranking3000 : "3000位",
			ranking20000 : "20000位",
			qualifying120 : "予選1200位",
			qualifying2400 : "予選2400位",
			seed120 : "シード120位",
			seed660 : "シード660位"
		},
		grouping : {
			findByArea : function(area, data, revert, round){
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
						r.push({y:_this.util.stringToDate(element.time), x:rounding(element[area])});
					else
						r.push({x:_this.util.stringToDate(element.time), y:rounding(element[area])});
				});
				return r;
			},
			aggregateByDaily : function(data, revert){
				var result = new Array();
				var aggregate = function(array, target, data){
					array.push({
						key: _this.battlefield.label[target],
						values : _this.battlefield.grouping.findByArea(target,data,revert,100000000)
					});
				};
				aggregate(result,"north",data);
				aggregate(result,"south",data);
				aggregate(result,"east",data);
				aggregate(result,"west",data);
				return result;
			},
			aggregateByArea : function(area, dataArray, revert){
				rounds = dataArray.filter(function(e){ return e!=null && e.score != null && e.score.length > 0});
				var result = new Array();
				if(rounds.length == 0)
					return result;
				rounds.forEach(function(each,index,array){
					each.score.forEach(function(e,idx,ar){
						spdate = e.time.split(" ");
						if(idx+1 == ar.length && spdate[1] == "00:00:00")
							e.time = rounds[0].datetime + " 23:59:59";
						else
							e.time = rounds[0].datetime + " "+spdate[1];
					});
					
					result.push({
						key: (index+1)+"日目",
						values : _this.battlefield.grouping.findByArea(area,each.score,revert,100000000)
					});
				});
				return result;
			},
			aggregateByTeam : function(data, revert){
				var result = [];
				var aggregate = function(array, target, data){
					array.push({
						key: _this.battlefield.label[target],
						values : _this.battlefield.grouping.findByArea(target,data,revert,100000)
					});
				};
				aggregate(result,"qualifying120", data);
				aggregate(result,"qualifying2400", data);
				aggregate(result,"seed120", data);
				aggregate(result,"seed660", data);
				return result;
			},
			aggregateByIndividual :function(data, revert){
				var result = [];
				var aggregate = function(array, target, data){
					array.push({
						key: _this.battlefield.label[target],
						values : _this.battlefield.grouping.findByArea(target,data,revert,100000)
					});
				};
				aggregate(result,"ranking1000", data);
				aggregate(result,"ranking3000", data);
				aggregate(result,"ranking20000", data);
				return result;
			},
			calcurateDailyBookmaker: function(data){
				var bookmakerTerm = 20;
				
				var score = data.score;
				if(score.length == 0)
					return data;
				
				var keys = Object.keys(data.score[0]);
				keys.some(function(element,idx){
					if(element == "time")
						keys.splice(idx,1);
				});
				var cscore = [];
				//generate fake data
				if(score.length > 1){
					accelertor = function(before,after,gapTotal,term){
						acceleration = after - before;
						return Math.round(before + ((acceleration * term) / gapTotal));
					};
					score.forEach(function(element, idx, array){
						if(idx > 0){
							before = array[idx-1];
							bdate = _this.util.stringToDate(before.time);
							ndate = _this.util.stringToDate(element.time);
							
							gapMillsec = ndate - bdate;
							//        millsec      sec    min
							gapMinutes = gapMillsec / 1000 / 60;
							gapTerm = (gapMinutes / bookmakerTerm) -1;
							
							acceleratorKeys = [];
							keys.forEach(function(key,idx,array){
								acceleratorKeys[key] = accelertor.bind(null,parseInt(before[key]), parseInt(element[key]), gapTerm+1);
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
				//generate acceleration
				if(cscore.length > 1){
					
				}
				
				//calc gap
				cscore.forEach(function(element,idx, array){
					var maxKey = null;
					var maxValue = null;
					keys.forEach(function(key, i, ar){
						if(element[key] > maxValue){
							maxValue = element[key];
							maxKey = key;
						}
					});
					keys.forEach(function(key,i,ar){
						element[key+"_gap"] = (maxValue - element[key]) != 0 ? -1 * (maxValue - element[key]) : 0;
						element[key+"_gap"] = Math.round(element[key]);
					});
					if(!element.isFake)
						element.isFake = false;
				});
				
				data.score = cscore;
				return data;
			}
		},
		algorithm : {
			types : [
				{id : "bookmaker", name:"ブックメーカー"},
				{id : "qualifying", name:"予選ランキング"},
				{id : "ranking", name:"個人ランキング"}
			],
			bookmaker: [{ 
					name : '1日目',
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByDaily(data.round1.score, revert);
					},
					buildGraph : function(data){
						this.graph.init(_this.util.stringToDate(data.round1.start_date), _this.util.stringToDate(data.round1.end_date));
					},
					calc:function(data){
						data.round1 = _this.battlefield.grouping.calcurateDailyBookmaker(data.round1);
						return data;
					},
					round:function(data){
						return data.round1;
					},
					type:"bookmaker"
				},{ 
					name : '2日目', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByDaily(data.round2.score, revert);
					},
					buildGraph : function(data){
						this.graph.init(_this.util.stringToDate(data.round2.start_date), _this.util.stringToDate(data.round2.end_date));
					},
					calc:function(data){
						data.round2 = _this.battlefield.grouping.calcurateDailyBookmaker(data.round2);
						return data;
					},
					round:function(data){
						return data.round2;
					},
					type:"bookmaker"
				},{ 
					name : '3日目', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByDaily(data.round3.score, revert);
					},
					buildGraph : function(data){
						this.graph.init(_this.util.stringToDate(data.round3.start_date), _this.util.stringToDate(data.round3.end_date));
					},
					calc:function(data){
						data.round3 = _this.battlefield.grouping.calcurateDailyBookmaker(data.round3);
						return data;
					},
					round:function(data){
						return data.round3;
					},
					type:"bookmaker"
				},{ 
					name : '4日目', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByDaily(data.round4.score, revert);
					},
					buildGraph : function(data){
						this.graph.init(_this.util.stringToDate(data.round4.start_date), _this.util.stringToDate(data.round4.end_date));
					},
					calc:function(data){
						data.round4 = _this.battlefield.grouping.calcurateDailyBookmaker(data.round4);
						return data;
					},
					round:function(data){
						return data.round4;
					},
					type:"bookmaker"
				},{ 
					name : '5日目', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByDaily(data.round5.score, revert);
					},
					buildGraph : function(data){
						this.graph.init(_this.util.stringToDate(data.round5.datetime+" 07:00:00"), _this.util.stringToDate(data.round5.end_date+" 23:59:59"));
					},
					calc:function(data){
						data.round5 = _this.battlefield.grouping.calcurateDailyBookmaker(data.round5);
						return data;
					},
					round:function(data){
						return data.round5;
					},
					type:"bookmaker"
				}, {
					name : 'east', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByArea("east",[
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round1),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round2),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round3),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round4),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round5)
						], revert);
					},
					buildGraph : function(data){
						this.graph.init(_this.util.stringToDate(data.round1.datetime+" 07:00:00"), _this.util.stringToDate(data.round5.end_date+" 23:59:59"));
					},
					calc:function(data){
						return data;
					},
					round:function(data){
						return data;
					},
					type:"bookmaker_area"
				}, {
					name : 'west', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByArea("west",[
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round1),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round2),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round3),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round4),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round5)
						], revert);
					},
					buildGraph : function(data){
						this.graph.init(_this.util.stringToDate(data.round1.datetime+" 07:00:00"), _this.util.stringToDate(data.round5.end_date+" 23:59:59"));
					},
					calc:function(data){
						return data;
					},
					round:function(data){
						return data;
					},
					type:"bookmaker_area"
				}, {
					name : 'south', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByArea("south",[
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round1),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round2),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round3),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round4),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round5)
						], revert);
					},
					buildGraph : function(data){
						this.graph.init(_this.util.stringToDate(data.round1.datetime+" 07:00:00"), _this.util.stringToDate(data.round5.end_date+" 23:59:59"));
					},
					calc:function(data){
						return data;
					},
					round:function(data){
						return data;
					},
					type:"bookmaker_area"
				}, {
					name : 'north', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByArea("north",[
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round1),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round2),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round3),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round4),
							_this.battlefield.grouping.calcurateDailyBookmaker(data.round5)
						], revert);
					},
					buildGraph : function(data){
						this.graph.init(_this.util.stringToDate(data.round1.datetime+" 07:00:00"), _this.util.stringToDate(data.round5.end_date+" 23:59:59"));
					},
					calc:function(data){
						return data;
					},
					round:function(data){
						return data;
					},
					type:"bookmaker_area"
				}
			],
			qualifying : [{ 
				name : '通算スコア', 
				graph : _this.viewer.graph.ndaysLine,
				type:"qualifying",
				run : function(data, revert){
					return _this.battlefield.grouping.aggregateByTeam(data.score, revert);
				},
				calc:function(data){
					return data;
				},
				buildGraph : function(data){
					this.graph.init(_this.util.stringToDate(data.start_date), _this.util.stringToDate(data.end_date));
			}}],
			ranking:[{ 
				name : '通算スコア', 
				graph : _this.viewer.graph.ndaysLine,
				type:"ranking",
				run : function(data, revert){
					return _this.battlefield.grouping.aggregateByIndividual(data.score, revert);
				},
				calc:function(data){
					return data;
				},
				buildGraph : function(data){
					this.graph.init(_this.util.stringToDate(data.start_date), _this.util.stringToDate(data.end_date));
			}}]
		},
		schedules : [
			{
				name:'2016年12月',
				bookmaker:'./granbluefantasy/battlefield/data/bookmaker_26.json',
				ranking:'./granbluefantasy/battlefield/data/ranking_26.json',
				qualifying:'./granbluefantasy/battlefield/data/qualifying_26.json'
			}
		]
	};
	return _this;
}(hauteclaire);