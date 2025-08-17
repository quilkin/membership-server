import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import cors from "cors";
import type { ErrorRequestHandler } from "express";
//import path from 'path';
//import { fileURLToPath } from 'url';
import * as dotenv from "dotenv";
//import http from 'http';

import { logIn, getLogins } from "./src/logins.js";
//import { logIn, getLogins, findUser, register, changeAccount, forgotPW, signUp } from "./src/logins.js";//
import { getMembers, saveMember, editMember, deleteMember, payment, findMember, findLoginName } from "./src/members.js";
import { createLogFiles, logError, logUser } from './src/utils/logger.js';
import { apiMethods } from './src/common/apiMethods.js';
import { createPool } from './src/dbconn.js'  ;
import { sendMembershipList } from "./src/email.js";

const app = express ();
//const httpServer = new http.Server(app);
const port = process.env.PORT || 3000;
app.use(express.json({ limit: '1mb'}));
app.use(cors());
// Configuring body parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '1mb',extended: false }));

app.use(methodOverride());
app.use(express.static('../client'));

app.listen(port, () => {
    console.log("Membership server listening on PORT:", port);
  });

app.get('/', function (req, res) {
    res.sendFile('index.html',  { root: '../client' })
});

// only used direct from browser

// app.get('/actions', function (req, res) {
//   res.sendFile('./logs/rh_action.log',  { root: './' })
// })
app.get('/errors', function (req, res) {
  res.sendFile('./logs/members_error.log',  { root: './' })
})
app.get('/users', function (req, res) {
  res.sendFile('./logs/members_users.log',  { root: './' })
})
app.get('/test', function (req, res) {
    res.send('membership server running!');
    logError('membership  server running!');
})



  // members
  app.post("/" + apiMethods.getMembers,     getMembers)
  app.post("/" + apiMethods.saveMember,     saveMember)
  app.post("/" + apiMethods.editMember,     editMember)
  app.post("/" + apiMethods.deleteMember,   deleteMember)
  app.post("/" + apiMethods.findMember,   findMember)
  app.post("/" + apiMethods.findLoginName,   findLoginName)
  app.post("/" + apiMethods.payment,   payment)
 
  // logins
  app.post("/" + apiMethods.login,        logIn)
  app.post("/" + apiMethods.getLogins,    getLogins)
  app.post("/" + apiMethods.memberList,       sendMembershipList)
  // app.post("/" + apiMethods.findUser,     findUser)
  // app.post("/" + apiMethods.register,     register)
  // app.post("/" + apiMethods.changeAccount,changeAccount)
  // app.post("/" + apiMethods.forgotPW,     forgotPW)

  
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let message = err.message.toString();
    // if (message.includes('Learn more at')) {
    //   // special for gmail error
    //   let index = message.indexOf('Learn more at');
    //   message = message.substring(0,index);
    // }
    console.error(message);
    logError(message);
  
    res.statusMessage = message;
    res.status(500).send(message);
  }

  app.use(errorHandler);

  createLogFiles('./');
  createPool('./.env');
  dotenv.config({ path: './.env' });
  logError("Membership server listening on PORT: "  + port);
  //logError("Environment: "  + process.env.NODE_ENV);