/*
reorder mechanism :) next 

*/
// CUR_WAREHOUSE_ID = 1;

data1 = [];
console.log(localStorage.sessionWH);
var CUR_WAREHOUSE_ID = parseInt(localStorage.sessionWH);
var	BO = "WMS"+CUR_WAREHOUSE_ID;	

var wh1 = 0;
var wh2 = 0;
var wh3 = 0;
var wh4 = 0;
var city_map = {
				1:"Bangalore",
				2:"Hyderabad",
				3:"Chennai",
				4:"Delhi"
			   };

switch(CUR_WAREHOUSE_ID) {
    case 1:
        wh1 = 1;
        break;warehouse_master
    case 2:
        wh2 = 1;
        break;
    
    case 3:
        wh3 = 1;
        break;
    
    case 4:
        wh4 = 1;
        break;
}	

$(document).ready(function () {
//------------------------------------------------------------------------------------------------------------>>
		// if(!SESSION.userLogged()){
  //   		// window.location.assign('index.html');
		// }	
			
		$('.warehouse-info').text(city_map[CUR_WAREHOUSE_ID]+" Warehouse");
		
		console.log(localStorage.sessionWH);

//------------------------------------------------------------------------------------------------------------>>
//TableSorter Plugin
	$.tablesorter.themes.bootstrap = {
		// these classes are added to the table. To see other table classes available,
		// look here: http://getbootstrap.com/css/#tables
		table        : 'table table-bordered table-striped',
		caption      : 'caption',
		// header class names
		header       : 'bootstrap-header', // give the header a gradient background (theme.bootstrap_2.css)
		sortNone     : '',
		sortAsc      : '',
		sortDesc     : '',
		active       : '', // applied when column is sorted
		hover        : '', // custom css required - a defined bootstrap style may not override other classes
		// icon class names
		icons        : '', // add "icon-white" to make them white; this icon class is added to the <i> in the header
		iconSortNone : 'bootstrap-icon-unsorted', // class name added to icon when column is not sorted
		iconSortAsc  : 'glyphicon glyphicon-chevron-up', // class name added to icon when column has ascending sort
		iconSortDesc : 'glyphicon glyphicon-chevron-down', // class name added to icon when column has descending sort
		filterRow    : '', // filter row class; use widgetOptions.filter_cssFilter for the input/select element
		footerRow    : '',
		footerCells  : '',
		even         : '', // even row zebra striping
		odd          : ''  // odd row zebra striping
		};
//-------------------	
	
$('#All-Stocks-Tab').click();

// Show Messages
showMessages(BO);

// Update Unread Messages Count 
updateMsgCount(BO);

// Update Sidebar notifications
updateSidebarNotify(BO);

//intializing Toaster
toastr.options = {
    closeButton: true,
    progressBar: true,
    showMethod: 'slideDown',
    timeOut: 4000
};		

sendAlert();
});
//--------------------------------------------------------------------------------------------------------
/*External Functions*/
//-------------------
//--------------------------------------------------------------------------------------------------------
/*	Tab:1 - All Fast-Moving  Slow-Moving Stocks*/

$('#Slow-Stocks-Tab').click(function(){
	
	var misc = alasql('select * from misc where id = 1');
		misc = misc[0];
	
	table_id = "slow-stocks";
	sql = 'select prev_month_sales.item_id, prev_month_sales.warehouse_'+CUR_WAREHOUSE_ID+' AS prev_sales, warehouse_master.safety_stocks_'+CUR_WAREHOUSE_ID+' AS safety_stocks from prev_month_sales JOIN warehouse_master ON prev_month_sales.item_id = warehouse_master.item_id WHERE prev_month_sales.warehouse_'+CUR_WAREHOUSE_ID+' <= '+misc.slow_threshold+';';
	ShowStock(sql,table_id);
});

