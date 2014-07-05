// Startup functions
function onBodyLoad() {
    document.addEventListener("deviceready",onDeviceReady, false);
}
function onDeviceReady() {
    showDiv('loading_div');

    //listen for child browser window change
    window.plugins.ChildBrowser.onLocationChange = function (url) {
        if (url === getAppParams().server+'/auth_users/phonegap_handler') {
            window.plugins.ChildBrowser.close();
        }
    };
    getPharmaciesFromServer(); //get pharmacies and write them as selects
    writeLastUsedPharmacy(); //write last used pharmacy to selects
    
    listenerEditProfileForm();
    listenerLoginPinForm();
    listenerSubmitCreatePinForm();
    
    //let user login
    showCorrectLoginDiv(); 
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
    /*
    if (divName === 'user_profile_div') {
        isProfileSet();   
    }
    */
    if (div.hasClass('require_profile')) {
        isProfileSet();
    }
}