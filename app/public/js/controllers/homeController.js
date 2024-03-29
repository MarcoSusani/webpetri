
function HomeController()
{

// bind event listeners to button clicks //
	var that = this;

	$('#new-petri-net').click(function(){ 
		$('#get-name-net').modal('show');
	});

	$('#get-name-net').on('shown', function(){ $('#name-pn').focus(); });

	/* UNCOMMENT FOR GET NEW ROOMS MANAGEMENT
	$('#new-room').click(function(){ $('#get-name-room').modal('show');});
	*/
	$('#lnk-report').click(function(){ $('#report-bug').modal('show');});
	$('#lnk-rate').click(function(){ $('#rate-webpetri').modal('show');});
// handle user logout //
	$('#btn-logout').click(function(){ that.attemptLogout(); });

// confirm account deletion //
	$('#account-form-btn1').click(function(){			
		$('.modal-confirm').modal({ show : false, keyboard : true, backdrop : true });
		$('.modal-confirm .modal-header h3').text('Delete Account');
		$('.modal-confirm .modal-body p').html('Are you sure you want to delete your account?');
		$('.modal-confirm .cancel').html('Cancel');
		$('.modal-confirm .submit').html('Delete');
		$('.modal-confirm .submit').addClass('btn-danger');

		$('.modal-confirm .submit').unbind('click');
		$('.modal-confirm .submit').click(function(){ that.deleteAccount(); });

		$('.modal-confirm').modal('show');
	});

// handle account deletion //
	

	$('#btn-selection').click(function(){ forSelection(); });
	$('#btn-new-place').click(function(){ forNewPlaces(); });
	$('#btn-new-transition').click(function(){ forNewTransitions(); });
	$('#btn-new-arc').click(function(){ forNewArcs(); });
	$('#btn-add-token').click(function(){ forAddTokens(); });
	$('#btn-remove-token').click(function(){ forRemoveTokens(); });

	$('#btn-simulation').click(function(){ 
		forSimulation(); 
		if(simulationStatus){
			$('.btn-draw').attr('disabled','disabled');
		}else{
			$('.btn-draw').removeClass('active');
			$('.btn-draw').removeAttr('disabled');
		}
	});

	this.deleteAccount = function()
	{
		$('.modal-confirm').modal('hide');
		var that = this;
		$.ajax({
			url: '/delete',
			type: 'POST',
			data: { id: $('#userId').val()},
			success: function(data){
	 			that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.attemptLogout = function()
	{
		var that = this;
		$.ajax({
			url: "/home",
			type: "POST",
			data: {logout : true},
			success: function(data){
	 			that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.showLockedAlert = function(msg){
		$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-alert .modal-header h3').text('Success!');
		$('.modal-alert .modal-body p').html(msg);
		$('.modal-alert').modal('show');
		$('.modal-alert button').click(function(){window.location.href = '/';})
		setTimeout(function(){window.location.href = '/';}, 3000);
	}
}

HomeController.prototype.onUpdateSuccess = function()
{
	$('.modal-alert').modal({ show : false, keyboard : true, backdrop : true });
	$('.modal-alert .modal-header h3').text('Success!');
	$('.modal-alert .modal-body p').html('Your account has been updated.');
	$('.modal-alert').modal('show');
	$('.modal-alert button').off('click');
}
