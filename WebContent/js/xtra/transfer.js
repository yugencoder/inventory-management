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
		
		// console.log(localStorage.sessionWH);

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

$('#Intra-Tab').click();
//-------------------

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
}); /* End of Document Ready*/

//--------------------------------------------------------------------------------------------------------
/*External Functions*/
//-------------------	
//--------------------------------------------------------------------------------------------------------
/*	Tab:3	Intra & Inter Stock Transfer*/

$('#Transfer-Tab').click(function(){
	$('#Intra-Tab').click();	
	/**/
});

$('#Intra-Tab').click(function(){
	intraTransfer();
});

intraTransfer = function(){

	damagedBins();
	var sql = 'SELECT stocks_master.stock_id, item.detail, bin_master.bin_id,  item.price \
			FROM stocks_master \
			JOIN bin_master ON bin_master.warehouse_'+CUR_WAREHOUSE_ID+' = stocks_master.stock_id \
			JOIN item ON item.id = stocks_master.item_id \
			WHERE bin_master.warehouse_'+CUR_WAREHOUSE_ID+'!= 0 \
			ORDER BY bin_master.bin_id \
			';	
	var stocks = alasql(sql);
	// // build html table
	$('#tbody-intra').empty();
	var tbody = $('#tbody-intra');
	var bins = alasql('select bin_id from bin_master where warehouse_'+CUR_WAREHOUSE_ID+'= 0 AND damaged_'+CUR_WAREHOUSE_ID+'!= 1');
	var $dest_bin = $('<td><div class="input"><select class="form-control dest-bin"></select></div></td>');
	for (var j = 0; j < bins.length; j++) {
		bin = bins[j];
		var $option = $('<option></option>');
		$option.text(bins[j].bin_id);
		$dest_bin.find('select').append($option);
	}
	for (var i = 0; i < stocks.length; i++) {
		var stock = stocks[i];
		var $tr = $('<tr></tr>');
		$tr.append('<td id = bin-'+stock.bin_id+'>' + stock.bin_id + '</td>');
		$tr.append('<td class= "stock_id">' + stock.stock_id + '</td>');
		$tr.append('<td>' + stock.detail + '</td>');
		$tr.append('<td>' + "Bangalore"+ '</td>');
		$tr.append('<td>' + stock.price + '</td>');

		/*Remember to UPDATE AFTER ALLOTMENT*/
		$dest_bin.clone().appendTo($tr);
		$tr.append('<td><button class="intra-transfer btn btn-sm" type="button"><span class="glyphicon glyphicon-transfer" style="font-size: 10px;"></span>&nbsp;Transfer</button></td>');

		$tr.appendTo(tbody);
	}
	//-------------------

	/*Call the tablesorter plugin*/
	isEnabled = false;
    callTableSorter($('#table-intra'),$('#pager-intra'),isEnabled,true,6);
}

/* Intra Transfer Button Function*/
$(document).on('click','.intra-transfer.btn', function() {

	$tr = $(this).closest('tr');
	var from_bin = parseInt($($tr.children()[0]).text());
	var to_bin = parseInt($tr.find('.dest-bin').val());
	var stock_id =parseInt($tr.find('.stock_id').text());
	console.log(from_bin, to_bin, stock_id);

	/*Update bin_master Table*/
		//1. set old to 0
		alasql('update bin_master set warehouse_'+CUR_WAREHOUSE_ID+'= 0 where bin_id='+from_bin);
		//2. set new location to stock_id
		alasql('update bin_master set warehouse_'+CUR_WAREHOUSE_ID+'= '+stock_id+' where bin_id='+to_bin);

		// alert("Stocks Successfully Transfered");		
	    toastr.success('Stocks Successfully Transfered!', 'Warehouse Management Team');

	//  Update UI
	intraTransfer();
});

