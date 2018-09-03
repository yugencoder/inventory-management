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

// Show Suppliers
showSuppliers();

	

}); /* End of Document Ready*/


//--------------------------------------------------------------------------------------------------------
/* External Functions*/

//--------------------------------------------------------------------------------------------------------
/* Suppliers Tab*/
//---------------------------
/* Building Suppliers Table*/
	$('#Suppliers-Tab').click(function(){
		showSuppliers();
	});

	showSuppliers =  function(){
		
		var sql = ' SELECT suppliers.supplier_id, suppliers.supplier_name,  suppliers.item_id, item.code, item.detail, suppliers.price, suppliers.supplier_rating \
					FROM suppliers \
					JOIN item ON suppliers.item_id = item.id ORDER BY supplier_rating DESC, price ASC;'

		// var sql = 'SELECT supplier_id, parts_id, supplier_name, parts_name, category_name, maker, price, supplier_rating from suppliers';
		// // send query
		var suppliers = alasql(sql);

		// // build html table
		var tbody = $('#tbody-suppliers');
		tbody.empty();
		for (var i = 0; i < suppliers.length; i++) {
			var supplier = suppliers[i];
			// var tr = $('<tr data-href="supplier.html?id=' + supplier.id + '"></tr>');
			var tr = $('<tr class="tablesorter-hasChildRow"></tr>');
			tr.append('<td class="supplier_id">' + supplier.supplier_id + '</td>');
			tr.append('<td class="supplier_name">' + supplier.supplier_name + '</td>');
			tr.append('<td class="item_id">' + supplier.item_id + '</td>');
			tr.append('<td>' + supplier.code + '</td>');
			tr.append('<td>' + supplier.detail + '</td>');
			tr.append('<td>' + numberWithCommas(supplier.price) + '</td>');
			tr.append('<td class="highlight-rating" style="text-align: center" <a href=# class="toggle-class" data-toggle="tooltip" data-placement="left" title="Click to edit supplier rating">' + supplier.supplier_rating + '</td>');
			tr.append('<td style="text-align:center"> <button supplier_id="'+supplier.supplier_id+'" item_id="'+supplier.item_id+'" type="button" class="btn btn-success btn-xs place_order-btn">Place Order</button> </td>');
			tr.appendTo(tbody);
		}
		//-------------------

		// Call the tablesorter plugin inline to enable editing
	 //    $('#table-suppliers').trigger("destroy");
		/*Call the tablesorter plugin*/
		isEnabled = false;
	    callTableSorter($('#table-suppliers'),$('#pager-suppliers'),isEnabled,true,6);

	}

// Process Order Button 
	$(document).on('click','.place_order-btn', function() {
		console.log("Process Order Clicked!!");
		$tr = $(this).closest('tr');
		supplier_id = $tr.find('.supplier_id').text();
		console.log(supplier_id);

		newwindow=window.open("process_order.html",'_blank','height=600,width=800');
		newwindow.supplier_id = supplier_id;

		var pollTimer = window.setInterval(function() {
			console.log("Inside Timer");    		
    		updateSidebarNotify(BO);
		    if (newwindow.closed !== false) { // !== is required for compatibility with Opera
		        window.clearInterval(pollTimer);
		    }
		}, 200);

	});
