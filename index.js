const rp = require('request-promise');
const cheerio = require('cheerio');

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var propertySchema = new Schema(
  {
    address: {type: String, required: true},
    cityNstate: {type: String, required: true}
  }
);

var mongoDB = "mongodb://localhost:27017/Herth";
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var propertyModel = mongoose.model('address', propertySchema);

    var options = {
      uri: `https://www.trulia.com/County/CA/Los_Angeles_Real_Estate/`,
      headers: {
            'User-Agent': 'Chrome/41.0.2228.1'
        },
      transform: function (body) {
        return cheerio.load(body);
      }
    };
    var addr = [];
    var CnS = [];

var found=false;

for(var i=2;i<600; i++)
{
  (function(index){
    setTimeout(function(){
    rp(options)
      .then(($) => {

          var data = $('[class="h6 typeWeightNormal typeTruncate typeLowlight mvn"]');
          data.each(function(j, elem){
            addr.push($(this).text());
          });
           data = $('[class="typeTruncate typeLowlight"]').each(function(j, elem){
            CnS.push($(this).text());
          });


      })
      .catch((err) => {
        console.log(err);
      });
      options.uri = `https://www.trulia.com/County/CA/Los_Angeles_Real_Estate/`+index+`_p`;
    }, index*10000);
  })(i);

}

j=0;
setTimeout(function(){
  addr.forEach(function(element) {
    var prop={
      address: element,
      cityNstate: CnS[j]
    }

    var propertyDoc = new propertyModel(prop);
      propertyDoc.save(function(err){
        if (err) {
          console.log('ERROR');
          return;
        }
      });

    j++;
  });
}, (i+1)*10000);

setTimeout(function(){
  mongoose.connection.close();
},(i+2)*10000);
