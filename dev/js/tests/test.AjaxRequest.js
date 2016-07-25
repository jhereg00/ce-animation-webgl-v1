var expect = chai.expect;

var AjaxRequest = require('../lib/AjaxRequest');

describe("AjaxRequest", function () {
  describe("constructor", function () {
    it("should insist on being an instance of itself", function () {
      var req = AjaxRequest("./test.html");
      expect(req).to.be.instanceof(AjaxRequest);
    });
    it("should get data", function (done) {
      var req = new AjaxRequest(
        "./test.html",
        {
          complete: function (data, xhttp) {
            expect(data).to.have.length.above(0);
            expect(xhttp.status).to.equal(200);
            done();
          }
        }
      );
    });
    it("should fire success function on successful call", function (done) {
      var req = new AjaxRequest(
        "./test.html",
        {
          success: function (data, xhttp) {
            expect(data).to.have.length.above(0);
            expect(xhttp.status).to.equal(200);
            done();
          }
        }
      );
    });
    it("should fire error function on failed call", function (done) {
      var req = new AjaxRequest(
        "./fail",
        {
          error: function (data, xhttp) {
            expect(xhttp.status).to.not.equal(200);
            done();
          }
        }
      );
    });
  });
});
