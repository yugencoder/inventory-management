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

$(document).ready(function () {
	console.log("Hello Mailbox");
	// Manage Session
		if(!SESSION.userLogged()){
    		window.location.assign('index.html');
		}	

	$('.warehouse-info').text(city_map[CUR_WAREHOUSE_ID]+" Warehouse");

	// Show Messages
	showMessages(BO);
	
	// Show Top 4 Messages 
	updateMsgCount(BO);

	// Show Messages in Mail
	showMailMessages(BO);
	
	// Show Message Count in Mail
	updateMailMsgCount(BO);

	// Update Sidebar notifications
	updateSidebarNotify(BO);

	$('.table-mail').DataTable({
                dom: '<"html5buttons"B>lTfgitp',
                buttons: [
                    {extend: 'print',
                     customize: function (win){
                            $(win.document.body).addClass('white-bg');
                            $(win.document.body).css('font-size', '10px');

                            $(win.document.body).find('table')
                                    .addClass('compact')
                                    .css('font-size', 'inherit');
                    }
                    }
                ]

            });

	sendAlert();
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

// Fill up Mailbox :)
showMailMessages = function(BO){

	$table =  $('.table-mail');
	messages = alasql('select * from messages where bo = "'+BO+'" order by timestamp DESC'); 	

	for (var i = 0; i < messages.length; i++) {
	
	var $tr = $('<tr class="read"><td class="check-mail"><input type="checkbox" class="i-checks"></td><td class="mail-id" style="display:none"></td><td class="mail-ontact"><a >Anna Smith</a></td><td class="mail-subject"><a >Lorem ipsum dolor noretek imit set.</a></td><td class="text-right mail-date">6.10 AM</td>/tr>');

		message = messages[i];

		// 1. ID
		$tr.find('.mail-id').text(message.id);

		// 2. Read/ UnRead
		if(message.read == 0){
			$tr.removeClass("read");
			$tr.addClass("unread");			
		}
		// 3. From
		$tr.find('.mail-ontact a').text(message.sender);

		// 4. Content
		$tr.find('.mail-subject a').text(message.content);


		// 5. Date
		$tr.find('.mail-date').text(moment(message.sent_date).format('MMMM Do YYYY, h:mm:ss a')); //);

		$table.append($tr);			
	}

    $('.i-checks').iCheck({
                checkboxClass: 'icheckbox_square-green',
                radioClass: 'iradio_square-green',
            });
};


//Check all functionality
	$('.checkall').on('ifChecked', function (event){

	  	console.log("checkall Clicked");	
		var $table = $('.table-mail');
		$table.find('.i-checks').iCheck('check');
	});

//Uncheck all functionality
	$('.checkall').on('ifUnchecked', function (event) {
	  	console.log("checkall Clicked");	
		var $table = $('.table-mail');
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

// Mark as Read functionality
	$('.mark_read').click(function(){
		var c = false;
		var cn = 0;
		var o = new Array();
		$('.i-checks').each(function(){
			if($(this).is(':checked')) {
				c = true;
				o[cn] = $(this);
				cn++;
			}
		});
		if(!c) {
			alert('No selected message');
		} else {
			var msg = (o.length > 1)? 'messages' : 'message';
			if(confirm('Mark '+o.length+' '+msg+' to read')) {
				for(var a=0;a<cn;a++) {
					$(o[a]).parents('tr').removeClass('unread');
					$(o[a]).parents('tr').addClass('read');
					  // Reflect in Database too :)

					id = parseInt($(o[a]).parents('tr').find('.mail-id').text());
					console.log(id);
					alasql('update messages set read = 1 where id='+id);

				}
				$('.table-mail').find('.i-checks').iCheck('uncheck');
				$('.checkall').iCheck('uncheck');
			}
			updateMailMsgCount(BO);
			updateSidebarNotify(BO);
		}
	});

// Delete Messages functionality
	$('.delete').click(function(){
		 // if($('.delete').length > 0) {
			 var c = false;
			 var cn = 0;
			 var o = new Array();
			 $('.tbody-mail input:checkbox').each(function(){
			  if($(this).is(':checked')) {
				  c = true;
				  o[cn] = $(this);
				  cn++;
			  }
			 });
			 if(!c) {
			  alert('No selected message');
			 } else {
			  var msg = (o.length > 1)? 'messages' : 'message';
			  if(confirm('Delete '+o.length+' '+msg+'?')) {
				  for(var a=0;a<cn;a++) {
					  $(o[a]).parents('tr').remove();
					  // Reflect in Database too
					  id = parseInt($(o[a]).parents('tr').find('.mail-id').text());
					  console.log(id);
	  				  alasql('delete from messages where id='+id);

				  }
			  }
			 }
			$('.checkall').iCheck('uncheck');
			updateMailMsgCount(BO);		
			updateSidebarNotify(BO);

		// }
	});

// Mark as Read Individually
	$(document).on('click','.mail-subject a', function() {
			$tr = $(this).closest('tr');
			$tr.removeClass('unread');
			$tr.addClass('read');

			id = parseInt($tr.find('.mail-id').text());
			console.log(id);
			alasql('update messages set read = 1 where id='+id);
			updateMailMsgCount(BO);
			updateSidebarNotify(BO);

	});

	$(document).on('click','.mail-ontact a', function() {
			$tr = $(this).closest('tr');
			$tr.removeClass('unread');
			$tr.addClass('read');

			id = parseInt($tr.find('.mail-id').text());
			console.log(id);
			alasql('update messages set read = 1 where id='+id);	
			updateMailMsgCount(BO);		
			updateSidebarNotify(BO);

	});

// Update Unread Inbox-Messages Count
	updateMailMsgCount = function(BO){
		count = parseInt(alasql('column of select count(*) from messages where bo = "'+BO+'" AND read = 0')); 
		if(!count){
			count = 0;
			$('.new-messages-inbox').text('');
		}
		else{
			$('.new-messages-inbox').text('('+count+')');
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
			 $('.table-alerts input:checkbox').each(function(){
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