$('#Fast-Stocks-Tab').click(function(){
	
	var misc = alasql('select * from misc where id = 1');
		misc = misc[0];
	
	table_id = "fast-stocks";
	sql = 'select prev_month_sales.item_id, prev_month_sales.warehouse_'+CUR_WAREHOUSE_ID+' AS prev_sales, warehouse_master.safety_stocks_'+CUR_WAREHOUSE_ID+' AS safety_stocks from prev_month_sales JOIN warehouse_master ON prev_month_sales.item_id = warehouse_master.item_id WHERE prev_month_sales.warehouse_'+CUR_WAREHOUSE_ID+' >= '+misc.fast_threshold+';';
	ShowStock(sql,table_id);
});
	
$('#All-Stocks-Tab').click(function(){
	
	table_id = "all-stocks"	;
	sql = 'select prev_month_sales.item_id, prev_month_sales.warehouse_'+CUR_WAREHOUSE_ID+' AS prev_sales, warehouse_master.safety_stocks_'+CUR_WAREHOUSE_ID+' AS safety_stocks from prev_month_sales JOIN warehouse_master ON prev_month_sales.item_id = warehouse_master.item_id';
	ShowStock(sql,table_id);
});

ShowStock = function(sql,table_id){

	$('#tbody-'+table_id).empty();;
	var misc = alasql('select * from misc where id = 1');
		misc = misc[0];
	
	//Setting Panel Values
	$('#slow-moving').val(misc.slow_threshold);
	$('#fast-moving').val(misc.fast_threshold);		
	$('#slow-moving-critical').val(misc.slow_critical);
	$('#fast-moving-critical').val(misc.fast_critical);		
	$('#slow-moving-reorder').val(misc.slow_reorder);
	$('#fast-moving-reorder').val(misc.fast_reorder);		
	//-------------------

	var records = alasql(sql);

	 // build html table
	var tbody = $('#tbody-'+table_id);
	for (var i = 0; i < records.length; i++) {
		var record = records[i];
		/*Intermission-------------------------------------*/
		/*1*/
		var child_sql = 'SELECT stocks_master.stock_id, bin_master.bin_id \
			FROM stocks_master \
			JOIN bin_master ON bin_master.warehouse_'+CUR_WAREHOUSE_ID+' = stocks_master.stock_id \
			WHERE stocks_master.item_id ='+record.item_id;
		var stocks = alasql(child_sql);
		var child_exists = stocks.length==0?false:true	;
		if(child_exists){
			pad = 1;
		}
		else{
			pad = -1;
		}
		/*2*/

		/*Intermission-------------------------------------*/
 
		var tr = $('<tr class="tablesorter-hasChildRow"></tr>');
		tr.append('<td rowspan="'+(stocks.length+1+pad)+'">'+(child_exists?'<a href=# class="toggle-class" data-toggle="tooltip" data-placement="right" title="Click to see the individual goods">':'') + record.item_id + (child_exists?'</a>':'')+'</td>');
		// console.log(record.prev_sales)
		tr.append('<td rowspan="'+(stocks.length+1+pad)+'">' + stocks.length+ '</td>');
		if(record.prev_sales <= misc.slow_threshold){
			tr.append('<td>' +(record.prev_sales*misc.slow_critical) + '</td>');
			tr.append('<td>' +(record.prev_sales*misc.slow_reorder) + '</td>');
			//udpate db
			alasql('update warehouse_master set safety_stocks_'+CUR_WAREHOUSE_ID+'='+(record.prev_sales*misc.slow_critical)+' where item_id='+ record.item_id);
			alasql('update warehouse_master set reorder_value_'+CUR_WAREHOUSE_ID+'='+(record.prev_sales*misc.slow_reorder)+' where item_id='+ record.item_id);
		}	
		else if(record.prev_sales >= misc.slow_threshold){
			tr.append('<td>' +(record.prev_sales*misc.fast_critical) + '</td>');
			tr.append('<td>' +(record.prev_sales*misc.fast_reorder) + '</td>');	
			//udpate db
			alasql('update warehouse_master set safety_stocks_'+CUR_WAREHOUSE_ID+'='+(record.prev_sales*misc.fast_critical)+' where item_id='+ record.item_id);
			alasql('update warehouse_master set reorder_value_'+CUR_WAREHOUSE_ID+'='+(record.prev_sales*misc.fast_reorder)+' where item_id='+ record.item_id);	
		}
		tr.append('<td>' + record.prev_sales+ '</td>');	
		tr.appendTo(tbody);

			if(child_exists){
					$tr_child = $('<tr class="tablesorter-childRow" ></tr>');
					
					$th = $('<th >');
					$th.text("Serial No.");
					$tr_child.append($th);

					$th = $('<th >');
					$th.text("Stock ID");
					$tr_child.append($th);
							
					$th = $('<th >');
					$th.text("Bin ID");
					$tr_child.append($th);
							
					$tr_child.appendTo(tbody);		
			}


		/*Building Child Tables*/
			for (var j = 0; j < stocks.length; j++) {
				
				var stock = stocks[j];
				$tr_child = $('<tr class="tablesorter-childRow"></tr>');
				
				$td = $('<td></td>');
				$td.text(j+1);
				$tr_child.append($td);


				$td = $('<td></td>');
				$td.text(stock.stock_id);
				$tr_child.append($td);

				$td = $('<td></td>');
				$td.text(stock.bin_id);
				$tr_child.append($td);

				$tr_child.appendTo(tbody);

			}
			
	}
	//-------------------

	/*Call the tablesorter plugin*/
	isEnabled = false;
    callTableSorter($('#table-'+table_id),$('#pager-'+table_id),isEnabled,true,6);
};	
//-------------------------------------------------------------------------------------------------------
/*Update Misc Button */
$('.update-misc-button').click(function(){
	/*Update Misc Table Values*/
	// values = [1, parseInt($('#slow-moving').val()), parseInt($('#fast-moving').val()), parseInt($('#slow-moving-critical').val()), parseInt($('#fast-moving-critical').val()), parseInt($('#slow-moving-reorder').val()), parseInt($('#fast-moving-reorder').val())]		
	alasql('UPDATE misc set slow_threshold = '+parseInt($('#slow-moving').val())); 
	alasql('UPDATE misc set fast_threshold = '+parseInt($('#fast-moving').val())); 
	alasql('UPDATE misc set slow_critical = '+parseInt($('#slow-moving-critical').val())); 
	alasql('UPDATE misc set fast_critical = '+parseInt($('#fast-moving-critical').val())); 
	alasql('UPDATE misc set slow_reorder = '+parseInt($('#slow-moving-reorder').val())); 
	alasql('UPDATE misc set fast_reorder = '+parseInt($('#fast-moving-reorder').val())); 

	// alert("Changes successfully Applied");
    toastr.success('Changes have been successfully applied!!', 'Warehouse Management Team');

	// alasql('DELETE FROM misc ')
	// alasql('INSERT INTO misc VALUES(?,?,?,?,?,?,?);',values); 
	console.log("Misc Values Updated")
	$('#All-Stocks-Tab').click();
})

