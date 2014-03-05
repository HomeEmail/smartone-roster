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
	var teams=new Array();//存放teams.json數據
	/*****get url para dt value**********/
	var getdt=function getdt(){
		var dt=getQueryString('dt')||(new Date().getFullYear()).toString()+getFullMonth(new Date().getMonth()+1);
		return dt;
	};
	/*****get url para tid value**********/
	var getTeamID=function getTeamID(){
		return getQueryString('tid')||2;
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
	var totalTeamNum=0;//需要加載team 的總數計數
	var needLoadTeamArray=new Array();//存放需要加載的team信息
	var teamSelect=function teamSelect(){
		/*
		<a href="?dt=201306&tid=2" class="teamNavBt"> < </a>
        <span id="currentTeamBox" data-currentTeamID="3">Program Management</span>
        <a href="?dt=201306&tid=4" class="teamNavBt"> > </a>
		*/
		var html='';
		var currentTid=getTeamID();
		var currentTidName='error teamID';
		var lastTid=-1;
		var nextTid=-1;
		var lastTidBtDisplay=true;
		var nextTidBtDisplay=true;
		var majorTeamArray=new Array();
		var leftTeamListHtml='';
		for(var i=0; i<teams.length; i++){
			if(teams[i].major==1){
				majorTeamArray.push(teams[i]);
				if(teams[i].tid==currentTid){
					var groupid=teams[i].groupid;
					for(var j=0; j<teams.length; j++){
						if(groupid==teams[j].groupid){
							needLoadTeamArray.push(teams[j]);	
						}
					}
				}
			}
		}
		leftTeamListHtml='<ul>';
		for(var i=0; i<majorTeamArray.length; i++){
			if(majorTeamArray[i].tid==currentTid){
				
				currentTidName=majorTeamArray[i].name;
				if(i>0&&i<(majorTeamArray.length-1)){
					lastTid=majorTeamArray[i-1].tid;
					nextTid=majorTeamArray[i+1].tid;	
				} else {
					if(i==(majorTeamArray.length-1)){
						lastTid=majorTeamArray[i-1].tid;
						nextTid=-1;	
						nextTidBtDisplay=false;
					}
					if(i==0){
						lastTid=-1;
						lastTidBtDisplay=false;
						nextTid=majorTeamArray[i+1].tid;	
					}	
				}
			}
			/****left slide team list******/
			/*
			<ul>
            <li><a href="?dt=201306&tid=2">Web Team</a></li>
        	</ul>
			*/
			leftTeamListHtml+='<li><a href="?dt='+getdt()+'&tid='+majorTeamArray[i].tid+'">'+majorTeamArray[i].name+'</a></li>';
		}
		leftTeamListHtml+='</ul>';
		$('leftSlideTeamList').update(leftTeamListHtml);
		html+='<button class="shift-bt" id="teamListBt" onclick="javascript:sildeLeftToRight();"> </button>';
		/*
		if(lastTidBtDisplay){
			html+='<a href="?dt='+getdt()+'&tid='+lastTid+'" class="teamNavBt lastTeamBt"> </a>';
		} else {
			html+='<span class="teamNavBt"></span>';
		}
		*/
		html+='<span id="currentTeamBox" title="" onClick="javascript:sildeLeftToRight();" data-currentTeamID="'+currentTid+'">'+currentTidName+'</span>';
		/*
		if(nextTidBtDisplay){
			html+='<a href="?dt='+getdt()+'&tid='+nextTid+'" class="teamNavBt nextTeamBt"> </a>';
		} else {
			html+='<span class="teamNavBt"></span>';
		}
		*/
		
		html+='<button class="shift-bt" id="shiftListBt"> </button>';
		/*
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
		}*/
		$('teamFilter').update(html);
		loadTip(8);
		console.log('success to print team select option');
		totalTeamNum=0;
		getRoster(needLoadTeamArray[totalTeamNum].tid);
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
				tidOK.push(needLoadTeamArray[totalTeamNum-1]);
				loadTip(8);
				console.log(path+' success to load.');
				if(totalTeamNum<needLoadTeamArray.length&&totalTeamNum>=0){
					getRoster(needLoadTeamArray[totalTeamNum].tid);
				} else {
					showRoster();
				}
			},
			onFailure: function(tran) {
				loadTip(8);
				console.log(path+' failed to load.');
				if(totalTeamNum<needLoadTeamArray.length&&totalTeamNum>=0){
					getRoster(needLoadTeamArray[totalTeamNum].tid);
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
			alert('此日期內無'+needLoadTeamArray[0].name+'相關的信息！');
			return;	
		}
		var html='';
		try{
			for(var i=0; i<rosters.length; i++){
				/***team phone*****/
				var tphoneStr='';
				var tphone=tidOK[i].phone.split(',');
				for(var jphone=0; jphone<tphone.length; jphone++){ 
					if(tphone[jphone]){
						tphoneStr+=' <a href="tel:'+tphone[jphone]+'">'+tphone[jphone]+'</a>';
					}
				}
				/*****shift list**主從team shift list相同***********/
				var shiftStr='';
				var shiftArray=rosters[i].team.shift;
				if(i==0){
					for(var jshift=0;jshift<shiftArray.length;jshift++){
						if(jshift%2!=0) continue;//奇數
						var dutyStr=shiftArray[jshift].duty||'-';
						//shiftStr+='<li>'+dutyStr+'： '+shiftArray[jshift].desc+' </li>';	
						try{
							shiftStr+='<tr><td align="right">'+dutyStr+': </td><td>'+shiftArray[jshift].desc+'</td><td align="right">'+(shiftArray[jshift+1].duty||'-')+': </td><td>'+shiftArray[jshift+1].desc+'</td></tr>';
						} catch(e){
							shiftStr+='<tr><td align="right">'+dutyStr+': </td><td>'+shiftArray[jshift].desc+'</td><td align="right"></td><td></td></tr>';
						}
					}
					shiftStr+='<tr><td align="right" style="height:50px; border:0px;"></td></tr>';
					$('shiftListBox').update(shiftStr);
				}
				/*****member List string*******/
				var memberListStr='';
				var memberArray=rosters[i].user;
				/*****把team分組，每組8人********/
				var memberGroupNum=Math.ceil(memberArray.length/8);
				
				/*****dutyday list string*******/
				var dutyListStr='';//
				var dutyListH=memberGroupNum*38+memberArray.length*50;//列表高度
				var dutyDays=rosters[i].user[0].dayduty.length;//本月天數
				var dutyListW=dutyDays*60;//列表寬度
				var daydutyListStr='';
				var daydutyArray;
				var nowDate=new Date();
				/***loop date*****/
				(function(){
					//loop 本月天數
					for(var jduty=0; jduty<dutyDays; jduty++){
						var currentDate=rosters[i].user[0].dayduty[jduty].day;
						//轉換日期格式2013-02-22 to 2013/02/22
						currentDate=currentDate.replace(/-/g,'/');
						currentDate=new Date(currentDate);
						var weekendMarkStyle="";
						if(isWeekend(currentDate)||isPH(currentDate)){
							weekendMarkStyle='color:#fe6665;';
						}
						var currentDateStyle='';
						if(currentDate.toDateString()==nowDate.toDateString()){
							initX=-(60*(jduty-1));
							currentDateStyle=' background-color:#d9f8f8;';
							daydutyListStr+='<li style="background-color:#d9f8f8;">';
						} else {
							daydutyListStr+='<li>';
						}
						/*****loop group*****/
						for(var jmemGroup=0; jmemGroup<memberGroupNum; jmemGroup++){
							
							daydutyListStr+='<span class="dutyDay"'+'style="border-bottom: 1px #ccc solid;'+weekendMarkStyle+'">'+getWeekEn(currentDate.getDay())+'<br/>'+(jduty+1)+'</span>';
							var memGroupItem=memberArray.slice(jmemGroup*8,jmemGroup*8+8);
							/*****loop member dutystatus********/
							var evenRowBg='';//偶數行背景樣式
							for(var kmemGroup=0; kmemGroup<memGroupItem.length; kmemGroup++){
								if(kmemGroup%2==0){
									//偶數行
									evenRowBg='background-color:#f3f3f3;';
								} else {
									evenRowBg='';
								}
								
								var bubbleColor='';
								var dutyStatusStr=memGroupItem[kmemGroup].dayduty[jduty].duty||'-';
								
								//日期相等時,shift是否有*和#，有就加到name前
								var prefixName='';
								if(currentDate.toDateString()==nowDate.toDateString()){
									prefixName=/\*/.test(dutyStatusStr) ? '*' : (/#/.test(dutyStatusStr) ? '#' : '');
									memberArray[jmemGroup*8+kmemGroup].name = prefixName + memberArray[jmemGroup*8+kmemGroup].name;
								}
								
								var dutyStatusHint='';
								//shift比較要先去除*和#
								var dutyStatusReplace=memGroupItem[kmemGroup].dayduty[jduty].duty.replace(/\*/,'').replace(/#/,'');
								for(var jshift=0;jshift<shiftArray.length;jshift++){
									if(dutyStatusReplace==shiftArray[jshift].duty){
										dutyStatusHint+='Staff Name : '+memGroupItem[kmemGroup].name+'<br/>';
										dutyStatusHint+='Date : '+currentDate.toDateString()+'<br/>';
										dutyStatusHint+=dutyStatusStr+' : '+shiftArray[jshift].desc;
										dutyStatusHint+=/#/.test(dutyStatusStr) ? '<br/># : Supervisor in charge' : '';
										dutyStatusHint+=/\*/.test(dutyStatusStr) ? '<br/>* : Approver' : '';
										
										bubbleColor = shiftArray[jshift].atwork=='1' ? 'dutyStatus-color3' : 'dutyStatus-color5';
										break;
									}
								}
								daydutyListStr+='<span class="dutyStatus" style="'+evenRowBg+currentDateStyle+'"><span onclick="javascript:showBubble(this);" class="dutyStatus-text '+bubbleColor+'" title="'+dutyStatusHint+'">'+dutyStatusStr+'</span></span>';
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
				
				//loop member name
				(function(){
					for(var jmemGroup=0; jmemGroup<memberGroupNum; jmemGroup++){
						memberListStr+='<div class="dutyDay"></div>';
						var memGroupItem=memberArray.slice(jmemGroup*8,jmemGroup*8+8);
						var evenRowBg='';//偶數行背景樣式
						for(var kmemGroup=0; kmemGroup<memGroupItem.length; kmemGroup++){
							if(kmemGroup%2==0){
								//偶數行
								evenRowBg='background-color:#f3f3f3;';
							} else {
								evenRowBg='';
							}
							memberListStr+=	'<div class="dutyStatus" style="'+evenRowBg+'"><a href="tel:'+memGroupItem[kmemGroup].phone+'">'+memGroupItem[kmemGroup].name+'</a></div>';
						}
					}
				})();
				
			/*****輸出字符串******/	
			html+='<li id="teamList-'+tidOK[i].tid+'">'+
					'<table width="100%" border="0" cellpadding="0" cellspacing="0">'+
						'<tbody>'+
							'<tr>'+
								'<td colspan="2" valign="top" style="border-bottom:1px #ccc solid;">'+
									'<div class="shift">'+
										'<div style="text-align:center;">'+
										(tidOK[i].major=='1' ? '' : '<span class="shift-teamName" onClick="javascript:sildeLeftToRight();">'+tidOK[i].name+'</span><br/>')+
										'<span class="shift-teamTel">'+(tphoneStr ? '<img src="img/btn_phone.png" style="vertical-align: sub;" />'+tphoneStr : '')+'</span>'+
										'</div>'+
										'<div style="clear:both;"></div>'+
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
		$('shiftListBt').observe('click',function(e){
			if($(this).hasClassName('shift-bt-on')){
				$(this).removeClassName('shift-bt-on');	
			} else {
				$(this).addClassName('shift-bt-on');	
			}
			$('teamShiftList').toggle();
		});
		gShiftListScroll=new iScroll('teamShiftList',{
			hScroll:false,
			vScroll:true,
			checkDOMChanges: true, //是否自动检测内容变化
		});
		
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
		var tidEncode=getTeamID();
		//tidEncode=tidEncode<<5;
		var today=(new Date().getFullYear()).toString()+getFullMonth(new Date().getMonth()+1);
		html+='<a href="?dt='+today+'&tid='+tidEncode+'" id="btn_today"> </a>';
		html+='<a href="?dt='+lastYear.toString()+getFullMonth(lastMonth.toString())+'&tid='+encodeURIComponent(tidEncode)+'" class="lastDateBt"> </a>';
		
		html+='<span class="currentDateBox">'+getMonthEn(monthPara)+' '+yearPara+'</span>';
		html+='<a href="?dt='+nextYear.toString()+getFullMonth(nextMonth.toString())+'&tid='+getTeamID()+'" class="nextDateBt"> </a>';
		$('footer').update(html);
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
