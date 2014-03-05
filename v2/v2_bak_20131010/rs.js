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
		//console.log(r);  
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
		var w=new Array('Sun','Mon','Tue','Wed','Thu','Fri','Sat');
		return w[week]||w[new Date().getDay()];
	}
	/*****check weekend******/
	var isWeekend=function isWeekend(date){
		if(date instanceof Date){
			if(date.getDay()==0||date.getDay()==6)
				return true;
			else
				return false;
		} 
		return false;	
	}
	/****check public holiday******/
	var isPH=function isPH(date){
		if(date instanceof Date){
			for(var i=0,len=aPH.length; i<len; i++){
				var phListItem=aPH[i].replace(/-/g,'/');
				var phListItem=new Date(phListItem);
				if(date.toDateString() == phListItem.toDateString())
					return true;
			}
			return false;
		}
		return false;
	}
	/******loading tip****************/
	var loadPercent=0;
	var loadTip=function loadTip(add){
		if(parseInt(add,10)){
			loadPercent+=add;
			if(loadPercent>=100) loadPercent=99;
			$('initLoading-info').update('Loading File: '+loadPercent+'%');
		} else {
			$('initLoading-info').update(add);
		}
	};
	/*****get all team list*************/
	var getTeams=function getTeams(){
		new Ajax.Request('teams.json?random='+Math.random()+Date.parse(new Date()), { 
			contentType:'application/json',
			method: 'get',
			onSuccess: function(tran) {
				//alert(tran.responseJSON[0].tid+' '+tran.responseJSON.length);
				teams=tran.responseJSON;
				console.log('success to load teams.json');
				teamSelect();
				loadTip(8);
			},
			onFailure: function(tran) {
				loadTip('oh mygod! page error due to teams.json failed to load.');
				console.log('oh mygod! page error due to teams.json failed to load.');
				//alert('oh mygod! page error due to teams.json failed to load.');	
			}
		});
	};
	var totalTeamNum=0;//team 的總數
	var teamSelect=function teamSelect(){
		var html='<option value="-1">All Teams</option>';
		for(var i=0;i<teams.length;i++){
			if(teams[i].major==1){
				var groupid=teams[i].groupid;
				var groupTeamIdArray=new Array();
				for(var j=0; j<teams.length; j++){
					if(groupid==teams[j].groupid){
						groupTeamIdArray.push(teams[j].tid);	
					}
				}
				html+='<option value="'+groupTeamIdArray.toString()+'">'+teams[i].name+'</option>';
			}
		}
		$('teamFilter').update(html);
		loadTip(8);
		console.log('success to print team select option');
		totalTeamNum=0;
		getRoster(teams[totalTeamNum].tid);
	};
	var rosters=new Array();//存放例如20130203-1.json的結果
	var tidOK=new Array();//存放加載roster成功的team
	var getRoster=function getRoster(tid){
		totalTeamNum++;
		var path='';
		path=getdt()+'-'+tid.toString()+'.json?random='+Math.random()+Date.parse(new Date());
		new Ajax.Request(path, { 
			contentType:'application/json',
			method: 'get',
			onSuccess: function(tran) {
				rosters.push(tran.responseJSON);
				tidOK.push(teams[totalTeamNum-1]);
				loadTip(8);
				console.log(path+' success to load.');
				if(totalTeamNum<teams.length&&totalTeamNum>=0){
					getRoster(teams[totalTeamNum].tid);
				} else {
					showRoster();
				}
			},
			onFailure: function(tran) {
				loadTip(8);
				console.log(path+' failed to load.');
				if(totalTeamNum<teams.length&&totalTeamNum>=0){
					getRoster(teams[totalTeamNum].tid);
				} else {
					showRoster();
				}
			}
		});
	};
	var initX=0;//水平滾動初始化位置
	var showRoster=function showRoster(){
		var testBegin=new Date();
		
		loadTip(8);
		console.log('success to load '+rosters.length+' roster json file');
		if(rosters.length<=0){
			$('initLoading').hide();
			alert('此日期內無相關team roster的信息！');
			return;	
		}
		var html='';
		try{
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
				var dutyListStr='';//
				var dutyListH=memberGroupNum*34+memberArray.length*40+6;//列表高度
				var dutyDays=rosters[i].user[0].dayduty.length;//本月天數
				var dutyListW=dutyDays*40;//列表寬度
				var daydutyListStr='';
				var daydutyArray;
				var nowDate=new Date();
				/***loop date*****/
				(function(){
					for(var jduty=0; jduty<dutyDays; jduty++){
						var currentDate=rosters[i].user[0].dayduty[jduty].day;
						//轉換日期格式2013-02-22 to 2013/02/22
						currentDate=currentDate.replace(/-/g,'/');
						currentDate=new Date(currentDate);
						var weekendMarkStyle="";
						if(isWeekend(currentDate)||isPH(currentDate)){
							weekendMarkStyle=' style="color:#fe6665;"';
						}
						if(currentDate.toDateString()==nowDate.toDateString()){
							initX=-(40*(jduty-2));
							daydutyListStr+='<li style="background-color:#eee;">';
						} else {
							daydutyListStr+='<li>';
						}
						/*****loop group*****/
						for(var jmemGroup=0; jmemGroup<memberGroupNum; jmemGroup++){
							daydutyListStr+='<span class="dutyDay"'+weekendMarkStyle+'>'+getWeekEn(currentDate.getDay())+'<br/>'+(jduty+1)+'</span>';
							var memGroupItem=memberArray.slice(jmemGroup*8,jmemGroup*8+8);
							/*****loop member********/
							for(var kmemGroup=0; kmemGroup<memGroupItem.length; kmemGroup++){
								var dutyStatusStr=memGroupItem[kmemGroup].dayduty[jduty].duty||'-';
								daydutyListStr+='<span class="dutyStatus"><span class="dutyStatus-text">'+dutyStatusStr+'</span></span>';
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
				})();	
				
			/*****輸出字符串******/	
			html+='<li id="teamList-'+tidOK[i].tid+'">'+
					'<table width="100%" border="0" cellpadding="0" cellspacing="0">'+
						'<tbody>'+
							'<tr>'+
								'<td colspan="2" valign="top" style="border-bottom:1px #ccc solid;">'+
									'<div class="shift">'+
										'<div style="text-align:center;">'+
										'<span class="shift-teamName">'+tidOK[i].name+'</span><br/>'+
										'<span class="shift-teamTel">TEL:'+tphoneStr+'</span>'+
										'<button class="button shift-bt" style="float:right; margin-right:10px;" onClick="javascript:showShift(this)">&or;</button>'+
										'</div>'+
										'<div style="clear:both;"></div>'+
										'<ul class="shift-list" style="display:none;">'+shiftStr+
										'</ul>'+
									'</div>'+
								'</td>'+
							'</tr>'+
							'<tr>'+
								'<td class="memberListBox" align="right" valign="top">'+
									'<div class="memberList">'+memberListStr+
									'</div>'+
								'</td>'+
								'<td valign="top">'+dutyListStr+
								'</td>'+
							'</tr>'+
						'</tbody>'+
					'</table>'+
				'</li>';
			}
		} catch (err) {
			txt="There was an error on this page.\n\n";
		    txt+="Error description: " + err.message + "\n\n";
		    txt+="Click OK to continue.\n\n";
		    alert(txt);	
			$('initLoading').hide();
			console.log('creat and excu js,but error');
		}
		$('teamList').update(html);
		loadTip(8);
		console.log('success to show roster');
		var testEnd=new Date();
		console.log('create html string spent to '+(testEnd-testBegin));
		createJs();/***creat and excu js **********/
	};
	var createJs=function createJs(){
		/***creat and excu js **********/
		gMyScroll=new Array(tidOK.length);
		gMyScrollReflectTeam=new Array(tidOK.length);
		 
		for(var tidCount=0; tidCount<tidOK.length; tidCount++){
			gMyScrollReflectTeam[tidCount] = tidOK[tidCount].tid;
			gMyScroll[tidCount] = new iScroll('wrapper'+tidOK[tidCount].tid,{
				hScroll:true,
				vScroll:false,
				x:initX	
			});
		}
		$('initLoading').hide();
		loadTip(100);
		console.log('creat and excu js');
	};
	var setFooter=function setFooter(){
		var html='';
		var monthPara=parseInt(getdt().substring(4),10);
		//console.log(monthPara);
		var yearPara=parseInt(getdt().substring(0,4),10);
		//console.log(yearPara);
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
		$('selectDate').update(getMonthEn(monthPara)+' '+yearPara);//頂部顯示日期
		loadTip(8);
		console.log('success to print footer');
	};
	return{
		init:function init(){
			loadTip(3);
			console.log('RS.App.init...');
			setFooter();
			getTeams();	
		}
	}
}());
