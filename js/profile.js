function isProfileSet() {
    var url = getAppParams().server+'/auth_users/phonegap_is_profile_set';
    var postData = {
        device_id: device.uuid,
        user_identifier:window.localStorage.getItem("user_identifier"),
        token:window.localStorage.getItem("token"),
    };
    $.post( url, postData, function( data ) {
        if (!data.token_valid) {
            showCorrectLoginDiv(); 
        } else {
            if (!data.is_profile_set) {
                showDiv('user_profile_div');
                populateProfileFormFromLocalStorage();
            } else {
                populateProfileFormFromWeb();
            }
        }
    }, 'json')
    .fail(function() {
        alert( "error checking on profile" );
    });
}
function listenerEditProfileForm() {
  $("#edit_profile_form").submit(function(e){
    e.preventDefault();
    var fields = [
        {
            id:'name',
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
function populateProfileFormFromWeb() {
    var dataToPost = {
        device_id:device.uuid,
        user_identifier:window.localStorage.getItem("user_identifier"),
        token:window.localStorage.getItem("token"),
    };
    var url = getAppParams().server+'/phonegap_api/get_profile';
    $.post( url, dataToPost, function(data) {
        var jsonData = JSON.parse(data);
        if (jsonData.results) {
            console.log(jsonData.results);  
            $('#name').val(jsonData.results.name);
            $('#email').val(jsonData.results.alert_email);
            var formMobile = jsonData.results.mobile_number.replace('+1','');
            $('#mobile').val(formMobile);
            if (jsonData.results.alert_via_email) {
                $('#notify_via_email').val('yes');
            } else {
                $('#notify_via_email').val('no');
            }
            if (jsonData.results.alert_via_sms) {
                $('#notify_via_sms').val('yes');
            } else {
                $('#notify_via_sms').val('no');
            }
            if (jsonData.results.customer_last_pharmacy) {
                writeLastUsedPharmacy(jsonData.results.customer_last_pharmacy);
            }
            if (jsonData.results.customer_last_date_of_birth) {
                writeLastUsedDob(jsonData.results.customer_last_date_of_birth);
            }
            
            
            //store profile locally
            if (localStorage.getItem('profile')) {
                localStorage.removeItem('profile');
            }
            localStorage.setItem("profile", JSON.parse(jsonData.results));
            alert('should be running writeLastUsedPharmacy from the profile data next');
            //writeLastUsedPharmacy(jsonData.results.customer_last_pharmacy);
        } else {
            alert('error, please try again');   
        }
    })
        .fail(function() {
            alert( "error" );
        });
}
function populateProfileFormFromLocalStorage() {
    console.log('populating profile form local storage');
    console.log('Email from local: ' + window.localStorage.getItem("userEmail"));
    $('#email').val(window.localStorage.getItem("userEmail"));
}