function DashboardController() {
	let that = this;

	$('#btn-logout').click(function () { that.attemptLogout(); });

	$('#btn-device').click(function () { window.location.href = '/device'; });

	$('#btn-account').click(function () { window.location.href = '/account'; });

	$('#btn-add-device').click(function () { window.location.href = '/register'; });

	$('#btn-print').click(function () { window.location.href = '/print'; });

	$('#btn-sysutils').click(function () { window.location.href = '/status'; });

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
		$('.modal-alert button').click(function () { window.location.href = '/'; })
		setTimeout(function () { window.location.href = '/'; }, 3000);
	}
}