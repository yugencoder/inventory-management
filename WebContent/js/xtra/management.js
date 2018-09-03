/*
reorder mechanism :) next 

*/
// CUR_WAREHOUSE_ID = 1;
var dataTable;
data1 = [];
// console.log(localStorage.sessionWH);
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

$('#OldStock-Tab').click();
//-------------------
	// Show Messages
	showMessages(BO);
	
	// Update Unread Messages Count 
	updateMsgCount(BO);

	// Update Sidebar notifications
	updateSidebarNotify(BO);

	// datepicker
    $('#date-range .input-daterange').datepicker({
    	format: 'yyyy-mm-dd',
        keyboardNavigation: false,
        forceParse: false,
        autoclose: true
    });
	
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
/*	Tab:2- Old & Dead Stocks Management*/

$('#Old-DeadStock-Tab').click(function(){
	$('#OldStock-Tab').click();	
	/**/
});

$('#OldStock-Tab').click(function(){
	showOldStock();	
});
	
showOldStock  = function(){
	var startDate =  alasql('column of select oldstock_low from misc where id = 1');
	var endDate =  alasql('column of select oldstock_up from misc where id = 1');
	var oldstocks_disc = alasql('column of select discount from misc where id = 1');

	/*Setting Panel Values*/
	$('#oldstocks-low-date').val(startDate);
	$('#oldstocks-up-date').val(endDate);
	$('#discount-oldstocks').val(oldstocks_disc);

	var sql = 'select stocks_master.stock_id, stocks_master.item_id, stocks_master.entry_date, stocks_master.discount, item.code, item.detail, item.price FROM stocks_master JOIN item ON stocks_master.item_id = item.id where stocks_master.entry_date <="'+endDate+'" AND stocks_master.entry_date >= "'+startDate+'" AND stocks_master.warehouse_'+CUR_WAREHOUSE_ID+'=1;';
	var old_stocks = alasql(sql);

	$('#tbody-old-stocks').empty();;

	// // build html table
	var tbody = $('#tbody-old-stocks');
	for (var i = 0; i < old_stocks.length; i++) {
		var old_stock = old_stocks[i];
		var tr = $('<tr></tr>');
		// tr.append('<td>' + wm.item_id + '</td>');
		// tr.append('<td rowspan="'+(stocks.length+1)+(child_exists?'<a href=# class="toggle-class">':'')+ wm.item_id + (child_exists?'</a>':'')+'</td>');
		tr.append('<td class="stock_id">'+ old_stock.stock_id + '</td>');
		tr.append('<td class="item_id">' + old_stock.item_id + '</td>');
		tr.append('<td class="item_code">' + old_stock.code + '</td>');
		tr.append('<td class="item_name">' + old_stock.detail + '</td>');
		tr.append('<td>' + old_stock.price + '</td>');
		tr.append('<td class = "discount"><a href="#" class="highlight-class" data-toggle="tooltip" data-placement="left" title="Click to Update Discount">'+ old_stock.discount + '</td>');
		// if(old_stock.discount == 0){
		// 	tr.append('<td> NA </td>');
		// }
		// else{
		// 	var d_price = old_stock.price - Math.round(old_stock.price*old_stock.discount*0.01);
		// 	tr.append('<td>'+d_price+'</td>');
		// }
		tr.append('<td>' + old_stock.entry_date+ '</td>');
		tr.appendTo(tbody);
	}
	//-------------------

	/*Call the tablesorter plugin*/
	isEnabled = false;
    callTableSorter($('#table-old-stocks'),$('#pager-old-stocks'),isEnabled,true,6);
};


$(document).on('click','.discount a', function() {
	console.log("Changing Discount");
	$tr = $(this).closest('tr');
	var stock_id = parseInt($tr.find('.stock_id').text());
	var item_id = parseInt($tr.find('.item_id').text());
	var item_code = $tr.find('.item_code').text();
	var item_name = $tr.find('.item_name').text();
	var discount = parseInt($tr.find('.discount').text());

	$('.modal-stock_id').text(stock_id);
	$('.modal-item_code').text(item_code);
	$('.modal-item_name').text(item_name);
	$('.modal-discount').val(discount);
	
	$('#discountModal').modal('show');

	//Setting up Graph
	dest_warehouse_id = parseInt($(this).val());
	records = alasql('select * from sales_data where item_id ='+item_id+' and warehouse_id ='+CUR_WAREHOUSE_ID);
	records = records[0];
	data1 = [];
	data1.push(records.january);data1.push(records.february);data1.push(records.march);data1.push(records.april);data1.push(records.may);data1.push(records.june);data1.push(records.july);data1.push(records.august);data1.push(records.september);data1.push(records.october);data1.push(records.november);data1.push(records.december);;
	updateGraph();

});

$('.update_discount').click(function(){
	var disc = $('.modal-discount').val();
	var item_id = parseInt($tr.find('.item_id').text());
	
	console.log(typeof disc);
	var sql = 'update stocks_master set discount = '+disc+' where item_id = '+item_id+';';
	alasql(sql);
	console.log(sql);
	// alert("Discount has been successfully set");
    toastr.success('Discount has been successfully set', 'Warehouse Management Team');	
	showOldStock();
	$('#discountModal .close').click();
});