//--------------------------------------------------------------------------------------------------------
// Toggle Filter Function
	$( '.toggle' ).click( function() {
	    isEnabled = !isEnabled;
	    $( this ).text(isEnabled ? ' Disable Filters' : ' Enable Filters' );
	   	var $adjust = $('<span class="glyphicon glyphicon-adjust" style="font-size: 10px;"></span> &nbsp;');
	   	$(this).prepend($adjust);
	   	/*next.next -- CONIFIRM working :)*/
	   	idVal = $(this).next().next().attr("id");
	   	pagerVal = 'pager'+idVal.split('-'	)[1];
	   	console.log(idVal);
	    callTableSorter($('#'+idVal),$('#'+pagerVal),isEnabled,true,6);
	    (isEnabled?$('.reset-filters').show():$('.reset-filters').hide());
  	});
//-------------------

//--------------------------------------------------------------------------------------------------------
// 	callTableSorter
	callTableSorter = function($var, $pagerVar, filterVal, sortVal, disabledCols){
		// $var.unbind();
		$var.unbind("click");
		$var.bind("click");
		
		$var.trigger("destroy");

		$var.tablesorter({
		theme : "bootstrap",
		
      	cssChildRow : "tablesorter-childRow",
		
		widthFixed: true,
		headerTemplate : '{content} {icon}', 
		widgets : [ "uitheme", "filter", "zebra", "print", 'toggle-ts' ],
		widgetOptions : {

    	print_title      : '',          // this option > caption > table id > "table"
		print_dataAttrib : 'data-name', // header attrib containing modified header name
		print_rows       : 'a',         // (a)ll, (v)isible, (f)iltered, or custom css selector
		print_columns    : 'a',         // (a)ll, (v)isible or (s)elected (columnSelector widget)
		print_extraCSS   : '',          // add any extra css definitions for the popup window here
		print_styleSheet : '../css/theme.bootstrap.css', // add the url of your print stylesheet
		print_now        : true,        // Open the print dialog immediately if true
		// callback executed when processing completes - default setting is null
		print_callback   : function(config, $table, printStyle){
		// do something to the $table (jQuery object of table wrapped in a div)
		// or add to the printStyle string, then...
		// print the table using the following code
		$.tablesorter.printTable.printOutput( config, $table.html(), printStyle );
		},
		  zebra : ["even", "odd"],
		  filter_external : '.search',
		  filter_reset : ".reset-filters",
		  filter_cssFilter: "form-control",
	      filter_columnFilters: filterVal,
          
          filter_childRows  : false,
		  // change this^^^ if needed :) 
	      // toggle-ts widget
	      // Commented -- 29th Dec
	    //   toggleTS_hideFilterRow : true,     
	    //   headers: {
		  	// disabledCols : {
			  //   sorter: false,
			  //   filter: false
		  	// }}
		  }
		})
		.tablesorterPager({
			container: $pagerVar,
			cssGoto  : ".pagenum",
			removeRows: false,
			output: '{startRow} - {endRow} / {filteredRows} ({totalRows})'
		});

		  $var.find( '.tablesorter-childRow td' ).addClass( 'hidden' );
		  $var.find( '.tablesorter-childRow th' ).addClass( 'hidden' );

		  $var.delegate( '.toggle-class', 'click' ,function() {    
		    // use "nextUntil" to toggle multiple child rows
		    // toggle table cells instead of the row
		    console.log("Working")
		    $( this )
		      .closest( 'tr' )
		      .nextUntil( 'tr.tablesorter-hasChildRow' )
		      .find( 'td' )	
		      .toggleClass( 'hidden' );

		    $( this )
		      .closest( 'tr' )
		      .nextUntil( 'tr.tablesorter-hasChildRow' )
		      .find( 'th' )	
		      .toggleClass( 'hidden' );

		    return false;
		  });

	};





