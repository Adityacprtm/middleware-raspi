$(document).ready(function () {

    let interval = 5;
    let refresh = function () {
        $.ajax({
            url: '/api/osutils',
            dataType: 'json',
            cache: false,
            error: function (request, error) {
                alert("Can't do because: " + error);
            },
            success: function (data) {
                console.log(data)
                handleViewOs(data);
            }
        })
    }

    function handleViewOs(data) {
        $('#platform').html(data.osutils.platform)
        $('#uptime').html(data.osutils.uptime + ' ms')
        $('#cpus').html(data.osutils.cpus)
        $('#cpu-usage').html(data.osutils.cpuUsage + ' %')
        $('#cpu-free').html(data.osutils.cpuFree + ' %')
        $('#total-memory').html(parseFloat(data.osutils.memTotal).toFixed(2) + ' MB')
        $('#used-memory').html((parseFloat(data.osutils.memTotal).toFixed(2) - parseFloat(data.osutils.memFree).toFixed(2)).toFixed(2) + ' MB')
        $('#free-memory').html(parseFloat(data.osutils.memFree).toFixed(2) + ' MB')
    }

    (function countdown(remaining) {
        if (remaining === 1) {
            refresh()
        }
        if (remaining === -1) {
            //location.reload(true)
            remaining = interval
            $('#osutils').fadeOut(100);
        }
        $('#osutils').fadeIn(100);
        document.getElementById('countdown').innerHTML = 'Refreshing in ' + remaining + ' seconds';
        setTimeout(function () { countdown(remaining - 1); }, 1000);
    })(interval);

    // delete unnecessary buttons 
    $('#btn-things').remove()
    $('#btn-things').remove()
    $('#btn-add-things').remove()
    $('#btn-account').remove()
    $('#btn-dashboard').remove()

    $('#btn-sysutils').addClass('active')

    // actions button
    $('#btn-print').click(function () { window.location.href = '/print'; });
    $('#btn-dashboard').click(function () { window.location.href = '/dashboard'; });
    $('#btn-logout').click(function () { 
        $.ajax({
            url: '/logout',
            type: 'POST',
            data: { logout: true },
            success: function (data) {
                $('.modal-alert').modal({ show: false, keyboard: false, backdrop: 'static' });
                $('.modal-alert .modal-header h4').text('Success!');
                $('.modal-alert .modal-body p').html('You are now logged out.<br>Redirecting you back to the homepage.');
                $('.modal-alert').modal('show');
                $('.modal-alert button').click(function () { window.location.href = '/'; })
                setTimeout(function () { window.location.href = '/'; }, 3000);
            },
            error: function (jqXHR) {
                console.log(jqXHR.responseText + ' :: ' + jqXHR.statusText);
            }
        });
    });
})