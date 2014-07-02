// Startup functions
function onBodyLoad() {
    document.addEventListener("deviceready",onDeviceReady, false);
}
function onDeviceReady() {
    showDiv('loading_div');
    if (isSessionActive()) {
        console.log('User is logged in');
        showDiv('loading_div');
    } else {
        showCorrectLoginDiv();   
    }
    $('#uuid').html(device.uuid);
    //setInterval(function(){ajaxOnlineCheck()}, 30000);
    //call back for child browser
    window.plugins.ChildBrowser.onLocationChange = function (url) {
        if (url === getAppParams().server+'/auth_users/phonegap_handler') {
            window.plugins.ChildBrowser.close();
        }
    };
    listenerEditProfileForm();
    listenerLoginPinForm();
    listenerSubmitCreatePinForm();
}

//regualr application functions
function ajaxOnlineCheck() {
    console.log('Checking if we are online...');
    var url = getAppParams().server+'/auth_users/is_app_serving';
    var jqxhr = $.get( url, function() {
        console.log('We are online :)');
    })
    .fail(function() {
        console.log('We are not online');
        showDiv('offline_div');
    });
}
function checkForDeviceLogin() {
    var json_url = getAppParams().server + '/auth_users/phonegap_handler_json?device_id=' + device.uuid;
    setTimeout(function() {
        $.getJSON( json_url, function( data ) {
            console.log(data);
            if (data.total > 0) {
                //set login info to local storage
                if (window.localStorage.getItem("userEmail")) {
                    window.localStorage.removeItem("userEmail");   
                }
                if (window.localStorage.getItem("userProvider")) {
                    window.localStorage.removeItem("userProvider");   
                }
                if (window.localStorage.getItem("user_identifier")) {
                    window.localStorage.removeItem("user_identifier");   
                }
                window.localStorage.setItem("userProvider",data.results[0].provider);
                window.localStorage.setItem("userEmail",data.results[0].email);
                window.localStorage.setItem("user_identifier",data.results[0].user_identifier);
                window.plugins.ChildBrowser.close();
                showDiv('pincode_login_div');
            } else {
                checkForDeviceLogin();   
            }
        });
    },1000);
}
function clearStorage() {
    console.log('clearing storage');   
}
function forgotPin() {
    //delete from server
    var dataToPost = {
        device_id:device.uuid,
        user_identifier:window.localStorage.getItem("user_identifier"),
    };
    var url = getAppParams().server + '/auth_users/phonegap_forgot_pin';
    $.post( url, dataToPost, function(data) {
        console.log(data);
        //alert( data.toString() );
    })
    .fail(function() {
        alert( "error" );
    });
    //delete from local phone
    localStorage.clear();
    //go to correct login place
    showCorrectLoginDiv();
}
function getAppParams() {
    var objToReturn = {};
    objToReturn.server = 'http://54.84.121.230:8080';
    //objToReturn.server = 'http://34.epharmacyapp.appspot.com';
    //objToReturn.server = 'https://epharmacyapp.appspot.com';
    return objToReturn;
}
function hideAllDivs() {
    $('.single_page_content_div').removeAttr('style');
    $('.single_page_content_div').attr('style','display: none;');
    /*
        var divs = ['offline_div','janrain_login_div','loading_div',
            'pincode_login_div'];
        for (x=0;x<divs.length;x++) {
            $('#' + divs[x]).removeAttr('style');
            $('#' + divs[x]).attr('style','display: none;');
        }
    */
}
function isPinSet() {
    console.log('starting isPinSet');
    var url = getAppParams().server+'/auth_users/is_pin_set';
    var postData = {
        device_id: device.uuid,
        user_identifier:window.localStorage.getItem("user_identifier"),
    };
    $.post( url, postData, function( data ) {
        if (!data.is_pin_set) {
            console.log('Pin is not set');
            showDiv('pincode_setup_div');   
        } else {
            console.log('Pin is set');
        }
    }, 'json')
    .fail(function() {
        alert( "isPinSet failed to come back..." );
    });
    console.log('engine isPinSet');
}
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
        }
        if (!data.is_profile_set) {
            showDiv('user_profile_div');
            populateProfileFormFromLocalStorage();
        }
    }, 'json')
    .fail(function() {
        alert( "error checking on profile" );
    });
}
function isSessionActive() {
    var sessionActive = false;
    if (window.sessionStorage.getItem("sessionExpireDate") === null) {
        console.log('no session object named sessionExpireDate');
    } else {
        console.log('There is a session named sessionExpireDate');   
    }
    return sessionActive;
}
function listenerLoginPinForm() {
  $("#pin_login_form").submit(function(e){
    e.preventDefault();
    var fields = [
        {
            id:'pinNumber',
            validators: ['required'],
            pattern:/^[0-9]{4}$/,
        },
    ];
    if (validateForm(fields)) {
        var dataToPost = {
            device_id:device.uuid,
            user_identifier:window.localStorage.getItem("user_identifier"),
            device_pin: $('#pinNumber').val(),
        };
        var url = getAppParams().server+'/auth_users/phonegap_pin_login';
        $.post( url, dataToPost, function(data) {
            if (data.logged_in) {
                window.localStorage.setItem("token",data.token);
                showDiv('landing_div');  
            } else {
                alert('Pin Invalid, please try again...');   
            }
        }, 'json')
        .fail(function() {
            alert( "error" );
        });
    } else {
        console.log('errors with: create_pin_form');
    }
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
            pattern:/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
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
                setLocalFlash('Profile Updated.');
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
function listenerSubmitCreatePinForm() {
  $("#create_pin_form").submit(function(e){
    e.preventDefault();
    var fields = [
        {
            id:'createPin1',
            validators: ['required'],
            pattern:/^[0-9]{4}$/,
            //message:'Pin is required and must be at least four digits',
            matchId:'createPin2',
        },
        {
            id:'createPin2',
            validators: ['required'],
            pattern:/^[0-9]{4}$/,
            //message:'Pin is required and must be at least four digits',
            matchId:'createPin1',
        },
    ];
    if (validateForm(fields)) {
        var dataToPost = {
            device_id:device.uuid,
            user_identifier:window.localStorage.getItem("user_identifier"),
            device_pin: $('#createPin1').val(),
        };
        var url = getAppParams().server+'/auth_users/phonegap_set_pin';
        $.post( url, dataToPost, function(data) {
            showCorrectLoginDiv();
        })
        .fail(function() {
            alert( "error" );
        });
    } else {
        console.log('errors with: create_pin_form');
    }
  });
}
function populateProfileFormFromLocalStorage() {
    console.log('populating profile form local storage');
    console.log('Email from local: ' + window.localStorage.getItem("userEmail"));
    $('#email').val(window.localStorage.getItem("userEmail"));
}
function setLocalFlash(message,messageType) {
    var notifications = null;
    if (sessionStorage.getItem("notifications")) {
        notifications = JSON.parse(sessionStorage.getItem("notifications"));  
    } else {
        notifications = [];
    }
    if (!messageType) {
        messageType = 'alert-info'; 
    }
    notifications.push({message:message,messageType:messageType});
    sessionStorage.setItem("notifications",JSON.stringify(notifications));
}
function showCorrectLoginDiv() {
    if (window.localStorage.getItem("user_identifier")) {
        //the user has logged in before
        showDiv('pincode_login_div');  
    } else {
        showDiv('janrain_login_div');
    }
}
function showDiv(divName) {
    navigator.notification.vibrate(100);
    hideAllDivs();
    writeNotifications();
    var div = $('#' + divName);
    div.removeAttr('style');
    //call backs for divs
    if (divName !== 'offline_div') {
        ajaxOnlineCheck();        
    }
    if (divName === 'janrain_login_div') {
        var url = getAppParams().server+'/auth_users/login_phonegap?continue_url=/auth_users/phonegap_handler?device_id=' + device.uuid;
        setTimeout(function(){
            window.plugins.ChildBrowser.showWebPage(url,
                { showNavigationBar: false,showLocationBar:false,
                showAddress:false });
        }, 1);
        checkForDeviceLogin();
    }
    if (divName === 'pincode_login_div') {
        console.log('launched div: pincode_login_div');
        isPinSet();
        console.log('ran is pin set');
    }
    if (div.hasClass('require_profile')) {
        isProfileSet();
    }
}
function writeNotifications() {
    if (sessionStorage.getItem("notifications")) {
        var notifications = JSON.parse(session.Storage.getItem("notifications"));
        sessionStorage.removeItem("notifications");
        var html = '';
        for (var x=0;x<notifications.length;x++) {
            html += notifications[x].message + ',' + notifications[x].messageType+'<br />';
        }
        $('#notification_div').html(html);
        $('#notification_div').removeAttr('style');
    } else {
        console.log('we don\'t have notifications');   
    }
}