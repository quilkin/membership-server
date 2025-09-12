import { dbconnection } from './dbconn.js'  ;
import { Member } from './common/member.js'
import {  logError, logUser } from './utils/logger.js';
import { TimesDates } from './common/timesdates.js';
import { User} from './common/user.js';

function ModifyApostrophes(data : string): string
{
    return data.replace("'", "''");
}

export function getMembers(request: { body: { data: string; }; }, response: { json: (arg0: Member[] ) => void; }, next: (arg0: { code: any; }) => void ) {

  const orderBy = request.body.data;

  const sql = `SELECT * FROM members order by ${orderBy} asc`;


  dbconnection.query(sql,function (error: { code: any; }, results: Member[])
  {
    if (error != null) {
      next(error);

    }
    else
        response.json(results);
  });
} 
 
export function findMember(request: { body: { data: String; }; }, response: { json: (arg0: Member[]) => void; }, next: (arg0: { code: any; }) => void) {

  const memberEmail = request.body.data;
  // should return just one member
  const sql = `SELECT * from members inner join logins on lower(logins.email) = lower(members.email) where members.email = '${memberEmail}'`;
  dbconnection.query(sql,function (error: { code: any; }, results: Member[])
  {
      if (error != null) {
        next(error);
        return;
      }
      // if (results.length > 0) {
      //   response.json("error: there is more than one member with this email.");
      //   return;
      // }
      response.json(results);
  });
}

// // find all committee members who should receive an automated list every month
// export function findMemberListControllers() : Member[] | null{
//   const sql = `SELECT * from members where committee like '%memberlist%'`;
//   dbconnection.query(sql,function (error: { code: any; }, results: Member[])
//   {
//     if (error != null) 
//       logError(error.code);
//     else 
//       return results;
//   });

//   return null;
// }

// find login name on Ridehub
export function findLoginName(request: { body: { data: String; }; }, response: { json: (arg0: User[]) => void; }, next: (arg0: { code: any; }) => void) {

  const memberEmail = request.body.data;
  const sql = `SELECT * from logins inner join members on lower(logins.email) = lower(members.email) where members.email = '${memberEmail}'`
  dbconnection.query(sql,function (error: { code: any; }, results: User[])
  {
      if (error != null) {
        next(error);
        return;
      }
      // if (results.length > 0) {
      //   response.json("error: there is more than one member with this email.");
      //   return;
      // }
      response.json(results);
  });
}


export function saveMember(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
    const member = request.body.data;
    member.address1 = ModifyApostrophes(member.address1);
    member.address2 = ModifyApostrophes(member.address2);
    member.address3 = ModifyApostrophes(member.address3);

        // check for existing member
    let sql = `SELECT fname,surname FROM members where surname= '${member.surname}' and fname = '${member.fname}'`
    dbconnection.query(sql,function (error: { code: any; }, results: string[])
    {
      if (error != null) {
        next(error);
        return;
      }
      if (results.length > 0) {
        response.json("There is already a member with this name/forename. Please add a digit to the name if this is a genuine coincidence.");
        return;
      }
      //const today = new Date();
      //const todayStr = TimesDates.dateString(today);
      sql = `insert into members (fname,surname,gender,subs,phone,email,committee,address1,`;
      sql += `address2,address3,postcode,paidDate,joinedDate,waChat,waInfo,waLeisure,nextOfKin,nokPhone)`;
      sql += ` values ('${member.fname}','${member.surname}','${member.gender}','${member.subs}','${member.phone}','${member.email}','${member.committee}','${member.address1}',`;
      sql += `'${member.address2}','${member.address3}','${member.postcode}','${member.paidDate}','${member.joinedDate}','${member.waChat}','${member.waInfo}','${member.waLeisure}','${member.nextOfKin}','${member.nokPhone}')`;
   
      // get new member ID

      dbconnection.query(sql,function (error: { code: any; }, results: { insertId: number; })
      {
        if (error != null) {
          next(error);
          return;
        }
        member.number = results.insertId;
        logUser(`Member ${member.number} saved as ${member.fname} ${member.surname} `);
        response.json(member.number.toString());
      })
    });
  }

  export function editMember(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: any) {
    const member = request.body.data;
    member.address1 = ModifyApostrophes(member.address1);
    member.address2 = ModifyApostrophes(member.address2);
    member.address3 = ModifyApostrophes(member.address3);
    
    let sql = `update members set fname = '${member.fname}', surname = '${member.surname}',waChat= '${member.waChat}',waInfo = '${member.waInfo}',waLeisure = '${member.waLeisure}',`;
    sql += ` address1 = '${member.address1}', address2 = '${member.address2}',address3 = '${member.address3}', postcode = '${member.postcode}', paidDate = '${member.paidDate}',joinedDate = '${member.joinedDate}',`;
    sql += ` subs= '${member.subs}', phone='${member.phone}', email = '${member.email}', committee = '${member.committee}',  nextOfKin = '${member.nextOfKin}', nokPhone = '${member.nokPhone}'`;
    sql += `where  number = '${member.number}'`;

    dbconnection.query(sql,function (error: { code: any; }, results: { insertId: number; })
    {
      if (error != null) {
        next(error);
        return;
      }
      logUser(`Member ${member.number} edited as ${member.fname} ${member.surname} `);
      response.json('OK');
    })
  }

  export function payment(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: any) {
      const member = request.body.data;
      let sql = `update members set paidDate = '${member.paidDate}' where ${member.number} = number`;
      dbconnection.query(sql,function (error: { code: any; }, results: { insertId: number; })
      {
        if (error != null) {
          next(error);
          return;
        }
        logUser(`Member ${member.fname} ${member.surname}  updated payment date `);
        response.json('OK');
      })
      
  }
  

  export function deleteMember(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
    const member : Member = request.body.data;
    let  sql = `delete from members where number = ${member.number}`;

    dbconnection.query(sql,function (error: { code: any; }, results: string)
    {
      if (error != null) {
        next(error);
        return;
      }
      logUser(`Member  ${member.fname} ${member.surname} deleted`);
      response.json('OK');
    });
  }

