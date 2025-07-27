/**
 * Helper names so that server and cleint can easily use the name when exchanging data.
 * Doesn't matter what these strings are as long as they are all different!
 * I hope tehy are all self-explanatory.
 */
export enum apiMethods {

    signup = 'Signup',
    login = 'Login',
    changeAccount = 'ChangeAccount',
    forgotPW ='ForgetPassword',
    getMembers = 'getMembers',  
    saveMember = 'SaveMember',
    editMember = 'EditMember',
    findMember = 'FindMember',
    deleteMember = 'DeleteMember',
    getLogins = 'GetLogins',
    register = 'Register',
    checkTimeout = 'CheckTimeout',
    findUser = 'FindUser',
    logAction = 'LogAction',
    payment = 'Payment'
    
  }
  