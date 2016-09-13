var env = process.env.STRIPE_DEMO_ENV || 'dev'
  , config = {}
  ;

// Common options
config.env = env;
config.serverPort = 10000;


// Interface
module.exports = config;

