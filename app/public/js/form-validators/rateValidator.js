
function RateValidator(){
    
// modal window to allow users to reset their password //
    this.rateWebPetri = $('#rate-webpetri');
    this.rateWebPetriAlert = $('#rate-webpetri .alert');
}

RateValidator.prototype.validateRate = function(s)
{
	if (s >= 1 && s <= 5){
		return true;
	}	else{
		this.showAlert('Please choose your rate');
		return false;
	}
}

RateValidator.prototype.showAlert = function(m)
{
	this.rateWebPetriAlert.attr('class', 'alert alert-error');
	this.rateWebPetriAlert.html(m);
	this.rateWebPetriAlert.show();
}

RateValidator.prototype.hideAlert = function()
{
    this.rateWebPetriAlert.hide();
}

RateValidator.prototype.showSuccess = function(m)
{
	this.rateWebPetriAlert.attr('class', 'alert alert-success');
	this.rateWebPetriAlert.html(m);
	this.rateWebPetriAlert.fadeIn(500);
}