const state = require('./state.js')
const axios = require('axios');
const fs = require('fs')
const util = require('util')
const database = require('./database.js')

async function github() {
  const owner = "google"
  const repo = "guava"
  var page = 1

  // await getIssues(page)
  getCommits()

  function getCommits() {
    database.selectIssues(3652)
  }

  async function getIssues(page){
    if (page <= 23) {
      try {
        var request = `repos/${owner}/${repo}/issues?client_id=08d67d19b0d4d6d3a54f&client_secret=f288e4572281f4ba261c6ff6ecb31ed88c10302f&state=closed&assignee=*&page=${page}`;
        // console.log(`https://api.github.com/${request}`);
        await sleep(1000)
        let res = await axios.get(`https://api.github.com/${request}`)
        console.log(`\nRequest: ${page}`);
        await saveIssues(res)

      } catch (e) {
        console.error(`\nErro ${page} -- ${e}`);
        await sleep(3000)
        await getIssues(page)
      }
    }else {
      return;
    }
  }

  async function saveIssues(response) {
    let parsedIssues = parseIssues(response)
    database.insertIssues(parsedIssues)
    // console.log(JSON.stringify(response.headers));
    page = parseHeader(response.headers.link).next;
    last = parseHeader(response.headers.link).last;
    console.log(`Next Page:${page}`);
    console.log(`Last Page:${last}`);

    await getIssues(page)
  }

  function parseIssues(issues){
    let parsedIssues = issues.data.map(issue => {
        return [issue.number,issue.id, issue.title,  issue.user.login, issue.user.id, issue.state, issue.assignee.login, issue.assignee.id,
          issue.comments, issue.created_at, issue.closed_at, issue.body]
    })
    return parsedIssues
  }

  function parseHeader(data) {
    let arrData = data.split("link:")
    data = arrData.length == 2? arrData[1]: data;
    let parsed_data = {}

    arrData = data.split(",")

    for (d of arrData){
        linkInfo = /<([^>]+)>;\s+rel="([^"]+)"/ig.exec(d)
        var page_split = linkInfo[1].split("page=")
        parsed_data[linkInfo[2]] = page_split[1]
    }

    return parsed_data;
  }

  function sleep (milliseconds){
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }
}

module.exports = github
