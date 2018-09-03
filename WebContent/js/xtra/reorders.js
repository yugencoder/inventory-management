/*
Trying to Add Action More Dropdown :

*/
var BO = "PO";

$(document).ready(function () {
//------------------------------------------------------------------------------------------------------------>>
// Manage Session
		// if(!SESSION.userLogged()){
  //   		window.location.assign('index.html');
		// }	
			
     isEnabled = false;           
//------------------------------------------------------------------------------------------------------------>>
// TableSorter Plugin
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

// Update Sidebar notifications
updateSidebarNotify(BO);

// Show Messages
showMessages(BO);

// Show Top 4 Messages 
updateMsgCount(BO);

// Show Reorders
$('#Open-Reorders-Tab').click();	

//intializing Toaster
toastr.options = {
    closeButton: true,
    progressBar: true,
    showMethod: 'slideDown',
    timeOut: 4000
};

}); /* End of Document Ready*/


//--------------------------------------------------------------------------------------------------------
/* External Functions*/


//--------------------------------------------------------------------------------------------------------
/*Reorder Requests*/
	$('#Reorder-Tab').click(function(){
		$('#Open-Reorders-Tab').click();	
	});

	$('#All-Reorders-Tab').click(function(){
		var sql = 'SELECT supplier_reorders.*, item.detail \
				FROM supplier_reorders \
				JOIN item ON supplier_reorders.item_id = item.id \
				;'
		var tableid = "";
		showReorders(sql,tableid);
	});

	$(document).on('click','#Closed-Reorders-Tab', function() {
		var sql = 'SELECT supplier_reorders.*, item.detail \
				FROM supplier_reorders \
				JOIN item ON supplier_reorders.item_id = item.id \
				WHERE supplier_reorders.status = "Closed";'
		var tableid = "-closed";
		showReorders(sql,tableid);
	});

	$(document).on('click','#Open-Reorders-Tab', function() {
		var sql = 'SELECT supplier_reorders.*, item.detail \
				FROM supplier_reorders \
				JOIN item ON supplier_reorders.item_id = item.id \
				WHERE supplier_reorders.status = "Open";'
		var tableid = "-open";
		showReorders(sql,tableid);
	});

	showReorders = function(sql, tableid){

		$('#tbody-reorders'+tableid).empty();
		var reorders = alasql(sql);

		// // build html table
		var tbody = $('#tbody-reorders'+tableid);
		for (var i = 0; i < reorders.length; i++) {
			var reorder = reorders[i];
			// var tr = $('<tr data-href="supplier.html?id=' + supplier.id + '"></tr>');
			var tr = $('<tr></tr>');
			tr.append('<td class="reorder_id">' + reorder.reorder_id + '</td>');
			tr.append('<td class="item_id">' + reorder.item_id + '</td>');
			tr.append('<td>' + reorder.detail + '</td>');
			tr.append('<td>' + reorder.quantity + '</td>');
			tr.append('<td>' + reorder.warehouse_id + '</td>');
			tr.append('<td>' + reorder.request_date + '</td>');
			tr.append('<td style="text-align:center"><span class="status label label-info">' + reorder.status + '</td>');

			if(tableid == "-open" || tableid== ""){
				$td_button = $('<td style="text-align:center"> <button reorder_id="'+reorder.reorder_id+'" item_id="'+reorder.item_id+'" type="button" class="btn btn-success btn-xs process_reorder active"> Process Reorder </button> </td>');
				if(reorder.status == "Closed"){
					$td_button.find('button').removeClass("active");
				}
				tr.append($td_button);			
			}
			// else if (tableid == ""){
			// 	switch(record.status){
			// 		case "Open":
			// 			tr.append('<td> <button reorder_id="'+reorder.reorder_id+'" item_id="'+reorder.item_id+'" type="button" class="btn btn-success btn-xs process_reorder"> Process Reorder </button> </td>');						
			// 		break;

			// 		case "Closed":
			// 		break;							
			// 	}
			// }
			tr.appendTo(tbody);
		}
		//-------------------
		/*Call the tablesorter plugin*/
		isEnabled = false;
	    callTableSorter($('#table-reorders'+tableid),$('#pager-reorders'+tableid),isEnabled,true,6);
	};
