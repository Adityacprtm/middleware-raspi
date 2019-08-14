$(document).ready(function () {

    let rdc = new RegisterController();
    let rv = new RegisterValidator();

    $('#register-form').ajaxForm({
        beforeSubmit: function (formData, jqForm, options) {
            return rv.validateForm();
        },
        success: function (responseText, status, xhr, $form) {
            if (status == 'success') $('.modal-alert').modal('show');
        },
        error: function (err) {
            if (err.responseText == 'things-name-taken') {
                rv.showInvalidName();
            }
        }
    });

    $('#name-tf').focus();

    // customize the account settings form //
    $('#register-form h2').text('Things Registration');
    $('#register-form #sub').text('Register your things.');
    $('#head-collapse').remove();
    $('#id-lb').remove();
    $('#id-tf').remove();
    $('#pwd-lb').remove();
    $('#pwd-tf').remove();
    $('#register-form-btn1').html('Cancel');
    $('#register-form-btn2').html('Submit');
    $('#register-form-btn2').addClass('btn-primary');
    $('#register-form-btn3').hide();

    // setup the alert that displays when an account is successfully created //
    $('.modal-alert').modal({ show: false, keyboard: false, backdrop: 'static' });
    $('.modal-alert .modal-header h4').text('Account Created!');
    $('.modal-alert .modal-body p').html('Your thing has been registered.</br>Click OK to return to the things list page.');

    // redirect to homepage when cancel button is clicked //
    $('#register-form-btn1').click(function () { window.location.href = '/things'; });
    // redirect to account
    $('#btn-account').click(function () { window.location.href = '/account'; });

    // remove unneeded nav button
    $('#btn-print').remove()
    $('#btn-sysutils').remove()
    $('#btn-dashboard').remove()

    // active navbar
    $('#btn-add-things').addClass('active')
})