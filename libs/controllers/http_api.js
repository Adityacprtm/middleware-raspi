module.exports = (app) => {

    const logger = app.helpers.winston
    const router = require('express').Router()
    const AM = require('../auth/config/account-manager')
    const DM = require('../auth/config/device-manager')

    /* 
    Device Request
    */
    /* Device request token */
    router.route('/device/request')
        .post((req, res) => {
            let ip, payload
            ip = req.ip
            if (ip.substr(0, 7) == "::ffff:") {
                ip = ip.substr(7)
            }
            logger.http('Incoming Device for %s request token from %s ', req.method, ip)
            payload = req.body
            payload.ip = ip
            payload.timestamp = Date.now().toString()
            DM.request(payload, (err, data) => {
                if (err != null) {
                    logger.http('Not generate token for %s, %s', ip, err)
                    res.format({
                        'application/json': function () {
                            res.status(401).send(err);
                        }
                    })
                } else {
                    logger.http('Token generated for %s', ip)
                    res.format({
                        'application/json': function () {
                            res.status(200).send({ token: data });
                        },
                    })
                }
            })
        })
        .get((req, res) => {
            let ip = req.ip
            if (ip.substr(0, 7) == "::ffff:") {
                ip = ip.substr(7)
            }
            logger.http('Incoming Device for %s request token from %s ', req.method, ip)
            res.format({
                'application/json': function () {
                    res.status(405).send({ message: 'Method Not Allowed' })
                }
            })
        })

    router.route('/device/check')
        .get((req, res) => {
            let ip = req.ip
            if (ip.substr(0, 7) == "::ffff:") {
                ip = ip.substr(7)
            }
            logger.http('Incoming Device for %s check token from %s ', req.method, ip)
            if (req.body.token) {
                DM.validity(req.body.token, (err, reply) => {
                    if (err != null) {
                        logger.error('There\'s an error: %s', err)
                        res.format({
                            'application/json': function () {
                                res.status(401).send(err)
                            }
                        })
                    } else {
                        if (reply.status) {
                            res.format({
                                'application/json': function () {
                                    res.status(200).send({ status: 'Valid' })
                                }
                            })
                        } else {
                            res.format({
                                'application/json': function () {
                                    res.status(200).send({ status: 'Invalid' })
                                }
                            })
                        }
                    }
                })
            } else {
                res.format({
                    'application/json': function () {
                        res.status(200).send({ message: 'Token Not Found' })
                    }
                })
            }
        })

    /*
    User Web Request
    */
    /* Main Path */
    router.route('/')
        .get((req, res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            let ip = req.ip
            if (ip.substr(0, 7) == "::ffff:") {
                ip = ip.substr(7)
            }
            if (req.cookies.login == undefined) {
                res.render('login', { title: 'Hello - Please Login To Your Account' });
            } else {
                AM.validateLoginKey(req.cookies.login, ip, function (e, o) {
                    if (o) {
                        AM.autoLogin(o.username, o.pass, function (o) {
                            req.session.user = o;
                            res.redirect('/dashboard');
                        });
                    } else {
                        res.render('login', { title: 'Login' });
                    }
                });
            }
        })
        .post((req, res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            let ip = req.ip
            if (ip.substr(0, 7) == "::ffff:") {
                ip = ip.substr(7)
            }
            AM.manualLogin(req.body['user'], req.body['pass'], function (e, o) {
                if (!o) {
                    res.status(400).send(e);
                } else {
                    req.session.user = o;
                    AM.generateLoginKey(o.username, ip, function (key) {
                        logger.http('User %s has login', req.session.user.username)
                        res.cookie('login', key, { maxAge: 900000 });
                        res.status(200).send(o);
                    });
                }
            });
        })

    /* SignUp path */
    router.route('/signup')
        .get((req, res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            res.render('signup', { title: 'Signup' });
        })
        .post((req, res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            AM.addNewAccount({
                name: req.body['name'],
                email: req.body['email'],
                user: req.body['user'],
                pass: req.body['pass'],
                admin: false
            }, function (err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    logger.http('User %s has registered', req.body['user'])
                    res.status(200).send('ok');
                }
            });
        })

    /* Dashboard path */
    router.route('/dashboard')
        .get((req, res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            if (req.session.user == null) {
                res.redirect('/');
            } else {
                let user = req.session.user.username
                DM.getDevice(user, (err, devices) => {
                    res.render('dashboard', {
                        title: 'Dashboard',
                        dvc: devices,
                        usr: req.session.user
                    })
                })
            }
        })

    /* Device Path */
    router.route('/device')
        .get((req, res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            if (req.session.user == null) {
                res.redirect('/');
            } else {
                if (req.query.id) {
                    let id = req.query.id
                    DM.checkId(id, (err, data) => {
                        if (data == null) {
                            res.status(400);
                            res.render('error', { title: 'Page Not Found', message: 'I\'m sorry, the page or resource you are searching for is currently unavailable.' });
                        } else {
                            res.render('edit-device', {
                                title: 'Device Update',
                                dvc: data
                            })
                        }
                    })
                } else {
                    res.render('device', { title: 'Devices' })
                }
            }
        })
        .post((req, res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            if (req.session.user == null) {
                res.redirect('/');
            } else {
                if (req.query.id) {
                    DM.checkId(req.query.id, (err, o) => {
                        if (err) {
                            res.status(400).send('not-found');
                        } else {
                            DM.updateDevice({
                                device_id: req.query.id,
                                role: req.body['role'],
                                description: req.body['description']
                            }, (err, rep) => {
                                if (err) {
                                    res.status(400).send(err);
                                } else {
                                    logger.http('User %s has changed the device data', req.session.user.username)
                                    res.status(200).send('ok');
                                }
                            })
                        }
                    })
                }
            }
        })

    router.route('/account')
        .get((req,res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            res.status(200)
            res.render('edit-account', {
                title: 'Account Update',
                usr: req.session.user
            })
        })
        .post((req, res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            if (req.session.user == null) {
                res.redirect('/');
            } else {
                AM.updateAccount({
                    id: req.session.user.id,
                    name: req.body['name'],
                    email: req.body['email'],
                    pass: req.body['pass']
                }, function (e, o) {
                    if (e) {
                        res.status(400).send('error-updating-account');
                    } else {
                        req.session.user = o;
                        logger.http('User %s has changed the account', req.session.user.username)
                        res.status(200).send('ok');
                    }
                });
            }
        })

    /* Get Device API */
    router.get('/api/device', (req, res) => {
        if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
            return res.redirect('https://' + req.get('host') + req.url);
        }
        if (req.session.user == null) {
            res.redirect('/');
        } else {
            let user = req.session.user.username
            DM.getDevice(user, (err, devices) => {
                res.json({ user: user, dvc: devices })
            })
        }
    })

    router.get('/api/osutils', (req, res) => {
        if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
            return res.redirect('https://' + req.get('host') + req.url);
        }
        if (req.session.user == null) {
            res.redirect('/');
        } else {
            let osu = require('node-os-utils');
            let os = require('os-utils');
            let admin = req.session.user.admin;

            (async function run() {
                data = {
                    platform: await osu.os.platform(),
                    uptime: osu.os.uptime(),
                    cpus: osu.cpu.count(),
                    cpuUsage: await osu.cpu.usage(),
                    cpuFree: await osu.cpu.free(),
                    memTotal: os.totalmem(),
                    memFree: os.freemem()
                }
                res.json({ user: admin, osutils: data })
            })()
        }
    })

    /* Register device path */
    router.route('/register')
        .get((req, res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            if (req.session.user == null) {
                res.redirect('/');
            } else {
                let user = req.session.user.username
                res.render('addDevice', {
                    title: 'Register Device',
                })
            }
        })
        .post((req, res) => {
            if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
                return res.redirect('https://' + req.get('host') + req.url);
            }
            DM.addDevice({
                device_name: req.body['device_name'],
                role: req.body['role'],
                description: req.body['description'],
                user: req.session.user.username
            }, (err) => {
                if (err) {
                    res.status(400).send(err);
                } else {
                    logger.http('User %s has register the device', req.session.user.username)
                    res.status(200).send('ok');
                }
            })
        })

    /* Delete Path */
    router.post('/delete', function (req, res) {
        if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
            return res.redirect('https://' + req.get('host') + req.url);
        }
        if (req.session.user == null) {
            res.redirect('/');
        } else {
            if (req.query.id) {
                DM.deleteDevice(req.query.id, null, (err, obj) => {
                    if (err != null) {
                        res.status(400).send('record not found');
                    } else {
                        logger.http('User %s has deleted the device', req.session.user.username)
                        res.status(200).send('ok');
                    }
                })
            } else {
                AM.deleteAccount(req.session.user.username, function (err, obj) {
                    if (err != null) {
                        res.status(400).send('record not found');
                    } else {
                        DM.deleteDevice(null, req.session.user.username, (err, obj) => {
                            if (err != null) {
                                res.status(400).send('record not found');
                            } else {
                                logger.http('User %s has deleted the account and devices', req.session.user.username)
                                res.clearCookie('login');
                                req.session.destroy(function (e) { res.status(200).send('ok'); });
                            }
                        })
                    }
                });
            }
        }
    });

    /* Print All User Path*/
    router.get('/print', function (req, res) {
        if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
            return res.redirect('https://' + req.get('host') + req.url);
        }
        if (req.session.user.admin == 1) {
            AM.getAllRecords(function (e, accounts) {
                DM.getAllDevice(function (e, devices) {
                    res.render('print', { title: 'Account List', accts: accounts, dvc: devices });
                })
            })
        } else {
            res.render('error', { title: 'Forbidden', message: 'forbidden you don\'t have permission to access ' + req.path + ' on this server' })
        }
    });

    /* System Utils */
    router.get('/status', function (req, res) {
        if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
            return res.redirect('https://' + req.get('host') + req.url);
        }
        if (req.session.user.admin == 1) {
            res.render('sysutils', { title: 'Information System' })
        } else {
            res.render('error', { title: 'Forbidden', message: 'forbidden you don\'t have permission to access ' + req.path + ' on this server' })
        }
    })

    /* LogOut Path */
    router.post('/logout', (req, res) => {
        if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
            return res.redirect('https://' + req.get('host') + req.url);
        }
        logger.http('User %s has logout', req.session.user.username)
        res.clearCookie('login');
        req.session.destroy(function (e) { res.status(200).send('ok'); });
    })

    /* Error path handler */
    router.get('*', function (req, res) {
        if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
            return res.redirect('https://' + req.get('host') + req.url);
        }
        res.render('error', { title: 'Page Not Found', message: 'I\'m sorry, the page or resource you are searching for is currently unavailable.' });
    });

    return router
}
