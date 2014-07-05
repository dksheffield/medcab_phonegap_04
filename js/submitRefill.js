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
            id:'email',
            validators: ['required', 'email'],
            //message:'Pin is required and must be at least four digits',
        },
        {
            id:'mobile',
            validators: ['required'],
            pattern:/^[0-9]{10}$/,
            //message:'Pin is required and must be at least four digits',
        },
    ];
    if (validateForm(fields)) {
        var mobile = $('#mobile').val();
        mobile = mobile.replace(/-/g, "");
        mobile = "+1"+mobile;
        var dataToPost = {
            device_id:device.uuid,
            user_identifier:window.localStorage.getItem("user_identifier"),
            token:window.localStorage.getItem("token"),
            name:$('#name').val(),
            email:$('#email').val(),
            mobile_number:mobile,
            notify_via_email:$('#notify_via_email').val(),
            notify_via_sms:$('#notify_via_sms').val(),
        };
        var url = getAppParams().server+'/phonegap_api/edit_profile';
        $.post( url, dataToPost, function(data) {
            var jsonData = JSON.parse(data);
            if (jsonData.success) {
                setNotification('Profile Updated.');
                showDiv('landing_div');  
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