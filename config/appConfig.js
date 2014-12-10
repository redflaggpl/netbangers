/**
 * appConfig
 * (sails.config.appConfig)
 *
 * App Config file contains all the constant varibles to be used in the enterir app.
 *
   To use:
   sails.config.appConfig.foo
 * @class appConfig
 * @static
 * @namespace sails.config
 * @module config
 */

module.exports.appConfig = {
  //Use this variable to set a salt for your security encryption.
  appSalt : 'applicationSalt',

  //Use this variable to set your application name and use it on your site.
  appName : 'Netbangers Blog',
  
  oauth: {
    tokenLife: 2592000
  },
  //Radius in meters for Local Activity (search records of users close to me)
  maxDistance: 128747.52
}
