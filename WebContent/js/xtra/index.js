// /* path to the stylesheets for the color picker */
// var style_path = "resources/css/colors";

$(document).ready(function () {
//     /* messages fade away when dismiss is clicked */
//     $(".message > .dismiss > a").on("click", function (event) {
//         var value = $(this).attr("href");
//         var id = value.substring(value.indexOf('#') + 1);

//         $("#" + id).fadeOut('slow', function () { });

//         return false;


        localStorage.setItem('sessionUser', "");
        localStorage.setItem('sessionBO', "");       
        $('#business_operation').change(function() {
            // console.log("Changed");
            if($("#business_operation").val() == "Warehouse Management"){
                $("#wh-display").show();
            }
            else{
                $("#wh-display").hide();                
            }
        });
    });


 
    $("#submit").on("click", function (event) {
        console.log('Clicked');
        var sessionUser = $("#username").val();
        var sessionBO = $("#business_operation").val();
        var sessionWH = "";
        if($("#business_operation").val() == "Warehouse Management"){
            /*Getting Warehouse Location*/
            sessionWH = $("#warehouse_location").val();
            localStorage.setItem('sessionWH', sessionWH);
            console.log(sessionWH);

        }
        var password = $("#password").val();
        var incorrectPassword = false;
        

        var operation = alasql('column of select operation from users where\
                               username = "'+sessionUser+'" AND \
                               password = "'+password+'" AND \
                               business_operation = "'+sessionBO+'"');
        // console.log(operation);
        if(operation.length == 0){
            incorrectPassword = true;
        }     
        // console.log(operation)
        // business operations
        if(sessionBO == "Procurement"){
            console.log(operation);
            if(operation == "Procurement"){
                console.log("Procurement");
                localStorage.setItem('sessionPO', "Procurement");
                window.location.assign('orders.html');
            }
            else if(operation == "Inspection"){
                localStorage.setItem('sessionPOQ', "Inspection");

                window.location.assign('qa_received.html');
            }
            else{
                incorrectPassword = true;
            }
        }
        else if(sessionBO == "Warehouse Management"){
                if(operation == "Management"){
                    localStorage.setItem('sessionWM', "Management");
                    window.location.assign('requests.html');
                  
                }
                if(operation == "Inspection"){
                    localStorage.setItem('sessionWMQ', "Inspection");
                    window.location.assign('wmsqa_requests.html');
                
                }
        }
        else if(sessionBO == "Order Fulfillment"){
                if(operation == "Management"){
                    localStorage.setItem('sessionOF', "Order Fulfillment");
                    window.location.assign('customer_orders.html');
                }
        }
        else{
            console.log("...");
            // To fill later
        }

        if(incorrectPassword){
            $('.messages').show();
            $('.messages').delay(3000).fadeOut();    
        }
    // window.location.assign('index.html');

    });
 // operations within the BOs
 // redirect accordingly