data1 = [];
data2 = [];
var supplier_id,item_id, estimate_value;
$(document).ready(function () {
//------------------------------------------------------------------------------------------------------------>>
	console.log("Inside Process Order Page");
	//get reorder id
	// reorder_id = 1;

	//Clearing all old values if any :)
	//-------------------			
	$('.quantity').val("");
	$('.comments').val("");
	$('.order_date').val("");
	$('#whouse-select').val("");			
	$('#myModal .close').click();


	supplier_id = window.supplier_id; 
	supplier_id = parseInt(supplier_id);
	global_supplier_id = supplier_id;
	item_id =  parseInt(alasql('column of select item_id from suppliers where supplier_id='+supplier_id));
	  console.log(item_id, supplier_id);
	  var sql = ' SELECT suppliers.supplier_id, suppliers.supplier_name, suppliers.item_id, item.maker, item.code, item.detail, suppliers.price, suppliers.supplier_rating \
			FROM suppliers \
			JOIN item ON suppliers.item_id = item.id \
			WHERE suppliers.supplier_id ='+supplier_id+' AND suppliers.item_id='+item_id+' ;'
	  
	  // var sql = 'select * from suppliers where supplier_id='+supplier_id+' AND parts_id='+parts_id;
		  var supplier = alasql(sql);
		  supplier = supplier[0];
		  console.log(supplier);
		  //Setting up the Modal Values
		  $('#supplier_name').html(supplier.supplier_name);  
		  $('#parts_name').html(supplier.detail);
		  $('#category_name').html(supplier.code);
		  $('#maker').html(supplier.maker);
		  $('#price').html(supplier.price);
		  $('#supplier_rating').html(supplier.supplier_rating);

		  $('#modal-item_id').text(supplier.item_id);
		  $('#modal-supplier_id').text(supplier.supplier_id);

		  //Entering Details
		    //1. Warehouse Location
		    var rows = alasql('SELECT * FROM whouse;');
		    warehouse_id = $('.warehouse_id').empty();
		    for (var i = 0; i < rows.length; i++) {
			     var row = rows[i];
			     console.log(row);
			     var option = $('<option>');
			     option.attr('value', row.id);
			     option.text(row.name);
			     $('.warehouse_id').append(option);
		    }

		  // Get & set todays date
		  	var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!

			var yyyy = today.getFullYear();
			if(dd<10){
			    dd='0'+dd;
			} 
			if(mm<10){
			    mm='0'+mm;
			} 
			var today = yyyy+'-'+mm+'-'+dd;
			$('.order_date').val(today);


			//-----------------
			records = alasql('select * from sales_data where item_id ='+item_id+' and warehouse_id = 1');
			records = records[0];
			console.log(records);
			data1 = []; data2 = [];
			data1.push(records.january);data1.push(records.february);data1.push(records.march);data1.push(records.april);data1.push(records.may);data1.push(records.june);data1.push(records.july);data1.push(records.august);data1.push(records.september);data1.push(records.october);data1.push(records.november);data1.push(records.december);data1.push(NaN);
			data2 = [ NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN]; data2.push(records.december);

			estimated_value = getEstimate(records);
			data2.push(estimated_value);

			// Populate the order value with the estimate
			$('.quantity').val(estimated_value);

			//Populate the quantity-rqd value
			rqd = estimated_value;
			avl = parseInt(alasql('column of select count(item_id) from stocks_master where warehouse_1 = 1 and item_id='+item_id));
			quantity_rqd = rqd - avl;
			$('.rqd').text(rqd);
			$('.avl').text(avl);
			$('.quantity-rqd').val(quantity_rqd);
			console.log(supplier_id, warehouse_id, item_id);
			
		//intializing Toaster
		toastr.options = {
		    closeButton: true,
		    progressBar: true,
		    showMethod: 'slideDown',
		    timeOut: 4000
		};		


});


