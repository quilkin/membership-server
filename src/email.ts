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
 * create and send an email containing a dump of all membership data
 */
export function sendMembershipList(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {

    createTransporter();
    let member : Member = request.body.data;
    let date: string = new Date().toDateString();
    let body: string = `Latest TCC Membership list - ${date}.\n\r`;

    let sql: string = "SELECT * FROM members";
    dbconnection.query(sql,function (error: { code: any; }, results: Member[])
    {
        if (error != null) {
            next(error);
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,";
        //const membersRows = JSON.parse(JSON.stringify(results));
        results.forEach(function(member: Member) {
            const values=Object.values(member);
            // don't want commas in csv file

            for (let i = 0; i < values.length; i++) {
                const val = values[i];
                if (typeof val === 'string' && val.includes(','))
                values[i] = val.replace(/,/gi, " ");
            }

            let row = values.join(",");
            csvContent += row + "\r\n";
        });
    
        var eMail = {
            from: "admin@truro.cc",
            to: member.email,
            subject: "TCC Membership list",
            text: body,
            attachments: [
                { path: csvContent}
            ]

         }
    
        transporter.sendMail(eMail, function(error: any, info: { response: string; }){
            if (error != null) {
                next(error);
                return;
              }

          logUser(`Full member list sent to ${member.fname} ${member.surname} `);
           response.json('OK');
        }); 
    })
 }


export interface eMailMessage {
    "transport": any,
    "email" : any
}

// /**
//  * Create an email to allow new user to register
//   */
// export function CreateRegistationEmail(user: User, hash: string, next: (arg0: { code: any; }) => void) : eMailMessage{

//    createTransporter();
   
//    user.code = hash;
//    const urlStr = `${process.env.serviceURL}?user=${user.name}&regcode=${user.code}`;
//    const body = `Please click ${urlStr}  to complete your registration\n\r\n\rFor security, this link will expire in 15 minutes!`;
   
//    var eMail = {
//     from: "rides@truro.cc",
//     to: user.email,
//     subject: "TCC rides signup",
//     text: body
//    }
//    let message : eMailMessage = {"transport": transporter,"email" : eMail}
//    return message;
// }

// export function CreatePasswordResetEmail(username: string, email: string, hash: string, next: (arg0: { code: any; }) => void) : eMailMessage {

//     createTransporter();
    
//     const urlStr = `${process.env.serviceURL}?pwuser=${username}&regcode=${hash}`;
//     const body = `Please click ${urlStr} to reset your password or other details\n\r\n\rFor security, this link will expire in 15 minutes!`;
    
//     var eMail = {
//      from: "rides@truro.cc",
//      to: email,
//      subject: "TCC RideHub forgotten password",
//      text: body
//     }
 
//     let message : eMailMessage = {"transport": transporter,"email" : eMail}
//     return message;
//  }