/*
Trying to Add Action More Dropdown :

*/

$(document).ready(function () {
//------------------------------------------------------------------------------------------------------------>>
// Manage Session
		// if(!SESSION.userLogged()){
  //   		window.location.assign('index.html');
		// }	
			
 
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
					JOIN item ON suppliers.item_id = item.id;'


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
			tr.append('<td style="text-decoration: red;">' + supplier.supplier_rating + '</td>');
			tr.append('<td> <button supplier_id="'+supplier.supplier_id+'" item_id="'+supplier.item_id+'" type="button" class="btn btn-success btn-xs place_order-btn">Place Order</button> </td>');
			tr.appendTo(tbody);
		}
		//-------------------

		/*Call the tablesorter plugin inline to enable editing*/
	    $('#table-suppliers').trigger("destroy");

		$('#table-suppliers').tablesorter({
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
		      filter_columnFilters: false,
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
				container: $('#pager-suppliers'),
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
					alasql('update suppliers set supplier_rating = '+parseInt(newContent)+';');
					console.log('update suppliers set supplier_rating = '+parseInt(newContent)+';');
			      
				      $this.addClass( 'editable_updated' ); // green background + white text
				      setTimeout(function(){
				        $this.removeClass( 'editable_updated' );
				      }, 500);
		    });


	     // Old TableSorter Code:


				   // $("#table-suppliers")
				   //  .tablesorter({
				   //    theme : 'blue',

				   //    widgets: ['editable'],
				   //    widgetOptions: {
					  //       editable_columns       : [6],       // or "0-2" (v2.14.2); point to the columns to make editable (zero-based index)
					  //       editable_enterToAccept : true,          // press enter to accept content, or click outside if false
					  //       editable_autoAccept    : true,          // accepts any changes made to the table cell automatically (v2.17.6)
					  //       editable_autoResort    : false,         // auto resort after the content has changed.
					  //       editable_validate      : null,          // return a valid string: function(text, original, columnIndex){ return text; }
					  //       editable_focused       : function(txt, columnIndex, $element) {
					  //         // $element is the div, not the td
					  //         // to get the td, use $element.closest('td')
					  //         $element.addClass('focused');
					  //       },
					  //       editable_blur          : function(txt, columnIndex, $element) {
					  //         // $element is the div, not the td
					  //         // to get the td, use $element.closest('td')
					  //         $element.removeClass('focused');
					  //       },
					  //       editable_selectAll     : function(txt, columnIndex, $element){
					  //         // note $element is the div inside of the table cell, so use $element.closest('td') to get the cell
					  //         // only select everthing within the element when the content starts with the letter "B"
					  //         return /^b/i.test(txt) && columnIndex === 0;
					  //       },
					  //       editable_wrapContent   : '<div>',       // wrap all editable cell content... makes this widget work in IE, and with autocomplete
					  //       editable_trimContent   : true,          // trim content ( removes outer tabs & carriage returns )
					  //       editable_noEdit        : 'no-edit',     // class name of cell that is not editable
				   //      	editable_editComplete  : 'editComplete' // event fired after the table content has been edited
				   //    }
				   //  }).children('tbody').on('editComplete', 'td', function(event, config){
					  //     var $this = $(this),
					  //       newContent = $this.text(),
					  //       cellIndex = this.cellIndex, // there shouldn't be any colspans in the tbody
					  //       rowIndex = $this.closest('tr').attr('id'); // data-row-index stored in row id
							
							// $tr = $this.closest('tr');
							// supplier_id = parseInt($tr.find('.supplier_id').text());
							// alasql('update suppliers set supplier_rating = '+parseInt(newContent)+';');
							// console.log('update suppliers set supplier_rating = '+parseInt(newContent)+';');
					      
					  //     $this.addClass( 'editable_updated' ); // green background + white text
					  //     setTimeout(function(){
					  //       $this.removeClass( 'editable_updated' );
					  //     }, 500);
				   //  });
	}

