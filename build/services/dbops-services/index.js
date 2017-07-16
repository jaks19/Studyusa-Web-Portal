'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("babel-polyfill");

'use strict';

var dbopsServices = {};

dbopsServices.findOneEntryAndPopulate = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(model, entryRequirement, fieldsArray, req, res) {
    var entry, fieldsString;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            entry = model.findOne(entryRequirement);

            if (!(fieldsArray.length > 0)) {
              _context.next = 14;
              break;
            }

            fieldsString = fieldsArray.join(' ');
            _context.prev = 3;
            _context.next = 6;
            return entry.populate(fieldsString).exec();

          case 6:
            entry = _context.sent;
            _context.next = 14;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context['catch'](3);

            req.flash('error', _context.t0);
            res.redirect('back');
            return _context.abrupt('return');

          case 14:
            return _context.abrupt('return', entry);

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 9]]);
  }));

  function findOneEntryAndPopulate(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  }

  return findOneEntryAndPopulate;
}();

dbopsServices.findAllEntriesAndPopulate = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(model, entryRequirement, fieldsArray, req, res) {
    var entries, fieldsString;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            entries = model.find(entryRequirement);

            if (!(fieldsArray.length > 0)) {
              _context2.next = 14;
              break;
            }

            fieldsString = fieldsArray.join(' ');
            _context2.prev = 3;
            _context2.next = 6;
            return entries.populate(fieldsString).exec();

          case 6:
            entries = _context2.sent;
            _context2.next = 14;
            break;

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2['catch'](3);

            req.flash('error', _context2.t0);
            res.redirect('back');
            return _context2.abrupt('return');

          case 14:
            return _context2.abrupt('return', entries);

          case 15:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[3, 9]]);
  }));

  function findAllEntriesAndPopulate(_x6, _x7, _x8, _x9, _x10) {
    return _ref2.apply(this, arguments);
  }

  return findAllEntriesAndPopulate;
}();

function promiseToCreateEntry(model, modelObjectWithData) {
  return new _promise2.default(function (resolve, reject) {
    model.create(modelObjectWithData, function (error, newEntry) {
      if (error) {
        reject(error);
      } else {
        resolve(newEntry);
      }
    });
  });
}

dbopsServices.createEntryAndSave = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(model, modelObjectWithData, req, res) {
    var save = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
    var newEntry;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return promiseToCreateEntry(model, modelObjectWithData);

          case 3:
            newEntry = _context3.sent;
            _context3.next = 11;
            break;

          case 6:
            _context3.prev = 6;
            _context3.t0 = _context3['catch'](0);

            req.flash('error', 'error creating entry');
            res.redirect('back');
            return _context3.abrupt('return');

          case 11:
            if (save) {
              newEntry.save(function (error, data) {
                if (error) {
                  req.flash('error', error);
                }
              });
            }
            return _context3.abrupt('return', newEntry);

          case 13:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 6]]);
  }));

  function createEntryAndSave(_x12, _x13, _x14, _x15) {
    return _ref3.apply(this, arguments);
  }

  return createEntryAndSave;
}();

dbopsServices.savePopulatedEntry = function savePopulatedEntry(populatedEntry, req, res) {
  populatedEntry.save(function (error, savedEntry) {
    if (error) {
      req.flash('error', error);
      res.redirect('back');
    }
  });
};

function promiseTofindEntryByIdAndRemove(model, id, req, res) {
  return new _promise2.default(function (resolve, reject) {
    model.findByIdAndRemove(id, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

dbopsServices.findEntryByIdAndRemove = function () {
  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(model, id, req, res) {
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return promiseTofindEntryByIdAndRemove(model, id, req, res);

          case 3:
            req.flash('success', 'Deletion Successful');
            _context4.next = 9;
            break;

          case 6:
            _context4.prev = 6;
            _context4.t0 = _context4['catch'](0);
            req.flash('error', 'Could not remove entry from the database');

          case 9:
            return _context4.abrupt('return');

          case 10:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 6]]);
  }));

  function findEntryByIdAndRemove(_x16, _x17, _x18, _x19) {
    return _ref4.apply(this, arguments);
  }

  return findEntryByIdAndRemove;
}();

module.exports = dbopsServices;
//# sourceMappingURL=index.js.map