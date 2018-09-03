/*Order Fulfillment JS File*/
var	BO = "OF";	
var city_map = {
				"Bangalore":1,
				"Hyderabad":2,
				"Chennai":3,
				"Delhi":4
			   };

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
// Others
$("#Returns-Open-Tab").click();

// Update Sidebar notifications
updateSidebarNotify(BO);

// Define Toaster
toastr.options = {
    closeButton: true,
    progressBar: true,
    showMethod: 'slideDown',
    timeOut: 4000
};	
		var misc = alasql('select date_diff from misc');
		var date_diff = misc[0].date_diff;
		$('.date-diff').val(date_diff);
}); /* End of Document Ready*/

/*External Functions*/

//--------------------------------------------------------------------------------------------------------


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

//1. Customer Return Requests--------------------------------------------------------------------------------------------->>

$("#Returns-Tab").click(function(){

	$("#Returns-Open-Tab").click();
	
});

$("#Returns-Open-Tab").click(function(){

		var sql = 'select return_requests_of.*,item.detail from return_requests_of \
				   JOIN item ON item.id == return_requests_of.item_id WHERE return_requests_of.status !="Closed";'
		tableid = 'open-returns';
	showReturns(sql,tableid);
})


$("#Returns-Closed-Tab").click(function(){

	var sql = 'select return_requests_of.*,item.detail from return_requests_of \
			   JOIN item ON item.id == return_requests_of.item_id WHERE return_requests_of.status ="Closed";'
	tableid = 'closed-returns';
	showReturns(sql,tableid);	
})

showReturns = function(sql, tableid){
	
	var return_requests = alasql(sql);

	var $tbody = $('#tbody-'+tableid);
		$tbody.empty();
	// Building Customer Order Table
	for (var i = 0; i < return_requests.length; i++) {
		return_request = return_requests[i];
		var $tr = $('<tr></tr>');
		
		$tr.append('<td class="return_id">'+ return_request.return_id+'</td>');
		$tr.append('<td class="request_id">'+ return_request.request_id+'</td>');
		$tr.append('<td class = "item_id">'+ return_request.item_id+'</td>');
		$tr.append('<td class="qty">'+ return_request.quantity+'</td>');
		$tr.append('<td class="warehouse_id">'+ return_request.warehouse_id+'</td>');
		$tr.append('<td class = "entry_date">'+ return_request.entry_date+'</td>');
		$tr.append('<td class = "exit_date">'+ return_request.exit_date+'</td>');

		$td = $('<td style="text-align:center"><span class="status">' + return_request.status + '</span></td>');
			$status = $td.find('.status');
				switch(return_request.status){
				   
				    case "Open":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-info");
						break;
				    case "Approved":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-success");
						break;
				    case "Rejected":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-danger");
						break;
				    case "Sent to Warehouse":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-success");
						break;		    
					default:
						$status.removeClass();
						$status.addClass("label");
						break;
				}
			$status.addClass("status");							

			$tr.append($td);


			$def_dropdown = $('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="RT-DD active"><span></span> Check Date Difference </a></li><li><a href="#" class="RT-WH"><span></span> Send to Warehouse</a></li><li role="separator" class="divider"></li><li><a href="#" class="RT-CL"><span></span> Close Order</a></li></ul></li></ul></td>');	

			switch(return_request.status){
			   
			    case "Approved":
			    	$def_dropdown.find('.RT-DD').removeClass("active");
			    	$def_dropdown.find('.RT-WH').addClass("active");
			    	$def_dropdown.find('.RT-CL').removeClass("active");
					$tr.append($def_dropdown);		
		        	break;

			    case "Rejected":
			    	$def_dropdown.find('.RT-DD').removeClass("active");
			    	$def_dropdown.find('.RT-WH').removeClass("active");
			    	$def_dropdown.find('.RT-CL').addClass("active");
					$tr.append($def_dropdown);	
		        	break;
			    case "Sent to Warehouse":
			    	$def_dropdown.find('.RT-DD').removeClass("active");
			    	$def_dropdown.find('.RT-WH').removeClass("active");
			    	$def_dropdown.find('.RT-CL').addClass("active");
					$tr.append($def_dropdown);	
		        	break;
				case "Closed":
			    	$def_dropdown.find('.RT-DD').removeClass("active");
			    	$def_dropdown.find('.RT-WH').removeClass("active");
			    	$def_dropdown.find('.RT-CL').removeClass("active");
					$tr.append($def_dropdown);	
		        	break;
		        default: 
   					$tr.append($def_dropdown);

			}	


		$tr.appendTo($tbody);
	}
		isEnabled = false;
		callTableSorter($('#table-'+tableid),$('#pager-'+tableid),isEnabled,true,6);
}

