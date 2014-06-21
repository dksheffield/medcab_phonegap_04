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
    listenerSubmitCreatePinForm();
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
function forgotPin() {
    //delete from server
    var dataToPost = {
        device_id:device.uuid,
        user_identifier:window.localStorage.getItem("user_identifier"),
    };
    var url = 'http://34.epharmacyapp.appspot.com/auth_users/phonegap_forgot_pin';
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
        var url = 'http://34.epharmacyapp.appspot.com/auth_users/phonegap_set_pin';
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
function isPinSet(str_device_id,str_user_identifier) {
    var url = 'http://34.epharmacyapp.appspot.com/auth_users/is_pin_set';
    var postData = {
        device_id: str_device_id,
        user_identifier:str_user_identifier,
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
    if (window.localStorage.getItem("user_identifier")) {
        //the user has logged in before
        showDiv('pincode_login_div');  
    } else {
        showDiv('janrain_login_div');
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
        console.log('launched div: pincode_login_div');
        isPinSet(device.uuid,window.localStorage.getItem("user_identifier"));
        console.log('ran is pin set');
    }
}