// Process Reorder Button 
	$(document).on('click','.place_order-btn', function() {
		console.log("Process Order Clicked!!");
		$tr = $(this).closest('tr');
		supplier_id = $tr.find('.supplier_id').text();
		console.log(supplier_id);

		newwindow=window.open("process_order.html",'_blank','height=600,width=800');
		newwindow.supplier_id = supplier_id;
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
/*Returns & Issues Tab Click*/
	$('#RandI-Tab').click(function(){
		$('#Returns-Tab').click();
	});

//--------------------------------------------------------------------------------------------------------
/*Building Returns Table*/
	$('#Returns-Tab').click(function(){
		$('#tbody-returns').empty();

		// // build html table
		sql = 'select return_goods.return_id,return_goods.order_id, return_goods.supplier_id,return_goods.goods_id,return_goods.comments, return_goods.status \
		 	FROM return_goods \
		 	ORDER BY return_goods.return_id';


		var returnss = alasql(sql);
		var tbody = $('#tbody-returns');

		for (var i = 0; i < returnss.length; i++) {
				

				var returns = returnss[i];
				var returnz = alasql('select supplier_orders.item_id, supplier_orders.warehouse_id from supplier_orders where order_id ='+returns.order_id+';')
				returnz = returnz[0];
				var tr = $('<tr class="tablesorter-hasChildRow"></tr>');
					
					//checking for child rows
					var records = alasql('select * from return_goods_qa where return_id = '+returns.return_id+';');
					var child_exists = records.length==0?false:true	;
					console.log("child_exists:"+child_exists);
					var pad = 0;
					if(child_exists){
						pad = 1;
					}
					console.log("child_exists:"+child_exists);

				tr.append('<td rowspan="'+(records.length+1+pad)+'" class="return_id">'+(child_exists?'<a href=# class="toggle-class">':'')+'' + returns.return_id + (child_exists?'</a>':'')+'</td>');
				tr.append('<td rowspan="'+(records.length+1+pad)+'" class = "order_id">' + returns.order_id + '</td>');
				tr.append('<td rowspan="'+(records.length+1+pad)+'" class = "supplier_id"><a href="#" class="highlight-class">' + returns.supplier_id + '</a></td>');
				tr.append('<td class = "item_id">' + returnz.item_id + '</td>');
				tr.append('<td class = "warehouse_id">' + returnz.warehouse_id + '</td>');			
				tr.append('<td>' + returns.comments + '</td>');
				tr.append('<td class = "status">' + returns.status + '</td>');
				

				$def_dropdown = $('<td>\
				<ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="RT-Shipped active"><span></span> Order Shipped </a></li><li><a href="#" class="RT-Receive"><span></span> Shipment Received</a></li><li><a href="#" class="RT-QC"><span></span> Send for QC</a></li><li role="separator" class="divider"></li><li><a href="#" class="RT-Close"><span></span> Close Order</a></li></ul></li></ul>\
				</td>');

				switch(returns.status){
				   
				    case "Shipped":			   	
				    	$def_dropdown.find('.RT-Shipped').removeClass("active");
				    	$def_dropdown.find('.RT-Receive').addClass("active");
				    	$def_dropdown.find('.RT-QC').removeClass("active");
				    	$def_dropdown.find('.RT-Close').removeClass("active");
						tr.append($def_dropdown);
				        break;

				    case "Received":
				    	$def_dropdown.find('.RT-Shipped').removeClass("active");
				    	$def_dropdown.find('.RT-Receive').removeClass("active");
				    	$def_dropdown.find('.RT-QC').addClass("active");
				    	$def_dropdown.find('.RT-Close').addClass("active");
						tr.append($def_dropdown);
				        break;
				    
				    case "Sent to QA":
				    	$def_dropdown.find('.RT-Shipped').removeClass("active");
				    	$def_dropdown.find('.RT-Receive').removeClass("active");
				    	$def_dropdown.find('.RT-QC').removeClass("active");
				    	$def_dropdown.find('.RT-Close').addClass("active");
						tr.append($def_dropdown);				
				        break;
				    
				    case "Closed":
				    	$def_dropdown.find('.RT-Shipped').removeClass("active");
				    	$def_dropdown.find('.RT-Receive').removeClass("active");
				    	$def_dropdown.find('.RT-QC').removeClass("active");
				    	$def_dropdown.find('.RT-Close').removeClass("active");
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
							
					$th = $('<th >');
					$th.text("Goods ID");
					$tr_child.append($th);
							
					$th = $('<th>');
					$th.text("Comments");
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


					$td = $('<td class="goods_qa_id"></td>');
					$td.text(record.goods_qa_id	);
					$tr_child.append($td);


					$td = $('<td class="comments"></td>');
					$td.text(record.comments);
					$tr_child.append($td);


					$td = $('<td class="status"></td>');
					$td.text(record.status);
					$tr_child.append($td);

					$def_dropdown = $('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="RT-RT"><span></span> Mark for Return</a></li><li><a href="#" class="RT-SendWarehouse"><span></span> Send to Warehouse </a></li></ul></li></ul></td>');

					switch(record.status){
					   
					    case "Pass":			   	
					    	$def_dropdown.find('.RT-RT').removeClass("active");
					    	$def_dropdown.find('.RT-SendWarehouse').addClass("active");
							$tr_child.append($def_dropdown);
					        break;

					    case "Fail":
					    	$def_dropdown.find('.RT-RT').addClass("active");
					    	$def_dropdown.find('.RT-SendWarehouse').removeClass("active");
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
	    callTableSorter($('#table-returns'),$('#pager-returns'),isEnabled,true,6);
		});

//--------------------------------------------------------------------------------------------------------
/*Building Issues Table*/
	$('#Issues-Tab').click(function(){
		$('#tbody-issues').empty();;
		// // build html table
		var issues = alasql('select * from issues');
		var tbody = $('#tbody-issues');

		for (var i = 0; i < issues.length; i++) {
			var issue = issues[i];
			//Hackabbye
			var tr = $('<tr></tr>');

			tr.append('<td>' + issue.issue_id + '</td>');
			tr.append('<td>' + issue.order_id + '</td>');
			tr.append('<td class="supplier_id"><a href="#" class="highlight-class">' + issue.supplier_id + '</a></td>');
			tr.append('<td>' + issue.comments + '</td>');
			tr.append('<td class = "status">' + issue.status + '</td>');
			tr.append('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="IS-Resolved"><span></span> Issue Resolved </a></li></ul></li></ul></td>');

			tr.appendTo(tbody);
		}
		/*Call the tablesorter plugin*/
		isEnabled = false;
	    callTableSorter($('#table-issues'),$('#pager-issues'),isEnabled,true,6);
		});

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
			tr.append('<td>' + reorder.status + '</td>');
			if(tableid == "-open" || tableid== ""){
				$td_button = $('<td> <button reorder_id="'+reorder.reorder_id+'" item_id="'+reorder.item_id+'" type="button" class="btn btn-success btn-xs process_reorder active"> Process Reorder </button> </td>');
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
		$tr = $(this).closest('tr');
		reorder_id = $tr.find('.reorder_id').text();
		console.log(reorder_id);

		newwindow=window.open("process_reorder.html",'_blank','height=600,width=800');
		newwindow.reorder_id = reorder_id;
		var pollTimer = window.setInterval(function() {
		    if (newwindow.closed !== false) { // !== is required for compatibility with Opera
		        window.clearInterval(pollTimer);
	    		$('#Open-Reorders-Tab').click();	
	    		$('#All-Reorders-Tab').click();	
		    }
		}, 200);


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
// 	PR - Action -> change status

	$(document).on('click','.PR-Receive', function() {
		if($(this).hasClass("active")){
			setStatus($(this),"Received");
				$this = $(this)
			//remove active class
				$this.removeClass("active");
			//add to next 
				$li = $this.closest('li');
				$nextli = $li.next('li');
				$a = $this.closest('li').next('li').find('a');
				$a.addClass("active");
		}
		else{
			alert('Please follow the workflow order');	
		}

	});

	$(document).on('click','.PR-QC', function() {
		if($(this).hasClass("active")){
			setStatus($(this),"Sent to QA");
				$this = $(this)
			//remove active class
				$this.removeClass("active");
			//add to next 
				$li = $this.closest('li');
				$nextli = $li.next('li');
				$a = $this.closest('li').next('li').next('li').find('a');
				$a.addClass("active");

			$tr = $(this).closest('tr');
			var order_id = parseInt($($tr.children()[0]).text());
			var records = alasql('select * from goods where order_id = '+order_id+' ORDER BY goods_id');
			var child_exists = records.length==0?false:true;

			if(!child_exists){

				$tr = $(this).closest('tr');
				// $tr = $ref.closest('tr');
				$tds = 	$tr.children();
				var quant = parseInt($($tds[3]).text());	

				$order_id = $($tds[0]);
				order_id = $order_id.text();
				$order_id.text("");
				$order_id.append('<a href=# class="toggle-class">'+order_id+'</a>')

				// $($tds[0]).attr("rowspan","2");
				// $($tds[0]).prepend($('<a href="#" class="toggle-child">'));

				/*Modifying Rowspan*/
				child_col_len = 4; 	// Predefined
				parent_col_len = $tr.find('td').length;
				len = parent_col_len - child_col_len;
				for(k = 0; k < len; k++){
					$($tr.find('td')[k]).attr("rowspan",quant + 2);
				}
				//------------------
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

				$tr.after($tr_child);		

				$last = $tr_child;
				goods_id = parseInt(alasql('column of select max(goods_id) from goods'));
				if(!goods_id){
					goods_id = 0;
				}
				for (var i = 1; i <= quant; i++) {
					$tr_child = $('<tr class="tablesorter-childRow"></tr>');

					$td = $('<td></td>');
					$td.text(i);
					$tr_child.append($td);
						
					$td = $('<td></td>');
					$td.text(goods_id+i);
					$tr_child.append($td);

					$td = $('<td class="status"></td>');
					$td.text("Awaiting");
					$tr_child.append($td);
					
				
					// $tr_child.append('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="PR-SendWarehouse"><span></span> Send to Warehouse </a></li><li><a href="#" class="PR-RT"><span></span> Mark for Return</a></li></ul></li></ul></td>');
					$tr_child.append('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="RT-RT"><span></span> Mark for Return</a></li><li><a href="#" class="RT-SendWarehouse"><span></span> Send to Warehouse </a></li></ul></li></ul></td>');
					$last.after($tr_child);
					$last = $tr_child;

					/*Add these details to Goods Table to make it persistent*/
					// -------	

					values = [goods_id+i,parseInt(order_id),"Awaiting"];
					console.log(values);
					alasql('insert into goods values(?,?,?)',values);

					// -------	
				}
				$('#table-orders').find( '.tablesorter-childRow th' ).addClass( 'hidden' );
			
				$('#table-orders').find( '.tablesorter-childRow td' ).addClass( 'hidden' );

				$('#table-orders').trigger("update");	
			}
		}
		else{
			alert('Please follow the workflow order');	
		}	
	});

	$(document).on('click','.PR-Close', function() {
		if($(this).hasClass("active")){
			r = window.confirm('Once closed you can\'t change the status anymore');
		 	if(r==true){
		 		$(this).closest('td').find('.dropdown a').removeClass();
		 			setStatus($(this),"Closed");

		 	}
	 	}
		else{
			alert('Please follow the workflow order');	
		}	
	});

	$(document).on('click','.PR-RT', function() {
		if($(this).hasClass("active")){
			$(this).removeClass("active");
			$tr = $(this).closest('tr');
			$tr_parent = $tr.prevAll('tr.tablesorter-hasChildRow');
			
			var goods_id = $($tr.children()[1]).text();
			var order_id = parseInt($($tr_parent.children()[0]).text());
			var supplier_id = parseInt($($tr_parent.children()[1]).text());
			$('#comments-goods_id').text(goods_id);
			$('#comments-order_id').text(order_id);
			$('#comments-supplier_id').text(supplier_id);


			//Updating Status
			$status = $tr.children('.status');
			status = "Marked for Return";
			$status.text(status);	
			var update = 'update goods set status ="'+status+'" where goods_id='+goods_id+'';
			alasql(update);

			console.log(goods_id,order_id,supplier_id);
			$('#commentsModal').modal('show');
		}
		else{
			alert('Please follow the workflow order');	
		}
	});

	$('.save-comments').click(function(){
			goods_id = $('#comments-goods_id').text();
			order_id = $('#comments-order_id').text();
			supplier_id = $('#comments-supplier_id').text();
			console.log("save comments triggered");
			var return_id = 1;
			var records = alasql('select return_id from return_goods');
			if(records.length){
				return_id = parseInt(alasql('column of select max(return_id) from return_goods'));
				return_id = return_id + 1;
			}
			var comments = $('#comment-text').val();
			console.log('insert into return_goods values ('+return_id+','+order_id+','+supplier_id+','+goods_id+',"'+comments+'""Awaiting","Awaiting")');
			var update = 'insert into return_goods values ('+return_id+','+order_id+','+supplier_id+','+goods_id+',"'+comments+'","Awaiting","Awaiting")';
			alasql(update);

			window.confirm('Return ID#'+return_id+' has been successfully registered!!');

			$('#comment-text').val("");
			$('#commentsModal .close').click();
			//-------------------			
		});

	$(document).on('click','.PR-SendWarehouse', function() {
			
		if($(this).hasClass("active")){
			$tr = $(this).closest('tr');
			goods_id = parseInt($tr.find('.goods_id').text())
			$tr_parent = $tr.prevAll(".tablesorter-hasChildRow:first");
				// var qty = 1;
			var item_id = parseInt($tr_parent.find('.item_id').text());	
			var cur_warehouse_id = parseInt($tr_parent.find('.warehouse_id').text());
			r = confirm(" Are you sure you want to send to Warehouse Location :"+cur_warehouse_id )
			if(r == true ){
				$(this).removeClass("active");
			 	// send the goods to the warehouse ?? -- same as in procurement
				$status = $tr.children('.status');
				status = "Sent to Warehouse "+cur_warehouse_id;
				$status.text(status);	
				var update = 'update goods set status ="'+status+'" where goods_id='+goods_id+'';
				alasql(update);

				console.log(item_id, cur_warehouse_id);
				var wh1 = 0;
				var wh2 = 0;
				var wh3 = 0;
				var wh4 = 0;
				switch(cur_warehouse_id) {
				    case 1:
				        wh1 = 1;
				        break;
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

				// 1. Update sales_master
					// 1.1 Get max stock_id
					// 1.2 Get waerehouse_loc
					// 1.3 Get item_id
					// 1.4 Update
						var new_stock_id = parseInt(alasql('column of select max(stock_id) from stocks_master')) + 1;
						var currentDate = $.datepicker.formatDate('yy-mm-dd', new Date());
						var disc = 0;
							values = [new_stock_id,item_id,wh1,wh2,wh3,wh4,currentDate,disc];
							console.log(values)
							alasql('insert into stocks_master values(?,?,?,?,?,?,?,?)',values);
				// 2. Update bin_master 
					// 2.1 Get the empty bin_no & update it with the new stock_id
						var bins = alasql('column of select bin_id from bin_master where warehouse_'+cur_warehouse_id+'=0 order by bin_no');
						alasql('update bin_master set warehouse_'+cur_warehouse_id+'='+new_stock_id+' where bin_id ='+bins[0]);
				
				// 3. Update warehouse_master
						alasql('update warehouse_master set warehouse_'+cur_warehouse_id+'= 1 where item_id ='+item_id);	
						console.log("UPDATED");
				alert("Successfully sent to Warehouse Location :"+cur_warehouse_id )				
			}
		}
		else{
			alert('Please follow the workflow order');	
		}
	});

	$(document).on('click','.IS-Resolved', function() {
			$tr = $(this).closest('tr');
			var issue_id = parseInt($($tr.children()[0]).text());
			var order_id = parseInt($($tr.children()[1]).text());
			alasql('update issues set status = "Closed" where issue_id='+issue_id);	
			console.log('update issues set status = "Closed" where issue_id='+issue_id);
			$status = $tr.children('.status');
			$status.text("Closed");
			// Change status of order back to sent to QA
			alasql('update supplier_orders set status = "Sent to QA" where order_id='+order_id);	

	});


	setStatus = function($var, status){
			$tr = $var.closest('tr');
			var order_id = parseInt($($tr.children()[0]).text());
			alasql('update supplier_orders set status = "'+status+'" where order_id='+order_id);	
			$status = $tr.children('.status');
			$status.text(status);
	}

//--------------------------------------------------------------------------------------------------------
// 	RT - Action -> change status
	$(document).on('click','.RT-Shipped', function() {
		if($(this).hasClass("active")){
			setStatusRT($(this),"Shipped");
			$this = $(this)
			//remove active class
			$this.removeClass("active");
			//add to next 
			$li = $this.closest('li');
			$nextli = $li.next('li');
			$a = $this.closest('li').next('li').find('a');
			$a.addClass("active");
		}
		else{
			alert('Please follow the workflow order');	
		}
	});

	$(document).on('click','.RT-Receive', function() {
		if($(this).hasClass("active")){
			setStatusRT($(this),"Received");
			$this = $(this)
			//remove active class
			$this.removeClass("active");
			//add to next 
			$li = $this.closest('li');
			$nextli = $li.next('li');
			$a = $this.closest('li').next('li').find('a');
			$a.addClass("active");
		}
		else{
			alert('Please follow the workflow order');	
		}
	});


	$(document).on('click','.RT-QC', function() {

		if($(this).hasClass("active")){
	
			setStatusRT($(this),"Sent to QA");
			$this = $(this)
			//remove active class
			$this.removeClass("active");
			//add to next 
			$li = $this.closest('li');
			$nextli = $li.next('li').next('li');
			$a = $this.closest('li').next('li').find('a');
			$a.addClass("active");


			$tr = $(this).closest('tr');
			var return_id = parseInt($($tr.find('.return_id').text()));
			var records = alasql('select * from return_goods_qa where return_id = '+return_id+' ;');
			var child_exists = records.length==0?false:true;

			if(!child_exists){

				$tr = $(this).closest('tr');
				$tds = 	$tr.children();
				var quant = 1;	

				$return_id = $($tds[0]);
				return_id = parseInt($return_id.text());
				$return_id.text("");
				$return_id.append('<a href=# class="toggle-class">'+return_id+'</a>')


				/*Modifying Rowspan*/
				child_col_len = 5; 	// Predefined
				parent_col_len = $tr.find('td').length;
				len = parent_col_len - child_col_len;
				for(k = 0; k < len; k++){
					$($tr.find('td')[k]).attr("rowspan",quant + 2);
				}
				//------------------
				$tr_child = $('<tr class="tablesorter-childRow" ></tr>');
						
				$th = $('<th >');
				$th.text("S.No");
				$tr_child.append($th);
						
				$th = $('<th >');
				$th.text("Goods ID");
				$tr_child.append($th);



				$th = $('<th>');
				$th.text("Comments");
				$tr_child.append($th);


				$th = $('<th>');
				$th.text("Status");
				$tr_child.append($th);


				$th = $('<th>');
				$th.text("Action");
				$tr_child.append($th);

				$tr.after($tr_child);		

				$last = $tr_child;
				for (var i = 1; i <= quant; i++) {

					new_id = parseInt(alasql('column of select max(goods_qa_id) from return_goods_qa;'));
					if(!new_id){
						new_id = 1;
					}
					else{
						console.log("inside");
						new_id = new_id + 1;
						console.log(new_id);
					}


					$tr_child = $('<tr class="tablesorter-childRow"></tr>');

					$td = $('<td></td>');
					$td.text(i);
					$tr_child.append($td);
					

					$td = $('<td class = "goods_qa_id"></td>');
					$td.text(new_id);
					$tr_child.append($td);


					$td = $('<td></td>');
					$td.text("NA");
					$tr_child.append($td);

					$td = $('<td class="status"></td>');
					$td.text("Awaiting");
					$tr_child.append($td);
					
				
					$tr_child.append('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="RT-RT"><span></span> Mark for Return</a></li><li><a href="#" class="RT-SendWarehouse"><span></span> Send to Warehouse </a></li></ul></li></ul></td>');

					$last.after($tr_child);
					$last = $tr_child;

					/*Add these details to Goods Table to make it persistent*/
					// -------	

	

					values = {goods_qa_id:new_id,return_id:return_id, comments:"NA", status:"Awaiting"};
					console.log(values);
					alasql('insert into return_goods_qa values ?',[values]);

					// -------	
				}
				$('#table-returns').find( '.tablesorter-childRow th' ).addClass( 'hidden' );
			
				$('#table-returns').find( '.tablesorter-childRow td' ).addClass( 'hidden' );

				$('#table-returns').trigger("update");	
			}
		}
		else{
			alert('Please follow the workflow order');	
		}	
	});

	$(document).on('click','.RT-Close', function() {
		if($(this).hasClass("active")){
			r = window.confirm('Once closed you can\'t change the status anymore');
		 	if(r==true){
		 		$(this).closest('td').find('.dropdown a').removeClass();
	 			setStatusRT($(this),"Closed");
		 	}
	 	}
		else{
			alert('Please follow the workflow order');	
		}	
	});

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
		alert('Supplier Rating has been updated!!')
		$('#supplierModal .close').click();

	});

	setStatusRT = function($var, status){

		$tr = $var.closest('tr');
		// console.log($tr.find('.return_id').text());
		var return_id = parseInt($tr.find('.return_id').text());
		console.log('update return_goods set status = "'+status+'" where return_id='+return_id);
		alasql('update return_goods set status = "'+status+'" where return_id='+return_id);	
		$status = $tr.children('.status');
		$status.text(status);
	}

	$(document).on('click','.RT-RT', function() {
		if($(this).hasClass("active")){
			$(this).removeClass("active");
			$tr = $(this).closest('tr');
			$tr_parent = $tr.prevAll('tr.tablesorter-hasChildRow');
			
			var goods_id = $($tr.children()[1]).text();
			var return_id = parseInt($($tr_parent.children()[0]).text());
			var order_id = parseInt($($tr_parent.children()[1]).text());
			var supplier_id = parseInt($($tr_parent.children()[2]).text());
			
			$('#comments-goods_id').text(goods_id);
			$('#comments-order_id').text(order_id);
			$('#comments-supplier_id').text(supplier_id);

				// hack -> return_id <- goods_id 


			//Updating Status
			$status = $tr.children('.status');
			status = "Marked for Return";
			$status.text(status);	
			var update = 'update return_goods set status ="'+status+'" where goods_id='+goods_id+'';
			alasql(update);

			console.log(goods_id,order_id,supplier_id);
			$('#commentsModal').modal('show');
		}
		else{
			alert('Please follow the workflow order');	
		}
	});


	$(document).on('click','.RT-SendWarehouse', function() {
			
		if($(this).hasClass("active")){
			$tr = $(this).closest('tr');
			$tr_parent = $tr.prevAll(".tablesorter-hasChildRow:first");
				// var qty = 1;
			var item_id = parseInt($tr_parent.find('.item_id').text());	
			var cur_warehouse_id = parseInt($tr_parent.find('.warehouse_id').text());
			r = confirm(" Are you sure you want to send to Warehouse Location :"+cur_warehouse_id )
			if(r == true ){
				$(this).removeClass("active");
			 	// send the goods to the warehouse ?? -- same as in procurement
				$status = $tr.children('.status');
				status = "Sent to Warehouse "+cur_warehouse_id;
				$status.text(status);	
				// update status
				goods_qa_id = parseInt($tr.find('.goods_qa_id'));
				alasql('update return_goods_qa set status = "'+status+'" where goods_qa_id = '+goods_qa_id);
				console.log(item_id, cur_warehouse_id);
				var wh1 = 0;
				var wh2 = 0;
				var wh3 = 0;
				var wh4 = 0;
				switch(cur_warehouse_id) {
				    case 1:
				        wh1 = 1;
				        break;
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

				// 1. Update sales_master
					// 1.1 Get max stock_id
					// 1.2 Get waerehouse_loc
					// 1.3 Get item_id
					// 1.4 Update
						var new_stock_id = parseInt(alasql('column of select max(stock_id) from stocks_master')) + 1;
						var currentDate = $.datepicker.formatDate('yy-mm-dd', new Date());
						var disc = 0;
							values = [new_stock_id,item_id,wh1,wh2,wh3,wh4,currentDate,disc];
							console.log(values)
							alasql('insert into stocks_master values(?,?,?,?,?,?,?,?)',values);
				// 2. Update bin_master 
					// 2.1 Get the empty bin_no & update it with the new stock_id
						var bins = alasql('column of select bin_id from bin_master where warehouse_'+cur_warehouse_id+'=0 order by bin_no');
						alasql('update bin_master set warehouse_'+cur_warehouse_id+'='+new_stock_id+' where bin_id ='+bins[0]);
				
				// 3. Update warehouse_master
						alasql('update warehouse_master set warehouse_'+cur_warehouse_id+'= 1 where item_id ='+item_id);	
						console.log("UPDATED");
				alert("Successfully sent to Warehouse Location :"+cur_warehouse_id )				
			}
		}
		else{
			alert('Please follow the workflow order');	
		}
	});


