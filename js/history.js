function getHistoryFromServer() {
    var url = getAppParams().server + '/phonegap_api/user_history';
    var dataToPost = {
        device_id:device.uuid,
        user_identifier:window.localStorage.getItem("user_identifier"),
        token:window.localStorage.getItem("token")
    };
    $.post( url, dataToPost, function( data ) {
        if (!data.authenticated) {
            setNotification('You must be logged in to perform this action','alert-warning');
            showCorrectLoginDiv();
        } else {
            console.log(data);
            html = '';
            
            $.each( data.results, function( key, value ) {
                var valueType = null;
                if (value.type === 'transfer') {
                    valueType = 'Transfer';
                } else {
                    valueType = 'Refill';
                }
                html += '<tr>';
                html += '<td>'+valueType+'</td>';
                html += '<td>'+value.created.month+'/'+value.created.day+'/'+value.created.year+'</td>';
                html += '<td>'+value.rx_numbers+'</td>';
                html += '<td>'+value.status+'</td>';
                html += '</tr>';
            }); 
            $('#user_history_content_div').html(html);
            $('#user_history_total_div').html(data.total+' Items');
        }
    }, 'json');
}