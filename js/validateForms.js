function validateForm(fields) {
    //clean up all the help blocks that we previously added
    $('.error-span').remove();
    $('.has-error').removeClass('has-error');
    
    var formValidates = true;
    var badFields = [];
    //loop through fields
    for (var x=0;x<fields.length;x++) {
      console.log(fields[x].id);
      var value = $('#' + fields[x].id).val();
      var fieldValidates = true;
      var errorMessage = '';
      var patternMessage = '';
      var matchMessage = '';
      //loop through validators
      if (fields[x].validators) {
        for (var y=0;y<fields[x].validators.length;y++) {
            var validator = fields[x].validators[y];
            //required validator
            if (validator==='required') {
                if (!validateRequired(value)) {
                    fieldValidates = false;
                    errorMessage += 'This field is required. ';
                }
            }
        }
      }
      //check pattern
      if (fields[x].pattern) {
          if (!value.match(fields[x].pattern)) {
              fieldValidates = false;
              patternMessage += 'Field does not match the correct pattern. ';
          }
      }
      //check if field matches
      if (fields[x].matchId) {
          var val1 = $('#' + fields[x].id).val();
          var val2 = $('#' + fields[x].matchId).val();
          if (val1 !== val2) {
            fieldValidates = false;
            matchMessage += 'Fields do not match. ';
          }
      }
      //what to do if field does not validate
      if (!fieldValidates) {
          formValidates = false;
          var objToPush = {field:fields[x].id};
          if (fields[x].message) {
              objToPush.errorMessage = fields[x].message;
          } else {
              if (errorMessage) {
                  objToPush.errorMessage = errorMessage;
              }
          }
          if (patternMessage) {
              objToPush.patternMessage = patternMessage;
          }
          if (matchMessage) {
              objToPush.matchMessage = matchMessage;
          }
          badFields.push(objToPush);
      }
    }
    //apply bootstrap to the form
    if (badFields) {
      for (var z = 0;z<badFields.length;z++) {
          var field = badFields[z].field;
          var fieldValue = $('#' + field).val();
          var label = $("label[for='"+field+"']");
          //add help block
          var parent_div = $('#' + field).parent();
          var new_div_html = parent_div.html();
          var fullErrorMessage = '';
          if (badFields[z].errorMessage) {
              fullErrorMessage += badFields[z].errorMessage;
          }
          if (badFields[z].patternMessage) {
              fullErrorMessage += badFields[z].patternMessage;
          }
          if (badFields[z].matchMessage) {
              fullErrorMessage += badFields[z].matchMessage;
          }
          new_div_html += '<span class="help-block error-span">';
          new_div_html += fullErrorMessage+'</span>';
          parent_div.html(new_div_html);
          label.addClass('control-label');
          $('#' + field).parent().addClass('has-error');
          $('#' + field).val(fieldValue);
          if (z===0) {
            $('#' + badFields[0].field).focus();
          }
      }
    }
    //alert('Form Validation: ' + formValidates);
    console.log(badFields);
    return formValidates;
}
      
function validateRequired(value) {
    if (value) {
        return true;
    } else {
        return false;
    }
}