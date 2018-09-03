/*
reorder mechanism :) next 

*/
// CUR_WAREHOUSE_ID = 1;
var	BO = "WMS";	
var CUR_WAREHOUSE_ID = parseInt(localStorage.sessionWH);

var	BO = "WMS"+CUR_WAREHOUSE_ID;	
var toggle=true;

data1 = [];
console.log(localStorage.sessionWH);


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

$('#Requests-Open-Tab').click();
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
	    timeOut: 5000
	};		

	sendAlert();	
	
}); /* End of Document Ready*/

//--------------------------------------------------------------------------------------------------------
/*External Functions*/
//-------------------
$('#show-workflow').click(function(){
		if(toggle){
			$('#workflow').show();
		}
		else{
			$('#workflow').hide();
		}
		toggle = !toggle;
        // $('#workflow').delay(3000).fadeOut(); 
});  
//--------------------------------------------------------------------------------------------------------
/*	Tab:4	Handling Incoming Request*/
$('#Requests-Tab').click(function(){
	$('#Requests-Open-Tab').click();
});

$('#Requests-Open-Tab').click(function(){
	var sql = 'SELECT order_requests.request_id, order_requests.item_id, item.detail, order_requests.quantity,  order_requests.status \
			FROM order_requests \
			JOIN item ON item.id = order_requests.item_id \
			WHERE order_requests.status != "Closed" \
			AND order_requests.warehouse_id = '+CUR_WAREHOUSE_ID+' \
			ORDER BY order_requests.request_id \
			';	
	var tableid = "open-requests";
	showRequests(sql,tableid); 			
});

$('#Requests-Closed-Tab').click(function(){
	var sql = 'SELECT order_requests.request_id, order_requests.item_id, item.detail, order_requests.quantity,  order_requests.status \
			FROM order_requests \
			JOIN item ON item.id = order_requests.item_id \
			WHERE order_requests.status = "Closed"\
			AND order_requests.warehouse_id = '+CUR_WAREHOUSE_ID+' \
			ORDER BY order_requests.request_id \
			';	
	var tableid = "closed-requests";
	showRequests(sql,tableid); 			

});

