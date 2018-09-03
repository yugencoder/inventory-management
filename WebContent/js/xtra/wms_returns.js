/*
reorder mechanism :) next 

*/
var CUR_WAREHOUSE_ID = parseInt(localStorage.sessionWH);
var BO = "WMS"+CUR_WAREHOUSE_ID; 
var toggle=true;

data1 = [];
// console.log(localStorage.sessionWH);
// var CUR_WAREHOUSE_ID = parseInt(localStorage.sessionWH);

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
        //     // window.location.assign('index.html');
        // }   
            
        $('.warehouse-info').text(city_map[CUR_WAREHOUSE_ID]+" Warehouse");
        
        // console.log(localStorage.sessionWH);

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

$('#Returns-Open-Tab').click();
//-------------------

    // Show Messages
    showMessages(BO);
    
    // Update Unread Messages Count 
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
    
    sendAlert();    
}); /* End of Document Ready*/

//--------------------------------------------------------------------------------------------------------
/*External Functions*/
//-------------------
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
/*  Tab:4   Handling Return Requests*/
$('#Returns-Tab').click(function(){
    $('#Returns-Open-Tab').click();
});

$('#Returns-Open-Tab').click(function(){
    var sql = 'SELECT return_requests.return_id,return_requests.request_id, return_requests.item_id, item.detail, return_requests.quantity, return_requests.status \
                    FROM return_requests \
                    JOIN item ON item.id = return_requests.item_id \
                    WHERE return_requests.status != "Closed" \
                    AND return_requests.warehouse_id = '+CUR_WAREHOUSE_ID+' ORDER BY return_requests.return_id ';   
    var tableid = 'open-returns';   
    showReturns(sql,tableid);
});

$('#Returns-Closed-Tab').click(function(){

    var sql = 'SELECT return_requests.return_id,return_requests.request_id, return_requests.item_id, item.detail, return_requests.quantity, return_requests.status \
                FROM return_requests \
                JOIN item ON item.id = return_requests.item_id \
                WHERE return_requests.status = "Closed"\
                AND return_requests.warehouse_id = '+CUR_WAREHOUSE_ID+' ORDER BY return_requests.return_id ';   
    var tableid = 'closed-returns'; 
    showReturns(sql,tableid);
});


