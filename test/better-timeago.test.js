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

    before = function(time) {
      return BTimeAgo(now.getTime() - time);
    }
    after = function(time) {
      return BTimeAgo(now.getTime() + time);
    }
  });

  describe('#init()', function () {
    beforeEach(function() {
      BTimeAgo.clear();
      BTimeAgo.option({static: true});
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

  describe('#print() #1', function () {
    beforeEach(function() {
      now = new Date("2016-06-18 20:00");
      BTimeAgo.clear();
      BTimeAgo.option({static: true});
      BTimeAgo.now(now);
    });

    it('should print correct fixed timeago', function () {
      expect(before(0).print()).to.equal("Just now");
      expect(before(SECOND).print()).to.equal("Just now");
      expect(before(59*SECOND).print()).to.equal("Just now");
    });

    it('should print correct relative timeago', function () {
      expect(before(MINUTE).print()).to.equal("a minute ago");
      expect(before(2*MINUTE).print()).to.equal("2 minutes ago");
      expect(before(59*MINUTE).print()).to.equal("59 minutes ago");
    });

    it('should print correct absolute timeago of today', function () {
      expect(before(HOUR).print()).to.equal("Today 19:00");
      expect(before(20*HOUR).print()).to.equal("Today 00:00");
    });

    it('should print correct absolute timeago of yesterday', function () {
      expect(before(21*HOUR).print()).to.equal("Yesterday 23:00");
      expect(before(DAY).print()).to.equal("Yesterday 20:00");
      expect(before(44*HOUR).print()).to.equal("Yesterday 00:00");
    });

    it('should print correct date', function () {
      expect(before(45*HOUR).print()).to.equal("Jun 16th");
      expect(before(3*DAY).print()).to.equal("Jun 15th");
    });

    it('should print correct time in the future', function () {
      expect(after(MINUTE).print()).to.equal("2016/6/18 20:01");
    });

  });

  describe('#print() #2', function () {
    beforeEach(function() {
      now = new Date("2016-06-18 00:00:02");
      BTimeAgo.clear();
      BTimeAgo.option({static: true});
      BTimeAgo.now(now);
    });

    it('should print relative timeage not more than 5 minutes', function () {
      expect(before(3*SECOND).print()).to.equal("Just now");
    });
  });

  describe('#print() #3', function () {
    beforeEach(function() {
      now = new Date("2016-06-18 00:04");
      BTimeAgo.clear();
      BTimeAgo.option({static: true});
      BTimeAgo.now(now);
    });

    it('should print relative timeage less than 5 minutes', function () {
      expect(before(4*MINUTE+44*SECOND).print()).to.equal("4 minutes ago");
    });

    it('should print absolute time more than 5 minutes', function () {
      expect(before(5*MINUTE).print()).to.equal("Yesterday 23:59");
    });
  });

  describe('#print() #4', function () {
    beforeEach(function() {
      now = new Date("2016-06-18 20:00");
      BTimeAgo.clear();
      BTimeAgo.option({static: true});
      BTimeAgo.now(now);
    });

    it('should print rounded relative timeage', function () {
      expect(before(2*MINUTE+10*SECOND).print()).to.equal("2 minutes ago");
      expect(before(2*MINUTE+44*SECOND).print()).to.equal("2 minutes ago");
      expect(before(2*MINUTE+45*SECOND).print()).to.equal("3 minutes ago");
      expect(before(2*MINUTE+50*SECOND).print()).to.equal("3 minutes ago");
    });

    it('should print rounded relative timeage', function () {
      expect(before(10*MINUTE+10*SECOND).print()).to.equal("10 minutes ago");
      expect(before(10*MINUTE+10*SECOND).print()).to.equal("10 minutes ago");
      expect(before(10*MINUTE+45*SECOND).print()).to.equal("11 minutes ago");
      expect(before(10*MINUTE+50*SECOND).print()).to.equal("11 minutes ago");
    });
  });

  describe('#print() #5', function () {
    beforeEach(function() {
      now = new Date("2016-06-18 00:04");
      BTimeAgo.clear();
      BTimeAgo.option({static: true});
      BTimeAgo.now(now);
    });

    it('should print rounded relative timeage', function () {
      expect(before(4*MINUTE+50*SECOND).print()).to.equal("5 minutes ago");
    });
  })
});
