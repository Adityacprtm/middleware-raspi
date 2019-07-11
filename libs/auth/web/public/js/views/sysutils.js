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
})