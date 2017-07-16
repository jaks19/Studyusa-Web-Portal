'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var apiServices = {};

var request = require('request');

// request library's request method does not return a promise so we use this wrapper 
// it does the request and returns the body of the response back as a promise
function doRequest(url) {
  return new _promise2.default(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

apiServices.retrieveNews = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req) {
    var url, newsResponse, parsedData;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            url = 'https://newsapi.org/v1/articles?source=cnn&sortBy=top&apiKey=c8e7fde98b5a4983b913761b2e7db0f6';
            newsResponse = void 0;
            _context.prev = 2;
            _context.next = 5;
            return doRequest(url);

          case 5:
            newsResponse = _context.sent;
            _context.next = 11;
            break;

          case 8:
            _context.prev = 8;
            _context.t0 = _context['catch'](2);

            req.flash('error', 'Could not fetch live news :(');

          case 11:
            parsedData = JSON.parse(newsResponse);
            return _context.abrupt('return', parsedData['articles'].splice(0, 10));

          case 13:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 8]]);
  }));

  function retrieveNews(_x) {
    return _ref.apply(this, arguments);
  }

  return retrieveNews;
}();

module.exports = apiServices;
//# sourceMappingURL=index.js.map