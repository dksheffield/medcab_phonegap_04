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
        if (url === 'http://34.epharmacyapp.appspot.com/auth_users/phonegap_handler') {
            window.plugins.ChildBrowser.close();
        }
    };
    valdateCreatePinForm();
}

//regualr application functions
function ajaxOnlineCheck() {
    console.log('Checking if we are online...');
    var jqxhr = $.get( "http://www.google.com", function() {
        console.log('We are online :)');
    })
    .fail(function() {
        console.log('We are not online');
        showDiv('offline_div');
    });
}
function checkForDeviceLogin() {
    var json_url = 'http://34.epharmacyapp.appspot.com/auth_users/phonegap_handler_json?device_id=' + device.uuid;
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
function isPinSet(str_device_id,str_user_identifier) {
    var url = 'http://34.epharmacyapp.appspot.com/auth_users/is_pin_set';
    var postData = {
        device_id: str_device_id,
        user_identifier:str_user_identifier,
    };
    $.post( url, postData, function( data ) {
        if (!data.is_pin_set) {
            showDiv('pincode_setup_div');   
        }
    }, 'json');
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
function showCorrectLoginDiv() {
    if (window.localStorage.getItem("userPinCode") === null) {
        showDiv('janrain_login_div');
    } else {
        showDiv('pincode_login_div');   
    }
}
function showDiv(divName) {
    navigator.notification.vibrate(125);
    hideAllDivs();
    $('#' + divName).removeAttr('style');
    //call backs for divs
    if (divName !== 'offline_div') {
        ajaxOnlineCheck();        
    }
    if (divName === 'janrain_login_div') {
        var url = 'http://34.epharmacyapp.appspot.com/auth_users/login_phonegap?continue_url=/auth_users/phonegap_handler?device_id=' + device.uuid;
        setTimeout(function(){
            window.plugins.ChildBrowser.showWebPage(url,
                { showNavigationBar: false,showLocationBar:false,
                showAddress:false });
        }, 1);
        checkForDeviceLogin();
    }
    if (divName === 'pincode_login_div') {
        isPinSet(device.uuid,window.localStorage.getItem("user_identifier"));
    }
}
function valdateCreatePinForm() {
    $('#create_pin_form').bootstrapValidator({
        message: 'This value is not valid',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        submitHandler: function(validator, form, submitButton) {
            // Use Ajax to submit form data
            var createPin1 = $('#createPin1').val();
            var createPin2 = $('#createPin2').val();
            var dataToPost = {createPin1:createPin1,createPin2:createPin2};
            dataToPost.device_pin = createPin1;
            dataToPost.device_id = device.uuid;
            dataToPost.user_identifier = window.localStorage.getItem("user_identifier");
            console.log(dataToPost);
            if (createPin1===createPin2) {
                var url = 'http://34.epharmacyapp.appspot.com/auth_users/phonegap_set_pin';
                $.post(url, dataToPost, function(result) {
                    console.log(result);
                }, 'json')
                .fail(function() {
                    alert( "error" );
                });
            }
            
        }
    });  
}