$(document).on('click','.RT-DD', function() {
	if($(this).hasClass("active")){
		$this = $(this)
		//remove active class
			$this.removeClass("active");
		//add to next 
			$li = $this.closest('li');
			$nextli = $li.next('li');
			$a = $this.closest('li').next('li').find('a');
			$a.addClass("active");

		$tr = $(this).closest('tr');
		entry_date = $tr.find('.entry_date').text();
		exit_date = $tr.find('.exit_date').text();
		var date1 = new Date(entry_date);
		var date2 = new Date(exit_date);
		var timeDiff = Math.abs(date2.getTime() - date1.getTime());
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
		
		var misc = alasql('select date_diff from misc');
		var date_diff = misc[0].date_diff;
		if(diffDays > date_diff){
			// alert("Rejected !! as Date difference:"+diffDays+" > 14 Days");
			toastr.error('Rejected !! as Date difference:'+diffDays+' > '+date_diff+' Days');			
			setStatusRT($(this),"Rejected");
			// disable send :)
			$a.removeClass("active");
			$tr.find('.RT-CL').addClass("active");

		}
		else{
			// alert("Approved !! as Date difference:"+diffDays+" <= 14 Days");
			toastr.success('Approved !! as Date difference:'+diffDays+' <= '+date_diff+' Days', 'Order Fulfillment Team');			
			setStatusRT($(this),"Approved");
		}

		}
		else{
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 		}	
});

$(document).on('click','.date-diff-save', function() {
	//1. Get occupancy
	var date_diff = parseInt($('.date-diff').val())
	console.log(date_diff);
	if(date_diff){
		sql = "update misc set date_diff = "+date_diff+';';
		alasql(sql);
		toastr.success("Changes has been successfully registered", "Warehouse Management Team");

	}
	else{
		toastr.error("Please enter a valid threshold Value", "Warehouse Management Team");
	}
});

$(document).on('click','.RT-WH', function() {
	if($(this).hasClass("active")){
		$this = $(this)
		//remove active class
			$this.removeClass("active");
		//add to next 
			$li = $this.closest('li');
			$nextli = $li.next('li');
			$a = $this.closest('li').next('li').next('li').find('a');
			$a.addClass("active");

			setStatusRT($(this),"Sent to Warehouse");
			$tr = $(this).closest('tr');
			return_id = parseInt($tr.find('.return_id').text());
			request_id = parseInt($tr.find('.request_id').text());
			item_id = parseInt($tr.find('.item_id').text());
			quantity = parseInt($tr.find('.qty').text());
			status = "Awaiting";
			warehouse_id = parseInt($tr.find('.warehouse_id').text());

			values = {return_id:return_id,request_id:request_id,item_id:item_id,quantity:quantity,status:status,warehouse_id:warehouse_id};
			console.log(values);
			alasql('INSERT INTO return_requests VALUES ?',[values]);
			console.log(alasql('column of select return_id from return_requests where return_id='+return_id));

			// alasql('INSERT INTO return_requests VALUES('+return_id+','+request_id+','+item_id+','+quantity+',"'+status+'",'+warehouse_id+');');

			// alert("Return ID:"+return_id+" sent to Warehouse:"+warehouse_id);
	    	toastr.success("Return ID:"+return_id+" sent to Warehouse:"+warehouse_id, 'Order Fulfillment Team');

		}
		else{
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 		}	
});
$(document).on('click','.RT-CL', function() {
	if($(this).hasClass("active")){
		setStatusRT($(this),"Closed");
		
		var sql = 'select return_requests_of.*,item.detail from return_requests_of \
				   JOIN item ON item.id == return_requests_of.item_id WHERE return_requests_of.status !="Closed";'
		tableid = 'open-returns';
		}
	else{
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 	}		

});

// Set Status Function
setStatusRT = function($var, status){
	$tr = $var.closest('tr');
	console.log($tr.get(0));
	var return_id = parseInt($tr.find('.return_id').text());
	alasql('update return_requests_of set status = "'+status+'" where return_id='+return_id);	
	$status = $tr.find('.status');
	$status.text(status);

	switch(status){

	    case "Open":
			$status.removeClass();
			$status.addClass("label");
			$status.addClass("label-info");
			break;
	    case "Approved":
			$status.removeClass();
			$status.addClass("label");
			$status.addClass("label-success");
			break;
	    case "Rejected":
			$status.removeClass();
			$status.addClass("label");
			$status.addClass("label-danger");
			break;
	    case "Sent to Warehouse":
			$status.removeClass();
			$status.addClass("label");
			$status.addClass("label-success");
			break;		    
		default:
			$status.removeClass();
			$status.addClass("label");
			break;
	}
$status.addClass("status");	

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