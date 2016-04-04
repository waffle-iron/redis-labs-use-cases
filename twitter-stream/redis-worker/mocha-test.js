var search = require("./modules/search.js");


describe('TwitterSearch', function () {
    it('should return result', function (done) {
        this.timeout(30000);

        search.searchHashtag("SXSW")
            .then(function(res){
                console.log("Search result", JSON.stringify(res,null,4));
                done();
            })
            .fail(function(err){
                done(err);
            });

    });
});