/**
 *  scripts.js
 *  This should include objects, which in turn include the lib files they need.
 *  This keeps us using a modular approach to dev while also only including the
 *  parts of the library we need.
 */

var windowSize = require('lib/windowSize');

var CEAnimation = require('app/Animation');
var ceAnim = new CEAnimation(document.body).init();
ceAnim.addInitFunction(function (anim) {
  (function animate () {
    anim.update();
    anim.draw();
    requestAnimationFrame(animate);
  })();
})