updateGraph = function(){
		var config = {
		type: 'line',
		data: {
		labels: ["Jan,16 ", "Feb,16 ", "Mar,16 ", "Apr,16 ", "May,16 ", "June,16 ", "July,16 ", "Aug,16 ", "Sept,16 ", "Oct,16 ", "Nov,16 ", "Dec,16"],
		datasets: [{
		    label: "Sales of the Item",
		    borderColor: window.chartColors.blue,
		    fill: false,
		    lineTension: 0.1,
		    data: data1,

		}]
		},
		options: {
		responsive: true,
		title:{
		    display:true,
		    text:'Item Sales History'
		},
		tooltips: {
		    mode: 'index',
		},
		hover: {
		    mode: 'index'
		},
		scales: {
		    xAxes: [{
		        display: true,
		        scaleLabel: {
		            display: true,
		            labelString: 'Month'
		        }
		    }],
		    yAxes: [{
		        display: true,
		        scaleLabel: {
		            display: true,
		            labelString: 'Sales Value'
		        },
		    }]
		},
		}
		};	
	    var ctx = document.getElementById("canvas").getContext("2d");
	    window.myLine = new Chart(ctx, config);		
};

$('.apply-oldstocks-button').click(function(){
	//Getting values 
	startDate = $('#oldstocks-low-date').val();
	endDate = $('#oldstocks-up-date').val();

	m_startDate = moment(startDate);
	m_endDate = moment(endDate);

	oldstocks_disc = $('#discount-oldstocks').val();
	console.log(m_startDate);
	console.log(m_endDate);
	if (m_endDate.isBefore(m_startDate)) {
   		// alert("End date must be greated than start date.");
	    toastr.warning('End date must be greated than start date', 'Warehouse Management Team');	

	}
	else{
		//Update on DB
		sql1 = 'update misc set oldstock_low  ="'+startDate+'" where id = 1;';
		console.log(sql1);
		alasql(sql1);
		sql1 = 'update misc set oldstock_up  ="'+endDate+'" where id = 1;';
		console.log(sql1);
		alasql(sql1);
		sql1 = 'update misc set discount  = "'+oldstocks_disc+'" where id = 1;';
		console.log(sql1);
		alasql(sql1);

		//1. Uniformly distribute discount to the old-stocks wrt to date.
			disc = $('#discount-oldstocks').val().split('-');
			disc1 = parseInt(disc[0]);
			disc2 = parseInt(disc[1]);  
			if(!disc2){

				var sql = 'update stocks_master set discount = '+disc1+' where entry_date >="'+startDate+'" AND entry_date <= "'+endDate+'";';
				alasql(sql);
				console.log(sql);
			}
			else{
				step_size = 5;	
				steps = Math.round((disc2 - disc1)/step_size) + 1;
				months = m_endDate.diff(m_startDate,'months',true);
				interval = Math.round(months/steps);

				var currentDate = m_startDate.clone();
				var result = [];
				while (currentDate.isBefore(m_endDate)) {
				    result.push(currentDate.format("YYYY-MM-DD"));
				    currentDate.add(interval, 'month');
				}
				result.push(endDate);

					var sql = 'select stocks_master.stock_id, stocks_master.entry_date, stocks_master.discount, item.code, item.detail, item.price FROM stocks_master JOIN item ON stocks_master.item_id = item.id where stocks_master.entry_date <="'+endDate+'" AND stocks_master.entry_date >= "'+startDate+'" AND stocks_master.warehouse_'+CUR_WAREHOUSE_ID+'=1 ORDER BY stocks_master.entry_date DESC;';
					var records = alasql(sql);
					console.log(m_startDate);
					console.log(m_endDate);
					console.log(result);

					//adjusting
					var new_disc = disc2;
					for (var i = 0; i < (result.length-1); i++) {
						var sql = 'update stocks_master set discount = '+new_disc+' where entry_date >="'+result[i]+'" AND entry_date <= "'+result[i+1]+'";';
						new_disc = new_disc - step_size;
						if(new_disc < disc1){
							new_disc = disc1;
						}
						console.log(sql);	
						alasql(sql);
					}
			}

		//2. Show graphs + new edit value modal
			// 2.1. First make discount clickable
			// 2.2  Make  the layouts -> graph ones and new discount value in the modal

		//call Function
		showOldStock();
		// alert("Changes successfully Applied");
	    toastr.success('Changes have been successfully Applied', 'Warehouse Management Team');	


	}	
});



