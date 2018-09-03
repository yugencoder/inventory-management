/*
Trying to Add Action More Dropdown :

*/
var BO = "PO";

$(document).ready(function () {
//------------------------------------------------------------------------------------------------------------>>
// Manage Session
		if(!SESSION.userLogged()){
    		window.location.assign('index.html');
		}	
			
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

//intializing Toaster
toastr.options = {
    closeButton: true,
    progressBar: true,
    showMethod: 'slideDown',
    timeOut: 4000
};		

showIssues();
	

}); /* End of Document Ready*/


//--------------------------------------------------------------------------------------------------------
/* External Functions*/



// Show Issues
showIssues = function(){
		$('#tbody-issues').empty();;
		// // build html table
		var issues = alasql('select * from issues');
		var tbody = $('#tbody-issues');

		for (var i = 0; i < issues.length; i++) {
			var issue = issues[i];
			//Hackabbye
			var tr = $('<tr></tr>');

			tr.append('<td class="issues_id">' + issue.issue_id + '</td>');
			tr.append('<td>' + issue.order_id + '</td>');
			tr.append('<td class="supplier_id"><a href="#" class="highlight-class" data-toggle="tooltip" data-placement="right" title="Click to Update the Supplier Rating">' + issue.supplier_id + '</a></td>');
			tr.append('<td>' + issue.comments + '</td>');

			$td = $('<td style="text-align:center"><span class="status">' + issue.status + '</span></td>');
				$status = $td.find('.status');
				switch(issue.status){
				   
				    case "Open":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-info");
						break;
				    case "Issue Resolved":
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
				tr.append($td);
			$def_dropdown = $('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="IS-Resolved"><span></span> Issue Resolved </a></li></ul></li></ul></td>');
			
			switch(issue.status){


				    case "Open":
				    	$def_dropdown.find('.IS-Resolved').addClass("active");
				    	$def_dropdown.find('.IS-Close').addClass("active");
						tr.append($def_dropdown);
				        break;
				    
				    
				    case "Closed":
				    	$def_dropdown.find('.IS-Resolved').removeClass("active");
				    	$def_dropdown.find('.IS-Close').removeClass("active");
						tr.append($def_dropdown);
				        break;
			        default: 
	   					tr.append($def_dropdown);
				}				

			tr.appendTo(tbody);
		}
		/*Call the tablesorter plugin*/
		isEnabled = false;
	    callTableSorter($('#table-issues'),$('#pager-issues'),isEnabled,true,6);
}

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

	$(document).on('click','.IS-Resolved', function() {
			$tr = $(this).closest('tr');
			var issue_id = parseInt($($tr.children()[0]).text());
			var order_id = parseInt($($tr.children()[1]).text());
			alasql('update issues set status = "Closed" where issue_id='+issue_id);	
			console.log('update issues set status = "Closed" where issue_id='+issue_id);
			$status = $tr.find('.status');
			$status.removeClass();
			$status.addClass("status");
			$status.addClass("label");
			$status.text("Closed");

			order_status = alasql('column of select status from supplier_orders where order_id='+order_id);
			if(order_status[0] == "Issue Raised"){	
				// Change status of order back to sent to QA
				alasql('update supplier_orders set status = "Sent for QC" where order_id='+order_id);	
			}
			order_status = alasql('column of select status from return_goods where order_id='+order_id);
			if(order_status[0] == "Issue Raised"){	
				// Change status of order back to sent to QA
				alasql('update return_goods set status = "Sent for QC" where order_id='+order_id);	
			}

	});

//Not Used
	$(document).on('click','.IS-Close', function() {
		if($(this).hasClass("active")){
			r = window.confirm('Once closed you can\'t change the status anymore');
		 	if(r==true){
		 		$(this).closest('td').find('.dropdown a').removeClass();
		 			setStatus($(this),"Closed");
					updateSidebarNotify(BO);
		 	}
	 	}
		else{
			alert('Please follow the workflow order');	
		}	
	});

//Not Used
	setStatusIS = function($var, status){

			$tr = $var.closest('tr');
			// console.log($tr.find('.return_id').text());
			var return_id = parseInt($tr.find('.issue_id').text());
			console.log('update issues set status = "'+status+'" where issue_id='+issue_id);
			alasql('update issues set status = "'+status+'" where issue_id='+issue_id);
			$status = $tr.find('.status').text(status);

				if(status == "Issue Resolved"){
					$status.removeClass();
					$status.addClass("status");
					$status.addClass("label");
					$status.addClass("label-success");
				
				}		
				if(status == "Closed"){
					$status.removeClass();
					$status.addClass("status");
					$status.addClass("label");
		
				}	
		}


	$(document).on('click','.supplier_id a', function() {
		
		$('#supplierModal').modal('show');

		// Update Modal Info
		$tr = $(this).closest('tr');
		var supplier_id = parseInt($tr.find('.supplier_id').text());
		console.log(supplier_id);
		var records = alasql('select * from suppliers where supplier_id = '+supplier_id);
		record = records[0];
		$('.modal-supplier_id').text(supplier_id);
		$('.modal-supplier_name').text(record.supplier_name);
		$('.modal-supplier_rating').val(record.supplier_rating);

	});

	$('.update_rating').click(function(){
		supplier_id = parseInt($('.modal-supplier_id').text());
		new_rating = parseInt($('.modal-supplier_rating').val());
		alasql('update suppliers set supplier_rating = '+new_rating+' where supplier_id='+supplier_id);
		console.log('update suppliers set supplier_rating = '+new_rating+' where supplier_id='+supplier_id);
		// alert('Supplier Rating has been updated!!')
	    toastr.success('Supplier Rating has been updated!!', 'Procurement Team');

		$('#supplierModal .close').click();

	});

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
