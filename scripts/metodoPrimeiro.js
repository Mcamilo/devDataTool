const csv = require('csv-parser');
const fs = require('fs');
const mysql = require('mysql');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'devProfile',
  charset: 'utf8mb4'
});
const owner = "google"
const repo = "guava"
async function metodoPrimeiro() {

  // console.log(await readCurrentCSV('data'));

  // await selectCommits()

  getAlteredFiles('10abdc5092ab80f20d5060b19ed0e084dadbb2ad')

  async function selectCommits(){
    con.query(`SELECT commit_sha FROM commitsTable WHERE repo = '${repo}'`, function (err, result, fields) {
        if (err) throw err;
        parseCommits(result);
      });
  }
  con.end()

  function parseCommits(commits) {
    commits.forEach(commit=>{
      getAlteredFiles(commit.commit_sha)
    })
  }

  async function getAlteredFiles(commit) {
    con.query(`SELECT filename FROM filesTable WHERE commitSha = '${commit}'`, function (err, result, fields) {
        if (err) throw err;
          let resultArray = result.map(a => a.filename);
          // console.log(JSON.stringify(resultArray));
          getImpact(commit, resultArray)
      });
  }

  async function getImpact(commit, files){
    let current = await readCurrentCSV(commit, files)
    let previous = await readPreviousCSV(commit, files)
    sum_metrics(current, previous)
  }

  async function readCurrentCSV(commit, files) {

    let promise = new Promise((resolve, reject) => {

    let current_commit_metrics = [];
    fs.createReadStream(`./Results/class-${commit}.csv`)
    // fs.createReadStream(`../Results/class-${commit}.csv`)
    .pipe(csv())
    .on('data', (row) => {
      let filename = row.file.replace('/home/matheus/guava/','')
      if (files.indexOf(filename) > -1) {
        current_commit_metrics.push(row)
      }
    })
    .on('error', function (err) {
      console.error('Error:', err)
      reject()
    })
    .on('end', () => {
      resolve(current_commit_metrics)
      });
    });
    return promise
  }

  async function readPreviousCSV(commit, files) {
    let promise = new Promise((resolve, reject) => {

    let previous_commit_metrics = [];
    fs.createReadStream(`./Results_Previous/class-${commit}-previous.csv`)
    // fs.createReadStream(`../Results_Previous/class-${commit}-previous.csv`)
    .pipe(csv())
    .on('data', (row) => {
      // limpar o nome
      let filename = row.file.replace('/home/matheus/guava/','')
      if (files.indexOf(filename) > -1) {
        previous_commit_metrics.push(row)
      }
    })
    .on('error', function (err) {
      console.error('Error:', err)
      reject()
    })
    .on('end', () => {
      resolve(previous_commit_metrics)
      });
    });
    return promise
  }

  function sum_metrics(current_commit_metrics,previous_commit_metrics){
    let cbo_current = current_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.cbo), 0)/current_commit_metrics.length;
    let cbo_previous = previous_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.cbo), 0)/previous_commit_metrics.length;
    let cbo = (cbo_current - cbo_previous).toFixed(2)

    let wmc_current = current_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.wmc), 0)/current_commit_metrics.length;
    let wmc_previous = previous_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.wmc), 0)/previous_commit_metrics.length;
    let wmc = (wmc_current - wmc_previous).toFixed(2)

    let dit_current = current_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.dit), 0)/current_commit_metrics.length;
    let dit_previous = previous_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.dit), 0)/previous_commit_metrics.length;
    let dit = (dit_current - dit_previous).toFixed(2)

    let rfc_current = current_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.rfc), 0)/current_commit_metrics.length;
    let rfc_previous = previous_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.rfc), 0)/previous_commit_metrics.length;
    let rfc = (rfc_current - rfc_previous).toFixed(2)

    let lcom_current = current_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.lcom), 0)/current_commit_metrics.length;
    let lcom_previous = previous_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.lcom), 0)/previous_commit_metrics.length;
    let lcom = (lcom_current - lcom_previous).toFixed(2)

    let nosi_current = current_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.nosi), 0)/current_commit_metrics.length;
    let nosi_previous = previous_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.nosi), 0)/previous_commit_metrics.length;
    let nosi = (nosi_current - nosi_previous).toFixed(2)

    let loc_current = current_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.loc), 0)/current_commit_metrics.length;
    let loc_previous = previous_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.loc), 0)/previous_commit_metrics.length;
    let loc = (loc_current - loc_previous).toFixed(2)

    let maxNestedBlocks_current = current_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.maxNestedBlocks), 0)/current_commit_metrics.length;
    let maxNestedBlocks_previous = previous_commit_metrics.reduce((prev, cur) => parseInt(prev) + parseInt(cur.maxNestedBlocks), 0)/previous_commit_metrics.length;
    let maxNestedBlocks = (maxNestedBlocks_current - maxNestedBlocks_previous).toFixed(2)

    console.log("\nCBO impact: "+ cbo);
    console.log("WMC impact: "+ wmc);
    console.log("DIT impact: "+ dit);
    console.log("RFC impact: "+ rfc);
    console.log("LCOM impact: "+ lcom);
    console.log("NOSI impact: "+ nosi);
    console.log("LOC impact: "+ loc);
    console.log("NBD impact: "+ maxNestedBlocks);

    // TODO:insert metrics statistics
    // TODO: insert lsi index
    // insertDataset()
  }

  function insertDataset(data) {
      var sql = "INSERT INTO datasetTable (number,issue_id,title,author_login,author_id,state,assignee_login,assignee_id,comments,created_at,closed_at,body) VALUES ?";
      con.query(sql, [data], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
      });
  }
}

module.exports = metodoPrimeiro
