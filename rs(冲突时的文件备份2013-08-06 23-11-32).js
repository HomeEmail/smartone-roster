// JavaScript Document
var RS=RS||{};
RS.App=RS.App||{};
RS.App=(function(){
	var wt=function wt(str){
		document.write(str);
	};
	var wl=function wl(str){
		document.writeln(str);
	};
	var getQueryString=function getQueryString(name){    
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");   
		var r = window.location.search.substr(1).match(reg);    
		if (r != null) 
			return unescape(r[2]); 
		return null;    
	};
	var getFullMonth=function getFullMonth(monthStr){
		var length=monthStr.toString().length;
		if(length==1)
			return '0'+monthStr.toString();
		return monthStr.toString();
	};
	var dt='';//url para value(year month), default current;
	var teams=new Array();
	/*****get url para dt value**********/
	var getdt=function getdt(){
		dt=getQueryString('dt')||(new Date().getFullYear()).toString()+getFullMonth(new Date().getMonth()+1);
		return dt;
	};
	/*****get month english shorthand**********/
	var getMonthEn=function getMonthEn(month){
		var m=new Array('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
		return m[month-1]||m[new Date().getMonth()];
		
	};
	/*****get week english shorthand*************/
	var getWeekEn=function getWeekEn(week){
		var w=new Array('Sun','Mon','Tues','Wed','Thur','Fri','Sat');
		return w[week]||w[new Date().getDay()];
	}
	/*****get all team list*************/
	var getTeams=function getTeams(){
		new Ajax.Request('teams.json', { 
			method: 'post',
			onSuccess: function(tran) {
				//alert(tran.responseJSON[0].tid+' '+tran.responseJSON.length);
				teams=tran.responseJSON;
				console.log('success to load teams.json');
				teamSelect();
			},
			onFailure: function(tran) {
				console.log('oh! loading team error');
				alert('oh! loading team error');	
			}
		});
	};
	var totalTeamNum=0;
	var teamSelect=function teamSelect(){
		var html='<option value="-1">All Teams</option>';
		for(var i=0;i<teams.length;i++){
			html+='<option value="'+teams[i].tid+'">'+teams[i].name+'</option>';
		}
		$('teamFilter').update(html);
		console.log('success to print team select option');
		totalTeamNum=0;
		getRoster(teams[totalTeamNum].tid);
	};
	var rosters=new Array();//存放例如20130203-1.json的結果
	var tidOK=new Array();//存放加載roster成功的team id
	var getRoster=function getRoster(tid){
		totalTeamNum++;
		var path='';
		path=getdt()+'-'+tid.toString()+'.json';
		new Ajax.Request(path, { 
			method: 'post',
			onSuccess: function(tran) {
				rosters.push(tran.responseJSON);
				tidOK.push(teams[totalTeamNum-1]);
				console.log(path+' success to load.');
				if(totalTeamNum<teams.length&&totalTeamNum>=0){
					getRoster(teams[totalTeamNum].tid);
				} else {
					showRoster();
				}
			},
			onFailure: function(tran) {
				console.log(path+' failed to load.');
				if(totalTeamNum<teams.length&&totalTeamNum>=0){
					getRoster(teams[totalTeamNum].tid);
				} else {
					showRoster();
				}
			}
		});
	};
	var showRoster=function showRoster(){
		console.log('success to load '+rosters.length+' roster json file');
		var html='';
		for(var i=0; i<rosters.length; i++){
			/***team phone*****/
			var tphoneStr='';
			var tphone=tidOK[i].phone.split(',');
			for(var jphone=0; jphone<tphone.length; jphone++){ 
				tphoneStr+=' <a href="tel:'+tphone[jphone]+'">'+tphone[jphone]+'</a>';
			}
			/*****shift list*************/
			var shiftStr='';
			var shiftArray=rosters[i].team.shift;
			for(var jshift=0;jshift<shiftArray.length;jshift++){
				var dutyStr=shiftArray[jshift].duty||'-';
				shiftStr+='<li>'+dutyStr+'： '+shiftArray[jshift].desc+' </li>';	
			}
			/*****member List string*******/
			var memberListStr='';
			var memberArray=rosters[i].user;
			/*****把team分組，每組8人********/
			var memberGroupNum=Math.ceil(memberArray.length/8);
			for(var jmemGroup=0; jmemGroup<memberGroupNum; jmemGroup++){
				memberListStr+='<div class="dutyDay" style="color:red;">'+tidOK[i].name.substring(0,11)+'<br/>'+tphoneStr+'</div>';
				var memGroupItem=memberArray.slice(jmemGroup*8,jmemGroup*8+8);
				for(var kmemGroup=0; kmemGroup<memGroupItem.length; kmemGroup++){
					memberListStr+=	'<div class="dutyStatus"><a href="tel:'+memGroupItem[kmemGroup].phone+'">'+memGroupItem[kmemGroup].name+'</a></div>';
				}
			}
			/*****dutyday list string*******/
			var dutyListStr='';
			var dutyListH=memberGroupNum*38+memberArray.length*30+5;//列表高度
			var dutyDays=rosters[i].user[0].dayduty.length;//本月天數
			var dutyListW=dutyDays*40;//列表寬度
			var daydutyListStr='';
			var daydutyArray;
			for(var jduty=0; jduty<dutyDays; jduty++){
				var currentDate=rosters[i].user[0].dayduty[jduty].day;
				//轉換日期格式2013-02-22 to 2013/02/22
				currentDate=currentDate.replace(/-/g,'/');
				currentDate=new Date(currentDate);
				
				daydutyListStr+='<li>';
				for(var jmemGroup=0; jmemGroup<memberGroupNum; jmemGroup++){
					daydutyListStr+='<span class="dutyDay">'+getWeekEn(currentDate.getDay())+'<br/>'+(jduty+1)+'</span>';
					var memGroupItem=memberArray.slice(jmemGroup*8,jmemGroup*8+8);
					for(var kmemGroup=0; kmemGroup<memGroupItem.length; kmemGroup++){
						var dutyStatusStr=memGroupItem[kmemGroup].dayduty[jduty].duty||'-';
						daydutyListStr+='<span class="dutyStatus">'+dutyStatusStr+'</span>';
					}
				}
				daydutyListStr+='</li>';
			}
			dutyListStr+='<div id="wrapper'+tidOK[i].tid+'" class="wrapper" style="height:'+dutyListH+'px;">'+
							'<div class="scroller" style="width:'+dutyListW+'px;">'+
								'<ul class="dutyList">'+daydutyListStr+
								'</ul>'+
							'</div>'+
						'</div>';		
			
		/*****輸出字符串******/	
		html+='<li id="teamList-'+tidOK[i].tid+'">'+
        		'<table width="100%" border="0" cellpadding="0" cellspacing="0">'+
					'<tbody>'+
						'<tr>'+
							'<td colspan="2" valign="top" style="border-bottom:1px #ccc solid;">'+
								'<div class="shift">'+
									'<div style="text-align:center;">'+
									'<span class="shift-teamName">'+tidOK[i].name+tphoneStr+'</span>'+
									'<button class="button shift-bt" onClick="javascript:showShift(this)">&or;</button></div>'+
									'<ul class="shift-list" style="display:none;">'+shiftStr+
									'</ul>'+
								'</div>'+
							'</td>'+
						'</tr>'+
						'<tr>'+
							'<td style="width:100px;" align="right" valign="top">'+
								'<div class="memberList" style="padding-bottom:5px;">'+memberListStr+
								'</div>'+
							'</td>'+
							'<td valign="top">'+dutyListStr+
							'</td>'+
						'</tr>'+
					'</tbody>'+
				'</table>'+
			'</li>';
		}
		$('teamList').update(html);
		createJs();/***creat and excu js **********/
	};
	var createJs=function createJs(){
		/***creat and excu js **********/
		var jsStr='';
		for(var tidCount=0; tidCount<tidOK.length; tidCount++){
			jsStr+='var myScroll'+tidOK[tidCount].tid+';';
			jsStr+='myScroll'+tidOK[tidCount].tid+' = new iScroll(\'wrapper'+tidOK[tidCount].tid+'\');';
		}
		document.write('<script>'+jsStr+'<\/script>');
	};
	var setFooter=function setFooter(){
		var html='';
		var monthPara=parseInt(getdt().substring(4));
		var yearPara=parseInt(getdt().substring(0,4));
		var nextMonth=0,nextYear=0;
		var lastMonth=0,lastYear=0;
		if(monthPara+1>12){
			nextMonth=1;
			nextYear=yearPara+1;
		} else {
			nextMonth=monthPara+1;
			nextYear=yearPara;
		}
		if(monthPara-1<1){
			lastMonth=12;
			lastYear=yearPara-1;
		} else {
			lastMonth=monthPara-1;
			lastYear=yearPara;
		}
		html+='<a href="?dt='+lastYear.toString()+getFullMonth(lastMonth.toString())+'"> <<< </a>';
		html+='<span>'+getMonthEn(monthPara)+' '+yearPara+'</span>';
		html+='<a href="?dt='+nextYear.toString()+getFullMonth(nextMonth.toString())+'"> >>> </a>';
		$('footer').update(html);
		console.log('success to print footer');
	};
	return{
		init:function init(){
			console.log('RS.App.init...');
			//console.log(getdt());
			//console.log(getMonthEn(9));
			setFooter();
			getTeams();	
		}
	}
}());
