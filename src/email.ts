import { Member } from './common/member.js'
import { User } from './common/user.js'
import { TimesDates } from './common/timesdates.js'
import { dbconnection}  from './dbconn.js'  ;
import  nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport/index.js';
import { logError, logUser } from './utils/logger.js';
//import {findMemberListControllers  } from './members.js'

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

/**
 * send membership list (requested from client)
 */
// export function requestMembershipList(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
//     let member : Member = request.body.data;
//     let date: string = new Date().toDateString();
//     let body: string = `Latest TCC Membership list - ${date}.\n\r`;

//     let sql: string = "SELECT * FROM members";

//     createTransporter();

//     dbconnection.query(sql,function (error: { code: any; }, results: Member[])
//     {
//         if (error != null) {
//             next(error);
//             return;
//         }
//         let csvContent = makeCSVfile(results);
    
//         var eMail = {
//             from: "admin@truro.cc",
//             to: member.email,
//             subject: "TCC Membership list",
//             text: body,
//             attachments: [
//                 { path: csvContent}
//             ]

//          }
    
//         transporter.sendMail(eMail, function(error: any, info: { response: string; }){
//             if (error != null) {
//                 next(error);
//                 return;
//               }

//           logUser(`Full member list sent to ${member.fname} ${member.surname} `);

//         }); 
//     })
//     response.json('OK');
// }

// send out automated member lists every month
export function autoMembershipList() {

// find all committee members who should receive an automated list every month
  const sql = `SELECT * from members where committee like '%memberlist%'`;
  dbconnection.query(sql,function (error: { code: any; }, committeeMembers: Member[])
  {
    if (error != null) 
      logError(error.code);

    if (committeeMembers.length > 0) {
        let date: string = new Date().toDateString();
        let mailBody: string = `Automatic monthly TCC Membership list - ${date}.\n\r`;
        mailBody += `CSV file attached`;
        let sql: string = "SELECT * FROM members";
        createTransporter();
        dbconnection.query(sql,function (error: { code: any; }, results: Member[])
        {
            if (error != null) {
                //next(error);
                logError("sql error getting member list");
                return;
            }
            let csvContent = makeCSVfile(results);
            committeeMembers.forEach(function(member: Member) {
                var eMail = {
                    from: "admin@truro.cc",
                    to: member.email,
                    text: mailBody,
                    subject: "TCC Membership list",
                    attachments: [
                        { 
                            path: csvContent,
                            filename: `TCC members  ${date}.csv`
                        }
                    ]

                }
                transporter.sendMail(eMail, function(error: any, info: { response: string; }){
                    if (error != null) {
                        logError(`could not send member list email to ${member.fname} ${member.surname}`)
                        return;
                    }

                    logUser(`Full member list sent to ${member.fname} ${member.surname} `);
 
                }); 
                
            })
        })

    }
    else {
        logError("no committee members are set up to receive list");
    }
})
}

function makeCSVfile(members: Member[]) {
        let csvContent = "data:text/csv;charset=utf-8,";

        members.forEach(function(member: Member) {
            const values=Object.values(member);
            
            for (let i = 0; i < values.length; i++) {
                const val = values[i];
                if (typeof val === 'string')
                { 
                    // don't want commas in csv file
                    if (val.includes(','))
                        values[i] = val.replace(/,/gi, " ");
                    if (val.includes('00:00:00'))
                        // date/time, not recognised
                        values[i] = 'unknown';
                }
                else if (typeof val === 'object'){
                    if (val != null) {
                        try {
                            const dateStr = val.getFullYear()  + "/" + ("0"+(val.getMonth()+1)).slice(-2) + "/" + ("0" + val.getDate()).slice(-2);
                            values[i] = dateStr;
                        }
                        catch {}
                    }
                }
            }
            let row = values.join(",");
            csvContent += row + "\r\n";
        });
        return csvContent;

}


export interface eMailMessage {
    "transport": any,
    "email" : any
}
