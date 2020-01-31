const mysql = require('mysql');
const fs = require('fs')
const util = require('util');
const axios = require('axios');

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'devProfile',
    charset: 'utf8mb4'
  });
  const owner = "google"
  const repo = "guava"
  // insertIssues(data)

  function insertIssues(data) {
      var sql = "INSERT INTO issuesTable (number,issue_id,title,author_login,author_id,state,assignee_login,assignee_id,comments,created_at,closed_at,body) VALUES ?";
      con.query(sql, [data], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
      });
  }

  async function selectIssues(left_off){
    con.query(`SELECT * FROM issuesTable WHERE number > ${left_off} ORDER BY number ASC LIMIT 1`, function (err, result, fields) {
        if (err) throw err;
        parseEvents(result);
      });
  }

  async function parseEvents(issues) {
      var number = issues[0].number
      console.log('\n');
      var request = `https://api.github.com/repos/${owner}/${repo}/issues/${number}/events?client_id=08d67d19b0d4d6d3a54f&client_secret=f288e4572281f4ba261c6ff6ecb31ed88c10302f`
      await getCommits(request, number)
      selectIssues(number)
  }

  async function getCommits(request, number){
    console.log(`>> Issue: ${request}`);
    let res = await axios.get(request)
    for (event of res.data) {
      if (event.event === 'referenced') {
        await insertCommits(event, number)
      }
    }

  }

  async function insertCommits(event, number){
    try {
      console.log(`Commit URL: ${event.commit_url}`);

      let res = await axios.get(event.commit_url+'?client_id=08d67d19b0d4d6d3a54f&client_secret=f288e4572281f4ba261c6ff6ecb31ed88c10302f')

      let message = res.data.commit.message
      message = message.replace(/\"/g, ' ');
      if (res.data.author.hasOwnProperty('login')) {
        console.log(`Commit SHA: ${res.data.sha}`);
        var sql = `INSERT INTO commitsTable (commit_sha, author_login, message, author_id, stats_total, stats_add, stats_del, url, issue_number, created_at, repo) VALUES
        ("${res.data.sha}","${res.data.author.login}","${message}",${res.data.author.id},${res.data.stats.total},${res.data.stats.additions},${res.data.stats.deletions}, "${res.data.html_url}",${number},"${event.created_at}",'${repo}')`
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log(`Inserted Commit: ${res.data.sha}`);
          insertFiles(res.data)
        });
      }else {
        throw "Missing Author Parameters."
      }
    } catch (e) {
        if (event.actor) {
          let sql = `INSERT INTO commitsErrorTable (actor_login, actor_id, commit_id, created_at, repo, error) VALUES ('${event.actor.login}',${event.actor.id},'${event.commit_id}','${event.created_at}', '${repo}', '${e.message}')`
        }else {
          let sql = `INSERT INTO commitsErrorTable (actor_login, actor_id, commit_id, created_at, repo, error) VALUES ('N/A','N/A','${event.commit_id}','${event.created_at}', '${repo}', '${e.message}')`
        }
        con.query(sql, function (err, result) {
          if (err) {
            if (err.errno === 1062) {
              console.log("Commit Erro Duplicado");
            }
          }
        });
    }
  }

  function insertFiles(commit) {
    var data = parseFiles(commit)
    // console.log(data);
    var sql = "INSERT INTO filesTable (commitSha,fileSha,filename,status,additions,deletions,changes,raw_url) VALUES ?";
    con.query(sql, [data], function (err, result) {
      if (err) {
        if (err.errno === 1062) {
          console.log("Arquivo Duplicado");
        }else {
          throw err;
        }
      }
      console.log("Inserted Files");
    });
  }

  function parseFiles(commit) {

    var files = commit.files
    let parsedFiles = files.map(file => {
        return [commit.sha, file.sha, file.filename, file.status, file.additions, file.deletions, file.changes, file.raw_url]
    })
    return parsedFiles
  }

  function sleep (milliseconds){
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }


module.exports = {insertIssues, selectIssues}
