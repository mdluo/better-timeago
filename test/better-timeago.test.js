/**
 * Better Timeago
 * (C) 2016 Mingdong Luo (https://github.com/mdluo) | MIT License
 */

var BTimeAgo = require('../index');
var expect = require('chai').expect;

describe("BTimeAgo", function() {
  beforeEach(function() {
    SECOND    =      1000;
    MINUTE    =     60000;
    HOUR      =   3600000;
    DAY       =  86400000;
    WEEK      = 604800000;
  });

  describe('#init()', function () {
    beforeEach(function() {
      BTimeAgo.option({static: true});
      BTimeAgo.clear();
    });

    it('should init with no parameter', function () {
      expect(BTimeAgo().timestamp instanceof Date).to.be.equal(true);
    });

    it('should init with date object', function () {
      var now = new Date();
      expect(BTimeAgo(now).timestamp).to.equal(now);
    });

    it('should init with timestamp', function () {
      var ts = new Date().getTime();
      expect(BTimeAgo(ts).timestamp.getTime()).to.equal(ts);
    });

    it('should init with Array', function () {
      var ts = new Date().getTime();
      var arr = [ts, ts, ts];
      expect(BTimeAgo(arr).timestamp instanceof Array).to.equal(true);
    });
  });

  describe('#unix()', function () {
    beforeEach(function() {
      BTimeAgo.option({static: true});
      BTimeAgo.clear();
    });

    it('should init with unix timestamp', function () {
      var now = new Date();
      var ts = Math.floor(new Date().getTime()/1000);
      var bta = BTimeAgo.unix(ts).timestamp;
      expect(bta.getTime()).to.equal(now.getTime()-now.getMilliseconds());
    });
  })

  describe('#print()', function () {
    beforeEach(function() {
      now = new Date("2016-06-18 20:00");
      BTimeAgo.option({static: true});
      BTimeAgo.now(now);
      BTimeAgo.clear();
      before = function(time) {
        return BTimeAgo(now.getTime() - time);
      }
    });

    it('should print correct timeago calling with timestamp', function () {
      expect(before(SECOND).print()).to.equal("Just now");
      expect(before(59*SECOND).print()).to.equal("Just now");
      expect(before(MINUTE).print()).to.equal("1 minute ago");
      expect(before(2*MINUTE).print()).to.equal("2 minutes ago");
    });

  })
});
