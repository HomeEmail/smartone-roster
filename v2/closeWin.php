<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
</head>

<body>

</body>

<script>
    //alert(document.cookie); //首次访问abc！=123，刷新后abc=kill，而不是abc=123
    //document.cookie = 'abc=123';
    window.onbeforeunload = function (e) { 
		return e.returnValue = 'sure?';
    }
    window.onunload = function () {
        //document.cookie = 'abc=kill';
    }
</script>
</html>