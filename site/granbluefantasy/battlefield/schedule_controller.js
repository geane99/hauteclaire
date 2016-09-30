hauteclaire = function(_this){
	_this.battlefield = {
		label : {
			north : "north",
			west : "west",
			east : "east",
			south : "south"
		},
		grouping : {
			findByArea : function(area, data, revert){
				var r = new Array();
				//x : time
				//y : score
				data.forEach(function(element,idx, array){
					if(revert)
						r.push({y:Date.parse(element.time), x:element[area]});
					else
						r.push({x:Date.parse(element.time), y:element[area]});
				});
				return r;
			},
			aggregateByDaily : function(data, revert){
				var result = new Array();
				var aggregate = function(array, target, data){
					array.push({
						key: _this.battlefield.label[target],
						values : _this.battlefield.grouping.findByArea(target,data,revert)
					});
				};
				aggregate(result,"north",data);
				aggregate(result,"south",data);
				aggregate(result,"east",data);
				aggregate(result,"west",data);
				return result;
			},
			aggregateByTeam : function(data){
				
			}
		},
		algorithm : [
			{ name : '1日目', run : function(data, revert){
				return _this.battlefield.grouping.aggregateByDaily(data.round1.data, revert);
			} },
			{ name : '2日目', run : function(data, revert){
				return _this.battlefield.grouping.aggregateByDaily(data.round2.data, revert);
			} },
			{ name : '3日目', run : function(data, revert){
				return _this.battlefield.grouping.aggregateByDaily(data.round3.data, revert);
			} },
			{ name : '4日目', run : function(data, revert){
				return _this.battlefield.grouping.aggregateByDaily(data.round4.data, revert);
			} },
			{ name : '5日目', run : function(data, revert){
				return _this.battlefield.grouping.aggregateByDaily(data.round5.data, revert);
			} }
		],
		schedules : [
			{
				name:'2015年12月度',
				bookmaker:'./granbluefantasy/battlefield/data/bookmaker_201512.json',
				hightscore:'./granbluefantasy/battlefield/data/highscore_201512.json'
			}
		]
	};
	return _this;
}(hauteclaire);