showReturns = function(sql,tableid){

        var returns = alasql(sql);
        
        // // build html table
        $('#tbody-'+tableid).empty();
        var tbody = $('#tbody-'+tableid);

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

            $tr.append('<td rowspan="'+(records.length+pad+1)+'" class="return_id">'+(child_exists?'<a href=# class="toggle-class" data-toggle="tooltip" data-placement="right" title="Click to see the individual goods">':'')+ret.return_id + (child_exists?'</a>':'')+'</td>');
            $tr.append('<td rowspan="'+(records.length+pad+1)+'" class="request_id">' + ret.request_id + '</td>');
            $tr.append('<td rowspan="'+(records.length+pad+1)+'" class="item_id">' + ret.item_id + '</td>');


            $tr.append('<td class="item_name">' + ret.detail + '</td>');
            $tr.append('<td class = "qty">' + ret.quantity+ '</td>');
                $td = $('<td style="text-align:center"><span class="status">' + ret.status + '</span></td>');
                $status = $td.find('.status');
                switch(ret.status){
                     case "Received":               
                            $status.removeClass();
                            $status.addClass("label");
                            $status.addClass("label-info");
                            break;
                    case "Sent for QC":
                            $status.removeClass();
                            $status.addClass("label");
                            $status.addClass("label-warning");
                            break;
                    
                    case "Request Approved":
                            $status.removeClass();
                            $status.addClass("label");
                            $status.addClass("label-success");
                            break;

                    case "Request Partially Approved":
                            $status.removeClass();
                            $status.addClass("label");
                            $status.addClass("label-warning");
                             break;
                           
                    case "Request Rejected":
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
                $tr.append($td);        


            $def_dropdown = $('<td>\
                            <ul class="list-unstyled"><li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">More.. <span class="caret"></span></a><ul class="dropdown-menu"><li><a href="#" class="RT-Received active"><span></span> Item Received </a></li><li><a href="#" class="RT-QC"><span></span> Send Items for QC</a></li><li><a href="#" class="RT-Approve"><span></span> Process Request</a></li><li role="separator" class="divider"></li><li><a href="#" class="RT-Close"><span></span> Close Order</a></li></ul></li></ul>\
                        </td>');

            switch(ret.status){
               
                case "Received":               
                    $def_dropdown.find('.RT-Received').removeClass("active");
                    $def_dropdown.find('.RT-QC').addClass("active");
                    $def_dropdown.find('.RT-Approve').removeClass("active");
                    $def_dropdown.find('.RT-Close').removeClass("active");
                    $tr.append($def_dropdown);
                    break;

                case "Sent for QC":
                    $def_dropdown.find('.RT-Received').removeClass("active");
                    $def_dropdown.find('.RT-QC').removeClass("active");
                    $def_dropdown.find('.RT-Approve').addClass("active");
                    $def_dropdown.find('.RT-Close').removeClass("active");
                    $tr.append($def_dropdown);
                    break;
                
                case "Request Approved":
                    $def_dropdown.find('.RT-Received').removeClass("active");
                    $def_dropdown.find('.RT-QC').removeClass("active");
                    $def_dropdown.find('.RT-Approve').removeClass("active");
                    $def_dropdown.find('.RT-Close').addClass("active");
                    $tr.append($def_dropdown);              
                    break;

                case "Request Partially Approved":
                    $def_dropdown.find('.RT-Received').removeClass("active");
                    $def_dropdown.find('.RT-QC').removeClass("active");
                    $def_dropdown.find('.RT-Approve').removeClass("active");
                    $def_dropdown.find('.RT-Close').addClass("active");
                    $tr.append($def_dropdown);              
                    break;
                case "Request Rejected":
                    $def_dropdown.find('.RT-Received').removeClass("active");
                    $def_dropdown.find('.RT-QC').removeClass("active");
                    $def_dropdown.find('.RT-Approve').removeClass("active");
                    $def_dropdown.find('.RT-Close').addClass("active");
                    $tr.append($def_dropdown);              
                    break;

                case "Closed":
                    $def_dropdown.find('.RT-Received').removeClass("active");
                    $def_dropdown.find('.RT-QC').removeClass("active");
                    $def_dropdown.find('.RT-Approve').removeClass("active");
                    $def_dropdown.find('.RT-Close').removeClass("active");
                    $tr.append($def_dropdown);
                    break;

                default: 
                    $tr.append($def_dropdown);
            }   

            $tr.appendTo(tbody);


            if(child_exists){
                $tr_child = $('<tr class="tablesorter-childRow" ></tr>');
                
                $th = $('<th>');
                $th.text("Serial No");
                $tr_child.append($th);
                        
                $th = $('<th>');
                $th.text("Return Goods ID");
                $tr_child.append($th);

                $th = $('<th>');
                $th.text("Status");
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
                            $status.addClass("label-success");
                            break;
                        case "Fail":
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
                    $tr_child.append($td);

                $tr_child.appendTo(tbody);

                }
        }
        //-------------------

        /*Call the tablesorter plugin*/
        isEnabled = false;
        callTableSorter($('#table-'+tableid),$('#pager-'+tableid),isEnabled,true,6);
}
//--------------------------------------------------------------------------------------------------------
// Toggle Filter Function
    $( '.toggle' ).click( function() {
        isEnabled = !isEnabled;
        $( this ).text(isEnabled ? ' Disable Filters' : ' Enable Filters' );
        var $adjust = $('<span class="glyphicon glyphicon-adjust" style="font-size: 10px;"></span> &nbsp;');
        $(this).prepend($adjust);
        /*next.next -- CONIFIRM working :)*/
        idVal = $(this).next().next().attr("id");
        pagerVal = 'pager'+idVal.split('-'  )[1];
        console.log(idVal);
        callTableSorter($('#'+idVal),$('#'+pagerVal),isEnabled,true,6);
        (isEnabled?$('.reset-filters').show():$('.reset-filters').hide());
    });
//-------------------