/*Populate damaged Bins*/
damagedBins = function(){
	var sql = 'SELECT *, warehouse_'+CUR_WAREHOUSE_ID+' as occupied \
				FROM bin_master \
				WHERE bin_master.damaged_'+CUR_WAREHOUSE_ID+'= 1 \
				ORDER BY bin_master.bin_id \
				';	

			var bins = alasql(sql);
			// // build html table
			$('#tbody-damaged').empty();
			var tbody = $('#tbody-damaged');

			for (var i = 0; i < bins.length; i++) {
				var bin = bins[i];
				var $tr = $('<tr></tr>');
				$tr.append('<td >' + (i+1) + '</td>');
				$tr.append('<td class= "bin_id">' + bin.bin_id + '</td>');
				detail = alasql('column of select item.detail from stocks_master join item on stocks_master.item_id = item.id where stocks_master.stock_id='+bin.occupied)
				$tr.append('<td class= "item_name">' + detail[0] + '</td>');

				if(bin.occupied){
					$tr.append('<td style="text-align:center" class= "occupancy"><span style="color:orange; font-weight:bold">Occupied</span></td>');									
				}
				else{

					$tr.append('<td style="text-align:center" class= "occupancy"><span style="color:green; font-weight:bold">Empty</span></td>');									
				}
				$tr.append('<td style="text-align:center"><span class="highlight"> Damaged </span></td>');
				// $tr.append('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="DM-RP"><span></span> Repair</a></li></ul></li></ul></td>');
				$tr.append('<td style="text-align:center"> <button type="button" class="btn btn-success btn-xs DM-RP">Repair Bin</button> </td>');

				$tr.appendTo(tbody);
			}
			//-------------------

			/*Call the tablesorter plugin*/
			isEnabled = false;
		    callTableSorter($('#table-damaged'),$('#pager-damaged'),isEnabled,true,6);
}

$(document).on('click','.DM-RP', function() {
	console.log("Clicked");
	$tr = $(this).closest('tr');
	var bin_id = parseInt($tr.find('.bin_id').text());
	console.log(bin_id);
	records = alasql('select warehouse_'+CUR_WAREHOUSE_ID+' as occupied from bin_master where bin_id = '+bin_id+';');
	records = records[0];
	if(records.occupied == 0){
		alasql('update bin_master set damaged_'+CUR_WAREHOUSE_ID+' = 0 where bin_id = '+bin_id+';');
		// alert('The Rack/Bin has been repaired');
		toastr.success('The Rack/Bin has been repaired!', 'Warehouse Management Team');		

		intraTransfer();
		console.log("Emptied");
	}
	else{
		console.log("Occupied");
		// alert('The Rack is currently occupied, Please transfer the contents first');	
		toastr.error('The Rack is currently occupied, Please transfer the contents first!', 'Warehouse Management Team');		
	}
});

/* Inter Transfer Tab*/
$('#Inter-Tab').click(function(){
	interTransfer();
});
/* Dynamiccally changing bin dropdown values on dest whous change*/
$(document).on('change','.dest-whouse', function() {
	dest_warehouse_id = $(this).val();
	$dest_bin = $(this).closest('td').next();
	$dest_bin.find('select').empty();
	// console.log(dest_warehouse_id,$(this).text())
		var bins = alasql('select bin_id from bin_master where warehouse_'+dest_warehouse_id+'= 0 AND  damaged_'+dest_warehouse_id+'!= 1');
		for (var j = 0; j < bins.length; j++) {
			bin = bins[j];
			var $option = $('<option>');
			$option.text(bins[j].bin_id);
			$dest_bin.find('select').append($option);
		}
});
/* Inter Transfer Button Function*/
$(document).on('click','.inter-transfer.btn', function() {

	$tr = $(this).closest('tr');
	var from_bin = parseInt($($tr.children()[0]).text());
	var to_bin = parseInt($tr.find('.dest-bin').val());
	var to_whouse = parseInt($tr.find('.dest-whouse').val());

	var stock_id =parseInt($tr.find('.stock_id').text());
	console.log(from_bin, to_bin, stock_id);

	/*Update bin_master Table*/
		//1. set old to 0
		alasql('update bin_master set warehouse_'+CUR_WAREHOUSE_ID+'= 0 where bin_id='+from_bin);
		//2. set new location to stock_id
		alasql('update bin_master set warehouse_'+to_whouse+'= '+stock_id+' where bin_id='+to_bin);

	// alert("Stocks Successfully Transfered");		
    toastr.success('Stocks Successfully Transfered!', 'Warehouse Management Team');

	//  Update UI
	interTransfer();
});

