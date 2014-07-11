
function ReportValidator(){
    
// modal window to allow users to report a bug //
    this.reportBug = $('#report-bug');
    //this.reportBug.modal({ show : false, keyboard : false, backdrop : 'static' });
    this.reportBug = $('#report-bug .alert');
}

ReportValidator.prototype.showAlert = function(m)
{
	this.reportBug.attr('class', 'alert alert-error');
	this.reportBug.html(m);
	this.reportBug.show();
}

ReportValidator.prototype.hideAlert = function()
{
    this.reportBug.hide();
}

ReportValidator.prototype.showSuccess = function(m)
{
	this.reportBug.attr('class', 'alert alert-success');
	this.reportBug.html(m);
	this.reportBug.fadeIn(500);
}