$(document).on('change','.warehouse_id', function() {
	dest_warehouse_id = parseInt($(this).val());
	records = alasql('select * from sales_data where item_id ='+item_id+' and warehouse_id ='+dest_warehouse_id);
	records = records[0];
	data1 = []; data2 = [];
	data1.push(records.january);data1.push(records.february);data1.push(records.march);data1.push(records.april);data1.push(records.may);data1.push(records.june);data1.push(records.july);data1.push(records.august);data1.push(records.september);data1.push(records.october);data1.push(records.november);data1.push(records.december);data1.push(NaN);
	data2 = [ NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN]; data2.push(records.december);

	estimated_value = getEstimate(records);
	data2.push(estimated_value);

	// Populate the order value with the estimate
	$('.quantity').val(estimated_value);
	
			//Populate the quantity-rqd value
			rqd = estimated_value;
			avl = parseInt(alasql('column of select count(item_id) from stocks_master where warehouse_'+dest_warehouse_id+' = 1 and item_id='+item_id));
			quantity_rqd = rqd - avl;
			$('.rqd').text(rqd);
			$('.avl').text(avl);
			$('.quantity-rqd').val(quantity_rqd);

	//-------------------
	updateGraph();
});


//---------------------
/* Place Order Button*/
	$(document).on('click','.place_order', function() {

		max_id = parseInt(alasql('column of select max(order_id) from supplier_orders'));
		if(!max_id){
			order_id = 1;
		}
		else{
			order_id = max_id + 1;
		}
		status = 'Open';
		qty = parseInt($('.quantity-rqd').val());
		comments = $('.comments').val();
		order_date =  $('.order_date').val();
		warehouse_id = parseInt($('.warehouse_id').val());

		values = {order_id:order_id,supplier_id:supplier_id, item_id:item_id, quantity:qty, warehouse_id:warehouse_id,order_date:order_date,comments:comments, verification:status, status:status }
		console.log(values);
		alasql('insert into supplier_orders values ?',[values]);
		// window.confirm('Order ID:'+order_id+' has been placed successfully placed!!');
        toastr.success('Order ID:'+order_id+' has been successfully placed!!', 'Procurement Team');



	});
	//-------------------	


$(document).on('click','.view-chart', function() {
	$("#chart-area").toggleClass( 'hidden' );
	updateGraph();
});

updateGraph = function(){
		var config = {
		type: 'line',
		data: {
		labels: ["Jan,16 ", "Feb,16 ", "Mar,16 ", "Apr,16 ", "May,16 ", "June,16 ", "July,16 ", "Aug,16 ", "Sept,16 ", "Oct,16 ", "Nov,16 ", "Dec,16", "Jan,17"],
		datasets: [{
		    label: "Recorded Sales",
		    borderColor: window.chartColors.blue,
		    fill: false,
		    lineTension: 0.1,
		    data: data1,

		}, {
		    label: "Predicted Sales",
		    borderColor: window.chartColors.red,
		    fill: false,
		    // Skip first and last points
		    data: data2,
		}]
		},
		options: {
		responsive: true,
		title:{
		    display:true,
		    text:'Sales Demand Forecasting'
		},
		tooltips: {
		    mode: 'index',
		},
		hover: {
		    mode: 'index'
		},
		scales: {
		    xAxes: [{
		        display: true,
		        scaleLabel: {
		            display: true,
		            labelString: 'Month'
		        }
		    }],
		    yAxes: [{
		        display: true,
		        scaleLabel: {
		            display: true,
		            labelString: 'Value'
		        },
		    }]
		},
		}
		};	
	    var ctx = document.getElementById("canvas").getContext("2d");
	    window.myLine = new Chart(ctx, config);		
};
getEstimate = function(records){
    // Extrapolate Testing
    var extrapolate = new EXTRAPOLATE.LINEAR();
    extrapolate.given(0).get(records.november);
    extrapolate.given(1).get(records.december);
    estimated_value =  extrapolate.valueFor(2)
    // estimated_value = 35;
    console.log(estimated_value);
    return estimated_value;
};   

