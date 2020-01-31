var fs = require('fs'),
    xml2js = require('xml2js');

async function xmlReader() {
  var parser = new xml2js.Parser();
  fs.readFile('./SISCON/pag1.xml', function(err, data) {
      parser.parseString(data, function (err, result) {
          // console.dir(result.entry);
          result.feed.entry.forEach(issue=>{
              // console.log(JSON.stringify(issue.));
              console.log(`\nId: ${issue.id}\nTitle: ${issue.title}\nAuthor Name: ${issue.author[issue.author.length - 1].name}\nAuthor Email: ${issue.author[issue.author.length - 1].email}\nAssignee: ${issue.assignee[issue.assignee.length - 1].name}`);
          })

      });
  });
}

module.exports = xmlReader