// Show Messages
	showMessages = function(BO){

		var new_messages = alasql('select * from messages where bo = "'+BO+'" order by timestamp DESC');
		var limit = 3;
		var $ul = $('.dropdown-messages');
			$ul.empty();
		for (var i = 0; i < new_messages.length; i++) {
			if(i >= limit){
				break;
			}
			message = new_messages[i];

			var $li =   $('<li><div class="dropdown-messages-box"><a href="wms_mailbox.html" class="pull-left"><img alt="image" class="img-circle" src="img/wms.jpg"></a><div class="media-body"><span class = "sender"><strong>Mike Loreipsum</strong>: <br> <span class = "content"></span><br><small class="text-muted"></small></div></div></li>');
			var $divider = $('<li class="divider"></li>');

			$li.find('.media-body span.sender strong').text(message.sender);
			$li.find('.media-body span.content').text(message.content);
			$li.find('.text-muted').text(moment(message.sent_date).format('MMMM Do YYYY, h:mm:ss a'));
			$ul.append($li);
			$ul.append($divider);
		}
		var $li_showMsg = $('<li class="divider"></li><li><div class="text-center link-block"><a href="wms_mailbox.html"><i class="fa fa-envelope"></i> <strong>Read All Messages</strong></a></div></li>');
			$ul.append($li_showMsg);
	};

