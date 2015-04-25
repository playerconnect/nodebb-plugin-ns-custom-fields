(function (Module) {
    'use strict';

    var async        = require('async'),
        objectAssign = require('object-assign'),

        sockets      = require('./nodebb').pluginSockets,
        meta         = require('./nodebb').meta,
        database     = require('./database'),
        constants    = require('./constants'),
        logger       = require('winston').loggers.get(constants.LOGGER),

        namespace    = 'ns-custom-fields';

    Module.setup = function (callback) {
        sockets[namespace] = {};
        //Acknowledgements
        sockets[namespace].getFields = Module.getFields;
        sockets[namespace].getSettings = Module.getSettings;
        sockets[namespace].saveFields = Module.saveFields;
        sockets[namespace].setSettings = Module.setSettings;

        callback();
    };

    Module.getFields = function (socket, callback) {
        async.parallel({
            fields: async.apply(database.getFields),
            data  : async.apply(database.getClientFields, socket.uid)
        }, function (error, result) {
            if (error) {
                callback(error);
            } else {
                callback(null, result);
            }
        });
    };

    Module.getSettings = function (socket, callback) {
        var defaultSettings = {
            filterTopics: false
        };
        meta.settings.get(constants.NAMESPACE, function (error, settings) {
            callback(error, objectAssign(defaultSettings, settings));
        });
    };

    Module.saveFields = function (socket, data, callback) {
        logger.log('verbose', 'Storing fields for user: %d', socket.uid);
        database.saveClientFields(socket.uid, data, callback);
    };

    Module.setSettings = function (socket, settings, callback) {
        meta.settings.set(constants.NAMESPACE, settings, function (error) {
            callback(error, settings);
        });
    };

})(module.exports);