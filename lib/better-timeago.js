/**
 * Better Timeago
 * (C) 2016 Mingdong Luo (https://github.com/mdluo) | MIT License
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['fecha', 'better-timeago-locale-en'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(
      require('fecha'),
      require('better-timeago-locale-en')
    );
  } else {
    root.returnExports = factory(root.fecha);
  }
})(this, function(fecha, locale_en, undefined) {

  'use strict'

  var BTimeAgo = (function() {

    var BTimeAgo = function(timestamp, callback) {
      return new BTimeAgo.prototype.init(timestamp, callback);
    }

    var SECOND    =      1000,
        MINUTE    =     60000,
        HOUR      =   3600000,
        DAY       =  86400000,
        WEEK      = 604800000;

    var UNITS =     {
      second:       SECOND,
      minute:       MINUTE,
      hour:         HOUR,
      day:          DAY,
      week:         WEEK
    };

    var _tsArray          = [],
        _now              = null,
        _startOf          = {},
        _idle             = true,
        _workerInterval   = null,
        _locales          = {
          en:             locale_en
        },
        _option    = {
          locale:         'en',
          shortUnit:      false,
          refreshPeriod:  MINUTE,
          static:         false,
          intervals: [
            {interval: [-Infinity, 0], type: ['absolute']},
            {interval: [0, MINUTE], type: ['fixed'], unit: ['moment']},
            {interval: [MINUTE, 5*MINUTE], type: ['relative'], unit: ['minute']},
            {interval: [5*MINUTE, HOUR, true], type: ['relative', 'absolute'], unit: ['minute']},
            {interval: [HOUR, 24*HOUR, true], type: ['absolute', 'absolute']},
            {interval: [24*HOUR, Infinity], type: ['absolute']},
          ]
        };

    var _parseNumber = function(timestamp, unix) {
      var ts = Number(timestamp);
      ts = (ts !== ts) ? 0 : ts;
      return unix ? ts*1000 : ts;
    };

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
    };

    var _convertInterval = function(ts, option, type, unit, callback) {
      var duration = _now - ts;
      var locale = _locales[option.locale];

      switch (type) {
        case 'fixed':
          return locale.units[unit];
        case 'absolute':
          for (var i = 0; i < locale.types.absolute.length; i++) {
            var division = locale.types.absolute[i];
            if (ts >= _startOf[division.k]) {
              var str = "";
              division.v.map(function(item) {
                str += item.f ? fecha.format(ts, item.s) : item.s;
              });
              return str;
            }
          }
        case 'relative':
          var d = Math.floor(duration / UNITS[unit]);
          var p = ((-1 <= d && d <= 1) || option.shortUnit) ? '' : locale.units[unit][2];
          var u = option.shortUnit ? 1 : 0;
          if (d < 0) {
            return locale.types.relative['in'] + (-d) + locale.units[unit][u] + p;
          }
          else {
            return "" + d + locale.units[unit][u] + p + locale.types.relative['ago'];
          }
        case 'custom':
          return callback(ts, _now, option, locale);
      }
    }

    var _convert = function(ts, option) {
      var duration = _now - ts;
      for (var i = 0; i < option.intervals.length; i++) {
        var item = option.intervals[i];
        if (item.interval[0] <= duration && duration < item.interval[1]) {
          if (item.interval[2] && ts < _startOf.today) {
            return _convertInterval(ts, option, item.type[1], item.unit, item.callback);
          }
          return _convertInterval(ts, option, item.type[0], item.unit, item.callback);
        }
      }
    };

    var _compose = function(timestamp) {
      if (timestamp instanceof Date) {
        return _convert(timestamp, _option);
      }
      if (timestamp instanceof Array  && timestamp.length > 0) {
        var compArr = [];
        timestamp.map(function(item) {
          compArr.push(_convert(item, _option));
        });
        return compArr;
      }
      return _locales[_locale].errors.default;
    };

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
    };

    var _worker = function() {
      if (_idle) {
        _idle = false;
        BTimeAgo.now();
        _tsArray.map(function(item) {
          if (!_option.static) {
            if (typeof item.callback === 'function') {
              item.callback(_compose(item.timestamp));
            }
          }
        });
        _idle = true;
      }
    };

    var _beginWorker = function() {
      _workerInterval = setInterval(_worker, _option.refreshPeriod);
    }

    var _stopWorker = function() {
      clearInterval(_workerInterval);
    }

    var _getLocaleDay = function(date) {
      var locale = _locales[_option.locale];
      return (date.getDay()+7-locale.startOfWeek)%7;
    };

    BTimeAgo.unix = function(timestamp, option, callback) {
      timestamp = _parse(timestamp, true);
      return new BTimeAgo.prototype.init(timestamp, option, callback, true);
    };

    BTimeAgo.locale = function(name, locale) {
      if (typeof name === 'string' && name.length>0 && typeof locale === 'object') {
        fecha.i18n = locale.fecha;
        _option.locale = name;
        _locales[name] = locale;
      }
      else {
        return _locale;
      }
    };

    BTimeAgo.option = function(option) {
      return _option = _spread(_option, option);
    }

    BTimeAgo.now = function(now, unix) {
      now = _parse(now, unix);
      _startOf.thisYear = new Date(now.getFullYear(), 0);
      _startOf.lastMonth = now.getMonth() ? (new Date(now.getFullYear(), now.getMonth()-1)) :
                                            (new Date(now.getFullYear()-1, 11));
      _startOf.thisMonth = new Date(now.getFullYear(), now.getMonth());
      _startOf.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      _startOf.yesterday = new Date(_startOf.today - DAY);
      _startOf.thisWeek = new Date(now - _getLocaleDay(now)*DAY);
      _startOf.lastWeek = new Date(_startOf.thisWeek - WEEK);
      _startOf.now = new Date(now+1);
      _startOf.epoch = new Date(0);
      return _now = now;
    };

    BTimeAgo.clear = function() {
      _tsArray = [];
      _stopWorker();
    };

    BTimeAgo.print = function(timestamp, now) {
      BTimeAgo.now(now);
      return _compose(timestamp);
    };

    BTimeAgo.fn = BTimeAgo.prototype = {
      constructor: BTimeAgo,

      timestamp: null,
      callback: null,

      init: function(timestamp, callback, skip) {
        if (!skip) {
          timestamp = _parse(timestamp);
        }
        this.timestamp = timestamp;
        this.callback = callback;
        _tsArray.push(this);
        BTimeAgo.now();
        _beginWorker();
      },

      print: function() {
        return _compose(this.timestamp);
      }
    };
    BTimeAgo.fn.init.prototype = BTimeAgo.prototype;

    return BTimeAgo;
  })();
  return BTimeAgo;
});
