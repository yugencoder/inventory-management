	/*Order Fulfillment JS File*/
var	BO = "OF";	
var city_map = {
				"Bangalore":1,
				"Hyderabad":2,
				"Chennai":3,
				"Delhi":4
			   };

var $dilemma = $();
var toggle=true;


$(document).ready(function () {
//------------------------------------------------------------------------------------------------------------>>
		// if(!SESSION.userLogged()){
		// 	window.location.assign('index.html');
		// }	

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

//------------------------------------------------------------------------------------------------------------>>
// Google API
	var map;
	var geocoder;
	var bounds = new google.maps.LatLngBounds();
	var markersArray = [];

	//var origin1 = new google.maps.LatLng(55.930, -3.118);
	var origin;
	var destination;
	//var destinationB = new google.maps.LatLng(50.087, 14.421);

	var destinationIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=D|FF0000|000000';
	var originIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=O|FFFF00|000000';

//------------------------------------------------------------------------------------------------------------>>
// Others
$('#Open-Orders-Tab').click();

// Update Sidebar notifications
updateSidebarNotify(BO);

// Define Toaster
toastr.options = {
    closeButton: true,
    progressBar: true,
    showMethod: 'slideDown',
    timeOut: 4000
};	

}); /* End of Document Ready*/

/*External Functions*/

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


//1. Customer Orders--------------------------------------------------------------------------------------------->>
$('#Orders-Tab').click(function(){
	
	console.log("Inside Orders Tab");
	$('#Open-Orders-Tab').click();
});


$('#Open-Orders-Tab').click(function(){	
	
	console.log("Inside Open Orders Tab");	

	var sql = 'select customer_orders.*,item.* from customer_orders join item on item.id = customer_orders.item_id where status != "Closed"'
	var tableid = 'open-orders';
	showOrders(sql,tableid);

});

$('#Closed-Orders-Tab').click(function(){
	var sql = 'select customer_orders.*,item.* from customer_orders join item on item.id = customer_orders.item_id where status == "Closed"'
	var tableid = 'closed-orders';
	showOrders(sql,tableid);

});

showOrders = function(sql, tableid){

	console.log("Inside showOrders");

	var cust_orders = alasql(sql);
	var $tbody = $('#tbody-'+tableid);
		$tbody.empty();
	// Building Customer Order Table
	for (var i = 0; i < cust_orders.length; i++) {
		cust_order = cust_orders[i];
		var $tr = $('<tr></tr>');
		// tr.append('<td>' + wm.item_id + '</td>');
		// tr.append('<td rowspan="'+(stocks.length+1)+(child_exists?'<a href=# class="toggle-class">':'')+ wm.item_id + (child_exists?'</a>':'')+'</td>');
		$tr.append('<td class="order_id">'+ cust_order.order_id+'</td>');
		$tr.append('<td class = "customer_id">'+ cust_order.customer_id+'</td>');
		$tr.append('<td class="item_id">'+ cust_order.item_id+'</td>');
		$tr.append('<td class="item_name">'+ cust_order.detail+'</td>');	
		$tr.append('<td class="qty">'+ cust_order.quantity+'</td>');
		$tr.append('<td>'+ cust_order.order_date+'</td>');
		$tr.append('<td class = "city">'+ cust_order.city+'</td>');	
		$td = $('<td style="text-align:center"><span class="status">' + cust_order.status + '</span></td>');
			$status = $td.find('.status');
				switch(cust_order.status){
				   
				    case "Open":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-info");
						break;
				    case "Available":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-success");
						break;
				    case "Not Available":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-danger");
						break;
				    case "Request Forwarded":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-success");
						break;
				    case "Suggestions Sent":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-warning");
						break;				    
					default:
						$status.removeClass();
						$status.addClass("label");
						break;
				}
				$status.addClass("status");							

			$tr.append($td);



		$def_dropdown = $('<td>\
				<ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="OF-AV active"><span></span> Check Availability </a></li><li><a href="#" class="OF-WH"><span></span> Send to Warehouse</a></li><li role="separator" class="divider"></li><li><a href="#" class="OF-CL"><span></span> Close Order</a></li></ul></li></ul>\
			</td>');

		console.log(cust_order.status);

		switch(cust_order.status){

				case "Available":			   	
					$def_dropdown.find('.OF-AV').removeClass("active");
					$def_dropdown.find('.OF-WH').addClass("active");
					$def_dropdown.find('.OF-CL').removeClass("active");
					$tr.append($def_dropdown);
					break;

				case "Request Forwarded":
					$def_dropdown.find('.OF-AV').removeClass("active");
					$def_dropdown.find('.OF-WH').removeClass("active");
					$def_dropdown.find('.OF-CL').addClass("active");
					$tr.append($def_dropdown);
					break;
				
				case "Closed":
					$def_dropdown.find('.OF-AV').removeClass("active");
					$def_dropdown.find('.OF-WH').removeClass("active");
					$def_dropdown.find('.OF-CL').removeClass("active");
					//if exists :)
					$def_dropdown.find('.OF-SG').removeClass("active");			    	
					$tr.append($def_dropdown);				
					break;
				
				case "Not Available":
					$def_dropdown = $('<td>\
						<ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="OF-SG active"><span></span> Send Suggestions</a></li><li role="separator" class="divider"></li><li><a href="#" class="OF-CL active"><span></span> Close Order</a></li></ul></li></ul>\
					</td>');	
					$tr.append($def_dropdown);
					break;

				case "Suggestions Sent":
					$def_dropdown = $('<td>\
						<ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="OF-SG"><span></span> Send Suggestions</a></li><li role="separator" class="divider"></li><li><a href="#" class="OF-CL active"><span></span> Close Order</a></li></ul></li></ul>\
					</td>');	
					$tr.append($def_dropdown);
					break;	

				default: 
					$tr.append($def_dropdown);			
		}


		$tr.appendTo($tbody);
	}
		isEnabled = false;
		callTableSorter($('#table-'+tableid),$('#pager-open-orders'),isEnabled,true,6);
}

