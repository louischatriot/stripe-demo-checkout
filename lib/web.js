var config = require('./config')
  , web = {}
  ;


web.payment = function (req, res, next) {
  console.log("========================");
  console.log(req.body);

  return res.send("Payment accepted");
}

// Interface
module.exports = web;
