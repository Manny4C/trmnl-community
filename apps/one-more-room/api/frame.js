export default function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
  // One immutable token per minute. Re-fetching within that minute is a retry,
  // not a second turn. No campaign or user identifier is sent to this endpoint.
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
  return res.status(200).json({frame:'minute:'+Math.floor(Date.now()/60000),engine:1});
}