showRequests = function(sql, tableid){

	var orders = alasql(sql);
	// // build html table
	$('#tbody-'+tableid).empty();
	var tbody = $('#tbody-'+tableid)

	

	for (var i = 0; i < orders.length; i++) {
		var order = orders[i];
		var $tr = $('<tr class="tablesorter-hasChildRow"></tr>');

		//checking for child rows
		var child_sql = 'SELECT stocks_master.stock_id, stocks_master.entry_date, bin_master.bin_id FROM stocks_master JOIN bin_master ON stocks_master.stock_id = bin_master.warehouse_'+CUR_WAREHOUSE_ID+' WHERE stocks_master.item_id = '+order.item_id+' ORDER BY entry_date';
		var records = alasql(child_sql);
		var child_exists = records.length==0?false:true	;
		var pad = 0;
		if(child_exists){
			pad = 1;
		}

		console.log("child_exists:"+child_exists);		
		$tr.append('<td rowspan="'+(records.length+1+pad)+'">' + order.request_id + '</td>');
		// $tr.append('<td class= "item_id">' + order.item_id + '</td>');
		$tr.append('<td rowspan="'+(records.length+1+pad)+'" class="item_id">'+(child_exists?'<a href=# class="toggle-class" data-toggle="tooltip" data-placement="right" title="Click to toggle seeing the individual goods">':'')+order.item_id + (child_exists?'</a>':'')+'</td>');

		$tr.append('<td>' + order.detail + '</td>');
		$tr.append('<td class = "qty">' + order.quantity+ '</td>');

		$td = $('<td style="text-align:center"><span class="status">' + order.status + '</span></td>');

			$status = $td.find('.status');

			var status_mod = order.status;
			if(status_mod.indexOf("Stocks Available") > 0 ){
				status_mod = "Stocks Available";
			}			
				switch(status_mod){
				   
				    case "Open":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-info");
						break;
				    case "Stocks Available":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-success");
						break;
				    case "Processed":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-warning");
						break;
				    case "Closed":
						$status.removeClass();
						$status.addClass("label");
						break;						
				    default:
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-danger");					
						break;
				}
				$status.addClass("status");							

			$tr.append($td);

		$def_dropdown = $('<td class="action">\
						<ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="OR-Check-Availability active"><span></span> Check Stock Availability </a></li><li><a href="#" class="OR-Processing"><span></span> Process Order</a></li><li role="separator" class="divider"></li><li><a href="#" class="OR-Close"><span></span> Close Order</a></li></ul></li></ul>\
						</td>');

		if(status_mod.indexOf("Stocks Available") > 0 ){
			status_mod = "Stocks Available";
		}

			switch(status_mod){

			    case "Stocks Available":			   	
			    	$def_dropdown.find('.OR-Check-Availability').removeClass("active");
			    	$def_dropdown.find('.OR-Processing').addClass("active");
			    	$def_dropdown.find('.OR-Close').removeClass("active");
					$tr.append($def_dropdown);
		        	break;
			    
			    case "Processed":			   	
			    	$def_dropdown.find('.OR-Check-Availability').removeClass("active");
			    	$def_dropdown.find('.OR-Processing').removeClass("active");
			    	$def_dropdown.find('.OR-Close').addClass("active");
					$tr.append($def_dropdown);
		        	break;

			    case "Closed":			   	
			    	$def_dropdown.find('.OR-Check-Availability').removeClass("active");
			    	$def_dropdown.find('.OR-Processing').removeClass("active");
			    	$def_dropdown.find('.OR-Close').removeClass("active");
					$tr.append($def_dropdown);
		        	break;	

			    case "Stocks Not Available":			   	
					$def_dropdown = $('<td>\
						<ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="OR-Close active"><span></span> Reject & Close Order</a></li></ul></li></ul>\
						</td>');	
					$tr.append($def_dropdown);
		        	break;		        	 
		               
			    default:
					$tr.append($def_dropdown);

			}

		$tr.appendTo(tbody);

		if(child_exists){
					$tr_child = $('<tr class="tablesorter-childRow" ></tr>');
					
					$th = $('<th >');
					$th.text("S.No");
					$tr_child.append($th);
							
					$th = $('<th >');
					$th.text("Stock ID");
					$tr_child.append($th);
							
					$th = $('<th>');
					$th.text("Bin ID");
					$tr_child.append($th);

					$th = $('<th>');
					$th.text("Entry Date");
					$tr_child.append($th);

					$tr_child.appendTo(tbody);		
			}
		/*Building Child Tables*/
			for (var j = 0; j < records.length; j++) {
				
				var record = records[j];
				$tr_child = $('<tr class="tablesorter-childRow"></tr>');
	
				$td = $('<td></td>');
				$td.text(j+1);
				$tr_child.append($td);

				$td = $('<td>');
				$td.text(record.stock_id);
				$tr_child.append($td);

				$td = $('<td>');
				$td.text(record.bin_id);
				$tr_child.append($td);

				$td = $('<td>');
				$td.text(record.entry_date);
				$tr_child.append($td);
				$tr_child.appendTo(tbody);

			}
	}
	//-------------------

	/*Call the tablesorter plugin*/
	isEnabled = false;
    callTableSorter($('#table-'+tableid),$('#pager-'+tableid),isEnabled,true,6);
};


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
		$var.unbind("click");
		$var.bind("click");

		$var.trigger("destroy");

		$var.tablesorter({
		theme : "bootstrap",
		
      	cssChildRow : "tablesorter-childRow",
		
		widthFixed: true,
		headerTemplate : '{content} {icon}', 
		widgets : [ "uitheme", "filter", "zebra", 'toggle-ts' ],
		widgetOptions : {
		  zebra : ["even", "odd"],
		  filter_external : '.search',
		  filter_reset : ".reset-filters",
		  filter_cssFilter: "form-control",
	      filter_columnFilters: filterVal,
          
          filter_childRows  : true,

	      // toggle-ts widget
	      toggleTS_hideFilterRow : true,     
	      headers: {
		  	disabledCols : {
			    sorter: false,
			    filter: false
		  	}}
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
	
		    $( this )
		      .closest( 'tr' )
		      .nextUntil( 'tr.tablesorter-hasChildRow' )
		      .find( 'th' )	
		      .toggleClass( 'hidden' );

		    $( this )
		      .closest( 'tr' )
		      .nextUntil( 'tr.tablesorter-hasChildRow' )
		      .find( 'td' )	
		      .toggleClass( 'hidden' );


		    return false;
		  });

	};
//-------------------

//--------------------------------------------------------------------------------------------------------
// Order Actions -> change status