//--------------------------------------------------------------------------------------------------------
/* Orders Tab*/
//--------------------------------------------------------------------------------------------------------
/* Building Orders Table*/
	$('#Orders-Tab').click(function(){
		$('#Open-Tab').click();
	});

	$('#Open-Tab').click(function(){
			sql ='select * from supplier_orders where status != "Closed"';
			tableID = 'orders-open';
			showOrders(tableID,sql);
	});

	$('#Closed-Tab').click(function(){
			sql ='select * from supplier_orders where status = "Closed"';
			tableID = 'orders-closed';
			showOrders(tableID,sql);
	});
	
	$('#All-Tab').click(function(){
			sql ='select * from supplier_orders;';
			tableID = 'orders';
			showOrders(tableID,sql);
	});

	showOrders = function(tableID, sql){
		$('#tbody-'+tableID).empty();;
		
		// // build html table
		var orders = alasql(sql);
		var tbody = $('#tbody-'+tableID);

		for (var i = 0; i < orders.length; i++) {
			var order = orders[i];
			//Hackabbye
			var tr = $('<tr class="tablesorter-hasChildRow"></tr>');

				//checking for child rows
				var records = alasql('select * from goods where order_id = '+order.order_id+' ORDER BY goods_id');
				var child_exists = records.length==0?false:true	;
				var pad = 0;
				if(child_exists){
					pad = 1;
				}
				console.log("child_exists:"+child_exists);

			tr.append('<td rowspan="'+(records.length+1+pad)+'" class="order_id">'+(child_exists?'<a href=# class="toggle-class">':'')+'' + order.order_id + (child_exists?'</a>':'')+'</td>');
			tr.append('<td rowspan="'+(records.length+1+pad)+'">' + order.supplier_id + '</td>');
			tr.append('<td rowspan="'+(records.length+1+pad)+'"class = "item_id">' + order.item_id + '</td>');
			tr.append('<td >' + order.quantity + '</td>');
			tr.append('<td class="warehouse_id">' + order.warehouse_id + '</td>');			
			tr.append('<td class="status">' + order.status + '</td>');
		
			$def_dropdown = $('<td>\
				<ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="PR-Receive active"><span></span> Shipment Received</a></li><li><a href="#" class="PR-QC"><span></span> Send for QC</a></li><li role="separator" class="divider"></li><li><a href="#" class="PR-Close"><span></span> Close Order</a></li></ul></li></ul>\
				</td>');

			switch(order.status){
			   
			    case "Received":
			    	$def_dropdown.find('.PR-Receive').removeClass("active");
			    	$def_dropdown.find('.PR-QC').addClass("active");
			    	$def_dropdown.find('.PR-Close').addClass("active");
					tr.append($def_dropdown);
			        break;
			    
			    case "Sent to QA":
			    	$def_dropdown.find('.PR-Receive').removeClass("active");
			    	$def_dropdown.find('.PR-QC').removeClass("active");
			    	$def_dropdown.find('.PR-Close').addClass("active");
					tr.append($def_dropdown);				
			        break;
			    
			    case "Closed":
			    	$def_dropdown.find('.PR-Receive').removeClass("active");
			    	$def_dropdown.find('.PR-QC').removeClass("active");
			    	$def_dropdown.find('.PR-Close').removeClass("active");
					tr.append($def_dropdown);
			        break;
		        default: 
   					tr.append($def_dropdown);
			}	

			tr.appendTo(tbody);

			if(child_exists){
				$tr_child = $('<tr class="tablesorter-childRow" ></tr>');
				
				$th = $('<th >');
				$th.text("S.No");
				$tr_child.append($th);
						
				$th = $('<th>');
				$th.text("Goods ID");
				$tr_child.append($th);

				$th = $('<th>');
				$th.text("Status");
				$tr_child.append($th);


				$th = $('<th>');
				$th.text("Action");
				$tr_child.append($th);

				$tr_child.appendTo(tbody);		
			}
			if(child_exists){
				/*Building Child Tables*/
				for (var j = 0; j < records.length; j++) {
					
					var record = records[j];
					$tr_child = $('<tr class="tablesorter-childRow"></tr>');
					$td = $('<td></td>');
					$td.text(j+1);
					$tr_child.append($td);

					$td = $('<td class= "goods_id"></td>');
					$td.text(record.goods_id);
					$tr_child.append($td);

					$td = $('<td class="status"></td>');
					$td.text(record.status);
					$tr_child.append($td);


					$def_dropdown = $('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="PR-RT"><span></span> Mark for Return</a></li><li><a href="#" class="PR-SendWarehouse"><span></span> Send to Warehouse </a></li></ul></li></ul></td>');

					switch(record.status){
					   
					    case "Pass":			   	
					    	$def_dropdown.find('.PR-RT').removeClass("active");
					    	$def_dropdown.find('.PR-SendWarehouse').addClass("active");
							$tr_child.append($def_dropdown);
					        break;

					    case "Fail":
					    	$def_dropdown.find('.PR-RT').addClass("active");
					    	$def_dropdown.find('.PR-SendWarehouse').removeClass("active");
							$tr_child.append($def_dropdown);
					        break;
				        default: 
		   					$tr_child.append($def_dropdown);
					}

					$tr_child.appendTo(tbody);
				}
			}	
		}
		/*Call the tablesorter plugin*/
		isEnabled = false;
	    callTableSorter($('#table-'+tableID),$('#pager-'+tableID),isEnabled,true,6);
	};




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
			widgets : [ "uitheme", "filter", "zebra", 'toggle-ts','editable' ],
			widgetOptions : {
			  zebra : ["even", "odd"],
			  filter_external : '.search',
			  filter_reset : ".reset-filters",
			  filter_cssFilter: "form-control",
		      filter_columnFilters: filterVal,
		      headers: {
			  	disabledCols : {
				    sorter: false,
				    filter: false
			  	}},
			  	//editable options
				  	editable_columns       : [6],       // or "0-2" (v2.14.2); point to the columns to make editable (zero-based index)
			        editable_enterToAccept : true,          // press enter to accept content, or click outside if false
			        editable_autoAccept    : true,          // accepts any changes made to the table cell automatically (v2.17.6)
			        editable_autoResort    : false,         // auto resort after the content has changed.
			        editable_validate      : null,          // return a valid string: function(text, original, columnIndex){ return text; }
			        editable_focused       : function(txt, columnIndex, $element) {
			          $element.addClass('focused');
			        },
			        editable_blur          : function(txt, columnIndex, $element) {
			          $element.removeClass('focused');
			        },
			        editable_selectAll     : function(txt, columnIndex, $element){
			          return /^b/i.test(txt) && columnIndex === 0;
			        },
			        editable_wrapContent   : '<div>',       // wrap all editable cell content... makes this widget work in IE, and with autocomplete
			        editable_trimContent   : true,          // trim content ( removes outer tabs & carriage returns )
			        editable_noEdit        : 'no-edit',     // class name of cell that is not editable
		        	editable_editComplete  : 'editComplete' // event fired after the table content has been edited
			  }
			})
			.tablesorterPager({
				container: $pagerVar,
				cssGoto  : ".pagenum",
				removeRows: false,
				output: '{startRow} - {endRow} / {filteredRows} ({totalRows})'
			})
			.children('tbody').on('editComplete', 'td', function(event, config){
						      var $this = $(this),
						        newContent = $this.text(),
						        cellIndex = this.cellIndex, // there shouldn't be any colspans in the tbody
						        rowIndex = $this.closest('tr').attr('id'); // data-row-index stored in row id
								
								$tr = $this.closest('tr');
								supplier_id = parseInt($tr.find('.supplier_id').text());
								alasql('update suppliers set supplier_rating = '+parseInt(newContent)+' where supplier_id = '+supplier_id+';');
								console.log('update suppliers set supplier_rating = '+parseInt(newContent)+' where supplier_id = '+supplier_id+';');
						      
							      $this.addClass( 'editable_updated' ); // green background + white text
							      setTimeout(function(){
							        $this.removeClass( 'editable_updated' );
							      }, 500);
					    });






		// $var.tablesorter({
		// theme : "bootstrap",
		
  //     	cssChildRow : "tablesorter-childRow",
		
		// widthFixed: true,
		// headerTemplate : '{content} {icon}', 
		// widgets : [ "uitheme", "filter", "zebra", 'toggle-ts' ],
		// widgetOptions : {
		//   zebra : ["even", "odd"],
		//   filter_external : '.search',
		//   filter_reset : ".reset-filters",
		//   filter_cssFilter: "form-control",
	 //      filter_columnFilters: filterVal,
          
  //         filter_childRows  : false,
		//   // change this^^^ if needed :) 
	 //      // toggle-ts widget
	 //      toggleTS_hideFilterRow : true,     
	 //      headers: {
		//   	disabledCols : {
		// 	    sorter: false,
		// 	    filter: false
		//   	}}
		//   }
		// })
		// .tablesorterPager({
		// 	container: $pagerVar,
		// 	cssGoto  : ".pagenum",
		// 	removeRows: false,
		// 	output: '{startRow} - {endRow} / {filteredRows} ({totalRows})'
		// });

		//   $var.find( '.tablesorter-childRow td' ).addClass( 'hidden' );
		//   $var.find( '.tablesorter-childRow th' ).addClass( 'hidden' );

		//   $var.delegate( '.toggle-class', 'click' ,function() {    
		//     // use "nextUntil" to toggle multiple child rows
		//     // toggle table cells instead of the row
		//     console.log("Working")
		//     $( this )
		//       .closest( 'tr' )
		//       .nextUntil( 'tr.tablesorter-hasChildRow' )
		//       .find( 'td' )	
		//       .toggleClass( 'hidden' );

		//     $( this )
		//       .closest( 'tr' )
		//       .nextUntil( 'tr.tablesorter-hasChildRow' )
		//       .find( 'th' )	
		//       .toggleClass( 'hidden' );

		//     return false;
		//   });

	};

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
