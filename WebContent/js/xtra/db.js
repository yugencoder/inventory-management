var DB = {};

DB.init = function() {
	if (window.confirm('are you sure to initialize database?')) {
		DB.load();
	}
};

DB.load = function() {
	alasql.options.joinstar = 'overwrite';

	// Classes
	alasql('DROP TABLE IF EXISTS kind;');
	alasql('CREATE TABLE kind(id INT IDENTITY, text STRING);');
	var pkind = alasql.promise('SELECT MATRIX * FROM CSV("data/KIND-KIND.csv", {headers: true})').then(function(kinds) {
		for (var i = 0; i < kinds.length; i++) {
			var kind = kinds[i];
			alasql('INSERT INTO kind VALUES(?,?);', kind);
		}
	});

	// Items
	alasql('DROP TABLE IF EXISTS item;');
	alasql('CREATE TABLE item(id INT IDENTITY, code STRING, kind INT, detail STRING, maker STRING, price INT, unit STRING);');
	var pitem = alasql.promise('SELECT MATRIX * FROM CSV("data/ITEM-ITEM.csv", {headers: true})').then(function(items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			alasql('INSERT INTO item VALUES(?,?,?,?,?,?,?);', item);
		}
	});

	// Warehouses
	alasql('DROP TABLE IF EXISTS whouse;');
	alasql('CREATE TABLE whouse(id INT IDENTITY, name STRING, addr STRING, tel STRING);');
	var pwhouse = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSE-WHOUSE.csv", {headers: true})').then(
			function(whouses) {
				for (var i = 0; i < whouses.length; i++) {
					var whouse = whouses[i];
					alasql('INSERT INTO whouse VALUES(?,?,?,?);', whouse);
				}
			});

	// Inventories
	alasql('DROP TABLE IF EXISTS stock;');
	alasql('CREATE TABLE stock(id INT IDENTITY, item INT, whouse INT, balance INT);');
	var pstock = alasql.promise('SELECT MATRIX * FROM CSV("data/STOCK-STOCK.csv", {headers: true})').then(
			function(stocks) {
				for (var i = 0; i < stocks.length; i++) {
					var stock = stocks[i];
					alasql('INSERT INTO stock VALUES(?,?,?,?);', stock);
				}
			});

	// Transaction
	alasql('DROP TABLE IF EXISTS trans;');
	alasql('CREATE TABLE trans(id INT IDENTITY, stock INT, date DATE, qty INT, balance INT, memo STRING);');
	var ptrans = alasql.promise('SELECT MATRIX * FROM CSV("data/TRANS-TRANS.csv", {headers: true})').then(
			function(transs) {
				for (var i = 0; i < transs.length; i++) {
					var trans = transs[i];
					alasql('INSERT INTO trans VALUES(?,?,?,?,?,?);', trans);
				}
			});

	// Users
	alasql('DROP TABLE IF EXISTS users;');
	alasql('CREATE TABLE users(id INT IDENTITY, username STRING, password STRING, business_operation STRING, operation STRING);');
	var pusers = alasql.promise('SELECT MATRIX * FROM CSV("data/Users.csv", {headers: true})').then(
			function(userss) {
				for (var i = 0; i < userss.length; i++) {
					var user = userss[i];
					alasql('INSERT INTO users VALUES(?,?,?,?,?);', user);
				}
			});


	// Suppliers
	alasql('DROP TABLE IF EXISTS suppliers;');
	alasql('CREATE TABLE suppliers(supplier_id INT PRIMARY KEY, item_id INT, supplier_name STRING, price INT, supplier_rating INT);');
	var psuppliers = alasql.promise('SELECT MATRIX * FROM CSV("data/PO/Suppliers.csv", {headers: true})').then(
			function(supplierss) {
				for (var i = 0; i < supplierss.length; i++) {
					var supplier = supplierss[i];
					alasql('INSERT INTO suppliers VALUES(?,?,?,?,?);', supplier);
				}
			});

	// Supplier Orders
	alasql('DROP TABLE IF EXISTS supplier_orders;');
	alasql('CREATE TABLE supplier_orders(order_id INT PRIMARY KEY, supplier_id INT PRIMARY KEY, item_id INT , quantity INT, warehouse_id INT, order_date DATE, comments string, verification STRING, status STRING);');
	var psorders = alasql.promise('SELECT MATRIX * FROM CSV("data/PO/Supplier-Orders.csv", {headers: true})').then(
			function(sorderss) {
				for (var i = 0; i < sorderss.length; i++) {
					var sorder = sorderss[i];
					alasql('INSERT INTO supplier_orders VALUES(?,?,?,?,?,?,?,?,?);', sorder);
				}
			});

	// Supplier Reorders
	alasql('DROP TABLE IF EXISTS supplier_reorders;');
	alasql('CREATE TABLE supplier_reorders(reorder_id INT PRIMARY KEY, item_id INT, quantity INT, warehouse_id INT, request_date DATE, status STRING);');
	var psrorders = alasql.promise('SELECT MATRIX * FROM CSV("data/PO/Supplier-Reorders.csv", {headers: true})').then(
			function(srorderss) {
				for (var i = 0; i < srorderss.length; i++) {
					var srorder = srorderss[i];
					alasql('INSERT INTO supplier_reorders VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);', srorder);
				}
			});

	// Sales Data
    alasql('DROP TABLE IF EXISTS sales_data;');
    alasql('CREATE TABLE sales_data(id INT PRIMARY KEY, item_id INT, year INT, warehouse_id INT, january INT, february INT, march INT, april INT, may INT, june INT, july INT, august INT, september INT, october INT, november INT, december INT);');
    var psdata = alasql.promise('SELECT MATRIX * FROM CSV("data/PO/Sales-Data.csv", {headers: true})').then(
            function(sdatas) {
                for (var i = 0; i < sdatas.length; i++) {
                    var sdata = sdatas[i];
                    alasql('INSERT INTO sales_data VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);', sdata);
                }
            });

	alasql('DROP TABLE IF EXISTS goods;');
	alasql('CREATE TABLE goods(goods_id INT PRIMARY KEY, order_id INT, status STRING);');

		/*Issues Table*/
	alasql('DROP TABLE IF EXISTS issues;');
	alasql('CREATE TABLE issues(issue_id INT PRIMARY KEY, order_id INT PRIMARY KEY, supplier_id INT PRIMARY KEY, comments STRING, status STRING);');

	// Returns Table
	alasql('DROP TABLE IF EXISTS return_goods;');
	alasql('CREATE TABLE return_goods(return_id INT PRIMARY KEY, order_id INT PRIMARY KEY, supplier_id INT PRIMARY KEY, goods_id STRING, comments STRING, verification STRING, status STRING);');
	// Returns QA Table
	alasql('DROP TABLE IF EXISTS return_goods_qa;');
	alasql('CREATE TABLE return_goods_qa(goods_qa_id INT PRIMARY KEY, return_id INT, comments STRING, status STRING);');

	//	Warehouse-Master Table
	alasql('DROP TABLE IF EXISTS warehouse_master;');
	alasql('CREATE TABLE warehouse_master(item_id INT PRIMARY KEY, warehouse_1 INT, warehouse_2 INT, warehouse_3 INT, warehouse_4 INT, safety_stocks_1 INT, safety_stocks_2 INT, safety_stocks_3 INT, safety_stocks_4 INT, reorder_value_1 INT, reorder_value_2 INT, reorder_value_3 INT, reorder_value_4 INT);');
	
	var pwmasters = alasql.promise('SELECT MATRIX * FROM CSV("data/WMS/Warehouse-Master.csv", {headers: true})').then(
			function(wmasters) {
				for (var i = 0; i < wmasters.length; i++) {
					var wmaster = wmasters[i];
					alasql('INSERT INTO warehouse_master VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?);', wmaster);
				}
			});	

	//	Stocks-Master Table
	alasql('DROP TABLE IF EXISTS stocks_master;');
	alasql('CREATE TABLE stocks_master(stock_id INT PRIMARY KEY, item_id INT, warehouse_1 INT, warehouse_2 INT, warehouse_3 INT, warehouse_4 INT,entry_date DATE, discount INT);');
	var psmasters = alasql.promise('SELECT MATRIX * FROM CSV("data/WMS/Stocks-Master.csv", {headers: true})').then(
			function(smasters) {
				for (var i = 0; i < smasters.length; i++) {
					var smaster = smasters[i];
					alasql('INSERT INTO stocks_master VALUES(?,?,?,?,?,?,?,?);', smaster);
				}
			});	

	//	Bin-Master Table
	alasql('DROP TABLE IF EXISTS bin_master;');
	alasql('CREATE TABLE bin_master(bin_id INT PRIMARY KEY, warehouse_1 INT, warehouse_2 INT, warehouse_3 INT, warehouse_4 INT, damaged_1 INT, damaged_2 INT, damaged_3 INT, damaged_4 INT);');
	var pbmasters = alasql.promise('SELECT MATRIX * FROM CSV("data/WMS/Bin-Master.csv", {headers: true})').then(
			function(bmasters) {
				for (var i = 0; i < bmasters.length; i++) {
					var bmaster = bmasters[i];
					alasql('INSERT INTO bin_master VALUES(?,?,?,?,?,?,?,?,?);', bmaster);
				}
			});	

	//	Prev-MOnths Table
	alasql('DROP TABLE IF EXISTS prev_month_sales;');
	alasql('CREATE TABLE prev_month_sales(item_id INT PRIMARY KEY, warehouse_1 INT, warehouse_2 INT, warehouse_3 INT, warehouse_4 INT);');
	var ppms = alasql.promise('SELECT MATRIX * FROM CSV("data/WMS/Prev-Month-Sales.csv", {headers: true})').then(
			function(pmss) {
				for (var i = 0; i < pmss.length; i++) {
					var pms = pmss[i];
					alasql('INSERT INTO prev_month_sales VALUES(?,?,?,?,?);', pms);
				}
			});	

	//	Order-Requests Table
	alasql('DROP TABLE IF EXISTS order_requests;');
	alasql('CREATE TABLE order_requests(request_id INT PRIMARY KEY, item_id INT, quantity INT, status STRING, warehouse_id INT);');
	var pors = alasql.promise('SELECT MATRIX * FROM CSV("data/WMS/Order-Requests.csv", {headers: true})').then(
			function(ors) {
				for (var i = 0; i < ors.length; i++) {
					var or = ors[i];
					alasql('INSERT INTO order_requests VALUES(?,?,?,?,?);', or);
				}
			});	


	//	Return-Requests Table
	alasql('DROP TABLE IF EXISTS return_requests;');
	alasql('CREATE TABLE return_requests(return_id INT PRIMARY KEY, request_id INT, item_id INT, quantity INT, verification STRING, status STRING, warehouse_id INT);');
	var prrs = alasql.promise('SELECT MATRIX * FROM CSV("data/WMS/Return-Requests.csv", {headers: true})').then(
			function(rrs) {
				for (var i = 0; i < rrs.length; i++) {
					var rr = rrs[i];
					alasql('INSERT INTO return_requests VALUES(?,?,?,?,?,?,?);', rr);
				}
			});	
	
	//	Return Child Table
	alasql('DROP TABLE IF EXISTS return_child;');
	alasql('CREATE TABLE return_child(return_child_id INT PRIMARY KEY, return_id INT , item_id INT, status STRING);');


	//	Misc Table
	alasql('DROP TABLE IF EXISTS misc;');
	alasql('CREATE TABLE misc(id INT PRIMARY KEY, slow_threshold INT , fast_threshold INT, slow_critical INT, fast_critical INT, slow_reorder INT, fast_reorder INT, oldstock_low DATE, oldstock_up DATE, discount STRING, deadstock DATE, warehouse_perc INT, update_date STRING, date_diff INT);');
	var pmiscs = alasql.promise('SELECT MATRIX * FROM CSV("data/WMS/Misc.csv", {headers: true})').then(
			function(miscs) {
				for (var i = 0; i < miscs.length; i++) {
					var misc = miscs[i];
					alasql('INSERT INTO misc VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?);', misc);
				}
			});	