// -----------------OR ACTIONS ------------------------------
$(document).on('click','.OR-Check-Availability', function() {

	if($(this).hasClass("active")){
		$this = $(this)
		//remove active class
		$this.removeClass("active");
		//add to next 
		$li = $this.closest('li');
		$a = $this.closest('li').next('li').find('a');
		$a.addClass("active");

		$tr = $(this).closest('tr');
		$tr.find('.item_id a').click();
		var reqd_qty = 	parseInt($tr.find('.qty').text());

		// available??
		var available = $tr.nextUntil('.tablesorter-hasChildRow').length - 1;
		console.log(available);
		if(available >= reqd_qty ){
			setStatus($(this),available+" Stocks Available")
		}
		else{
			$status = $tr.find('.status');
			setStatus($(this),"Stocks Not Available");
			
			toastr.success('Reorder Request has been sent to Procurement Team','Warehouse Management Team');

			$td_action = $tr.find('.action');
			// console.log($td_action.get(0));
			$td_action.empty();
			$td_action.append('<td>\
						<ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="OR-Close active"><span></span> Reject & Close Order</a></li></ul></li></ul>\
						</td>');		
			// console.log($td_action.get(0));

		}
	}
	else{
		// alert('Please follow the workflow order');	
		toastr.error('Please follow the workflow order','Warehouse Management Team');
       	$('#workflow').show(); $('#workflow').delay(4500).fadeOut(); 			

	}	
});

