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
    root.BTimeAgo = factory(root.fecha, root.locale_en);
  }
})(this, function(fecha, locale_en, undefined) {

  'use strict'

  var BTimeAgo = (function() {

    var BTimeAgo = function(timestamp, callback) {
      return new BTimeAgo.prototype.init(timestamp, callback);
    }

    var UNITS =     {
      second:       1e3,
      minute:       6e4,
      hour:         36e5,
      day:          864e5,
      week:         6048e5
    };

    var ABS_ROUND = {
      floor: function(v, u) {
        return Math.floor(Math.abs(v) / u);
      },
      round: function(v, u) {
        return Math.round(Math.abs(v) / u);
      },
      ceil: function(v, u) {
        return Math.ceil(Math.abs(v) / u);
      },
      percent: function(v, u, p) {
        v = Math.abs(v);
        var x = v / u;
        var floor = Math.floor(x);
        return ((x-floor)*100 < p) ? floor : ceil;
      },
      to: function(v, u, t) {
        v = Math.abs(v);
        var floor = Math.floor(v / u);
        return ((v % u) < t) ? floor : (floor+1);
      }
    };

    var _tsArray          = [],
        _now              = null,
        _startOf          = {},
        _idle             = true,
        _daemon           = null,
        _locales          = {en: locale_en},
        _option           = {
          debug:          false,
          static:         false,
          cycle:          UNITS.minute,
          locale:         'en',
          shortUnit:      false,
          intervals: [
            {interval: [-Infinity, 0], type: ['absolute']},
            {interval: [0, UNITS.minute], type: ['fixed'], unit: ['moment']},
            {interval: [UNITS.minute, 5*UNITS.minute], type: ['relative'], unit: ['minute'], round: ['to', 45*UNITS.second]},
            {interval: [5*UNITS.minute, UNITS.hour], divide: true, type: ['relative', 'absolute'], unit: ['minute'], round: ['to', 45*UNITS.second]},
            {interval: [UNITS.hour, 24*UNITS.hour], divide: true, type: ['absolute', 'absolute']},
            {interval: [24*UNITS.hour, Infinity], type: ['absolute']},
          ],
          types: {
            absolute: ['now', 'today', 'yesterday', 'thisYear', 'epoch']
          }
        };

    var _errors   = {
      dafault:    'Error',
      parameter:  'Invalid Parameter',
      option:     'Invalid Option',
      locale:     'Invalid Locale',
    }

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

    var _convertInterval = function(props, type, interval) {
      var ts = props.timestamp;
      var now = props.now;
      var startOf = props.startOf;
      var option = props.option;
      var locale = _locales[option.locale];
      var unit = interval.unit;

      switch (type) {
        case 'fixed':
          return option.shortUnit ? locale.units[unit][0][1] : locale.units[unit][0][0];

        case 'absolute':
          for (var i = 0; i < locale.types.absolute.length; i++) {
            var division = locale.types.absolute[i];
            if (option.types.absolute.indexOf(division.k) >= 0) {
              if (ts >= startOf[division.k]) {
                var str = "";
                division.v.map(function(item) {
                  str += item.f ? fecha.format(ts, item.s) : item.s;
                });
                return str;
              }
            }
          }
          throw new Error();

        case 'relative':
          var d = ABS_ROUND[interval.round[0]]( (now-ts), UNITS[unit], interval.round[1] );
          var i = ((now-ts) < 0) ? locale.types.relative['in'] : locale.types.relative['ago'];
          var s = option.shortUnit ? 1 : 0;
          var duration = (d == 1) ? locale.units[unit][1][s] : d;
          var plural = (d > 1) ? locale.units[unit][2][s] : '';
          var units = locale.units[unit][0][s];

          return i[0] + duration + units + plural + i[1];

        case 'custom':
          return interval.callback(ts, now, option, locale);
      }
    }

    var _convert = function(props) {
      var ts = props.timestamp;
      var now = props.now;
      var startOf = props.startOf;
      var option = props.option;
      var duration = now - ts;
      try {
        for (var i = 0; i < option.intervals.length; i++) {
          var item = option.intervals[i];
          if (item.interval[0] <= duration && duration < item.interval[1]) {
            if (item.divide && ts < startOf.today) {
              return _convertInterval(props, item.type[1], item);
            }
            return _convertInterval(props, item.type[0], item);
          }
        }
      } catch (e) {
        if (_option.debug) {
          throw e;
        }
        else {
          return _errors.locale;
        }
      }
      return _errors.option;
    };

    var _compose = function(props) {
      var timestamp = props.timestamp;
      if (timestamp instanceof Date) {
        return _convert(props);
      }
      if (timestamp instanceof Array  && timestamp.length > 0) {
        var compArr = [];
        timestamp.map(function(item) {
          compArr.push(_convert(props));
        });
        return compArr;
      }
      return _errors.default;
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
          if (typeof item.callback === 'function') {
            item.callback(_compose({
              timestamp: item.timestamp,
              now: _now,
              startOf: _startOf,
              option: _option
            }));
          }
        });
        _idle = true;
      }
    };

    var _beginWorker = function() {
      if (_option.static) {
        if (!_now) {
          BTimeAgo.now();
        }
      }
      else {
        if (!_daemon && _tsArray.length <= 1) {
          BTimeAgo.now();
          _daemon = setInterval(_worker, _option.cycle);
        }
      }
    }

    var _stopWorker = function() {
      clearInterval(_daemon);
      _daemon = null;
    }

    var _getLocaleDay = function(date) {
      var locale = _locales[_option.locale];
      return (date.getDay()+7-locale.startOfWeek)%7;
    };

    var _parseStartOf = function(now) {
      var startOf = {};
      startOf.thisYear = new Date(now.getFullYear(), 0);
      startOf.lastMonth = now.getMonth() ? (new Date(now.getFullYear(), now.getMonth()-1)) :
                                           (new Date(now.getFullYear()-1, 11));
      startOf.thisMonth = new Date(now.getFullYear(), now.getMonth());
      startOf.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startOf.yesterday = new Date(_startOf.today - UNITS.day);
      startOf.thisWeek = new Date(now - _getLocaleDay(now)*UNITS.day);
      startOf.lastWeek = new Date(_startOf.thisWeek - UNITS.week);
      startOf.now = new Date(now+1);
      startOf.epoch = new Date(0);
      return startOf;
    };

    BTimeAgo.unix = function(timestamp, callback) {
      timestamp = _parse(timestamp, true);
      return new BTimeAgo.prototype.init(timestamp, callback, true);
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
      _now = _parse(now, unix);
      _startOf = _parseStartOf(_now);
      return _now;
    };

    BTimeAgo.clear = function() {
      _tsArray = [];
      _stopWorker();
    };

    BTimeAgo.print = function(timestamp, now) {
      now = _parse(now);
      return _compose({
        now: _parse(now),
        startOf: _parseStartOf(now),
        timestamp: timestamp,
        option: _option
      });
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
        _beginWorker();
      },

      print: function() {
        return _compose({
          timestamp: this.timestamp,
          now: _now,
          startOf: _startOf,
          option: _option
        });
      }
    };
    BTimeAgo.fn.init.prototype = BTimeAgo.prototype;

    return BTimeAgo;
  })();
  return BTimeAgo;
});
