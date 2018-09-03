console.log(localStorage.sessionWH);
var CUR_WAREHOUSE_ID = parseInt(localStorage.sessionWH);
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
var	BO = "WMS_QA"+CUR_WAREHOUSE_ID;	

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
  //   		window.location.assign('index.html');
		// }	
		
		$('.warehouse-info').text(city_map[CUR_WAREHOUSE_ID]+" Warehouse");

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
	// $('#Returns-Tab').click();
	showReturns();

	// Show Messages
	showMessages(BO);
	
	// Show Top 4 Messages 
	updateMsgCount(BO);

	// Update Sidebar notifications
	updateSidebarNotify(BO);	

	sendAlert();

});
	// $('#Returns-Tab').click(function(){
	showReturns = function(){
			console.log("Inside Returns Tab");

		var sql = 'SELECT return_requests.*, item.detail \
						FROM return_requests \
						JOIN item ON item.id = return_requests.item_id \
						WHERE return_requests.status == "Sent for QC" \
						AND return_requests.warehouse_id = '+CUR_WAREHOUSE_ID+' ORDER BY return_requests.return_id ';	

			var returns = alasql(sql);
			
			// // build html table
			$('#tbody-open-returns').empty();
			var tbody = $('#tbody-open-returns');

			for (var i = 0; i < returns.length; i++) {
				var ret = returns[i];
				var $tr = $('<tr class="tablesorter-hasChildRow">');

					//checking for child rows
					var records = alasql('select * from return_child WHERE return_id = '+ret.return_id+' ORDER BY return_child_id');
					var child_exists = records.length==0?false:true;
					console.log("child_exists:"+child_exists);			
					var pad = 0;
					if(child_exists){
						pad = 1;
						}
					$tr.append('<td rowspan="'+(records.length+pad+1)+'" class="return_id">'+(child_exists?'<a href=# class="toggle-class">':'')+ret.return_id + (child_exists?'</a>':'')+'</td>');
					$tr.append('<td rowspan="'+(records.length+pad+1)+'" class="request_id">' + ret.request_id + '</td>');
					$tr.append('<td rowspan="'+(records.length+pad+1)+'" class="item_id">' + ret.item_id + '</td>');
					$tr.append('<td >' + ret.detail + '</td>');
					$tr.append('<td class = "qty">' + ret.quantity+ '</td>');
					// $tr.append('<td ><a href="#" data-pk="'+ret.return_id+'"" data-value="'+ret.verification+'">' +ret.verification + '</a></td>');

					$tr.append('<td class = "status">' + ret.status + '</td>');
					$tr.appendTo(tbody);

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

						$td = $('<td>');
						$td.text(record.return_child_id);
						$tr_child.append($td);

						$tr_child.append($('<td><a href="#" data-ret="'+ret.return_id+'" data-pk="'+record.return_child_id+'" data-value="'+record.status+'">' +record.status + '</a></td>'));

						$tr_child.appendTo(tbody);

						}
			}
			//-------------------

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
			    	console.log(params.value, params.pk);
					console.log('update return_child set status="'+params.value+'" where return_child_id = '+params.pk+'');
			    	alasql('update return_child set status="'+params.value+'" where return_child_id = '+params.pk+';'); 				    	
			    }


					if(params.value == "Fail"){

							// Send notifications to WM Team

									var msg = 'QA Status Change for Returns: QA Status has been changed to '+params.value+' for Return Goods ID : '+params.pk;
									var msg_length = parseInt('column of select max(id) from messages');
									var msg_id = 1;

									if(msg_length){
										msg_id = msg_length + 1;
									}

									values = {id:msg_id,read:0,sender:"WMS QA",bo:"WMS"+CUR_WAREHOUSE_ID,content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
									console.log(values);
									alasql('insert into messages values ?',[values]);
									toastr.success('Warehouse Management Team has been successfully notified','Warehouse QA Team');					    		

				    	}		    
				    	if(params.value == "Pass"){
				    		console.log($td.get(0));
							$td = $('.return_id.'+params.pk);
				    		$tr = $td.closest('tr');
				    		$tr.find('.raise_issue-btn').removeClass("active");

							// Send notifications to WM Team

									var msg = 'QA Status Change for Returns: QA Status has been changed to '+params.value+' for Return Goods ID : '+params.pk;
									var msg_length = parseInt('column of select max(id) from messages');
									var msg_id = 1;

									if(msg_length){
										msg_id = msg_length + 1;
									}

									values = {id:msg_id,read:0,sender:"WMS QA",bo:"WMS"+CUR_WAREHOUSE_ID,content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
									console.log(values);
									alasql('insert into messages values ?',[values]);
									toastr.success('Warehouse Management Team has been successfully notified','Warehouse QA Team');						    		

				    	}					    
		    },
		    title: 'QA Result:'
			});
			
			/*Call the tablesorter plugin*/
			isEnabled = false;
		    callTableSorter($('#table-open-returns'),$('#pager-open-returns'),isEnabled,true,6);
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

