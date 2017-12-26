function getSheet(user_name){
    var ss_url = PropertiesService.getScriptProperties().getProperty('SPREAD_SHEET_URL');
    var ss = SpreadsheetApp.openByUrl(ss_url);

    //open user's sheet
    //if it don't exist, create new sheet named user_name.
    var sheet = ss.getSheetByName(user_name);
    if( sheet == null ){
        sheet = ss.insertSheet(user_name);
        var values = [[ "start[s]", "finish[s]", "time[s]","type"]];

        var range = sheet.getRange(1, 1, 1, 4);
        range.setValues(values);
    }
    return sheet;
}


function startActivity(user_name, timestamp, activity_tag){
    var sheet = getSheet(user_name);
    var last_row = sheet.getLastRow();
    if ( sheet.getRange(last_row, 1).getValue() && sheet.getRange(last_row, 2).getValue() ){
        sheet.getRange(last_row+1, 1).setValue(timestamp);
        sheet.getRange(last_row+1, 4).setValue(activity_tag);
        return 'start activity [' + activity_tag + ']';
    }else{
        return 'Running activity exists. Please finish activity by "/finish_activity" or delete runnning activity by "/delete_activity"'
    }
}

function finishActivity(user_name, timestamp){
    var sheet = getSheet(user_name);
    var last_row = sheet.getLastRow();
    if (sheet.getRange(last_row, 1).getValue() && !sheet.getRange(last_row, 2).getValue()){
        sheet.getRange(last_row, 2).setValue(timestamp);
        var activity_tag = sheet.getRange(last_row, 4).getValue();
        var start_time = sheet.getRange(last_row, 1).getValue();
        // calc time
        time = timestamp - start_time;
        sheet.getRange( last_row, 3).setValue(time);
        return 'finish activity [' + activity_tag + ']\n' + 'time: ' + time;
    }else{
        return 'No activity is running.'; 
    }
}

function getActivityTime(user_name, cmd){
    var sheet = getSheet(user_name);
    var last_row = sheet.getLastRow();
    var cmd_arr = cmd.split(" ");
    var start_time, finish_time, tag, start_index=-1, finish_index=-1, time_arr, timestamp_arr, output;

    // read command arg
    if( cmd_arr.length == 3){
        tag = cmd_arr[2];
    }
    if( cmd_arr.length >= 2){
        start_time = Math.round(new Date(cmd_arr[0]).getTime() / 1000);
        finish_time = Math.round(new Date(cmd_arr[1]).getTime() / 1000 + 60*60*24);
    }
    var values = sheet.getSheetValues( 2, 1, last_row - 2 + 1 , 1);

    // start index detection
    for( var i=0; i<values.length; i++){
        if( start_time <= values[i] ){
            start_index = i;
            break;
        }
    }

    // finish index detection
    for( var i=start_index; i<values.length; i++){
        if( finish_time <= values[i] ){
            finish_index = i-1;
            break;
        }
    }

    // get sheet values and extract data in specified period.
    if( finish_index == -1 ){
        finish_index = last_row - 2;
    }

    arr_filtered_by_time = sheet.getSheetValues( 2+start_index, 1, finish_index - start_index + 1, 4);
    if( !arr_filtered_by_time[arr_filtered_by_time.length - 1][2] ){
        arr_filtered_by_time.pop();
    }

    // filtering by tagname
    if( cmd_arr.length >= 3){
        arr_filtered_by_time = arr_filtered_by_time.filter(function (e) {
            return e[3] == tag;
        });
    }

    output = arr_filtered_by_time;
    return output;
}

function showSum(user_name, arg){
    var arr = getActivityTime(user_name, arg);
    var message,sum;

    if( arr.length == 0 ){
        message = "No data is found. Please confirm that your command is like below;\nshow_sum: <start date> <end date> <tag_name(option)>\nexample -- show_sum 2017/1/1 2017/1/7 foobar";
    }else{
        sum = 0;
        for( var i = 0; i < arr.length; i++){
            sum += arr[i][2];
        }

        message = "sum of activity time: "+ secToHms(sum);
    }

    return message;
}

function secToHms(t){
    var hms="";
    var h=Math.floor(t/3600);
    var m=Math.floor(t%3600 /60);
    var s=Math.floor(t%60);

    if(h != 0){
        hms = h + "h " + m + "min " + s + "sec";
    }else if( m != 0){
        hms = m + "min " + s + "sec";
    }else{
        hms = s + "sec";
    }

    return hms;
}

