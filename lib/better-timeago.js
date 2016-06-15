/**
 * Better Timeago
 * (C) 2016 Mingdong Luo (https://github.com/mdluo) | MIT License
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.returnExports = factory();
  }
})(this, function(undefined) {

  'use strict'

  var BTimeAgo = (function() {

    var BTimeAgo = function(timestamp, callback) {
      return new BTimeAgo.prototype.init(timestamp, callback);
    }

    var ONE_SECOND  =      1000,
       ONE_MINUTE   =     60000,
       ONE_HOUR     =   3600000,
       ONE_DAY      =  86400000;

    var _tsArray          = [];
    var _refreshPeriod    = ONE_MINUTE;

    var _parse = function(timestamp, unix) {
      if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        var ts = Number(timestamp);
        ts = (ts !== ts) ? 0 : ts;
        return unix ? ts*1000 : ts;
      }
      if (typeof timestamp === 'object') {
        if (timestamp instanceof Date) {
          return timestamp.getTime();
        }
        if (timestamp instanceof Array && timestamp.length > 0) {
          timestamp.map(function(item, i) {
            var ts = Number(item);
            ts = (ts !== ts) ? 0 : ts;
            timestamp[i] = unix ? ts*1000 : ts;
          });
          return timestamp;
        }
      }
    }

    BTimeAgo.unix = function(timestamp, callback) {
      var ts = _parse(timestamp, true);
      return new BTimeAgo.prototype.init(ts, callback, true);
    }

    BTimeAgo.dump = function() {
      _tsArray.map(function(item) {
        console.log("{timestamp: %s, callback: %s}", item.ts+"", item.cb);
      })
    }

    BTimeAgo.fn = BTimeAgo.prototype = {
      constructor: BTimeAgo,

      init: function(timestamp, callback, skipParse) {
        var ts = skipParse ? timestamp : _parse(timestamp);
        if (ts) {
          _tsArray.push({cb: callback, ts: ts});
        }
      },

      dump: BTimeAgo.dump

    }
    BTimeAgo.fn.init.prototype = BTimeAgo.prototype;

    return BTimeAgo;
  })();
  return BTimeAgo;
});