$(document).on('click','.QA-Issue', function() {

	setStatus($(this),"Issue Raised");
	$tr = $(this).closest('tr');
	var order_id = parseInt($($tr.children()[0]).text());
	var supplier_id = parseInt($($tr.children()[1]).text());

		$('#comments-order_id').text(order_id);
		$('#comments-supplier_id').text(supplier_id);

});

$('.save-comments').click(function(){
	
	order_id = $('#comments-order_id').text();
	supplier_id = $('#comments-supplier_id').text();
	console.log("triggered -  supplier_id:"+supplier_id);
	var issue_id = 1;
	var records = alasql('select issue_id from issues');
	if(records.length){
		issue_id = parseInt(alasql('column of select max(issue_id) from issues'));
		issue_id = issue_id + 1;
	}
	var comments = $('#comment-text').val();
	var update = 'insert into issues values ('+issue_id+','+order_id+','+supplier_id+',"'+comments+'","Open")';
	alasql(update);

	window.confirm('Issue ID#'+issue_id+' has been successfully registered!!');

	$('#commentsModal .close').click();
	//-------------------			
});

$(document).on('click','.QA-Close', function() {

	setStatus($(this),"Closed");
});

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
			var $li =   $('<li><div class="dropdown-messages-box"><a href="wmsqa_mailbox.html" class="pull-left"><img alt="image" class="img-circle" src="img/wms.jpg"></a><div class="media-body"><span><strong>Mike Loreipsum</strong> started following <strong>Monica Smith</strong>.</span> <br><small class="text-muted"></small></div></div></li>');
			var $divider = $('<li class="divider"></li>');

			$li.find('.media-body span').text(message.content);
			$li.find('.text-muted').text(moment(message.sent_date).format('MMMM Do YYYY, h:mm:ss a'));
			$ul.append($li);
			$ul.append($divider);
		}
		var $li_showMsg = $('<li class="divider"></li><li><div class="text-center link-block"><a href="wmsqa_mailbox.html"><i class="fa fa-envelope"></i> <strong>Read All Messages</strong></a></div></li>');
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
		var sql = 'column of SELECT count(*) FROM return_requests WHERE return_requests.status == "Sent for QC";';			
		requests_count = parseInt(alasql(sql)); 

		if(!requests_count){
			requests_count = 0;
			$('.requests-side-notify').text('');
		}
		else{
			$('.requests-side-notify').text(requests_count);
		}

	
		// // 3. "returns-side-notify"
		// var sql = 'column of select count(*) from return_goods where status = "Sent for QC"';
		// returns_count = parseInt(alasql(sql)); 

		// if(!returns_count){
		// 	returns_count = 0;
		// 	$('.returns-side-notify').text('');
		// }
		// else{
		// 	$('.returns-side-notify').text(returns_count);
		// }

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
	}		