// Update Unread Messages Count
	updateMsgCount =  function(BO){
		count = parseInt(alasql('column of select count(*) from messages where bo = "'+BO+'" AND read = 0')); 
		if(!count){
			count = 0;
			$('.new-messages').text('');
		}
		else{
			$('.new-messages').text(count);
		}
	}

//  Populate sidebar notifications
	updateSidebarNotify = function(BO){

	// 1. Requests Received
	// 2. Return Requests

	 // 1. "mail-side-notify"
		var sql = 'column of select count(*) from messages where bo = "'+BO+'" AND read = 0';
		mail_count = parseInt(alasql(sql)); 

		if(!mail_count){
			mail_count = 0;
			$('.mail-side-notify').text('');
		}
		else{
			$('.mail-side-notify').text(mail_count);
		}


	// 2. "requests-side-notify"
		var sql = 'COLUMN OF SELECT COUNT(*) \
				FROM order_requests \
				JOIN item ON item.id = order_requests.item_id \
				WHERE order_requests.status != "Closed" \
				AND order_requests.warehouse_id = '+CUR_WAREHOUSE_ID+' \
				ORDER BY order_requests.request_id \
				';	
		requests_count = parseInt(alasql(sql)); 

		if(!requests_count){
			requests_count = 0;
			$('.requests-side-notify').text('');
		}
		else{
			$('.requests-side-notify').text(requests_count);
		}

	// 3. "wms_returns-side-notify"
		var sql = 'COLUMN OF SELECT COUNT(*) \
                    FROM return_requests \
                    JOIN item ON item.id = return_requests.item_id \
                    WHERE return_requests.status != "Closed" \
                    AND return_requests.warehouse_id = '+CUR_WAREHOUSE_ID+' ORDER BY return_requests.return_id ';   
		wms_returns_count = parseInt(alasql(sql)); 

		if(!wms_returns_count){
			wms_returns_count = 0;
			$('.wms_returns-side-notify').text('');
		}
		else{
			$('.wms_returns-side-notify').text(wms_returns_count);
		}

	}

