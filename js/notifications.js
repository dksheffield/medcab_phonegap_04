function setNotification(message,messageType) {
    /*
    configured for bootstrap
    usage:
    setNotification('test notification - success','alert-success');
    setNotification('test notification - info','alert-info');
    setNotification('test notification - warning','alert-warning');
    setNotification('test notification - danger','alert-danger');
    setNotification('test notification - default'); //this does an alert-info on the background
    */
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
function writeNotifications() {
    if (sessionStorage.getItem("notifications")) {
        var notifications = JSON.parse(sessionStorage.getItem("notifications"));
        sessionStorage.removeItem("notifications");
        var html = '';
        for (var x=0;x<notifications.length;x++) {
            html += '<div class="alert '+notifications[x].messageType+' alert-dismissible" role="alert">';
            html += '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>';
            html += notifications[x].message;
            html += '</div>';
        }
        $('#notification_div').html(html);
        $('#notification_div').removeClass('hide');
    } else {
        console.log('we don\'t have notifications');
        $('#notification_div').html('&nbsp;');        
        $('#notification_div').addClass('hide');
    }
}