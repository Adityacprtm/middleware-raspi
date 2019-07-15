$(document).ready(function () {

    let hc = new DashboardController();
    let av = new AccountValidator();

    /*
        API Device
    */
    let a = [];
    let user;
    $.ajax({
        url: '/api/device',
        dataType: 'json',
        error: function (request, error) {
            alert("Can't do because: " + error);
        },
        success: function (data) {
            user = data.user
            for (let i = 0; i < data.dvc.length; i++) {
                a.push(data.dvc[i])
            }
            handleView()
        }
    })

    function handleView() {
        $('#welcome-user').text('Welcome, ' + user);
        if (a.length == 0) {
            $('#page-header').html('No Device Registered')
        } else {
            for (let i = 0; i < a.length; i++) {
                let topic
                if (a[i].topic) { topic = a[i].topic }
                else { topic = "Not Available" }
                //if (a[i].role == 'subscriber') { a[i].iv = "Use Publisher IV"; a[i].key = "Use Publisher Key" }
                // $('.card-columns').append('<div style="width: 101%" class="card shadow-sm"> <h5 class="card-header text-center bg-white"><a style="text-decoration:none" href="/device?id=' + a[i].device_id + '">' + a[i].device_name.toUpperCase() + '</a></h5> <form class="card-body"> <p> <a class="text-decoration-none dropdown-toggle btn btn-primary" data-toggle="collapse" href="#collapseExample' + i + '" role="button" aria-expanded="false" aria-controls="collapseExample">Security Information </a> </p><div class="collapse" id="collapseExample' + i + '"> <div class="form-group"> <label>Device ID</label> <textarea style="resize: none;" class="form-control" disabled>' + a[i].device_id + '</textarea> </div><div class="form-group"> <label>Device Password</label> <textarea style="resize: none;" class="form-control" disabled>' + a[i].device_password + '</textarea> </div><div class="form-group"> <label>Key (hex)</label> <input class="form-control" type="text" value="' + a[i].key + '" disabled/> </div><div class="form-group"> <label>IV (hex)</label> <input class="form-control" type="text" value="' + a[i].iv + '" disabled/> </div></div><hr> <div class="form-group"> <label>Role</label> <input class="form-control" type="text" value="' + a[i].role + '" disabled/> </div><div class="form-group"> <label>Topic</label> <input class="form-control" type="text" value="' + topic + '" disabled/> </div><div class="form-group"> <label>Description</label> <input class="form-control" type="text" value="' + a[i].description + '" disabled/> </div></form> <div class="card-footer text-center"> <small class="text-muted">Added ' + a[i].date + '</small> </div></div>')
                $('.card-columns').append('<div style="width: 101%" class="card shadow-sm"><h5 class="card-header text-center bg-white"><a style="text-decoration:none" href="/device?id=' + a[i].device_id + '">' + a[i].device_name.toUpperCase() + '</a></h5><form class="card-body"><p> <a class="text-decoration-none dropdown-toggle btn btn-primary" data-toggle="collapse" href="#collapseExample' + i + '" role="button" aria-expanded="false" aria-controls="collapseExample">Security Information </a></p><div class="collapse" id="collapseExample' + i + '"><div class="form-group"> <label>Device ID</label><div class="textarea-container"><textarea id="dvc_id' + i + '" style="resize: none;" class="form-control" readonly>' + a[i].device_id + '</textarea><button onClick="copyText(\'dvc_id' + i + '\')" class="btn btn-sm btn-secondary">Copy</button></div></div><div class="form-group"> <label>Device Password</label><div class="textarea-container"><textarea id="dvc_pswd' + i + '" style="resize: none;" class="form-control" readonly>' + a[i].device_password + '</textarea><button onClick="copyText(\'dvc_pswd' + i + '\')" type="button" class="btn btn-sm btn-secondary">Copy</button></div></div></div><hr><div class="form-group"> <label>Role</label> <input class="form-control" type="text" value="' + a[i].role + '" readonly /></div><div class="form-group"> <label>Topic</label> <input class="form-control" type="text" value="' + topic + '" readonly /></div><div class="form-group"> <label>Description</label> <input class="form-control" type="text" value="' + a[i].description + '" readonly /></div></form><div class="card-footer text-center"> <small class="text-muted">Added ' + a[i].date + '</small></div></div>')
            }
        }
    }
})