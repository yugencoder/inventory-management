/*
Trying to Add Action More Dropdown :

*/
var BO = "PO";
var $dilemma = $();
var toggle=true;
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

	// Show Suppliers
	$('#Open-Tab').click();

	// Show Messages
	showMessages(BO);

	// Show Top 4 Messages 
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
}); /* End of Document Ready*/


//--------------------------------------------------------------------------------------------------------
/* External Functions*/
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
/* Orders Tab*/
//--------------------------------------------------------------------------------------------------------
/* Building Orders Table*/
	$('#Orders-Tab').click(function(){
		$('#Open-Tab').click();
	});

	$('#Open-Tab').click(function(){
			sql ='select supplier_orders.*,item.* from supplier_orders JOIN item ON supplier_orders.item_id = item.id where status != "Closed"';
			tableID = 'orders-open';
			showOrders(tableID,sql);
	});

	$('#Closed-Tab').click(function(){
			sql ='select supplier_orders.*,item.* from supplier_orders JOIN item ON supplier_orders.item_id = item.id where status == "Closed"';
			tableID = 'orders-closed';
			showOrders(tableID,sql);
	});
	
	$('#All-Tab').click(function(){
			sql ='select supplier_orders.*,item.* from supplier_orders JOIN item ON supplier_orders.item_id = item.id';
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

			tr.append('<td rowspan="'+(records.length+1+pad)+'" class="order_id">'+(child_exists?'<a href=# class="toggle-class" data-toggle="tooltip" data-placement="right" title="Click to see/hide individual goods">':'')+'' + order.order_id + (child_exists?'</a>':'')+'</td>');
			tr.append('<td rowspan="'+(records.length+1+pad)+'" class="supplier_id">' + order.supplier_id + '</td>');
			tr.append('<td rowspan="'+(records.length+1+pad)+'"class = "item_id">' + order.item_id + '</td>');
			tr.append('<td rowspan="'+(records.length+1+pad)+'"class = "item_name">' + order.detail + '</td>');
			tr.append('<td class = "quant">' + order.quantity + '</td>');
			tr.append('<td class="warehouse_id">' + order.warehouse_id + '</td>');		
			$td = $('<td style="text-align:center"><span class="status">' + order.status + '</span></td>');
			$status = $td.find('.status');
				switch(order.status){
				   
				    case "Open":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-info");
						break;
				    case "Received":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-success");
						break;
				    case "Sent for QC":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-warning");
						break;
				    case "Issue Raised":
						$status.removeClass();
						$status.addClass("label");
						$status.addClass("label-danger");
						break;
				    default:
						$status.removeClass();
						$status.addClass("label");
						break;
				}
				$status.addClass("status");							

			tr.append($td);
		
			$def_dropdown = $('<td>\
				<ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="PR-Receive active"><span></span> Shipment Received</a></li><li><a href="#" class="PR-QC"><span></span> Send for QC</a></li><li role="separator" class="divider"></li><li><a href="#" class="PR-Automate"><span></span> Automate Process</a></li><li><a href="#" class="PR-Close"><span></span> Close Order</a></li></ul></li></ul>\
				</td>');

			switch(order.status){
			   
			    case "Received":
			    	$def_dropdown.find('.PR-Receive').removeClass("active");
			    	$def_dropdown.find('.PR-QC').addClass("active");
			    	$def_dropdown.find('.PR-Close').addClass("active");
					tr.append($def_dropdown);
			        break;
			    
			    case "Sent for QC":
			    	$def_dropdown.find('.PR-Receive').removeClass("active");
			    	$def_dropdown.find('.PR-QC').removeClass("active");
			    	$def_dropdown.find('.PR-Close').addClass("active");
					tr.append($def_dropdown);				
			        break;
			    
			    case "Issue Raised":
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

					$td = $('<td style="text-align:center"><span class="status">'+record.status+'</span></td>');
					// $td.text();
					$status = $td.find('.status');

					switch(record.status){					   
					    case "Awaiting":
							$status.removeClass();
							$status.addClass("label");
							$status.addClass("label-info");
							break;
					    case "Pass":
							$status.removeClass();
							$status.addClass("label");
							$status.addClass("label-primary");
							break;
					    case "Fail":
							$status.removeClass();
							$status.addClass("label");
							$status.addClass("label-danger");
							break;														
					    case "Marked for Return":
							$status.removeClass();
							$status.addClass("label");
							$status.addClass("label-danger");
							break;
					    default:
							$status.removeClass();
							$status.addClass("label");
							$status.addClass("label-success");
							break;
					}	
					$status.addClass("status");							

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
			// alert('Please follow the workflow order');
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 
	
		}

	});

	$(document).on('click','.PR-QC', function() {
		if($(this).hasClass("active")){
			setStatus($(this),"Sent for QC");
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
			var qunat;
			if(!child_exists){

				$tr = $(this).closest('tr');
				// $tr = $ref.closest('tr');
				$tds = 	$tr.children();
			
				quant = parseInt($($tds[4]).text());	
				$order_id = $($tds[0]);
				order_id = $order_id.text();
				$order_id.text("");
				$order_id.append('<a href=# class="toggle-class" data-toggle="tooltip" data-placement="right" title="Click to see/hide individual goods">'+order_id+'</a>')

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

					$td = $('<td style="text-align:center" ><span class="status label label-info">Awaiting</span></td>');
					$tr_child.append($td);

					$tr_child.append('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="PR-RT"><span></span> Mark for Return</a></li><li><a href="#" class="PR-SendWarehouse"><span></span> Send to Warehouse </a></li></ul></li></ul></td>');
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

			// Send notifications to QC Team
				var item_id = parseInt($tr.find('.item_id').text());

				var msg = 'Requests Received: '+quant+' new items with Item ID:'+item_id+' has been sent for Quality Check as part of Order ID:'+order_id;
				var msg_length = parseInt('column of select max(id) from messages');
				var msg_id = 1;

				if(msg_length){
					msg_id = msg_length + 1;
				}

				values = {id:msg_id,read:0,sender:"Procurement Officer",bo:"PO_QA",content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
				console.log(values);
				alasql('insert into messages values ?',[values]);
				toastr.success('QA Team has been successfully notified','Procurement Team');
		
		}
		else{
			// alert('Please follow the workflow order');	
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show(); $('#workflow').delay(4500).fadeOut(); 			
		}	
	});

	$(document).on('click','.PR-Close', function() {
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
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 	
		}	
	});

	$(document).on('click','.PR-RT', function() {
		if($(this).hasClass("active")){
			$tr = $(this).closest('tr');
			$tr_parent = $tr.prevAll('tr.tablesorter-hasChildRow');
			
			var goods_id = $($tr.children()[1]).text();
			var order_id = parseInt($($tr_parent.children()[0]).text());
			var supplier_id = parseInt($($tr_parent.children()[1]).text());
			$('#comments-goods_id').text(goods_id);
			$('#comments-order_id').text(order_id);
			$('#comments-supplier_id').text(supplier_id);
			
			$dilemma = $();
			$dilemma = $(this);
			$('#commentsModal').modal('show');
		}
		else{
			// alert('Please follow the workflow order');	
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 
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
			console.log('insert into return_goods values ('+return_id+','+order_id+','+supplier_id+','+goods_id+',"'+comments+'""Awaiting","Open")');
			var update = 'insert into return_goods values ('+return_id+','+order_id+','+supplier_id+','+goods_id+',"'+comments+'","Awaiting","Open")';
			alasql(update);

			// window.confirm('Return ID#'+return_id+' has been successfully registered!!');
			toastr.success('Return ID#'+return_id+' has been successfully registered!',"Procurement Team")

			//Making $this as inactive
			$dilemma.removeClass("active");

			//Updating Status
			$tr = $dilemma.closest('tr');
			$status = $tr.find('.status');

			status = "Marked for Return";
			$status.text(status);	
			var update = 'update goods set status ="'+status+'" where goods_id='+goods_id+'';
			alasql(update);
			$(this).removeClass("active");

			console.log(goods_id,order_id,supplier_id);

			$('#comment-text').val("");
			updateSidebarNotify(BO);									
			$('#commentsModal .close').click();

			//-------------------			
		});

	$(document).on('click','.PR-SendWarehouse', function() {
			
		if($(this).hasClass("active")){
			$tr = $(this).closest('tr');
			$this = $(this);
			goods_id = parseInt($tr.find('.goods_id').text())
			$tr_parent = $tr.prevAll(".tablesorter-hasChildRow:first");
				// var qty = 1;
			var item_id = parseInt($tr_parent.find('.item_id').text());	
			var cur_warehouse_id = parseInt($tr_parent.find('.warehouse_id').text());

			$.confirm({
		    title: ' You are about to send stock with Stock ID:'+goods_id+' to Warehouse Location :'+cur_warehouse_id,
		    buttons: {
		        confirm: function () {
				$this.removeClass("active");
				$status = $tr.find('.status');
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
						var currentDate = moment().format("YYYY-MM-DD");
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
				// alert("Successfully sent to Warehouse Location :"+cur_warehouse_id );
			    toastr.success("Successfully sent to Warehouse Location :"+cur_warehouse_id, 'Procurement Team');

			    // Send notifications to the Warehouse Management Team

				// var item_name = $tr.find('.item_name').text();

				var msg = 'Stocks Received: Item with Stock-ID:'+new_stock_id+' has been Received:';
				var msg_length = parseInt('column of select max(id) from messages');
				var msg_id = 1;

				if(msg_length){
					msg_id = msg_length + 1;
				}

				values = {id:msg_id,read:0,sender:"Procurement Officer",bo:"WMS"+cur_warehouse_id,content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
				console.log(values);
				alasql('insert into messages values ?',[values]);
				toastr.success('WMS Team has been successfully notified','Procurement Team');			    

			    },
		        cancel: function () {
		            // $.alert('Canceled!');
		        },
		    }
			});
		}
		else{
			// alert('Please follow the workflow order');
			toastr.error('Please follow the workflow order','Procurement Team');
 	       	$('#workflow').show();$('#workflow').delay(4500).fadeOut(); 				
		}
	});


	setStatus = function($var, status){
			$tr = $var.closest('tr');
			console.log($tr.get(0))

			var order_id = parseInt($($tr.children()[0]).text());
			alasql('update supplier_orders set status = "'+status+'" where order_id='+order_id);	
			$status = $tr.find('.status');
			$status.text(status);

			if(status == "Open"){
				$status.removeClass();
				$status.addClass("status");
				$status.addClass("label");
				$status.addClass("label-info");			
			}

			if(status == "Received"){
				$status.removeClass();
				$status.addClass("status");
				$status.addClass("label");
				$status.addClass("label-success");
			
			}
			if(status== "Sent for QC"){
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

$(document).on('click','.PR-Automate', function() {

	$tr = $(this).closest('tr');
	var order_id = parseInt($tr.find('.order_id').text());
	var item_id = parseInt($tr.find('.item_id').text());	
	var cur_warehouse_id = parseInt($tr.find('.warehouse_id').text());
	var supplier_id = parseInt($tr.find('.supplier_id').text());

	var records = alasql('select * from goods where order_id = '+ order_id+' ORDER BY goods_id');

	// skipping header
	$trow = $tr.next().next();
	
	var sent_stocks = 0;
	var sent_return = 0;
	var return_id_list = "";
	var flag = false;

	console.log(order_id,item_id,cur_warehouse_id);

	for (var i = 0; i < records.length; i++) {
		var status = records[i].status;
		console.log(status);
		if(status == "Awaiting"){
			flag = true;
		}
		if(status == "Pass"){

			$this = $trow.find('.PR-SendWarehouse');
			var goods_id = parseInt($trow.find('.goods_id').text());	

			//-------------------------------------------------------------------------------------------
			$this.removeClass("active");
			$status = $trow.find('.status');
			status = "Sent to Warehouse "+cur_warehouse_id;
			$status.text(status);	
			var update = 'update goods set status ="'+status+'" where goods_id='+goods_id+'';
			alasql(update);

			var wh1 = 0;var wh2 = 0;var wh3 = 0;var wh4 = 0;
			switch(cur_warehouse_id) {
			    case 1:
			        wh1 = 1;break;
			    case 2:
			        wh2 = 1;break;
			    
			    case 3:
			        wh3 = 1;break;
			    
			    case 4:
			        wh4 = 1;break;
			}	

			// 1. Update sales_master
					var new_stock_id = parseInt(alasql('column of select max(stock_id) from stocks_master')) + 1;
					var currentDate = moment().format("YYYY-MM-DD");
					var disc = 0;
						values = [new_stock_id,item_id,wh1,wh2,wh3,wh4,currentDate,disc];
						console.log(values)
						alasql('insert into stocks_master values(?,?,?,?,?,?,?,?)',values);
			// 2. Update bin_master 
					var bins = alasql('column of select bin_id from bin_master where warehouse_'+cur_warehouse_id+'=0 order by bin_no');
					alasql('update bin_master set warehouse_'+cur_warehouse_id+'='+new_stock_id+' where bin_id ='+bins[0]);
			
			// 3. Update warehouse_master
					alasql('update warehouse_master set warehouse_'+cur_warehouse_id+'= 1 where item_id ='+item_id);	
					console.log("UPDATED");

			sent_stocks = sent_stocks + 1;

			var msg = 'Stocks Received: Item with Stock-ID:'+new_stock_id+' has been Received:';
			var msg_length = parseInt('column of select max(id) from messages');
			var msg_id = 1;

			if(msg_length){
				msg_id = msg_length + 1;
			}

			values = {id:msg_id,read:0,sender:"Procurement Officer",bo:"WMS"+cur_warehouse_id,content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
			console.log(values);
			alasql('insert into messages values ?',[values]);
			// toastr.success('WMS Team has been successfully notified','Procurement Team');			  
			//-------------------------------------------------------------------------------------------
			console.log("clicked Pass");
		}
		if(status == "Fail"){

			// $tr_child.find('.PR-RT').click();
			// -------------------------------------------------------------------------------------------
			$this = $trow.find('.PR-RT');
			$this.removeClass("active");
			console.log($this.get(0));
			console.log($trow.get(0));

			$status = $trow.find('.status');
			status = "Marked for Return";
			$status.text(status);	
			console.log(sent_return);
			
			var goods_id = parseInt($trow.find('.goods_id').text());

			var return_id = 1;
			var rec = alasql('select return_id from return_goods');
			if(rec.length){
				return_id = parseInt(alasql('column of select max(return_id) from return_goods'));
				return_id = return_id + 1;
			}

			var comments = "NA";
			console.log('insert into return_goods values ('+return_id+','+order_id+','+supplier_id+','+goods_id+',"'+comments+'""Awaiting","Open")');
			var update = 'insert into return_goods values ('+return_id+','+order_id+','+supplier_id+','+goods_id+',"'+comments+'","Awaiting","Open")';
			alasql(update);

			// toastr.success('Return ID#'+return_id+' has been successfully registered!',"Procurement Team")
			sent_return = sent_return + 1;
			return_id_list = return_id_list+" "+return_id;

			var update = 'update goods set status ="'+status+'" where goods_id='+goods_id+'';
			alasql(update);
		
			// //-------------------------------------------------------------------------------------------
			console.log("clicked Fail");			
		}
		$trow = $trow.next();
		console.log($trow.find('.goods_id').text());
	}
	if(sent_stocks){
		toastr.success(sent_stocks+' Items Successfully sent to Warehouse Location :'+cur_warehouse_id, 'Procurement Team');
	}
	if(sent_return){
		toastr.success(sent_return+' Items with Return IDs:'+return_id_list+' has been registered for Return',"Procurement Team");
	}
	if(!sent_return && !sent_stocks){
		if(flag){
			toastr.error('QA Team is yet to update Goods Status to Pass/Fail',"Procurement Team");
	
		}
		else{
			toastr.info('No Goods found with Pass/ Fail Status to Automate',"Procurement Team");

		}
	}
	updateSidebarNotify(BO);	

});