$(document).on('click','.OR-Processing', function() {

	if($(this).hasClass("active")){
		$this = $(this)
		//remove active class
		$this.removeClass("active");
		//add to next 
		$li = $this.closest('li');
		$a = $this.closest('li').next('li').next('li').find('a');
		$a.addClass("active");

		// 1. Proceed only if available
		$tr = $(this).closest('tr');
		$tr.find('.item_id a').click();
		var item_id = parseInt($tr.find('.item_id').text());
		var reqd_qty = 	parseInt($tr.find('.qty').text());	
		var available = $tr.nextUntil('.tablesorter-hasChildRow').length - 1;
		// var available = alasql('column of select count(*) from stocks_master where item_id ='+item_id+' where warehouse_'+CUR_WAREHOUSE_ID+'= group by stock_id');
		
		
		if(available < reqd_qty ){
			// window.confirm('Required Number of stocks are not Available, Request needs to be rejected!!');
			toastr.error('Required Number of stocks are not Available, Request needs to be rejected!!',"Warehouse Management Team")			
			setStatus($(this),"Closed");

		}
		else{

			setStatus($(this),"Processed");

		// Find the required number of stocks
			var stock_ids = alasql('column of select stock_id from stocks_master where item_id ='+item_id+' AND warehouse_'+CUR_WAREHOUSE_ID+' = 1 order by entry_date');
			var bins =  alasql('column of SELECT bin_master.bin_id FROM stocks_master JOIN bin_master ON stocks_master.stock_id = bin_master.warehouse_'+CUR_WAREHOUSE_ID+' WHERE stocks_master.item_id = '+item_id+' ORDER BY entry_date');

		// 2. Make changes in the database
			// 2.1 -  Stocks Master
			stock_names = "";
			for (var i = 0; i < reqd_qty; i++) {
				alasql('delete from stocks_master where stock_id = '+stock_ids[i]);
			// 2.2 -  Bin Master
				alasql('update bin_master set warehouse_'+CUR_WAREHOUSE_ID+'= 0  where bin_id = '+bins[i]);
				stock_names = stock_names+" ["+stock_ids[i]+"]";
			}
			// 2.3 -  Warehouse Master
			if(reqd_qty == available){
				alasql('update warehouse_master set warehouse_'+CUR_WAREHOUSE_ID+'= 0  where item_id = '+item_id);

			}
			// window.confirm('Order has been processed: Stocks - '+stock_names+' has been sent for shipping!!');
			toastr.success('Order has been processed: Stocks - '+stock_names+' has been sent for shipping!',"Warehouse Management Team")			

		// 3. AUTOMATIC RE-ORDERING MODULE
					// 1. Get safety level & reorder_limit of the item in the particular warehouse
					var critical_limit = alasql(' column of select safety_stocks_'+CUR_WAREHOUSE_ID+' from warehouse_master \
							where item_id ='+item_id+';');
					var reorder_qty = alasql(' column of select reorder_value_'+CUR_WAREHOUSE_ID+' from warehouse_master \
							where item_id ='+item_id+';');
					// 2. Check with safety level
					console.log('Available',(available-reqd_qty));
					console.log('critical limit',(critical_limit[0]));
					console.log(typeof critical_limit[0]);
					
					if((available-reqd_qty) <= critical_limit[0]){
					// 3. Sent reorder request to procurement team if required-- supplier_reorders
						// reorder_id INT IDENTITY, item_id INT, quantity INT, warehouse_id INT, request_date DATE, status STRING			

						reorder_id = parseInt(alasql('column of select max(reorder_id) from supplier_reorders;'));

						if(!reorder_id){
							reorder_id = 1;
						}	
						else{
							reorder_id = reorder_id + 1;
						}
						var currentDate = moment().format('YYYY-MM-DD');

						values = [reorder_id, item_id, reorder_qty,CUR_WAREHOUSE_ID,currentDate,"Open"];
						alasql('INSERT INTO supplier_reorders VALUES(?,?,?,?,?,?);',values);
						// alert('Inventory Stocks of Item :'+item_id+' has reached the critical limit :'+critical_limit+', A reorder request with Reorder ID :'+reorder_id+' has been sent!');
						toastr.info('Inventory Stocks of Item :'+item_id+' has reached the critical limit :'+critical_limit+', A reorder request with Reorder ID :'+reorder_id+' has been sent!',"Warehouse Management Team");

						// Send notifications to Procurement Team

						var msg = 'Reorder Request Received: '+reorder_qty+' quantity of Item ID : '+item_id+' needs to be reordered';
						var msg_length = parseInt('column of select max(id) from messages');
						var msg_id = 1;

						if(msg_length){
							msg_id = msg_length + 1;
						}

						values = {id:msg_id,read:0,sender:"Warehouse Manager",bo:"PO_QA",content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
						console.log(values);
						alasql('insert into messages values ?',[values]);
						// toastr.success('Procurement Team has been successfully notified','Warehouse Management Team');						

					}
		

			var sql = 'SELECT order_requests.request_id, order_requests.item_id, item.detail, order_requests.quantity,  order_requests.status \
			FROM order_requests \
			JOIN item ON item.id = order_requests.item_id \
			WHERE order_requests.status != "Closed" \
			AND order_requests.warehouse_id = '+CUR_WAREHOUSE_ID+' \
			ORDER BY order_requests.request_id \
			';	
			var tableid = "open-requests";
			showRequests(sql,tableid); 			
		// $tr.find('.item_id a').click();
		// 3. Add a sales record
		
		}
	}
	else{
		// alert('Please follow the workflow order');	
		toastr.error('Please follow the workflow order','Warehouse Management Team');
       	$('#workflow').show(); $('#workflow').delay(4500).fadeOut(); 			

	}			
});


$(document).on('click','.OR-Close', function() {
	if($(this).hasClass("active")){
	$this = $(this);
	    $.confirm({
		    title: 'Once closed you can\'t change the status anymore!',
		    // content: 'Simple confirm!',
		    buttons: {
		        confirm: function () {
			 		$this.removeClass();
		 			setStatus($this,"Closed");
		 			console.log("setting status as closed");
					updateSidebarNotify(BO);
			    },
		        cancel: function () {
		            // $.alert('Canceled!');
		        },
		    }
			});
	 	}	
	else{
		// alert('Please follow the workflow order');	
		toastr.error('Please follow the workflow order','Warehouse Management Team');
	    $('#workflow').show(); $('#workflow').delay(4500).fadeOut(); 			

	}	
});


setStatus = function($var, status){

	$tr = $var.closest('tr');
	var item_id = parseInt($tr.find('.item_id').text());
	alasql('update order_requests set status = "'+status+'" where item_id='+item_id+'AND warehouse_id = '+CUR_WAREHOUSE_ID+' \
');	
	$status = $tr.find('.status');
	$status.text(status);

	if(status.indexOf("Stocks Available") > 0 ){
		status = "Stocks Available";
	}
	if(status == "Stocks Available"){
		$status.removeClass();
		$status.addClass("status");
		$status.addClass("label");
		$status.addClass("label-success");
	
	}
	if(status== "Processed"){
		$status.removeClass();
		$status.addClass("status");
		$status.addClass("label");
		$status.addClass("label-warning");
	
	}			
	if(status == "Closed"){
		$status.removeClass();
		$status.addClass("status");
		$status.addClass("label");

	}	
	if(status == "Stocks Not Available"){
		$status.removeClass();
		$status.addClass("status");
		$status.addClass("label");
		$status.addClass("label-danger");		

	}				
}


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