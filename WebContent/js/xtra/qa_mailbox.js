var	BO = "PO_QA";	

$(document).ready(function () {
	console.log("Hello Mailbox");
	// Manage Session
		if(!SESSION.userLogged()){
    		window.location.assign('index.html');
		}	

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
			 $('.table-mail input:checkbox').each(function(){
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