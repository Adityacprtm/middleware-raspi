const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const db = require('../db/db');

/* Request Token */
exports.request = function (payload, callback) {
    db.get('SELECT * FROM devices WHERE device_id=? AND device_password=?', [payload.device_id, payload.device_password], (err, docs) => {
        if (err) { callback(err, null) }
        if (docs) {
            if (docs.token) {
                checkToken(docs.token, (err, reply) => {
                    if (err) {
                        if (err.name == "TokenExpiredError") {
                            docs.ip = payload.ip
                            docs.timestamp = payload.timestamp
                            generateToken(docs, (err, token) => {
                                if (err != null) { callback(err, null) }
                                else { callback(null, token) }
                            })
                        }
                    }
                    else {
                        callback('Already has token', null)
                    }
                })
            } else {
                docs.ip = payload.ip
                docs.timestamp = payload.timestamp
                generateToken(docs, (err, token) => {
                    if (err != null) { callback(err, null) }
                    else { callback(null, token) }
                })
            }
        } else {
            callback('Device Not Registered', null)
        }
    })
}

exports.validity = function (token, callback) {
    checkToken(token, (err, reply) => {
        if (err != null) {
            callback(err, { 'status': false })
        } else {
            db.get('SELECT * FROM devices WHERE device_id=?', reply.device_id, (e, o) => {
                if (o) { callback(null, { 'status': true, 'data': reply }) }
                else { callback(err, { 'status': false }) }
            })
        }
    })
}

exports.addDevice = function (dataDevice, callback) {
    let tempId
    db.get('SELECT * FROM devices WHERE device_name=? AND user=?', [dataDevice.device_name, dataDevice.user], (err, rep) => {
        if (rep) {
            callback('device-name-taken')
        } else {
            tempId = hashing(dataDevice.device_name, Date.now())
            db.get('SELECT * FROM devices WHERE device_id=?', tempId, (err, rep) => {
                if (err) { callback(err) }
                if (rep) { dataDevice.device_id = hashing(dataDevice.device_name, Date.now()) } 
                else { dataDevice.device_id = tempId }
                dataDevice.topic_id = generateTopicId()
                dataDevice.device_password = hashing(dataDevice.user, Date.now())
                db.run('INSERT INTO devices (device_name,role,description,user,device_id,device_password,topic_id,date) VALUES (?,?,?,?,?,?,?,datetime("now","localtime"))', [dataDevice.device_name, dataDevice.role, dataDevice.description, dataDevice.user, dataDevice.device_id, dataDevice.device_password, dataDevice.topic_id], (err, o) => {
                    if (err) { callback(err) }
                    else { callback(null) }
                })
            })
        }
    })
}

exports.updateDevice = function (newData, callback) {
    db.run('UPDATE devices SET role=?,description=? WHERE device_id=?', [newData.role, newData.description, newData.device_id], callback)
}

exports.checkId = function (id, callback) {
    db.get('SELECT * FROM devices WHERE device_id=?', id, (err, rep) => {
        if (rep) { callback(null, rep) }
        else { callback(err, null) }
    })
}

exports.getDevice = function (user, callback) {
    db.all('SELECT * FROM devices WHERE user=?', user, (e, res) => {
        if (e) callback(e)
        else callback(null, res)
    })
}

exports.getAllDevice = function (callback) {
    db.all('SELECT * FROM devices', (e, res) => {
        if (e) callback(e)
        else callback(null, res)
    })
}

exports.deleteDevice = function (id, user, callback) {
    if (id != null) {
        db.run('DELETE FROM devices WHERE device_id=?', id, callback)
    } else if (user != null) {
        db.run('DELETE FROM devices WHERE user=?', user, callback)
    }
}

exports.saveTopic = function (device_id, topic) {
    db.run('UPDATE devices SET topic=? WHERE device_id=?', [topic, device_id])
}

exports.deleteTopic = function (device_id) {
    db.run('UPDATE devices SET topic=null WHERE device_id=?', device_id)
}

exports.buildTopic = function (device_id, topic, callback) {
    db.get('SELECT topic_id FROM devices WHERE device_id=?', device_id, (e,o) => {
        if (o) {
            callback(null, o.topic_id + '/' + topic)
        } else {
            callback(e)
        }
    })
}

let generateTopicId = function () {
    return crypto.randomBytes(4).toString(process.env.ENCODE);
}

let generateSalt = function () {
    let set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    let salt = '';
    for (let i = 0; i < 10; i++) {
        let p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
}

let hashing = function (str, timestamp) {
    return crypto.createHash('sha256').update(str + '-' + timestamp).digest(process.env.ENCODE);
}

let checkToken = function (token, callback) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, decoded)
        }
    })
}

let generateToken = function (docs, callback) {
    let payload = {
        device_id: docs.device_id,
        device_name: docs.device_name,
        timestamp: docs.timestamp,
        role: docs.role
    }
    jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: process.env.EXP_TIME, issuer: process.env.ISSUER }, (err, token) => {
        if (err) {
            callback(err.name, null)
        } else {
            db.run('UPDATE devices SET ip=?,timestamp=?,token=? WHERE device_id=?', [docs.ip, docs.timestamp, token, docs.device_id], (err) => {
                if (err) callback(err, null)
            })
            callback(null, token)
        }
    })
}