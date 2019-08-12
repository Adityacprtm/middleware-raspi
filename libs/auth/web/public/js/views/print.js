$(document).ready(function () {

    let showErrors = function (a) {
		$('.modal-form-errors .modal-body p').text('Please correct the following problems :');
		let ul = $('.modal-form-errors .modal-body ul');
		ul.empty();
		for (let i = 0; i < a.length; i++) ul.append('<li>' + a[i] + '</li>');
		this.$('.modal-form-errors').modal('show');
	}

    $('#modal-account-form').ajaxForm({
        success: function (responseText, status, xhr, $form) {
			if (status == 'success') $(location).attr('href', '/print')
		},
		error: function (err) {
			if (err.responseText == 'email-taken') {
				showErrors(['That email address is already in use.'])
			} else if (err.responseText == 'username-taken') {
                showErrors(['That username is already in use.'])
			}
		}
    })

    //tampilkan data ke modal untuk edit
    $('#account-table').on('click', '.edit', function () {
        var username = $(this).data('username');
        var email = $(this).data('email');
        var name = $(this).data('name');
        $('#EditModal').modal('show');
        $('.username').val(username);
        $('.email').val(email);
        $('.name').val(name);
    });
    //tampilkan modal hapus record
    $('#account-table').on('click', '.delete', function () {
        var username = $(this).data('username');
        $('#DeleteModal').modal('show');
        $('#textDelete').html(' Are you sure want to DELETE ' + username + '?')
        $('.username').val(username);
    });
    //tampilan modal approve akun
    $('#account-table').on('click', '.approve', function () {
        var username = $(this).data('username');
        $('#ApproveModal').modal('show');
        $('#textApproved').html('Are you sure want to APPROVE ' + username + '?')
        $('.username').val(username);
    });
    //tampilan modal approve akun
    $('#account-table').on('click', '.decline', function () {
        var username = $(this).data('username');
        $('#DeclineModal').modal('show');
        $('#textDecline').html('Are you sure want to DECLINE ' + username + '?')
        $('.username').val(username);
    });
    
    $('#account-table').DataTable({
        "lengthMenu": [[5, 15, 25, 50, -1], [5, 15, 25, 50, "All"]]
    });
    $('#device-table').DataTable({
        "lengthMenu": [[5, 15, 25, 50, -1], [5, 15, 25, 50, "All"]]
    });

});