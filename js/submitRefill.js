function listenerSubmitRefillForm() {
  $("#submit_refill_form").submit(function(e){
    e.preventDefault();
    var fields = [
        {
            id:'refill_pharmacy',
            validators: ['required'],
            //message:'Pin is required and must be at least four digits',
        },
        {
            id:'refill_dob',
            validators: ['required'],
            //message:'Pin is required and must be at least four digits',
        },
        {
            id:'refill_rx_numbers',
            validators: ['required'],
            //message:'Pin is required and must be at least four digits',
        },
    ];
    if (validateForm(fields)) {
        var dataToPost = {
            device_id:device.uuid,
            user_identifier:window.localStorage.getItem("user_identifier"),
            token:window.localStorage.getItem("token"),
            refill_pharmacy:$('#refill_pharmacy').val(),
            refill_dob:$('#refill_dob').val(),
            refill_rx_numbers:$('#refill_rx_numbers').val(),
            refill_notes:$('#refill_notes').val()
        };
        var url = getAppParams().server+'/phonegap_api/submit_refill';
        $.post( url, dataToPost, function(data) {
            var jsonData = JSON.parse(data);
            if (jsonData.success) {
                setNotification('Refill Recieved. We will notify you when it is ready to be picked up.','alert-success');
                showDiv('landing_div'); 
                $('#refill_rx_numbers').val('');
                $('#refill_notes').val('');
            } else {
                alert('error, please try again');   
            }
        })
        .fail(function() {
            alert( "error" );
        });
    } else {
        console.log('errors with: create_pin_form');
    }
  });
}