var env = process.env.STRIPE_DEMO_ENV || 'dev'
  , config = {}
  ;

// Common options
config.env = env;
config.serverPort = 10000;
config.stripeSecretKey = process.env.STRIPE_FR_DEMO_TEST_SECRET_KEY;

// Interface
module.exports = config;

