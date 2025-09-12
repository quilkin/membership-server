import { createPool, dbconnection } from './dbconn.js'  ;
import { User } from './common/user.js'
import { logUser } from './utils/logger.js';
import { getHash } from './utils/hash.js'
//import { CreateRegistationEmail, CreatePasswordResetEmail, eMailMessage} from './email.js'
import {  eMailMessage} from './email.js'


  export async function logIn(request: { body: { data: User; }; }, response: { json: (arg0: User) => void; }, next: (arg0: { code: any; }) => void) {
    let user : User = request.body.data;
    const hash : string = await getHash(user.pw);
    // can login with either username or email
    let query: string = `SELECT id, name, pw, email, role, units, climbs, notifications FROM logins where name = '${user.name}' or email = '${user.name}'`;

    dbconnection.query(query,function (error: { code: any; },  results: User[])
    {
      if (error != null) {
        next(error);
        return;
      }
      if (results.length === 0) {
        logUser('** User login: unknown user: ' + user.name + ' email: ' + user.email);
        response.json(user);
        return;
      }
      const checkedUser = results[0];
        // can login with either username or email
      if (checkedUser.name === user.name || checkedUser.email === user.name) {
        if (checkedUser.pw === hash) {
        
          user = checkedUser;
          // don't want to return the password
          user.pw = '';
        }
      }
      logUser('User login: ' + user.id + ' name ' + user.name + ' email: ' + user.email);
      
      response.json(user);
    });
  }
    
  export function getLogins(request: any, response: { json: (arg0: User[]) => void; }, next: (arg0: { code: any; }) => void) {
      let sql = "SELECT id, name, email, notifications FROM logins";
      dbconnection.query(sql,function (error: { code: any; }, results: User[])
      {
        if (error != null) {
          next(error);
        }
        else
            response.json(results);
      });
  }

