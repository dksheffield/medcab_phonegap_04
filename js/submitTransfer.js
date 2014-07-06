function listenerSubmitTransferForm() {
  $("#submit_transfer_form").submit(function(e){
    e.preventDefault();
    var fields = [
        {
            id:'transfer_pharmacy',
            validators: ['required'],
            //message:'Pin is required and must be at least four digits',
        },
        {
            id:'transfer_dob',
            validators: ['required'],
            //message:'Pin is required and must be at least four digits',
        },
        {
            id:'transfer_rx_numbers',
            validators: ['required'],
            //message:'Pin is required and must be at least four digits',
        },
        {
            id:'transfer_old_pharmacy',
            validators: ['required'],
            //message:'Pin is required and must be at least four digits',
        },
        {
            id:'transfer_old_pharmacy_number',
            validators: ['required'],
            //message:'Pin is required and must be at least four digits',
        },
        
    ];
    if (validateForm(fields)) {
        var dataToPost = {
            device_id:device.uuid,
            user_identifier:window.localStorage.getItem("user_identifier"),
            token:window.localStorage.getItem("token"),
            transfer_pharmacy:$('#transfer_pharmacy').val(),
            transfer_dob:$('#transfer_dob').val(),
            transfer_rx_numbers:$('#transfer_rx_numbers').val(),
            transfer_old_pharmacy:$('#transfer_old_pharmacy').val(),
            transfer_old_pharmacy_number:$('#transfer_old_pharmacy_number').val(),
            transfer_notes:$('#transfer_notes').val()
        };
        var url = getAppParams().server+'/phonegap_api/submit_transfer';
        $.post( url, dataToPost, function(data) {
            var jsonData = JSON.parse(data);
            if (jsonData.success) {
                setNotification('Transfer Recieved. We will notify you when it is ready to be picked up.','alert-success');
                showDiv('user_history_div'); 
                //clear certain form values
                $('#transfer_rx_numbers').val('');
                $('#transfer_notes').val('');
                //$('#transfer_old_pharmacy').val('');
                //$('#transfer_old_pharmacy_number').val('');
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