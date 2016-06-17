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

    var BTimeAgo = function(timestamp, option, callback) {
      return new BTimeAgo.prototype.init(timestamp, option, callback);
    }

    var ONE_SECOND  =      1000,
        ONE_MINUTE  =     60000,
        ONE_HOUR    =   3600000,
        ONE_DAY     =  86400000,
        ONE_WEEK    = 604800000;

    var _now              = new Date(),
        _tsArray          = [],
        _refreshPeriod    = ONE_MINUTE,
        _defaultOption    = {
          static:         false,
          intervals: [
            // @interval:   min <= duration < max
            // @type:       relative|absolute|fixed|custom
            // @unit        second|moment|minute|hour|day|week|month|year
            {interval: [0, ONE_MINUTE], type: 'fixed', unit: 'moment'},
            {interval: [ONE_MINUTE, ONE_HOUR], type: 'relative', unit: 'minute'},
            {interval: [ONE_HOUR, ONE_HOUR], type: 'relative', unit: 'minute'},
          ],
        };

    var _parseNumber = function(timestamp, unix) {
      var ts = Number(timestamp);
      ts = (ts !== ts) ? 0 : ts;
      return unix ? ts*1000 : ts;
    }

    var _parse = function(timestamp, unix) {
      if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        return new Date(_parseNumber(timestamp, unix));
      }
      if (typeof timestamp === 'object') {
        if (timestamp instanceof Date) {
          return timestamp;
        }
        if (timestamp instanceof Array && timestamp.length > 0) {
          timestamp.map(function(item, i) {
            if (!(item instanceof Date)) {
              timestamp[i] = new Date(_parseNumber(item, unix));
            }
          });
          return timestamp;
        }
      }
      return new Date();
    }

    var _convert = function(timestamp) {
      var duration = Math.floor((_now - timestamp.getTime())/1000);
      return duration + "s ago";
    }

    var _compose = function(timestamp) {
      if (timestamp instanceof Date) {
        return _convert(timestamp);
      }
      if (timestamp instanceof Array  && timestamp.length > 0) {
        var compArr = [];
        timestamp.map(function(item) {
          compArr.push(_convert(item));
        });
        return compArr;
      }
      // TODO error message
      return "Error message";
    }

    var _spread = function(from, to) {
      if (!to) {
        to = {};
      }
      for (var prop in from) {
        if (from.hasOwnProperty(prop) && !to.hasOwnProperty(prop)) {
          to[prop] = from[prop];
        }
      }
      return to;
    }

    BTimeAgo.unix = function(timestamp, option, callback) {
      timestamp = _parse(timestamp, true);
      return new BTimeAgo.prototype.init(timestamp, option, callback, true);
    }

    BTimeAgo.now = function(now, unix) {
      return _now = _parse(now, unix);
    }

    BTimeAgo.clear = function() {
      _tsArray = [];
    }

    BTimeAgo.print = function(timestamp) {
      return _compose(timestamp);
    }

    BTimeAgo.dump = function() {
      _tsArray.map(function(item) {
        console.log("{timestamp: [%s], option: %s, callback: %s}", item.timestamp+"", item.option,  item.callback);
      })
    }

    BTimeAgo.fn = BTimeAgo.prototype = {
      constructor: BTimeAgo,

      timestamp: null,
      option: null,
      callback: null,

      init: function(timestamp, option, callback, skip) {
        if (!skip) {
          timestamp = _parse(timestamp);
        }
        option = _spread(_defaultOption, option);
        if (timestamp) {
          this.timestamp = timestamp;
          this.option = option;
          this.callback = callback;
          _tsArray.push(this);
        }
      },

      print: function() {
        return _compose(this.timestamp);
      },

      dump: BTimeAgo.dump

    }
    BTimeAgo.fn.init.prototype = BTimeAgo.prototype;

    return BTimeAgo;
  })();
  return BTimeAgo;
});