function getChart(user_name, arg){
    var args = arg.split(" ");

    // translate week and month option
    if(args[0] == "week"){
        var from = new Date( new Date().getTime() - 7*60*60*24*1000);
        var to = new Date();
        arg = from.toLocaleDateString() + " " + to.toLocaleDateString();

        if( args.length == 2){
            arg = arg + " " + args[1];
        }

        args = arg.split(" ");
    }else if(args[0] == "month"){
        var from = new Date( new Date().getTime() - 30*60*60*24*1000);
        var to = new Date();
        arg = from.toLocaleDateString() + " " + to.toLocaleDateString();

        if( args.length == 2){
            arg = arg + " " + args[1];
        }

        args = arg.split(" ");
    }

    var arr = getActivityTime(user_name, arg);
    var delArr = [1,3];
    var sheet = getSheet(user_name);

    // delete finish timestamp and activity tag
    for( var i=0; i<arr.length; i++){
        for(var j=0; j<delArr.length; j++){
            arr[i].splice(delArr[j]-j, 1);
        }
    }

    // convert timestamp by millisec to Date
    // time sec to hours
    arr = arr.map( function(e) {
        //return [new Date(e[0] * 1000).toLocaleString(), e[1]/60/60];
        return [new Date(e[0] * 1000).toLocaleDateString(), e[1]/60/60];
    });

    for( var i=1; i<arr.length; i++){
        if(arr[i-1][0] == arr[i][0]){
            arr[i][1] += arr[i-1][1];
            arr[i-1][0] = "";
        }
    }
    Logger.log("unite");
    Logger.log(arr);
    arr = arr.filter( function(e){
        return e[0];
    });
    Logger.log("delete");
    Logger.log(arr);


    // write values on a sheet temporally.
    var range = sheet.getRange(1, 10, arr.length, 2);
    range.setValues(arr);

    // make chart
    var chart = sheet.newChart().setChartType(Charts.ChartType.BAR)
        .addRange(range)
        .setPosition(6,6,0,0)
        .setOption("title",user_name + "'s activity " + args[0] + " - " + args[1])
        .setOption("vAxis.title","Date")
        .setOption("hAxis.title","Time [h]")
        .build();
    //sheet.insertChart(chart);

    // delete values
    range.clear();

    return chart.getAs("image/png");
}


function doPost(e) {
    var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
    var bot_name = "bot";
    var bot_icon = PropertiesService.getScriptProperties().getProperty('BOT_ICON_URL');
    var verify_token = PropertiesService.getScriptProperties().getProperty('VERIFY_TOKEN');

    var app = SlackApp.create(token);
    // verify post
    /*
       if (verify_token != e.parameter.token){
       throw new Error("invalid token.");
       }
       */

    // delete trigger words
    var trigger = e.parameter.trigger_word;
    var text = e.parameter.text.substr(trigger.length).trim();
    var message;

    switch (trigger){
        case "start_activity:": {
            message = startActivity(e.parameter.user_name, e.parameter.timestamp, text); 
            break;
        }
        case "finish_activity:": {
            message = finishActivity(e.parameter.user_name, e.parameter.timestamp);
            break;
        }
        case "delete_activity:":{
            message = "this function have been developed yet. Comming Soon.";
            break;
        }
        case "show_sum:":{
            message = showSum(e.parameter.user_name, text);
            break;
        }
        case "show_chart:":{
            var args = text.split(" ");
            var options = {
                filename: "chart_"+e.parameter.user_name+"_"+args[0]+"-"+args[1],
                title: e.parameter.user_name + "_ActivityChart_"+args[0]+"-"+args[1] ,
                channels:e.parameter.channel_name 
            }
            var response = app.filesUpload(getChart(e.parameter.user_name, text), options);
            message = "Process finished.";
            break;
        }
        case "help:":{
            message = 'Command Reference\n■start_activity: <activity tag>\n-- start activity\n\n■finish_activity:\n-- finish running activity\n\n■delete_activity:\n-- delete running activity(not implemented)\n\n■show_sum: <begin date> <end date> <activity tag(optional)>\n-- show activity time designated time span and a kind of activity.\n\n■show_chart: <begin date> <end date> <activity tag(optional)>\n-- show a chart which expresses activity time for the time span.\n\n■show_chart: <time_span> <activity tag(optional)>\n-- week or month is allowed for <time_span>.';
            break;
        }
        default: {
            message = 'Command is not found.\nType help: and read the document.';
            break;
        }
    }
    return app.postMessage(e.parameter.channel_name, message, {
        username: bot_name,
        icon_url: bot_icon
    });

}

////
//
// TEST CODE
//
/////
var SLACK_USER_NAME_FOR_TEST = "input your user name on slack";

function testEditSS(){
    getSheet(SLACK_USER_NAME_FOR_TEST);
}

function testStart(){
    Logger.log(startActivity(SLACK_USER_NAME_FOR_TEST, 12345, "hoge"));
}

function testFinish(){
    Logger.log(finishActivity(SLACK_USER_NAME_FOR_TEST, 12345));
}

function testGAT(){
    Logger.log(getActivityTime(SLACK_USER_NAME_FOR_TEST, "2017/12/23 2017/12/25"));
}

function testGetChart(){
    Logger.log(getChart(SLACK_USER_NAME_FOR_TEST, "2017/12/23 2017/12/25"));
}

function testShowSum(){
    Logger.log(showSum(SLACK_USER_NAME_FOR_TEST, "2017/12/23 2017/12/25"));
}