// -----------------------------------------------------------------------------------
// Alerts Functionality
	$('#Alerts').click(function(){
		
		showAlerts();
		$('#reminderModal').modal('show');

	});

	//ShowALerts
	showAlerts = function(){
		var sql = 'select * from alerts where bo="'+BO+'";'
		records = alasql(sql);

		$tbody = $('.tbody-alerts');
		$tbody.empty();
		
		for (var i = 0; i < records.length; i++) {
			record = records[i];
			$tr = $('<tr><td class="check-mail"><input type="checkbox" class="i-checks"></td><td class="mail-serial" style="display:none"></td><td class="show-serial"></td><td class="mail-subject"></td><td class="mail-ontact"></td><td class="text-center mail-date"></td></tr>');

			$tr.find('.mail-serial').text(record.id);	
			$tr.find('.show-serial').text(i+1);	
			$tr.find('.mail-subject').text(record.subject);
			$tr.find('.mail-ontact').text(record.days);		
			$tr.find('.mail-date').text(record.next_date);	
			$tbody.append($tr);	
		}
		
	    $('.i-checks').iCheck({
	        checkboxClass: 'icheckbox_square-green',
	        radioClass: 'iradio_square-green',
	    });
	}

	// Add Alerts
	$(document).on('click','.add-alert', function() {

		alert_days = parseInt($('.alert-days').val());
		alert_subject = $('.alert-subject').val();
		alert_subject_valid = alert_subject.length;
		if(alert_days && alert_subject_valid){

			next_date = moment().add(alert_days, 'days').format("DD/MM/YYYY");
			serial = 1;
			max_id = parseInt(alasql('column of select max(id) from alerts'));
			if(max_id){
				serial = max_id + 1;
			}
			values = {id:serial,subject:alert_subject,days:alert_days,next_date:next_date,bo:BO};
			console.log(values);
			alasql('insert into alerts VALUES ?',[values]);
			showAlerts();
		}
		else{
			toastr.error("Please enter valid Subject & Days ");
		}

	});

	// Delete Messages functionality
	$('.delete-alert').click(function(){
		 // if($('.delete').length > 0) {
			 var c = false;
			 var cn = 0;
			 var o = new Array();
			 $('.tbody-alerts input:checkbox').each(function(){
			  if($(this).is(':checked')) {
				  c = true;
				  o[cn] = $(this);
				  cn++;
			  }
			 });
			 if(!c) {
			  toastr.error('No selected message','Warehouse QA Team');
			 } else {
			  var msg = (o.length > 1)? 'messages' : 'message';
			  if(confirm('Delete '+o.length+' '+msg+'?')) {
				  for(var a=0;a<cn;a++) {
					  $(o[a]).parents('tr').remove();
					  // Reflect in Database too
					  id = parseInt($(o[a]).parents('tr').find('.mail-serial').text());
					  console.log(id);
	  				  alasql('delete from alerts where id='+id);

				  }
			  }
			 }
			$('.checkall').iCheck('uncheck');
			showAlerts();
		// }
	});


	//Check all functionality
	$('.select-all-alerts').on('ifChecked', function (event){

	  	console.log("checkall Clicked");	
		var $table = $('.table-alerts');
		$table.find('.i-checks').iCheck('check');
	});

	//Uncheck all functionality
	$('.select-all-alerts').on('ifUnchecked', function (event) {
	  	console.log("checkall Clicked");	
		var $table = $('.table-alerts');
		$table.find('.i-checks').iCheck('uncheck');
	});

	// Making checkbox check functionality
	$('.i-checks').on('ifChecked', function (event){
	    $(this).closest("input").attr('checked', true);
	    console.log("checked");
		console.log($(this).closest("input").get(0));              
	});

	$('.i-checks').on('ifUnchecked', function (event) {
	    $(this).closest("input").attr('checked', false);
	    console.log("unchecked");
		console.log($(this).closest("input").get(0));        
	});

	//Send Alert Mail

	sendAlert = function(){

	var sql = 'select * from alerts where bo="'+BO+'";'
	records = alasql(sql);
	for (var i = 0; i < records.length; i++) {
		record = records[i];
		if( moment().format("DD/MM/YYYY") == record.next_date){
			//1. Send Alert

				var msg = record.subject;
				var msg_length = parseInt('column of select max(id) from messages');
				var msg_id = 1;

				if(msg_length){
					msg_id = msg_length + 1;
				}

				values = {id:msg_id,read:0,sender:"Reminder",bo:BO,content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
				console.log(values);
				alasql('insert into messages values ?',[values]);
				toastr.info(msg,'Reminder');

			//2. Update Next Date
			var next_date = moment().add(record.days, 'days').format("DD/MM/YYYY");
			alasql('update alerts set next_date ="'+next_date+'" where id = '+record.id);
		}

	}

	// 	Checking Warehouse Occupancy % 		

		var records = alasql("select * from misc;");
		var perc = records[0].warehouse_perc;
	    var update_date = records[0].update_date;

		//Set Warehouse Occupancy
		$('.wh-occupancy').val(perc);
		
		var cur_perc;
	    total_bins = parseInt(alasql('column of select count(*) from bin_master'));
	    occ_bins = parseInt(alasql('column of select count(*) from bin_master where warehouse_'+CUR_WAREHOUSE_ID+'!= 0'));
	    
	    var cur_perc = Math.round((occ_bins/total_bins)*100);
	    var current_date = moment().format("DD/MM/YYYY");
	    if(cur_perc >= perc && current_date !=update_date){

				var msg = 'Warehouse Occupancy is currently '+cur_perc+'% which is over the set threshold of '+perc+'%';
				var msg_length = parseInt('column of select max(id) from messages');
				var msg_id = 1;

				if(msg_length){
					msg_id = msg_length + 1;
				}
				values = {id:msg_id,read:0,sender:"Reminder",bo:BO,content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
				console.log(values);
				alasql('insert into messages values ?',[values]);
				alasql('update misc set update_date = "'+current_date+'"');
				toastr.warning(msg,'Reminder');	   
			}
		}		