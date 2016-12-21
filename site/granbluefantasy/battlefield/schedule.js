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
						r.push({y:Date.parse(element.time), x:rounding(element[area])});
					else
						r.push({x:Date.parse(element.time), y:rounding(element[area])});
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
						this.graph.init(Date.parse(data.round1.start_date), Date.parse(data.round1.end_date));
					}
				},{ 
					name : '2日目', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByDaily(data.round2.score, revert);
					},
					buildGraph : function(data){
						this.graph.init(Date.parse(data.round2.start_date), Date.parse(data.round2.end_date));
					}
				},{ 
					name : '3日目', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByDaily(data.round3.score, revert);
					},
					buildGraph : function(data){
						this.graph.init(Date.parse(data.round3.start_date), Date.parse(data.round3.end_date));
					}
				},{ 
					name : '4日目', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByDaily(data.round4.score, revert);
					},
					buildGraph : function(data){
						this.graph.init(Date.parse(data.round4.start_date), Date.parse(data.round4.end_date));
					}
				},{ 
					name : '5日目', 
					graph : _this.viewer.graph.dailyLine,
					run : function(data, revert){
						return _this.battlefield.grouping.aggregateByDaily(data.round5.score, revert);
					},
					buildGraph : function(data){
						this.graph.init(Date.parse(data.round5.datetime+" 07:00:00"), Date.parse(data.round5.end_date+" 23:59:59"));
					}
			}],
			qualifying : [{ 
				name : '通算スコア', 
				graph : _this.viewer.graph.ndaysLine,
				run : function(data, revert){
					return _this.battlefield.grouping.aggregateByTeam(data.score, revert);
				},
				buildGraph : function(data){
					this.graph.init(Date.parse(data.start_date), Date.parse(data.end_date));
			}}],
			ranking:[{ 
				name : '通算スコア', 
				graph : _this.viewer.graph.ndaysLine,
				run : function(data, revert){
					return _this.battlefield.grouping.aggregateByIndividual(data.score, revert);
				},
				buildGraph : function(data){
					this.graph.init(Date.parse(data.start_date), Date.parse(data.end_date));
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