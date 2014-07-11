
$(document).ready(function(){

	var rpv = new ReportValidator();
	
	$('#report-bug-form').ajaxForm({
		url: '/report-bug',
		beforeSubmit : function(formData, jqForm, options){;
			rpv.hideAlert();
			return true;
		},
		success	: function(responseText, status, xhr, $form){
			rpv.showSuccess("Your bug has been report. Thank you!");
			setTimeout(function(){ window.location.href = '/'; }, 3000);
		},
		error : function(){
			rpv.showAlert("I'm sorry something went wrong, please try again.");
		}
	});

	$('#report-bug').on('shown', function(){ $('#bug-tf').focus(); })

});