//--------------------------------------------------------------------------------------------------------
// Process Reorder Button 
	$(document).on('click','.process_reorder', function() {
		console.log("Process Reorder Clicked!!");
		if($(this).hasClass("active")){
			var $this = $(this);
			$tr = $(this).closest('tr');
			reorder_id = $tr.find('.reorder_id').text();
			console.log(reorder_id);

			newwindow=window.open("process_reorder.html",'_blank','height=600,width=800');
			newwindow.reorder_id = reorder_id;

			var pollTimer = window.setInterval(function() {
				console.log("Inside Timer");
	    		updateSidebarNotify(BO); 		
			    if (newwindow.closed !== false) { // !== is required for compatibility with Opera
			        window.clearInterval(pollTimer);
					var status = alasql('column of select status from supplier_reorders where reorder_id = '+reorder_id);
					if(status[0] == "Closed"){
				        $this.removeClass("active");
				        setStatus($tr,"Closed")
			    	}

			    }
			}, 200);
		}
		else{
			toastr.error("Sorry, you can't place the order as the status is closed!","Procurement Team");
		}
	});



//--------------------------------------------------------------------------------------------------------
// 	Toggle Filter Function
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

//--------------------------------------------------------------------------------------------------------
// 	PopItUp Function
	function popitup(url,reorder_id) {
		newwindow=window.open(url,'_blank','height=600,width=800');
		// newwindow.breakups = sessionStorage.breakup;
		newwindow.reorder_id = reorder_id;
		if (window.focus) {newwindow.focus()}
		return false;
	}


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
		widgets : [ "uitheme", "filter", "zebra", 'toggle-ts' ],
		widgetOptions : {
		  zebra : ["even", "odd"],
		  filter_external : '.search',
		  filter_reset : ".reset-filters",
		  filter_cssFilter: "form-control",
	      filter_columnFilters: filterVal,
          
          filter_childRows  : false,
		  // change this^^^ if needed :) 
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

//--------------------------------------------------------------------------------------------------------

	setStatus = function($var, status){
			$tr = $var.closest('tr');
			var reorder_id = parseInt($($tr.children()[0]).text());
			alasql('update supplier_reorders set status = "'+status+'" where reorder_id='+reorder_id);	
			console.log('update supplier_reorders set status = "'+status+'" where reorder_id='+reorder_id);
			
			$status = $tr.find('.status').text(status);
			if(status == "Closed"){
				$status.removeClass();
				$status.addClass("status");
				$status.addClass("label");
			}
	}

//--------------------------------------------------------------------------------------------------------
//  Populate sidebar notifications
	updateSidebarNotify = function(BO){
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


	// 2. "reorders-side-notify"
		var sql = 'column of select count(*) \
				FROM supplier_reorders \
				JOIN item ON supplier_reorders.item_id = item.id \
				WHERE supplier_reorders.status != "Closed";'
		reorders_count = parseInt(alasql(sql)); 

		if(!reorders_count){
			reorders_count = 0;
			$('.reorders-side-notify').text('');
		}
		else{
			$('.reorders-side-notify').text(reorders_count);
		}

	// 3. "orders-side-notify"
		var sql ='column of select count(*) from supplier_orders where status != "Closed"';
		orders_count = parseInt(alasql(sql)); 

		if(!orders_count){
			orders_count = 0;
			$('.orders-side-notify').text('');
		}
		else{
			$('.orders-side-notify').text(orders_count);
		}

	// 4. "returns-side-notify"
		var sql = 'column of select count(*) \
			 	FROM return_goods \
			 	WHERE return_goods.status !="Closed" \
			 	ORDER BY return_goods.return_id';

		returns_count = parseInt(alasql(sql)); 

		if(!returns_count){
			returns_count = 0;
			$('.returns-side-notify').text('');
		}
		else{
			$('.returns-side-notify').text(returns_count);
		}


	// 5. "issues-side-notify"
		var sql = 'column of select count(*) from issues where status !="Closed"';
		issues_count = parseInt(alasql(sql)); 

		if(!issues_count){
			issues_count = 0;
			$('.issues-side-notify').text('');
		}
		else{
			$('.issues-side-notify').text(issues_count);
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
			var $li =   $('<li><div class="dropdown-messages-box"><a href="mailbox.html" class="pull-left"><img alt="image" class="img-circle" src="img/wms.jpg"></a><div class="media-body"><span><strong>Mike Loreipsum</strong> started following <strong>Monica Smith</strong>.</span> <br><small class="text-muted"></small></div></div></li>');
			var $divider = $('<li class="divider"></li>');

			$li.find('.media-body span').text(message.content);
			$li.find('.text-muted').text(moment(message.sent_date).format('MMMM Do YYYY, h:mm:ss a'));
			$ul.append($li);
			$ul.append($divider);
		}
		var $li_showMsg = $('</li><li><div class="text-center link-block"><a href="mailbox.html"><i class="fa fa-envelope"></i> <strong>Read All Messages</strong></a></div></li>');
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