//--------------------------------------------------------------------------------------------------------
//  callTableSorter
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
        widgets : [ "uitheme", "filter", "zebra", "print", 'toggle-ts' ],
        widgetOptions : {

        print_title      : '',          // this option > caption > table id > "table"
        print_dataAttrib : 'data-name', // header attrib containing modified header name
        print_rows       : 'a',         // (a)ll, (v)isible, (f)iltered, or custom css selector
        print_columns    : 'a',         // (a)ll, (v)isible or (s)elected (columnSelector widget)
        print_extraCSS   : '',          // add any extra css definitions for the popup window here
        print_styleSheet : '../css/theme.bootstrap.css', // add the url of your print stylesheet
        print_now        : true,        // Open the print dialog immediately if true
        // callback executed when processing completes - default setting is null
        print_callback   : function(config, $table, printStyle){
        // do something to the $table (jQuery object of table wrapped in a div)
        // or add to the printStyle string, then...
        // print the table using the following code
        $.tablesorter.printTable.printOutput( config, $table.html(), printStyle );
        },
          zebra : ["even", "odd"],
          filter_external : '.search',
          filter_reset : ".reset-filters",
          filter_cssFilter: "form-control",
          filter_columnFilters: filterVal,
          
          filter_childRows  : false,
          // change this^^^ if needed :) 
          // toggle-ts widget
          // Commented -- 29th Dec
        //   toggleTS_hideFilterRow : true,     
        //   headers: {
            // disabledCols : {
              //   sorter: false,
              //   filter: false
            // }}
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

  $('.print-table').click(function(){
    console.log('Print table clicked');
    $('#table-dead-stocks').trigger('printTable');
  });

//--------------------------------------------------------------------------------------------------------
// Order Actions -> change status

// -----------------RT ACTIONS ------------------------------
$(document).on('click','.RT-Received', function() {
    if($(this).hasClass("active")){
        setStatusRT($(this),"Received");
        $this = $(this)
        $this.removeClass("active");
        //add to next 
        // $li = $this.closest('li');
        $a = $this.closest('li').next('li').find('a');
        $a.addClass("active");
    }
    else{
        toastr.error('Please follow the workflow order','Procurement Team');
        $('#workflow').show();$('#workflow').delay(4500).fadeOut();         }
});

$(document).on('click','.RT-QC', function() {
    if($(this).hasClass("active")){
        setStatusRT($(this),"Sent for QC");
        $this = $(this)
        //remove active class
        $this.removeClass("active");
        //add to next 
        $li = $this.closest('li');
        $nextli = $li.next('li');
        $a = $this.closest('li').next('li').find('a');
        $a.addClass("active");
        
        /*Add ChildRows in ChildRow Tables*/
        $tr = $(this).closest('tr');
        var return_id = parseInt($tr.find('.return_id').text());
        var item_id = parseInt($tr.find('.item_id').text());
        
        var qty = parseInt($tr.find('.qty').text());

        var records = alasql('select * from return_child where return_id = '+return_id+' ORDER BY return_id');
        var child_exists = records.length==0?false:true;
        var quant;        

            if(!child_exists){
                    
                $tr.find('.return_id').attr("rowspan",qty+2);
                $tr.find('.request_id').attr("rowspan",qty+2);
                $tr.find('.item_id').attr("rowspan",qty+2);
                // $tr.find('.item_name').attr("rowspan",qty+2);

                $return_id = $tr.find('.return_id');
                $return_id.text("");
                $return_id.append('<a href=# class="toggle-class" data-toggle="tooltip" data-placement="right" title="Click to see the individual goods">'+return_id+'</a>');

                var max_child_id = parseInt(alasql('column of select max(return_child_id) from return_child '));
                if(max_child_id){
                    // Do nothing --hack to check if undefined or null or NaN
                }
                else{
                    max_child_id = 0;
                }

                
                $last = $tr;
                //adding headers
                $tr_child = $('<tr class="tablesorter-childRow" ></tr>');
                
                $th = $('<th>');
                $th.text("Serial No");
                $tr_child.append($th);
                        
                $th = $('<th>');
                $th.text("Return Goods ID");
                $tr_child.append($th);

                $th = $('<th>');
                $th.text("Status");
                $tr_child.append($th);
                    
                $last.after($tr_child);
                $last = $tr_child;

                quant = parseInt( $tr.find('.qty').text()); 

                for (var i = 1; i <= quant; i++) {
                        $tr_child = $('<tr class="tablesorter-childRow"></tr>');

                        $td = $('<td></td>');
                        $td.text(i);
                        $tr_child.append($td);

                        $td = $('<td></td>');
                        $td.text(max_child_id + i);
                        $tr_child.append($td);

                        $td = $('<td style="text-align:center" ><span class="status label label-info">Awaiting</span></td>');
                        $tr_child.append($td);

                        
                        $last.after($tr_child);
                        $last = $tr_child;

                        /*Add these details to Goods Table to make it persistent*/
                        // -------  

                        values = [max_child_id + i,return_id,item_id,"Awaiting"];
                        console.log(values);
                        alasql('insert into return_child values(?,?,?,?);',values);

                        // -------  
                }

        }
            // Send notifications to QC Team

                var msg = 'Return Requests: '+quant+' new item with Item ID:'+item_id+' has been sent for Quality Check as part of Return ID:'+return_id;
                var msg_length = parseInt('column of select max(id) from messages');
                var msg_id = 1;

                if(msg_length){
                    msg_id = msg_length + 1;
                }

                values = {id:msg_id,read:0,sender:"Warehouse Manager",bo:"WMS_QA1",content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
                console.log(values);
                alasql('insert into messages values ?',[values]);
                toastr.success('WMS QA Team has been successfully notified','Procurement Team');

         callTableSorter($('#table-open-returns'),$('#pager-open-returns'),isEnabled,true,6);

    }
    else{
            toastr.error('Please follow the workflow order','Procurement Team');
            $('#workflow').show();$('#workflow').delay(4500).fadeOut();     
    }
});

$(document).on('click','.RT-Approve', function() {
    
    $tr = $(this).closest('tr');
    var return_id = parseInt($tr.find('.return_id').text());
    var return_childs = alasql('column of select status from return_child where return_id ='+return_id);
    flag = true;
    for (var i = 0; i < return_childs.length; i++) {
        if(return_childs[i] == "Awaiting"){
            toastr.error("Please Await Quality Check Result","Warehouse Management Team");
            flag = false;
            break;
        }
    }
    console.log('flag:',flag);  
    if($(this).hasClass("active") && flag){
        $this = $(this)
        //remove active class
        $this.removeClass("active");
        //add to next 
        $li = $this.closest('li');
        $a = $this.closest('li').next('li').next('li').find('a');
        $a.addClass("active");

        //find if request is approved or rejected
        pass_strength = 0
        for (var i = 0; i < return_childs.length; i++) {
            if(return_childs[i] == "Pass"){
                pass_strength = pass_strength + 1;
            }
        }   
        if(pass_strength == 0){
            setStatusRT($(this),"Request Rejected");
            }
        else{
            //All Passed
            setStatusRT($(this),"Request Partially Approved");
           console.log("Request Partially Approved");
 
            console.log(pass_strength);
            console.log(return_childs.length);
            if(pass_strength == return_childs.length){
                setStatusRT($(this),"Request Approved");
                console.log("Request Approved");

            }
            // send the goods to the warehouse ?? -- same as in procurement
            var qty = pass_strength;
            var item_id = parseInt($tr.find('.item_id').text());    
            var stock_ids = "";
            for (var i = 0; i < qty; i++) {
            // 1. Update sales_master
                // 1.1 Get max stock_id
                // 1.2 Get waerehouse_loc
                // 1.3 Get item_id
                // 1.4 Update
                    var new_stock_id = parseInt(alasql('column of select max(stock_id) from stocks_master')) + 1;
                        var currentDate = moment().format('YYYY-MM-DD');

                        var disc = 0;
                        values = [new_stock_id,item_id,wh1,wh2,wh3,wh4,currentDate,disc];
                        console.log(values)
                        alasql('insert into stocks_master values(?,?,?,?,?,?,?,?);',values);
            // 2. Update bin_master 
                // 2.1 Get the empty bin_no & update it with the new stock_id
                    var bins = alasql('column of select bin_id from bin_master where warehouse_'+CUR_WAREHOUSE_ID+'=0 order by bin_no');
                    alasql('update bin_master set warehouse_'+CUR_WAREHOUSE_ID+'='+new_stock_id+' where bin_id ='+bins[0]);
            
            // 3. Update warehouse_master
                    alasql('update warehouse_master set warehouse_'+CUR_WAREHOUSE_ID+'= 1 where item_id ='+item_id);    
                    console.log("UPDATED");
                    stock_ids = stock_ids+" "+new_stock_id
            }   
            // alert(qty+" Stocks with Stock ids -"+stock_ids+" added to warehouse:"+CUR_WAREHOUSE_ID+"!");
            toastr.success(qty+" Stocks with Stock ids -"+stock_ids+" added to warehouse:"+CUR_WAREHOUSE_ID+"!","Warehouse Management Team");
        }
    }
    else if(flag){
            toastr.error('Please follow the workflow order','Procurement Team');
            $('#workflow').show();$('#workflow').delay(4500).fadeOut();         }
});
$(document).on('click','.RT-Close', function() {
    if($(this).hasClass("active")){ 
        $this = $(this);
        $.confirm({
            title: 'Once closed you can\'t change the status anymore!',
            // content: 'Simple confirm!',
            buttons: {
                confirm: function () {
                    $this.removeClass();
                    setStatusRT($this,"Closed");
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
            toastr.error('Please follow the workflow order','Procurement Team');
            $('#workflow').show();$('#workflow').delay(4500).fadeOut();         }
});


setStatusRT = function($var, status){

    $tr = $var.closest('tr');
    var return_id = parseInt($tr.find('.return_id').text());
    alasql('update return_requests set status = "'+status+'" where return_id='+return_id);  
    $status = $tr.find('.status');
    $status.text(status);
              switch(status){
                     case "Received":               
                            $status.removeClass();
                            $status.addClass("status");
                            $status.addClass("label");
                            $status.addClass("label-info");
                            break;
                    case "Sent for QC":
                            $status.removeClass();
                            $status.addClass("label");
                            $status.addClass("label-warning");
                            $status.addClass("status");                            
                            break;
                    
                    case "Request Approved":
                            $status.removeClass();
                            $status.addClass("label");
                            $status.addClass("label-success");
                            $status.addClass("status");
                            break;

                    case "Request Partially Approved":
                            $status.removeClass();
                            $status.addClass("label");
                            $status.addClass("label-warning");
                            $status.addClass("status");
                             break;
                           
                    case "Request Rejected":
                            $status.removeClass();
                            $status.addClass("label");
                            $status.addClass("status");
                            $status.addClass("label-danger");
                             break;

                   default: 
                            $status.removeClass();
                            $status.addClass("status");
                            $status.addClass("label");
                             break;
                              
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

            var $li =   $('<li><div class="dropdown-messages-box"><a href="wms_mailbox.html" class="pull-left"><img alt="image" class="img-circle" src="img/wms.jpg"></a><div class="media-body"><span class = "sender"><strong>Mike Loreipsum</strong>: <br> <span class = "content"></span><br><small class="text-muted"></small></div></div></li>');
            var $divider = $('<li class="divider"></li>');

            $li.find('.media-body span.sender strong').text(message.sender);
            $li.find('.media-body span.content').text(message.content);
            $li.find('.text-muted').text(moment(message.sent_date).format('MMMM Do YYYY, h:mm:ss a'));
            $ul.append($li);
            $ul.append($divider);
        }
        var $li_showMsg = $('<li class="divider"></li><li><div class="text-center link-block"><a href="wms_mailbox.html"><i class="fa fa-envelope"></i> <strong>Read All Messages</strong></a></div></li>');
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

    // 1. Requests Received
    // 2. Return Requests

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
        var sql = 'COLUMN OF SELECT COUNT(*) \
                FROM order_requests \
                JOIN item ON item.id = order_requests.item_id \
                WHERE order_requests.status != "Closed" \
                AND order_requests.warehouse_id = '+CUR_WAREHOUSE_ID+' \
                ORDER BY order_requests.request_id \
                ';  
        requests_count = parseInt(alasql(sql)); 

        if(!requests_count){
            requests_count = 0;
            $('.requests-side-notify').text('');
        }
        else{
            $('.requests-side-notify').text(requests_count);
        }

    // 3. "wms_returns-side-notify"
        var sql = 'COLUMN OF SELECT COUNT(*) \
                    FROM return_requests \
                    JOIN item ON item.id = return_requests.item_id \
                    WHERE return_requests.status != "Closed" \
                    AND return_requests.warehouse_id = '+CUR_WAREHOUSE_ID+' ORDER BY return_requests.return_id ';   
        wms_returns_count = parseInt(alasql(sql)); 

        if(!wms_returns_count){
            wms_returns_count = 0;
            $('.wms_returns-side-notify').text('');
        }
        else{
            $('.wms_returns-side-notify').text(wms_returns_count);
        }

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

    //  Checking Warehouse Occupancy %      

        var records = alasql("select * from misc;");
        var perc = records[0].warehouse_perc;
        var update_date = records[0].update_date;

        //Set Warehouse Occupancy
        $('.wh-occupancy').val(perc);
        
        var cur_perc;
        total_bins = parseInt(alasql('column of select count(*) from bin_master'));
        occ_bins = parseInt(alasql('column of select count(*) from bin_master where warehouse_'+CUR_WAREHOUSE_ID+'!= 0'));
        
        var cur_perc = Math.round((occ_bins/total_bins)*100);
        var current_date = moment().format("DD/MM/YYYY");
        if(cur_perc >= perc && current_date !=update_date){

                var msg = 'Warehouse Occupancy is currently '+cur_perc+'% which is over the set threshold of '+perc+'%';
                var msg_length = parseInt('column of select max(id) from messages');
                var msg_id = 1;

                if(msg_length){
                    msg_id = msg_length + 1;
                }
                values = {id:msg_id,read:0,sender:"Reminder",bo:BO,content:msg,sent_date:moment().format('MM/DD/YYYY HH:mm:ss'),timestamp:moment().unix()};
                console.log(values);
                alasql('insert into messages values ?',[values]);
                alasql('update misc set update_date = "'+current_date+'"');
                toastr.warning(msg,'Reminder');    
            }
        }       