'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var filesystemServices = {};

var mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require("fs"),
    // To read-from/write-to files
multiparty = require("multiparty"); // To get file object upon selection from pc for upload

function getPromiseToParseForm(req) {
    // form.parse needs a callback so we make this wrapper to give back a promise instead
    return new _promise2.default(function (resolve, reject) {
        var form = new multiparty.Form();
        form.parse(req, function (error, fields, files) {
            if (error) {
                reject(error);
            } else {
                resolve([fields, files]);
            }
        });
    });
}

filesystemServices.getAddedFileName = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
        var file, fileName;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return getPromiseToParseForm(req);

                    case 3:
                        file = _context.sent[1]['doc'][0];
                        fileName = file['originalFilename'];
                        return _context.abrupt('return', fileName);

                    case 8:
                        _context.prev = 8;
                        _context.t0 = _context['catch'](0);
                        req.flash('error', _context.t0);
                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 8]]);
    }));

    function getAddedFileName(_x, _x2) {
        return _ref.apply(this, arguments);
    }

    return getAddedFileName;
}();

filesystemServices.getNewFileMetadata = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
        var fileData, _ref3, _ref4, fields, files;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        fileData = {};
                        _context2.prev = 1;
                        _context2.next = 4;
                        return getPromiseToParseForm(req);

                    case 4:
                        _ref3 = _context2.sent;
                        _ref4 = (0, _slicedToArray3.default)(_ref3, 2);
                        fields = _ref4[0];
                        files = _ref4[1];

                        fileData.message = fields['message'][0];
                        fileData.title = fields['title'][0];
                        fileData.fileName = files['doc'][0]['originalFilename'];
                        return _context2.abrupt('return', fileData);

                    case 14:
                        _context2.prev = 14;
                        _context2.t0 = _context2['catch'](1);

                        req.flash('error', 'Could not retrieve file metadata');
                        res.redirect('back');

                    case 18:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[1, 14]]);
    }));

    function getNewFileMetadata(_x3, _x4) {
        return _ref2.apply(this, arguments);
    }

    return getNewFileMetadata;
}();

module.exports = filesystemServices;
//# sourceMappingURL=index.js.map