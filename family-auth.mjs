// Four- and five-character family passwords need a stable credential form
// because the shared Auth provider enforces a six-character server minimum.
// This does not add password entropy. Both apps must use this exact algorithm.
// Existing passwords of six or more characters are passed through unchanged.
export async function prepareFamilyPassword(email,password){
 if(typeof password!=='string'||password.length<4)throw new Error('PASSWORD_TOO_SHORT');
 if(password.length>=6)return password;
 const identity=String(email).trim().toLowerCase();
 const bytes=new TextEncoder().encode('rainy-family-short-v1\0'+identity+'\0'+password);
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 return 'rf1.'+Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');
}
