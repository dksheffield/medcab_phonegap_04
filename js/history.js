function getHistoryFromServer() {
    var url = getAppParams().server + '/phonegap_api/user_history';
    var dataToPost = {
        device_id:device.uuid,
        user_identifier:window.localStorage.getItem("user_identifier"),
        token:window.localStorage.getItem("token")
    }
    $.post( url, dataToPost, function( data ) {
        if (!data.authenticated) {
            setNotification('You must be logged in to perform this action','alert-warning');
            showCorrectLoginDiv();
        } else {
            html = '';
            $.each( data.results, function( key, value ) {
                html += value.type+':';
                html += value.created+' - ';
                html += value.rx_numbers+' - ';
                html += 'Status: '+value.status;
                html += '<br />';
            }); 
            $('#user_history_content_div').html(html);
        }
    }, 'json');
}