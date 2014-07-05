function getPharmaciesFromServer() {
    var url = getAppParams().server+'/pharmacys/return_json_of_pharmacies';
    $.getJSON( url, function( data ) {
        for (var x=0;x<data.pharmacies.length;x++) {
           $('#refill_pharmacy').append('<option>'+data.pharmacies[x]+'</option>');
        }
    });
}
function writeLastUsedPharmacy() {
    var profile = JSON.parse(localStorage.getItem("profile"));
    alert(profile.customer_last_pharmacy);
}