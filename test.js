var BTimeAgo = require('./index');

var test1 = BTimeAgo.unix(1465987105);
var test2 = BTimeAgo(1465987109000);
var test3 = BTimeAgo(new Date());
var test4 = BTimeAgo([1465987109000, 1465963123000]);
var test5 = BTimeAgo.unix([1465987110, 1465963125]);

BTimeAgo.dump();
