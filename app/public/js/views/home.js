

$(document).ready(function(){
	try{
		init();
	}catch(e){
	}
	var hc = new HomeController();
	var av = new AccountValidator();
	
	$('#account-form').ajaxForm({
		url: '/home',
		beforeSubmit : function(formData, jqForm, options){
			if (av.validateForm() == false){
				return false;
			} 	else{
			// push the disabled username field onto the form data array //
				formData.push({name:'user', value:$('#user-tf').val()})
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') {
				hc.onUpdateSuccess();
				setTimeout(function(){ window.location.href = '/'; }, 3000);
			}
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
			    av.showInvalidEmail();
			}	else if (e.responseText == 'username-taken'){
			    av.showInvalidUserName();
			}
		}
	});
	$('#name-tf').focus();

	$('#get-name-net-form').ajaxForm({
		url: '/new-net',
		type: 'POST',
		beforeSubmit : function(formData, jqForm, options){
			return true;
			/*
			if (ev.validateEmail($('#email-tf').val())){
				ev.hideEmailAlert();
				return true;
			}	else{
				ev.showEmailAlert("<b> Error!</b> Please enter a valid email address");
				return false;
			}
			*/
		},
		success	: function(responseText, status, xhr, $form){
			$('#get-name-net').modal('hide');
			window.location.href = '/home';
		},
		error : function(responseText){
		}
	});

	$('#get-name-room-form').ajaxForm({
		url: '/new-room',
		type: 'POST',
		beforeSubmit : function(formData, jqForm, options){
			return true;
			/*
			if (ev.validateEmail($('#email-tf').val())){
				ev.hideEmailAlert();
				return true;
			}	else{
				ev.showEmailAlert("<b> Error!</b> Please enter a valid email address");
				return false;
			}
			*/
		},
		success	: function(responseText, status, xhr, $form){
			$('#get-name-room').modal('hide');
			window.location.href = '/home';
			//ev.showEmailSuccess("Check your email on how to reset your password.");
		},
		error : function(){
			//ev.showEmailAlert("Sorry. There was a problem, please try again later.");
		}
	});

// customize the account settings form //
	
	$('#account-form h1').text('Account Settings');
	$('#account-form #sub1').text('Here are the current settings for your account.');
	$('#user-tf').attr('disabled', 'disabled');
	$('#account-form-btn1').html('Delete');
	$('#account-form-btn1').addClass('btn-danger');
	$('#account-form-btn2').html('Update');

});

function confirmDeleteNet(netId, netName){

	$('.modal-confirm').modal({ show : true, keyboard : true, backdrop : true });
	$('.modal-confirm .modal-header h3').text('Delete Petri Net ' + netName);
	$('.modal-confirm .modal-body p').html('Are you sure you want to delete this Petri Net?');
	$('.modal-confirm .cancel').html('Cancel');
	$('.modal-confirm .submit').html('Delete');
	$('.modal-confirm .submit').addClass('btn-danger');

	$('.modal-confirm .submit').unbind('click');
	$('.modal-confirm .submit').click(function(){ deleteNet(netId); });

	$(".modal-confirm").modal("show"); 
}

function deleteNet(netId){

	$(".modal-confirm").modal("hide"); 
	
	$.ajax({
		url: '/delete-net',
		type: 'POST',
		data: { id: netId},
		success: function(data){
 			//window.location.href = '/home';
 			showLockedAlert('The net has been deleted.<br>Redirecting you back to the homepage.');
		},
		error: function(jqXHR){
			console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
		}
	});
}

function downloadWithName(a, netId, name) {

    var li = $(a).parent().parent().parent().parent();
    if($(li).attr("class") != "active"){
		$('#pn-list').children().removeClass("active"); 
		$(li).addClass("active");
		$('#container').css('visibility','visible');
		$('.btn-draw').removeAttr('disabled');
		$('.btn-draw').removeClass("active");
		$('#btn-simulation').removeAttr('disabled');
		$('#btn-simulation').removeClass("active");
		//load net from DB
		$.ajax({
			url: '/open-net',
			type: 'POST',
			data: { id: netId},
			success: function(data){
				openPetriNet(data);
	 			downloadImage(name);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}else{
		downloadImage(name);
	}

}

function downloadImage(name){
	function eventFire(el, etype){
        if (el.fireEvent) {
            (el.fireEvent('on' + etype));
        } else {
            var evObj = document.createEvent('Events');
            evObj.initEvent(etype, true, false);
            el.dispatchEvent(evObj);
        }
    }

	stage.toDataURL({
        callback: function(dataUrl) {
        	var link = document.createElement("a");
		    link.download = name;
		    link.href = dataUrl;
		    eventFire(link, "click");
		}
    });
}

function showLockedAlert(msg){
	$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
	$('.modal-alert .modal-header h3').text('Success!');
	$('.modal-alert .modal-body p').html(msg);
	$('.modal-alert').modal('show');
	$('.modal-alert button').click(function(){window.location.href = '/';})
	setTimeout(function(){window.location.href = '/';}, 3000);
}


function openNet(li, netId){
	if($(li).attr("class") != "active"){
		$('#pn-list').children().removeClass("active"); 
		$(li).addClass("active");
		$('#container').css('visibility','visible');
		$('.btn-draw').removeAttr('disabled');
		$('.btn-draw').removeClass("active");
		$('#btn-simulation').removeAttr('disabled');
		$('#btn-simulation').removeClass("active");
		//load net from DB
		$.ajax({
			url: '/open-net',
			type: 'POST',
			data: { id: netId},
			success: function(data){
				openPetriNet(data);
	 			//window.location.href = '/home';
	 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}
}

function openNetBold(b, netId){
	var li = $(b).parent().parent();
	openNet(li, netId);
}

function openRoom(roomId){
	var win = window.open('/room/' + roomId, roomId);
	win.focus();
}

function deleteRoom(roomId){
	$.ajax({
		url: '/delete-room',
		type: 'POST',
		data: { id: roomId},
		success: function(data){
 			window.location.href = '/home';
 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
		},
		error: function(jqXHR){
			console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
		}
	});
}