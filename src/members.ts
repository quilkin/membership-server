import { dbconnection } from './dbconn.js'  ;
import { Member } from './common/member.js'
import {  logUser } from './utils/logger.js';
import { TimesDates } from './common/timesdates.js';

function ModifyApostrophes(data : string): string
{
    return data.replace("'", "''");
}

export function getMembers(request: { body: { data: number; }; }, response: { json: (arg0: Member[] ) => void; }, next: (arg0: { code: any; }) => void ) {

  const sql = `SELECT * FROM members order by name asc`;


  dbconnection.query(sql,function (error: { code: any; }, results: Member[])
  {
    if (error != null) {
      next(error);

    }
    else
        response.json(results);
  });
} 
 
export function saveMember(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
    const member = request.body.data;
    member.address1 = ModifyApostrophes(member.address1);
    member.address2 = ModifyApostrophes(member.address2);
    member.address3 = ModifyApostrophes(member.address3);

   

     // check for existing member
    let sql = `SELECT fame,name FROM members where name= '${member.name}' and fname = '${member.fname}'`
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
      const today = new Date();
      const todayStr = TimesDates.dateString(today);
      sql = `insert into members (fname,name,gender,subs,telephone,email,address1,address2,address3,postcode,paidDate,joinedDate,waChat,waInfo,waLeisure)`;
      sql += ` values ('${member.fname}','${member.name}','${member.gender}','${member.subs}','${member.telephone}','${member.email}','${member.address1}',`;
      sql += `'${member.address2}','${member.address3}','${member.postcode}','${todayStr}','${todayStr}','${member.waChat}','${member.waInfo}','${member.waLeisure}',)`;
      // get new member ID

      dbconnection.query(sql,function (error: { code: any; }, results: { insertId: number; })
      {
        if (error != null) {
          next(error);
          return;
        }
        member.number = results.insertId;
        logUser(`Member ${member.number} saved as ${member.fname} ${member.name} `);
      })
    });
  }

  export function editMember(request: { body: { data: Member; }; }, response: { json: (arg0: string) => void; }, next: any) {
    const member = request.body.data;
    member.address1 = ModifyApostrophes(member.address1);
    member.address2 = ModifyApostrophes(member.address2);
    member.address3 = ModifyApostrophes(member.address3);
    
    let sql = `update members set fname = '${member.fname}', name = '${member.name}',waChat= '${member.waChat}',waInfo = '${member.waInfo}',waLeisure = '${member.waLeisure}',`;
    sql += ` address1 = '${member.address1}', address2 = '${member.address2}',address3 = '${member.address3}', postcode = '${member.postcode}', `;
    sql += ` subs= '${member.subs}', telephone='${member.telephone}', email = '${member.email}' where  number = '${member.number}'`;

    dbconnection.query(sql,function (error: { code: any; }, results: { insertId: number; })
    {
      if (error != null) {
        next(error);
        return;
      }
      logUser(`Member ${member.number} edited as ${member.fname} ${member.name} `);
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
      logUser(`Member  ${member.fname} ${member.name} deleted`);
      response.json('OK');
    });
  }