$('#DeadStock-Tab').click(function(){

	if(dataTable != null)
	    dataTable.destroy();


	var lt1_date =  alasql('column of select deadstock from misc where id = 1');
	$('#deadstocks-date').val(lt1_date);

	var sql = 'select stocks_master.stock_id, stocks_master.entry_date, item.code, item.detail, item.price FROM stocks_master JOIN item ON stocks_master.item_id = item.id where stocks_master.entry_date <="'+lt1_date+'" AND stocks_master.warehouse_'+CUR_WAREHOUSE_ID+'=1 ;';
	var dead_stocks = alasql(sql);

	$('#tbody-dead-stocks').empty();;

	// // build html table
	var tbody = $('#tbody-dead-stocks');
	for (var i = 0; i < dead_stocks.length; i++) {
		var dead_stock = dead_stocks[i];
		var tr = $('<tr></tr>');
		// tr.append('<td>' + wm.item_id + '</td>');
		// tr.append('<td rowspan="'+(stocks.length+1)+(child_exists?'<a href=# class="toggle-class">':'')+ wm.item_id + (child_exists?'</a>':'')+'</td>');
		tr.append('<td>'+ dead_stock.stock_id + '</td>');
		tr.append('<td>' + dead_stock.code + '</td>');
		tr.append('<td>' + dead_stock.detail + '</td>');
		tr.append('<td>' + dead_stock.price+ '</td>');
		tr.append('<td>' + dead_stock.entry_date+ '</td>');
		tr.appendTo(tbody);
	}
	//-------------------

	/*Call the tablesorter plugin*/
	isEnabled = false;
    // callTableSorter($('#table-dead-stocks'),$('#pager-dead-stocks'),isEnabled,true,6);	

	// Datatable
	dataTable = $('#table-dead-stocks').DataTable({
                dom: '<"html5buttons"B>lTfgitp',
                buttons: [
                    {extend: 'pdf', title: 'ExampleFile'},
                    {extend: 'print',
                     customize: function (win){
                            $(win.document.body).addClass('white-bg');
                            $(win.document.body).css('font-size', '10px');
                            $(win.document.body).find('table')
                                    .addClass('compact')
                                    .css('font-size', 'inherit');
                    }
                    }
                ]
            });


});

$('.apply-deadstocks-button').click(function(){
	
	var new_date = $('#deadstocks-date').val();
	alasql('update misc set deadstock ="'+new_date+'";');
	$('#DeadStock-Tab').click();
	// alert("Changes successfully Applied");
    toastr.success('Changes have been successfully Applied', 'Warehouse Management Team');	



});

$('.clear-deadstocks-button').click(function(){
	console.log('clearing deadstocks!');
		var r = false;
	    $.confirm({
	    title: 'This will remove all the deadstocks ?',
	    // content: 'Simple confirm!',
	    buttons: {
	        confirm: function () {
				removeDeadStocks();
				$('#DeadStock-Tab').click();
				// alert("Changes successfully Applied");
			    toastr.success('Changes have been successfully Applied', 'Warehouse Management Team');	
		    },
	        cancel: function () {
	            // $.alert('Canceled!');
	        },
	    }
		});
	// r = window.confirm("Are you sure you want to remove all the deadstocks ?")
	if(r == true){
		


	}

	// Clear Dead Stocks -- in DB 
});	

removeDeadStocks = function(){

	var date =  alasql('select deadstock from misc where id = 1');
		lt1_date = date[0].deadstock;
		var sql = 'select stocks_master.stock_id FROM stocks_master JOIN item ON stocks_master.item_id = item.id where stocks_master.entry_date <="'+lt1_date+'" AND stocks_master.warehouse_'+CUR_WAREHOUSE_ID+'=1 ;';
		var dead_stocks = alasql(sql);

		for (var i = 0; i < dead_stocks.length; i++) {
			dead_stock = dead_stocks[i] ;

			// 1. warehouse_master
			item_id = alasql('column of select item_id from stocks_master where stock_id ='+dead_stock.stock_id+' AND warehouse_'+CUR_WAREHOUSE_ID+'=1');
			console.log('column of select item_id from stocks_master where stock_id ='+dead_stock.stock_id);
			console.log(item_id);
			items = alasql('column of select item_id from stocks_master where item_id ='+item_id[0]);
			console.log('column of select item_id from stocks_master where item_id ='+item_id[0]);
			console.log(items);
			
			if(items.length == 1){
				alasql('update warehouse_master set warehouse_'+CUR_WAREHOUSE_ID+' = 0  where item_id ='+item_id);
			}
			// . bin_master
			alasql('update bin_master set warehouse_'+CUR_WAREHOUSE_ID+' = 0  where warehouse_'+CUR_WAREHOUSE_ID+' ='+dead_stock.stock_id);
			console.log('update bin_master set warehouse_'+CUR_WAREHOUSE_ID+' = 0  where warehouse_'+CUR_WAREHOUSE_ID+' ='+dead_stock.stock_id);

			// . stocks_master
			alasql('delete from stocks_master where stock_id ='+dead_stock.stock_id+' AND warehouse_'+CUR_WAREHOUSE_ID+'=1');
			console.log('delete from stocks_master where stock_id ='+dead_stock.stock_id+' AND warehouse_'+CUR_WAREHOUSE_ID+'=1');

	
		}


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
		print_rows       : 'v',         // (a)ll, (v)isible, (f)iltered, or custom css selector
		print_columns    : 'v',         // (a)ll, (v)isible or (s)elected (columnSelector widget)
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