//--------------------------------------------------------------------------------------------------------
// callTableSorter
	callTableSorter = function($var, $pagerVar, filterVal, sortVal, disabledCols){
		$var.unbind("click");
		$var.bind("click");
		$var.trigger("destroy");
		$('.search').text("");

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

		/*SOLVE THIS ISSUE*/
		  $var.find( '.tablesorter-childRow td' ).addClass( 'hidden' );
		  
		  $var.delegate( '.toggle-class', 'click' ,function() {    
		  // $var.on("click", '.toggle-class',function() {   
			// use "nextUntil" to toggle multiple child rows
			// toggle table cells instead of the row
			console.log("Working")
			$( this )
			  .closest( 'tr' )
			  .nextUntil( 'tr.tablesorter-hasChildRow' )
			  .find( 'td' )	
			  .toggleClass( 'hidden' );
			return false;
		  });

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
		pagerVal =  $(this).next().next().next().attr("id");
		console.log(idVal,pagerVal);
		callTableSorter($('#'+idVal),$('#'+pagerVal),isEnabled,true,6);
		(isEnabled?$('.reset-filters').show():$('.reset-filters').hide());
	});
//-------------------
//--------------------------------------------------------------------------------------------------------
$(document).on('click','.OF-AV', function() {

	if($(this).hasClass("active")){
		$this = $(this)
		//remove active class
		$this.removeClass("active");
		//add to next 
		$li = $this.closest('li');
		$a = $this.closest('li').next('li').find('a');
		$a.addClass("active");

		// 1. Available
			$tr = $(this).closest('tr');
			var item_id = parseInt($tr.find('.item_id').text());
			var reqd_qty = 	parseInt($tr.find('.qty').text());
			var availability = false;	
			//find max availability
			for (var i = 1; i < 5; i++) {
				var stock_ids = alasql('column of select stock_id from stocks_master where item_id ='+item_id+' AND warehouse_'+i+' = 1 order by entry_date');
				if(stock_ids.length > reqd_qty){
					availability = true;
					setStatus($(this),"Available");
					break;
				}
			}
		// 2. Not Available
		if(!availability){
				// Update "More Options"
				setStatus($(this),"Not Available");
				var $last_td = $tr.find('td:last');
				$last_td.empty();
				$last_td.append('<ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="OF-SG active"><span></span> Send Suggestions</a></li><li role="separator" class="divider"></li><li><a href="#" class="OF-CL active"><span></span> Close Order</a></li></ul></li></ul>');
			}
		console.log(status);
	}
	else{
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 	}
});
$(document).on('click','.OF-WH', function() {
	if($(this).hasClass("active")){
		$this = $(this)
		//remove active class
		$this.removeClass("active");
		//add to next 
		$li = $this.closest('li');
		$a = $this.closest('li').next('li').next('li').find('a');
		$a.addClass("active");

		$('#fwdModal').modal('show');

		$tr = $(this).closest('tr');

		var order_id = parseInt($tr.find('.order_id').text());
		var item_id = parseInt($tr.find('.item_id').text());
		var qty = parseInt($tr.find('.qty').text());


		$('#fwd-order_id').text(parseInt($tr.find('.order_id').text()));
		$('#fwd-customer_id').text(parseInt($tr.find('.customer_id').text()));
		$('#fwd-item_id').text(parseInt($tr.find('.item_id').text()));
		$('#fwd-qty').text(parseInt($tr.find('.qty').text()));
		$('#fwd-source').text($tr.find('.city').text());

		
		for (var i = 1; i < 5; i++) {
			var sql = 'SELECT stock_id \
				FROM stocks_master \
				WHERE warehouse_'+i+'=1 \
				AND item_id ='+item_id;
			var stocks = alasql(sql);
			// console.log(stocks.length);
			if(stocks.length){
				$('.wh_'+i).text(stocks.length+" Units Available");
			}
			else{
				$('.wh_'+i).text("0 Units Available");

			}
		}

		
		origin = [];
		origin.push($('#fwd-source').text());
		calcDistances(origin);
			$("#table-fwd").tablesorter({
				theme : "bootstrap",
				widthFixed: true,
				headerTemplate : '{content} {icon}', 
				widgets : [ "uitheme", "zebra" ],
				widgetOptions : {
				  zebra : ["even", "odd"]
				}
			});


		// Manipulating info inside modal -----------------------
			// 1. Delay --for google-maps to fill up info

			// 2. Build up temp table 
		var timesRun = 0;
		var poll_best_wh = setInterval(function() {
			    timesRun += 1;
		 		console.log("HAHAHAHA");
				$tr = $('.send-warehouse-table tr');
				alasql('delete from send_warehouse');
					$( '.send-warehouse-table tr' ).each(function( index ) {
				  if(index == 0){
				  	return true;
				  }
				  values = {id:index, warehouse_id:parseInt($(this).find('.wh_id').text()), available:parseInt($(this).find('.available').text()),distance: parseInt($(this).find('.results').text()) }
				  alasql('insert into send_warehouse values ?',[values])
				});		

				// 5. Find the best one with the reqd availability
				var reqd_qty = 	parseInt($('#fwd-qty').text());
				var records = alasql('column of select warehouse_id from send_warehouse where available >= '+reqd_qty+' order by distance')

				// 4. Give suggestions
				$('#warehouse_id').val(records[0]);
				 if(timesRun === 60){
        			clearInterval(poll_best_wh);
    			}
			}, 200);		
		// ------------------------------------------------------
		}
	else{
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 	}
});

