function validateRequired(fieldId) {
    var value = $('#' + fieldId).val();
    if (value) {
        return True;  
    } else {
        return False;   
    }
}