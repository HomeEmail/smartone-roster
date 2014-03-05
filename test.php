<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="">
<meta name="author" content="">
<meta name="viewport" content="width=960, user-scalable=no"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<title>Smartone</title>
<script>
/*{
    “user”:{uid,name,phone,[{day,duty},{day,duty}]},
    “shift”:[{“phone”:”3333”},{duty,desc},{duty,desc}]
}*/

var j={
	"user":{"uid":"1","name":"ivnace","phone":"3332","dayduty":[{"day":"2013-07-22","duty":"R"},{"day":"2013-07-23","duty":"RR"}]},
	"team":{"tid":"1","phone":"3333","shift":[{"duty":"R","desc":"R is R"},{"duty":"RR","desc":"RR is RR"}]}
	};
//alert(j.user.dayduty[0].day);
</script>
</head>


<body>
<a href="tel:680437" title="tel:680437">打电话给某某</a>

<?php
	$jsonArray;
	//user 信息
	$userArray;
	$userArray=array(
		'uid'=>'1',
		'name'=>'ivance',
		'phone'=>'3233',
		'dayduty'=>''
	);
	//上班情况数组
	$dutyArray=array();
	for($i=1;$i<=2;$i++){
		$d=array(
			'day'=>'2014-22-22',
			'duty'=>'R'
		);	
		array_push($dutyArray,$d);
	}
	
	$userArray['dayduty']=$dutyArray;
	
	//team 信息
	$teamArray;
	$teamArray=array(
		'tid'=>'1',
		'phone'=>'2333',
		'shift'=>''
	);
	//自定义班次数组
	$dutyShiftListArray=array();
	for($i=1;$i<=2;$i++){
		$a1=array(
			'duty'=>$i,
			'desc'=>'aaa'.$i
		);
		array_push($dutyShiftListArray,$a1);
	}
	
	$teamArray['shift']=$dutyShiftListArray;
	
	$jsonArray=array(
		'user'=>$userArray,
		'team'=>$teamArray
	);
	$jsonStr='';
	$jsonStr=json_encode($jsonArray);
	echo $jsonStr;
?>



</body>
</html>
