$(document).ready(function () {
//------------------------------------------------------------------------------------------------------------>>
	console.log("Inside Process Reorders");
	//get reorder id
	// reorder_id = 1;
	var reorder_id = window.reorder_id; 
	reorder_id = parseInt(reorder_id);

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


		var sql = 'SELECT supplier_reorders.reorder_id, supplier_reorders.item_id, supplier_reorders.quantity, supplier_reorders.warehouse_id, supplier_reorders.request_date, item.detail \
				FROM supplier_reorders \
				JOIN item ON supplier_reorders.item_id = item.id \
				WHERE reorder_id = '+reorder_id+';'
		var reorders = alasql(sql);
		reorders = reorders[0]
		var sql = 'SELECT * FROM suppliers WHERE item_id = '+reorders.item_id+' ORDER BY supplier_id ;'
		console.log("Inside Process Reorders");
		console.log(sql);
		var suppliers = alasql(sql);
	
			//---------------------------------
			// Set the reorder Info

			$('#reorder_id').text(reorders.reorder_id); 
			$('#item_id').text(reorders.item_id); 
			$('#item_name').text(reorders.detail); 
			$('#qty').text(reorders.quantity); 
			$('#warehouse_id').text(reorders.warehouse_id);

			//---------------------------------



			//-------------------------
			// Suggesting the most suitable supplier
			var sql = 'column of SELECT TOP 1 supplier_id FROM suppliers WHERE item_id = '+reorders.item_id+' ORDER BY supplier_rating DESC, price ;';
			sugg_supplier  = alasql(sql);
			sugg_supplier = parseInt(sugg_supplier[0]);
			$('#supplier_id').val(sugg_supplier);
			//-------------------------
					
		// // build html table
		var tbody = $('#tbody-suppliers');
		for (var i = 0; i < suppliers.length; i++) {
			var supplier = suppliers[i];
			// var tr = $('<tr data-href="supplier.html?id=' + supplier.id + '"></tr>');
			var tr = $('<tr></tr>');
			tr.append('<td>' + supplier.supplier_id + '</td>');
			tr.append('<td>' + supplier.supplier_name + '</td>');
			tr.append('<td>' + supplier.price + '</td>');
			tr.append('<td>' + supplier.supplier_rating + '</td>');
			tr.appendTo(tbody);
		}
		//-------------------

		/*Call the tablesorter plugin*/
		isEnabled = false;
	    callTableSorter($('#table-suppliers'),$('#pager-suppliers'),isEnabled,true,6);
		
		//intializing Toaster
		toastr.options = {
		    closeButton: true,
		    progressBar: true,
		    showMethod: 'slideDown',
		    timeOut: 4000
		};

}); /* End of Document Ready*/

//--------------------------------------------------------------------------------------------------------
// Place Order Button
$('.place-order').click(function(){
		max_id = parseInt(alasql('column of select max(order_id) from supplier_orders'));
		if(!max_id){
			order_id = 1;
		}
		else{
			order_id = max_id + 1;

		}
		var sql = 'SELECT supplier_reorders.reorder_id, supplier_reorders.item_id, supplier_reorders.quantity, supplier_reorders.warehouse_id, supplier_reorders.request_date, item.detail \
		FROM supplier_reorders \
		JOIN item ON supplier_reorders.item_id = item.id \
		WHERE reorder_id = '+reorder_id+';'
		reorder = alasql(sql);
		reorder = reorder[0];

		supplier_id = $('#supplier_id').val();
		item_id = reorder.item_id;
		qty = reorder.quantity;
		warehouse_id = reorder.warehouse_id;
		order_date = reorder.request_date;
		comments = "Auto Reorder Request";	
		status = 'Open';

		values = [order_id, supplier_id, item_id, qty, warehouse_id, order_date, comments, status, status]
		console.log(values);
		alasql('insert into supplier_orders values (?,?,?,?,?,?,?,?,?)',values);
		// window.confirm('Order ID:'+order_id+' has been placed successfully placed!!');
        toastr.success('Order ID:'+order_id+' has been successfully placed!!', 'Procurement Team');

		// Update Reorder Status
		alasql('update supplier_reorders set status = "Closed" where reorder_id = '+reorder_id);

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