//---------------Order Fulfillment Table---------------------------------------->>

	alasql('DROP TABLE IF EXISTS customer_orders;');
	alasql('CREATE TABLE customer_orders(order_id INT PRIMARY KEY, customer_id INT, item_id INT, quantity INT, order_date DATE, city STRING, status STRING);');
	var pcust_orders = alasql.promise('SELECT MATRIX * FROM CSV("data/OF/Customer-Orders.csv", {headers: true})').then(
			function(cust_orders) {
				for (var i = 0; i < cust_orders.length; i++) {
					var cust_order = cust_orders[i];
					alasql('INSERT INTO customer_orders VALUES(?,?,?,?,?,?,?);', cust_order);
				}
			});	

	//	Return-Requests-OF Table 
	alasql('DROP TABLE IF EXISTS return_requests_of;');
	alasql('CREATE TABLE return_requests_of(return_id INT PRIMARY KEY, request_id INT , item_id INT, quantity INT, warehouse_id INT, status STRING, entry_date DATE, exit_date DATE);');
	var prrsof = alasql.promise('SELECT MATRIX * FROM CSV("data/OF/Return-Requests-OF.csv", {headers: true})').then(
			function(rrsof) {
				for (var i = 0; i < rrsof.length; i++) {
					var rrof = rrsof[i];
					alasql('INSERT INTO return_requests_of VALUES(?,?,?,?,?,?,?,?);', rrof);
				}
			});	

	// Messages
	alasql('DROP TABLE IF EXISTS messages;');
	alasql('CREATE TABLE messages(id INT PRIMARY KEY, read INT, sender STRING, bo STRING, content STRING, sent_date STRING, timestamp INT);');
	var pmessages = alasql.promise('SELECT MATRIX * FROM CSV("data/Messages.csv", {headers: true})').then(
			function(rmessages) {
				for (var i = 0; i < rmessages.length; i++) {
					var message = rmessages[i];
					alasql('INSERT INTO messages VALUES(?,?,?,?,?,?,?);', message);
				}
			});	

	// Alerts
	alasql('DROP TABLE IF EXISTS alerts;');
	alasql('CREATE TABLE alerts(id INT PRIMARY KEY, subject STRING, days INT, next_date STRING, bo STRING);');
	var palerts = alasql.promise('SELECT MATRIX * FROM CSV("data/Alerts.csv", {headers: true})').then(
			function(ralerts) {
				for (var i = 0; i < ralerts.length; i++) {
					var alertz = ralerts[i];
					alasql('INSERT INTO alerts VALUES(?,?,?,?,?);', alertz);
				}
			});	


	// // Stock-Status
	alasql('DROP TABLE IF EXISTS stock_status;');
	alasql('CREATE TABLE stock_status(stock_id INT PRIMARY KEY, damaged_1 INT, check_date_1 STRING, damaged_2 INT, check_date_2 STRING,damaged_3 INT, check_date_3 STRING,damaged_4 INT, check_date_4);');
	var pstack_status = alasql.promise('SELECT MATRIX * FROM CSV("data/WMS/Stock-Status.csv", {headers: true})').then(
			function(rstack_status) {
				for (var i = 0; i < rstack_status.length; i++) {
					var stack_status = rstack_status[i];
					alasql('INSERT INTO stock_status VALUES(?,?,?,?,?,?,?,?,?);', stack_status);
				}
			});	

	// Rack-Status
	alasql('DROP TABLE IF EXISTS rack_status;');
	alasql('CREATE TABLE rack_status(bin_id INT PRIMARY KEY, check_date_1 STRING, check_date_2 STRING, check_date_3 STRING, check_date_4);');
	var prack_status = alasql.promise('SELECT MATRIX * FROM CSV("data/WMS/Rack-Status.csv", {headers: true})').then(
			function(rrack_status) {
				for (var i = 0; i < rrack_status.length; i++) {
					var rack_status = rrack_status[i];
					alasql('INSERT INTO rack_status VALUES(?,?,?,?,?);', rack_status);
				}
			});	
//------------------------<<
	// Reload page
	Promise.all([ pkind, pitem, pwhouse, pstock, ptrans, pusers, psuppliers, psorders, pwmasters, pwmasters, pbmasters, ppms, pors, prrs, pcust_orders, psrorders, pmiscs, prrsof, psdata, pmessages,pstack_status,prack_status,palerts]).then(function() {
	window.location.reload(true);
	});
};

DB.remove = function() {
	if (window.confirm('are you sure to delete dababase?')) {
		alasql('DROP localStorage DATABASE STK')
	}
};

// add commas to number
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// DO NOT CHANGE!
alasql.promise = function(sql, params) {
	return new Promise(function(resolve, reject) {
		alasql(sql, params, function(data, err) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

// connect to database
try {
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
} catch (e) {
	alasql('CREATE localStorage DATABASE STK;');
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	DB.load();
}
