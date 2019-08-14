
function RegisterController() {

    let that = this;

    // redirect to homepage when cancel button is clicked //
    $('#register-form-btn1').click(function () { window.location.href = '/things'; });

    // redirect to homepage on new account creation, add short delay so user can read alert window //
    $('.modal-alert #ok').click(function () { setTimeout(function () { window.location.href = '/things'; }, 300) });

    // confirm things deletion //
    $('#register-form-btn3').click(function () { $('.modal-confirm').modal('show') });

    // handle things deletion //
    $('.modal-confirm .submit').click(function () { that.deleteThings(); });

    $('#btn-logout').click(function () { that.attemptLogout(); });

    $('#btn-dashboard').click(function () { window.location.href = '/dashboard'; });

    $('#btn-add-things').click(function () { window.location.href = '/register'; });

    $('#btn-things').click(function () { window.location.href = '/things'; });

    this.deleteThings = function () {
        $('.modal-confirm').modal('hide');
        let that = this;
        let id = document.getElementById('id-tf').value
        $.ajax({
            url: '/delete?id=' + id,
            type: 'POST',
            success: function (data) {
                that.showLockedAlert('Your things has been deleted.<br>Redirecting you back to the things page.');
            },
            error: function (jqXHR) {
                console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
            }
        });
    }

    this.attemptLogout = function () {
        let that = this;
        $.ajax({
            url: '/logout',
            type: 'POST',
            data: { logout: true },
            success: function (data) {
                that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
            },
            error: function (jqXHR) {
                console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
            }
        });
    }

    this.showLockedAlert = function (msg) {
        $('.modal-alert').modal({ show: false, keyboard: false, backdrop: 'static' });
        $('.modal-alert .modal-header h4').text('Success!');
        $('.modal-alert .modal-body p').html(msg);
        $('.modal-alert').modal('show');
        $('.modal-alert button').click(function () { window.location.href = '/dashboard'; })
        setTimeout(function () { window.location.href = '/dashboard'; }, 3000);
    }
}

RegisterController.prototype.onUpdateSuccess = function () {
    $('.modal-alert').modal({ show: false, keyboard: true, backdrop: true });
    $('.modal-alert .modal-header h4').text('Success!');
    $('.modal-alert .modal-body p').html('Your things has been updated.');
    $('.modal-alert').modal('show');
    $('.modal-alert button').click(function () { window.location.href = '/things'; })
	setTimeout(function () { window.location.href = '/things'; }, 3000);
}
