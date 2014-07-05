function getPharmaciesFromServer() {
    var url = getAppParams().server+'/pharmacys/return_json_of_pharmacies';
    $.getJSON( url, function( data ) {
      alert(data);
    });
}