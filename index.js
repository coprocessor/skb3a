import express from 'express';
import cors from 'cors';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import Promise from 'bluebird';
// const { Schema } = mongoose;
//-----------------------------------------------------
const listening = 3000;
const baseUrl = '/task3a';
const app = express();
const pcUrl = 'https://gist.githubusercontent.com/isuvorov/ce6b8d87983611482aac89f6d7bc0037/raw/pc.json';
app.use(cors());
//-----------------------------------------------------
let pc = {};
fetch(pcUrl)
  .then(async (res) => {
    pc = await res.json();
  })
  .catch(err => {
    console.log('Attention, incorrect data:', err);
  });
//-----------------------------------------------------
app.get('/*', async (req, res) => {
  if (req.url === '/') res.json(pc);
  if (req.url === '/length') {
    res.json(pc.length)
  } else {
    if (req.url !== '/') {
      const  foundPos1 = req.url.indexOf('.', 0);
      const foundPos2 = req.url.indexOf('[', 0);
      const foundPos3 = req.url.substring(req.url.length - 6);
      // let url = req.url.replace(/\//gi, ".");
      let url =  (req.url.replace(/\//gi, ".")).substring(1);
      if (url[url.length - 1] === '.' ) url =  url.substring(0, url.length - 1);
      if (url == 'volumes') {
        // const allHdd = await Promise.all(pc.hdd);
        const sectors = (await Promise.all(pc.hdd)).map((disk) => {
          return _.pick(disk, ['volume', 'size']);
        })
        sectors.forEach( (item, i) => {
          sectors.slice(i + 1, sectors.length).forEach( (item1, j) => {
            if (item1.volume === item.volume) {
              item.size += item1.size;
              item1.volume = '';
              item1.size = 0;
            }
          });
        });
        // const str = new Array();
        const arrayOne = [];
        sectors.forEach( (item, i) => {
          if (item.volume !== '') arrayOne[i] = item.volume;
        });
        const arrayTwo = new Array();
        // const str1 = [];
        sectors.forEach( (item, i) => {
          if (item.volume !== '') arrayTwo[i] = item.size + 'B';
        });
        // const pok = _.zipObject(str, str1);
        res.json(_.zipObject(arrayOne, arrayTwo));
      } else {
        if ((_.get(pc, url) !== undefined)  && foundPos1 < 0 && foundPos2 < 0 && foundPos3 != 'length') {
          res.json(_.get(pc, url));
        } else res.status(404).send(`Not Found`);
      }
    }
  }
});
//-----------------------------------------------------
app.listen(listening, () => {
  console.log(`Open port ${listening}, now listening`);
});
