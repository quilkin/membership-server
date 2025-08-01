import fs from "fs";
import util from "util";
var log_file: { write: (arg0: string) => void; };
var user_file: { write: (arg0: string) => void; };
//var action_file: { write: (arg0: string) => void; };

export function createLogFiles(path : string) {
  if (!fs.existsSync(path +'/logs')){
    fs.mkdirSync(path +'/logs');
  }
  log_file = fs.createWriteStream(path +'/logs/members_error.log', {flags : 'a'});
 // action_file = fs.createWriteStream(path +'/logs/rh_action.log', {flags : 'a'});
  user_file = fs.createWriteStream(path + '/logs/members_users.log', {flags : 'a'});
}

function timeStr(): string {
  return new Date().toLocaleTimeString();
}
function dateStr() : string {
  return new Date().toLocaleDateString();
}
export function logError(mess : string) { 
  try {
    const message = util.format('%s %s: ***** %s',dateStr(),timeStr(),mess)+ '\n'; 
    log_file.write(message);
  }
  catch (e){
  }
};
export function logUser(mess: string) { //
  try {
    const message = util.format('%s %s: %s',dateStr(),timeStr(),mess)+ '\n'; 
    user_file.write(message);
  }
  catch(e) {
    
  }
};

