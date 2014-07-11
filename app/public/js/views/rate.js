
$(document).ready(function(){

	var rv = new RateValidator();
	
	$('#rate-webpetri-form').ajaxForm({
		url: '/rate-webpetri',
		beforeSubmit : function(formData, jqForm, options){;
			rv.hideAlert();
			if (rv.validateRate($('#rate-tf').val()) == false){
				return false;
			} 	else{
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			rv.showSuccess("Your rate has been send. Thank you!");
			setTimeout(function(){ window.location.href = '/'; }, 3000);
		},
		error : function(){
			rv.showAlert("I'm sorry something went wrong, please try again.");
		}
	});

});