interTransfer = function(){

	updateWHStatus();
	var sql = 'SELECT stocks_master.stock_id, stocks_master.item_id, item.detail, bin_master.bin_id, item.price, prev_month_sales.warehouse_'+CUR_WAREHOUSE_ID+' AS prev_sales \
			FROM stocks_master \
			JOIN bin_master ON bin_master.warehouse_'+CUR_WAREHOUSE_ID+' = stocks_master.stock_id \
			JOIN item ON item.id = stocks_master.item_id \
			JOIN prev_month_sales ON prev_month_sales.item_id = stocks_master.item_id \
			WHERE bin_master.warehouse_'+CUR_WAREHOUSE_ID+' != 0 \
			ORDER BY bin_master.bin_id \
			';	
	var stocks = alasql(sql);
	// // build html table
	$('#tbody-inter').empty();
	var tbody = $('#tbody-inter');

	/*Info for destination whouse dropdown*/
	var whouses =alasql('SELECT * FROM whouse where id != '+CUR_WAREHOUSE_ID+';');
	var $dest_whouse = $('<td><div class="input"><select class="form-control dest-whouse"></select></div></td>');
	for (var j = 0; j < whouses.length; j++) {
		var whouse = whouses[j];
		var option = $('<option>');
		option.attr('value', whouse.id);
		option.text(whouse.name);
		$dest_whouse.find('select').append(option);
	}
	var dest_ids =alasql('column of SELECT id FROM whouse where id != '+CUR_WAREHOUSE_ID+';');
	dest_warehouse_id = dest_ids[0];

	/*Info for destination bins dropdown*/
	var bins = alasql('select bin_id from bin_master where warehouse_'+dest_warehouse_id+'= 0 AND damaged_'+dest_warehouse_id+'!= 1');
	var $dest_bin = $('<td><div class="input"><select class="form-control dest-bin"></select></div></td>');
	for (var j = 0; j < bins.length; j++) {
		bin = bins[j];
		var $option = $('<option></option>');
		$option.text(bins[j].bin_id);
		$dest_bin.find('select').append($option);
	}
	for (var i = 0; i < stocks.length; i++) {
		var stock = stocks[i];
		var $tr = $('<tr></tr>');
		$tr.append('<td id = bin-'+stock.bin_id+'>' + stock.bin_id + '</td>');
		$tr.append('<td class= "stock_id">' + stock.stock_id + '</td>');
		$tr.append('<td class= "item_id">' + stock.item_id + '</td>');
		$tr.append('<td>' + stock.detail + '</td>');
		$tr.append('<td>' + stock.prev_sales + '</td>');
		
		$dest_whouse.clone().appendTo($tr);
		$dest_bin.clone().appendTo($tr);
		$tr.append('<td><button class="inter-transfer btn btn-sm" type="button"><span class="glyphicon glyphicon-transfer" style="font-size: 10px;"></span>&nbsp;Transfer</button></td>');

		$tr.appendTo(tbody);
	}
	//-------------------

	/*Call the tablesorter plugin*/
	isEnabled = false;
    callTableSorter($('#table-inter'),$('#pager-inter'),isEnabled,true,6);
}
/* Update Warehouse Occupancy Status*/
updateWHStatus = function(){
 
 			var rows = alasql('SELECT * FROM whouse;');
		    for (var i = 0; i < rows.length; i++) {
			    var row = rows[i];
			    total_bins = parseInt(alasql('column of select count(*) from bin_master'));
			    occ_bins = parseInt(alasql('column of select count(*) from bin_master where warehouse_'+row.id+'!= 0'));
			    console.log(total_bins,occ_bins);
			    var perc = Math.round((occ_bins/total_bins)*100);
		     	$('.wh'+row.id+'-status').text(perc+'%');
		     	$('.wh'+row.id+'-progress').css("width",perc+'%');
		    }


	// $('.wh1-status').text();
	// $('.wh2-status').text();
	// $('.wh3-status').text();
	// $('.wh4-status').text();	
}

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

  $('.print-table').click(function(){
  	console.log('Print table clicked');
    $('#table-dead-stocks').trigger('printTable');
  });

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
	}		