$('#fwdModal').on('hidden.bs.modal', function (e) {
		// $('#Open-Orders-Tab').click();
		var sql = 'select customer_orders.*,item.* from customer_orders join item on item.id = customer_orders.item_id where status != "Closed"'
		var tableid = 'open-orders';
		showOrders(sql,tableid);

})

$(document).on('click','.fwd-request', function() {
	order_id = parseInt($('#fwd-order_id').text());
	item_id = parseInt($('#fwd-item_id').text());
	qty = parseInt($('#fwd-qty').text()); 

	dest_wh_id = parseInt($('#warehouse_id').val()); 
	values = [order_id, item_id, qty, "Open",dest_wh_id];
	console.log(values);
	// BOOKMARK
	check_exists = alasql('column of select * from order_requests where request_id='+values[0]);
	console.log(check_exists.length);
	if(check_exists.length){
		console.log('request_id:'+values[0]+' already exists!');
	}
	else{
		console.log('insert into order_requests values('+values[0]+','+values[1]+','+values[2]+',"'+values[3]+'",'+values[4]+');');
		alasql('insert into order_requests values('+values[0]+','+values[1]+','+values[2]+',"'+values[3]+'",'+values[4]+');');
		console.log(alasql('select request_id from order_requests where request_id = '+values[0]+';'));
		
		// alert('Order forwared to Warehouse:'+dest_wh_id+' with Request ID:'+values[0]);  	
    	toastr.success('Order forwared to Warehouse:'+dest_wh_id+' with Request ID:'+values[0], 'Order Fulfillment Team');

		alasql('update customer_orders set status = "Request Forwarded" where order_id='+order_id);	

		// Send notifications to WM Team
		var msg = 'Customer Order Received: Customer Order with Order ID : '+order_id+' has been sent from Order Fulfillment Team';
		var msg_length = parseInt('column of select max(id) from messages');
		var msg_id = 1;

		if(msg_length){
			msg_id = msg_length + 1;
		}

		values = {id:msg_id,read:0,sender:"Order Manager",bo:"WMS"+dest_wh_id,content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
		console.log(values);
		alasql('insert into messages values ?',[values]);
		toastr.success('Warehouse Management Team has been successfully notified','Warehouse QA Team');				

		$('#fwdModal .close').click();

	}
}); 


$(document).on('click','.OF-CL', function() {

	if($(this).hasClass("active")){
		$this = $(this);
		//remove active class
		$this.removeClass("active");
		console.log($this.closest('li').prevUntil('li').find('a'));
		$this.closest('li').prevUntil('li').find('a').removeClass("active");

		//change status
		setStatus($(this),"Closed");

		var sql = 'select * from customer_orders where status != "Closed"'
		var tableid = 'open-orders';
	}
	else{
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 	}		
});

$(document).on('click','.OF-SG', function() {

	if($(this).hasClass("active")){
		$this = $(this)
		$dilemma = $this;
		//remove active class
		// $this.removeClass("active");
		//add to next 
		$li = $this.closest('li');
		$a = $this.closest('li').next('li').next('li').find('a');
		$a.addClass("active");

		console.log("Finding Suggestions!")

		$('#sugg-Modal').modal('show');
		$('#display-error').hide();
		//1. Find kind of the item
		$tr = $(this).closest('tr');
		
		var item_id = parseInt($tr.find('.item_id').text());
		var qty = parseInt($tr.find('.qty').text());
		
		kind = alasql('column of select kind from item where id ='+item_id);
		kind = kind[0];
		category = alasql('column of select text from kind where id ='+kind);
		category = category[0];
		similar_items = alasql('column of select id from item where kind ='+kind+' AND id !='+item_id);


		$('#sugg-item_id').text(item_id);
		$('#sugg-qty').text(qty);
		$('#sugg-source').text(category);

		console.log(kind,category,similar_items);
		//2. Find others of the same kind in the stocks_table with the same quantity in each warehouse
		for (var j = 0; j < similar_items.length; j++) {
			cur_item = similar_items[j];
			for (var i = 1; i <= 4; i++) {
				$option = $('<option>');
				items = alasql('select * from stocks_master where item_id='+cur_item+' AND warehouse_'+i+'=1')
				if(items.length >= qty){
					$option.val(cur_item);
					name = alasql('column of select detail from item where id ='+cur_item);
					$option.text(name);
					$('#select-sugg').append($option);
					break;
				}

			}
		}	
		if($('#select-sugg').children().length == 0){
			$('#display-error').text("No Similar items of the required quantity found in the Warehouse!!");
			$('#display-error').show();

		}
		$('#select-sugg').multiSelect();
	}
	else{
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 	}

});
	
$(document).on('click','.fwd-sugg-button', function() {
	// alert("Suggestions Successfully Sent!");
    toastr.success('Suggestions Successfully Sent!', 'Order Fulfillment Team');
	setStatus($dilemma,"Suggestions Sent");

	$('#sugg-Modal .close').click();


});
// Set Status Function
setStatus = function($var, status){

	$tr = $var.closest('tr');
	console.log($tr.get(0));


	var order_id = parseInt($tr.find('.order_id').text());
	alasql('update customer_orders set status = "'+status+'" where order_id='+order_id);	
	$status = $tr.find('.status');
	$status.text(status);

	switch(status){		   
	    case "Open":
			$status.removeClass();
			$status.addClass("label");
			$status.addClass("label-info");
			break;
	    case "Available":
			$status.removeClass();
			$status.addClass("label");
			$status.addClass("label-success");
			break;
	    case "Not Available":
			$status.removeClass();
			$status.addClass("label");
			$status.addClass("label-danger");
			break;
	    case "Request Forwarded":
			$status.removeClass();
			$status.addClass("label");
			$status.addClass("label-success");
			break;
	    case "Suggestions Sent":
			$status.removeClass();
			$status.addClass("label");
			$status.addClass("label-warning");
			break;						
	    default:
			$status.removeClass();
			$status.addClass("label");
			break;
	}
	$status.addClass("status");


};

function calcDistances(origin) {
  destination = ['Bangalore','Chennai','Hyderabad','Delhi'];
  google.maps.event.addDomListener(window, 'load', initialize);
  calculateDistances(origin,destination);
};


//  Populate sidebar notifications
updateSidebarNotify = function(BO){

	// 1. Customer Orders
	// 2. Customer Returns


	// 1. "customer_orders-side-notify"
			var sql = 'column of select COUNT(*) from customer_orders where status != "Closed"'

			customer_orders_count = parseInt(alasql(sql)); 

		if(!customer_orders_count){
			customer_orders_count = 0;
			$('.customer_orders-side-notify').text('');
		}
		else{
			$('.customer_orders-side-notify').text(customer_orders_count);
		}

	// 2. "customer_returns-side-notify"
		var sql = 'column of select COUNT(*) from return_requests_of \
				   JOIN item ON item.id == return_requests_of.item_id WHERE return_requests_of.status !="Closed";'
		customer_returns_count = parseInt(alasql(sql)); 

		if(!customer_returns_count){
			customer_returns_count = 0;
			$('.customer_returns-side-notify').text('');
		}
		else{
			$('.customer_returns-side-notify').text(customer_returns_count);
		}

	}