var BTimeAgo = require('./index');

var test1 = BTimeAgo.unix(1465987105);
var test2 = BTimeAgo(1465987109000);
var test3 = BTimeAgo(new Date());
var test4 = BTimeAgo([1465987109000, 1465963123000]);
var test5 = BTimeAgo.unix([1465987110, 1465963125]);
var test6 = BTimeAgo();

BTimeAgo.dump();

console.log(BTimeAgo.now());

BTimeAgo.now(new Date());
console.log(BTimeAgo.now());

console.log(test1.print());
console.log(test5.print());
console.log(test6.print());
