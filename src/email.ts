import { Member } from './common/member.js'
import { User } from './common/user.js'
import { TimesDates } from './common/timesdates.js'
import { dbconnection}  from './dbconn.js'  ;
import  nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport/index.js';
import { logUser } from './utils/logger.js';

var transporter: nodemailer.Transporter<SentMessageInfo>;

function createTransporter() {
    transporter = nodemailer.createTransport({
        host: process.env.emailServer,
        secure: true,
        auth: {
            user: process.env.emailUserName,
            pass: process.env.emailPassword
        }
    });
}

/***
 * create and send an email about a new ride to all users, unless they opted out
 */
export function SendNotificationEmails(ride: Member, response: { json: any; }, next: (arg0: { code: any; }) => void)  {

    createTransporter();
    
    // let date: string = TimesDates.StrFromIntDays(ride.date);
    // let body: string = `A new ride (or event) has been posted! :)\n\r    Date: ${date}.\n    Decription: ${ride.description}\n\r`;
    // body += "Please visit https://ridehub.truro.cc for details\n\r\n\r";
    // body += "============================================================================================\n\r";
    // body += "If you no longer wish to receive these emails, you can edit your preferences in the RideHub 'Account' page\n\r";
    // body += "If you are are unable to do this, please reply to this email with 'unsubscribe' in the message\n\r";
    // body += "If you wish to close your account, please reply to this email with 'close account' in the message\n\r";
    
    // var eMail = {
    // from: "rides@truro.cc",
    // to: "rides@truro.cc",
    // subject: "TCC Ride Hub",
    // text: body,
    // bcc: [] as string[]
    // // bcc: results
    // }
    // // get email list from DB
    // // todo: ***** send to all roles after testing ****************
    // //let sql: string = "SELECT email FROM logins where notifications > 0 and role > 1";
    // let sql: string = "SELECT email FROM logins where notifications > 0";
    // dbconnection.query(sql,function (error: { code: any; }, results: any[])
    // {
    //     if (error != null) {
    //         next(error);
    //         return;
    //     }
    //     eMail.bcc = [];
    //     for (let row = 0; row < results.length; row++) {
    //         let e = results[row];
    //         eMail.bcc.push(e.email)
    //       }
    
    //     transporter.sendMail(eMail, function(error: any, info: { response: string; }){
    //         if (error != null) {
    //             next(error);
    //             return;
    //           }
    //       const rideID = ride.rideID;
    //       logUser(`New ride emails sent for ride ${rideID}`);
    //        response.json(rideID.toString());
    //     }); 
    // })
 }


export interface eMailMessage {
    "transport": any,
    "email" : any
}

/**
 * Create an email to allow new user to register
  */
export function CreateRegistationEmail(user: User, hash: string, next: (arg0: { code: any; }) => void) : eMailMessage{

   createTransporter();
   
   user.code = hash;
   const urlStr = `${process.env.serviceURL}?user=${user.name}&regcode=${user.code}`;
   const body = `Please click ${urlStr}  to complete your registration\n\r\n\rFor security, this link will expire in 15 minutes!`;
   
   var eMail = {
    from: "rides@truro.cc",
    to: user.email,
    subject: "TCC rides signup",
    text: body
   }
   let message : eMailMessage = {"transport": transporter,"email" : eMail}
   return message;
}

export function CreatePasswordResetEmail(username: string, email: string, hash: string, next: (arg0: { code: any; }) => void) : eMailMessage {

    createTransporter();
    
    const urlStr = `${process.env.serviceURL}?pwuser=${username}&regcode=${hash}`;
    const body = `Please click ${urlStr} to reset your password or other details\n\r\n\rFor security, this link will expire in 15 minutes!`;
    
    var eMail = {
     from: "rides@truro.cc",
     to: email,
     subject: "TCC RideHub forgotten password",
     text: body
    }
 
    let message : eMailMessage = {"transport": transporter,"email" : eMail}
    return message;
 }