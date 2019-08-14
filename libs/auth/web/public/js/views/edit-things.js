$(document).ready(function () {

    let rc = new RegisterController();
    let rv = new RegisterValidator();

    $('#register-form').ajaxForm({
        beforeSubmit: function (formData, jqForm, options) {
            if (rv.validateForm() == false) {
                return false;
            } else {
                // push the disabled username field onto the form data array //
                formData.push({ name: 'things_id', value: $('#id-tf').val() })
                return true;
            }
        },
        success: function (responseText, status, xhr, $form) {
            if (status == 'success') rc.onUpdateSuccess();
        },
        error: function (err) {
            if (err.responseText == 'things-name-taken') {
                rv.showInvalidName();
            }
        }
    });

    $('#btn-add-things').click(function () { window.location.href = '/register'; });
    $('#btn-account').click(function () { window.location.href = '/account'; });
    $('#btn-things').click(function () { window.location.href = '/things'; });

    // customize the account settings form //
    $('#register-form h2').text('Things Setting');
    $('#register-form #sub').text('Here are the current settings for your things.');
    $('#id-tf').attr('disabled', 'disabled');
    $('#pwd-tf').attr('disabled', 'disabled');
    $('#key-tf').attr('disabled', 'disabled');
    $('#iv-tf').attr('disabled', 'disabled');
    $('#name-tf').attr('disabled', 'disabled');
    $('#register-form-btn1').html('Cancel');
    $('#register-form-btn2').html('Update');
    $('#register-form-btn2').addClass('btn-primary');
    $('#register-form-btn3').html('Delete');
    $('#register-form-btn3').removeClass('btn-outline-dark');
    $('#register-form-btn3').addClass('btn-danger');

    // setup the confirm window that displays when the user chooses to delete their account //
    $('.modal-confirm').modal({ show: false, keyboard: true, backdrop: true });
    $('.modal-confirm .modal-header h4').text('Delete Things');
    $('.modal-confirm .modal-body p').html('Are you sure you want to delete your things?');
    $('.modal-confirm .cancel').html('Cancel');
    $('.modal-confirm .submit').html('Delete');
    $('.modal-confirm .submit').addClass('btn-danger');

    $('#btn-print').remove()
    $('#btn-dashboard').remove()
    $('#btn-sysutils').remove()
    $('#btn-print').remove()
})