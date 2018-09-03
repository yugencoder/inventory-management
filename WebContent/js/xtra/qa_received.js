/*
Trying to Add Action More Dropdown :

*/
var $dilemma = $();
var	BO = "PO_QA";	

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
//-------------------

 	// $("#Received-Orders-Tab").click();
 	showReceived();

//intializing Toaster
	toastr.options = {
    closeButton: true,
    progressBar: true,
    showMethod: 'slideDown',
    timeOut: 4000
};		
	// Show Messages
	showMessages(BO);
	
	// Show Top 4 Messages 
	updateMsgCount(BO);

	// Update Sidebar notifications
	updateSidebarNotify(BO);


}); /* End of Document Ready*/


// $("#Received-Orders-Tab").click(function(){
showReceived = function(){
//--------------------------------------------------------------------------------------------------------
/*Building Received Orders Table*/
	var orders = alasql('select supplier_orders.*,item.* from supplier_orders join item on item.id = supplier_orders.item_id where status = "Sent for QC"');
		var tbody = $('#tbody-received');
		tbody.empty();
		for (var i = 0; i < orders.length; i++) {
			var order = orders[i];
			//Hackabbye
			var tr = $('<tr class="tablesorter-hasChildRow"></tr>');

				//checking for child rows
				var records = alasql('select * from goods where order_id = '+order.order_id+' ORDER BY goods_id');
				var child_exists = records.length==0?false:true	;
				console.log("child_exists:"+child_exists);
					var pad = 0;
					if(child_exists){
						pad = 1;
					}
			tr.append('<td rowspan="'+(records.length+1+pad)+'" class="order_id '+order.order_id+'">'+(child_exists?'<a href=# class="toggle-class" data-toggle="tooltip" data-placement="right" title="Click to see/hide individual goods">':'')+'' + order.order_id + (child_exists?'</a>':'')+'</td>');
			tr.append('<td class="supplier_id" rowspan="'+(records.length+1+pad)+'">' + order.supplier_id + '</td>');
			tr.append('<td class="item_name" rowspan="'+(records.length+1+pad)+'">' + order.detail + '</td>');
			tr.append('<td rowspan="'+(records.length+1+pad)+'">' + order.quantity + '</td>');
			tr.append(
					'<td class="verification" data-toggle="tooltip" data-placement="right" title="Click to change Verification Status"><a href="#" data-pk="'+order.order_id+'"" data-value="'+order.verification+'">' +order.verification + '</a></td>');
			tr.append('<td><span class="label label-warning status">' + order.status + '</span></td>');
			// tr.append('<td><ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a class="QA-Issue" data-toggle="modal" data-target="#commentsModal"><span></span> Raise an Issue </a></li><li><a href="#" class="QA-Close"><span></span> Close Order</a></li></ul></li></ul>\</td>');
			
			$def_dropdown = $('<td style="text-align:center"> <button type="button" class="btn btn-success btn-xs raise_issue-btn">Raise Issue</button> </td>');

				switch(order.verification){
				   
				    case "Pass":			   	
				    	$def_dropdown.find('.raise_issue-btn').removeClass("active");
						tr.append($def_dropdown);
				        break;

				    case "Fail":
				    	$def_dropdown.find('.raise_issue-btn').addClass("active");
				    	tr.append($def_dropdown);
				        break;
				    
			        default: 
	   					tr.append($def_dropdown);
				}	
			tr.appendTo(tbody);


			$('.tablesorter-hasChildRow td:nth-child(5) a').editable({
			    type: 'select',
			    name: 'select',
			    mode: 'inline',
			    source: '[{value: "Pass", text: "Pass"}, {value: "Fail", text: "Fail"}]',
			    url: function(params) {
			    	console.log(params);
			    	var d = new $.Deferred();
				    if(params.value == "") {
				        return d.reject('Please Enter Passed/Failed !!'); //returning error via deferred object
				    } else {
				    	console.log(params.order_id);
						console.log('update supplier_orders set verification="'+params.value+'" where order_id = '+params.pk);
				    	alasql('update supplier_orders set verification="'+params.value+'" where order_id = '+params.pk);		
				    	if(params.value == "Fail"){
				    		console.log($td.get(0));
							$td = $('.order_id.'+params.pk);
				    		$tr = $td.closest('tr');
				    		$tr.find('.raise_issue-btn').addClass("active");

				    	}		    
				    	if(params.value == "Pass"){
				    		console.log($td.get(0));
							$td = $('.order_id.'+params.pk);
				    		$tr = $td.closest('tr');
				    		$tr.find('.raise_issue-btn').removeClass("active");

				    	}						    	
				    }
			    },
			    title: 'QA Result:'
			});


			if(child_exists){
					$tr_child = $('<tr class="tablesorter-childRow" ></tr>');
					
					$th = $('<th >');
					$th.text("S.No");
					$tr_child.append($th);
							
					$th = $('<th >');
					$th.text("Goods ID");
					$tr_child.append($th);
							
			
					$th = $('<th>');
					$th.text("QA Check");
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

				$td = $('<td class="goods_id '+record.goods_id+'"></td>');
				$td.text(record.goods_id);
				$tr_child.append($td);
				$tr_child.append($('<td data-toggle="tooltip" data-placement="left" title="Click to Change QA Status"><a href="#" data-pk='+record.goods_id+' data-value="'+record.status+'">' +record.status + '</a></td>'));

				$tr_child.appendTo(tbody);
			}

		}
		$('.tablesorter-childRow td:last-child a').editable({
		    type: 'select',
		    name: 'select',
		    mode: 'inline',
		    source: '[{value: "Pass", text: "Pass"}, {value: "Fail", text: "Fail"}]',
		    url: function(params) {
		    	console.log(params);
		    	var d = new $.Deferred();
			    if(params.value == "") {
			        return d.reject('Please Enter Passed/Failed !!'); //returning error via deferred object
			    } else {
			    	console.log(params.order_id);
					console.log('update goods set status="'+params.value+'" where goods_id = '+params.pk+'');
			    	alasql('update goods set status="'+params.value+'" where goods_id = '+params.pk+'');
			    	
			    }

					if(params.value == "Fail"){
				    		console.log($td.get(0));
							$td = $('.return_id.'+params.pk);
				    		$tr = $td.closest('tr');
				    		$tr.find('.raise_issue-btn').addClass("active");

							// Send notifications to Procurement Team

									var msg = 'QA Status Change for Orders: QA Status has been changed to '+params.value+' for Goods ID : '+params.pk;
									var msg_length = parseInt('column of select max(id) from messages');
									var msg_id = 1;

									if(msg_length){
										msg_id = msg_length + 1;
									}

									values = {id:msg_id,read:0,sender:"Procurement QA",bo:"PO",content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
									console.log(values);
									alasql('insert into messages values ?',[values]);
									toastr.success('Procurement Team has been successfully notified','Procurement QA Team');					    		

				    	}		    
				    	if(params.value == "Pass"){
				    		console.log($td.get(0));
							$td = $('.return_id.'+params.pk);
				    		$tr = $td.closest('tr');
				    		$tr.find('.raise_issue-btn').removeClass("active");

							// Send notifications to Procurement Team

									var msg = 'QA Status Change for Orders: QA Status has been changed to '+params.value+' for Goods ID : '+params.pk;
									var msg_length = parseInt('column of select max(id) from messages');
									var msg_id = 1;

									if(msg_length){
										msg_id = msg_length + 1;
									}

									values = {id:msg_id,read:0,sender:"Procurement QA",bo:"PO",content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
									console.log(values);
									alasql('insert into messages values ?',[values]);
									toastr.success('Procurement Team has been successfully notified','Procurement QA Team');						    		

				    	}				    
		    },
		    title: 'QA Result:'
		});
		/*Call the tablesorter plugin*/
		isEnabled = false;
	    callTableSorter($('#table-received'),$('#pager-received'),isEnabled,true,6);
//-------------------   
};


$(document).on('click','.raise_issue-btn', function() {

	if($(this).hasClass("active")){
		$dilemma = $(this);
		$tr = $(this).closest('tr');
		var order_id = parseInt($tr.find('.order_id').text());
		var supplier_id = parseInt($tr.find('.supplier_id').text());
		console.log(order_id);
		console.log(supplier_id);


		$('#comments-order_id').text(order_id);
		$('#comments-supplier_id').text(supplier_id);
		$('#commentsModal').modal('show');
	}
	else{
		toastr.error('Issue can be raised only if verification fails',"Procurement QA Team");	
	}		

});

$('.save-comments').click(function(){

	$dilemma.removeClass("active");
	setStatus($dilemma,"Issue Raised");


	order_id = parseInt($('#comments-order_id').text());
	supplier_id = parseInt($('#comments-supplier_id').text());
	console.log("triggered -  supplier_id:"+supplier_id);
	var issue_id = 1;
	var records = alasql('select issue_id from issues');
	if(records.length){
		issue_id = parseInt(alasql('column of select max(issue_id) from issues'));
		issue_id = issue_id + 1;
	}
	var comments = $('#comment-text').val();
	var update = 'insert into issues values ('+issue_id+','+order_id+','+supplier_id+',"'+comments+'","Open")';

		// Send notifications to Procurement Team

		var msg = 'Issue Raised: A new issue with Issue ID : '+issue_id+' has been raised in regard to Order ID : '+order_id;
		var msg_length = parseInt('column of select max(id) from messages');
		var msg_id = 1;

		if(msg_length){
			msg_id = msg_length + 1;
		}

		values = {id:msg_id,read:0,sender:"Procurement QA",bo:"PO",content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
		console.log(values);
		alasql('insert into messages values ?',[values]);
		toastr.success('Procurement Team has been successfully notified','Procurement QA Team');	

	console.log(update);
	alasql(update);

	// window.confirm('Issue ID#'+issue_id+' has been successfully registered!!');
	toastr.success('Issue ID#'+issue_id+' has been successfully registered!!');		
	// clearing
	$td = $('.order_id.'+order_id);
	$tr = $td.closest('tr');
	string = $tr.find('.verification').text();

	$tr.find('.verification').empty();
	$tr.find('.verification').append('<span class="label">'+string+'</label>')
	$('#comments-order_id').text("");
	$('#comments-supplier_id').text("");
	$('#comment-text').text("");
	$('#commentsModal .close').click();
	//-------------------			
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
//  QA Actions
//-------------------

setStatus = function($var, status){
	
	$tr = $var.closest('tr');
	var order_id = parseInt($($tr.children()[0]).text());
	alasql('update supplier_orders set status = "'+status+'" where order_id='+order_id);	
	console.log('update supplier_orders set status = "'+status+'" where order_id='+order_id);
	$status = $tr.find('.status');
	$status.text(status);

		if(status== "Issue Raised"){
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
			var $li =   $('<li><div class="dropdown-messages-box"><a href="qa_mailbox.html" class="pull-left"><img alt="image" class="img-circle" src="img/wms.jpg"></a><div class="media-body"><span><strong>Mike Loreipsum</strong> started following <strong>Monica Smith</strong>.</span> <br><small class="text-muted"></small></div></div></li>');
			var $divider = $('<li class="divider"></li>');

			$li.find('.media-body span').text(message.content);
			$li.find('.text-muted').text(moment(message.sent_date).format('MMMM Do YYYY, h:mm:ss a'));
			$ul.append($li);
			$ul.append($divider);
		}
		var $li_showMsg = $('</li><li><div class="text-center link-block"><a href="qa_mailbox.html"><i class="fa fa-envelope"></i> <strong>Read All Messages</strong></a></div></li>');
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



	// 2. "received-side-notify"
		var sql = 'column of select count(*) from supplier_orders  where status = "Sent for QC"';
		received_count = parseInt(alasql(sql)); 

		if(!received_count){
			received_count = 0;
			$('.received-side-notify').text('');
		}
		else{
			$('.received-side-notify').text(received_count);
		}

	
		// 3. "returns-side-notify"
		var sql = 'column of select count(*) from return_goods where status = "Sent for QC"';
		returns_count = parseInt(alasql(sql)); 

		if(!returns_count){
			returns_count = 0;
			$('.returns-side-notify').text('');
		}
		else{
			$('.returns-side-notify').text(returns_count);
		}

	}