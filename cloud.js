import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const $ = id => document.getElementById(id);
const storeKey = 'climbLog.v1';
const status = text => { $('syncStatus').textContent = text; };
const configured = !!(window.CLIMB_SUPABASE_URL && window.CLIMB_SUPABASE_ANON_KEY);
const supabase = configured ? createClient(window.CLIMB_SUPABASE_URL, window.CLIMB_SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
let user = null, busy = false, pending = false, syncTimer;
function readLocal(){ try { const v=JSON.parse(localStorage.getItem(storeKey)||'{}');return {checks:v.checks||{},entries:Array.isArray(v.entries)?v.entries:[]};}catch{return {checks:{},entries:[]}} }
function merge(a,b){
  const entries = new Map();
  for (const e of [...(a.entries||[]),...(b.entries||[])]) if(e && typeof e.key==='string' && /^([1-9]|1[0-2])-(Monday|Wednesday|Saturday)$/.test(e.key)) {
    const old=entries.get(e.key);
    if(!old || String(e.date||'') >= String(old.date||'')) entries.set(e.key,e);
  }
  return {checks:{...(a.checks||{}),...(b.checks||{})},entries:[...entries.values()]};
}
function installLocal(next){localStorage.setItem(storeKey,JSON.stringify(next));location.reload()}
async function sync(){
  if(!supabase||!user){status(configured?'Sign in to sync':'Set up Supabase to enable sync');return}
  if(busy){pending=true;return}
  busy=true;status('Syncing…');
  try{
    const {data:remote,error}=await supabase.from('journals').select('payload').eq('user_id',user.id).maybeSingle();
    if(error)throw error;
    const local=readLocal();
    const merged=merge(remote?.payload||{},local);
    const {error:saveError}=await supabase.from('journals').upsert({user_id:user.id,payload:merged,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(saveError)throw saveError;
    status('Synced ✓');
    if(JSON.stringify(local)!==JSON.stringify(merged))installLocal(merged);
  }catch(e){console.error(e);status('Sync error — '+(e.message||'try again'));}
  finally{busy=false;if(pending){pending=false;queueSync()}}
}
function queueSync(){clearTimeout(syncTimer);syncTimer=setTimeout(sync,900)}
window.addEventListener('climblog:changed',queueSync);
window.addEventListener('online',queueSync);
$('signIn').addEventListener('click',async()=>{
  if(!supabase){status('Configure config.js and publish the app first');return}
  const email=$('email').value.trim();if(!email){status('Enter your email address');return}
  status('Sending sign-in link…');
  const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});
  status(error?'Sign-in error: '+error.message:'Check your email for a sign-in link');
});
$('signOut').addEventListener('click',async()=>{if(supabase)await supabase.auth.signOut()});
$('syncNow').addEventListener('click',sync);
$('import').addEventListener('click',()=>$('importFile').click());
$('importFile').addEventListener('change',async e=>{
  const f=e.target.files?.[0];if(!f)return;
  try{const imported=JSON.parse(await f.text());if(!Array.isArray(imported.entries)||typeof imported.checks!=='object'||!imported.checks)throw Error('Not a valid Climb Log backup');
    const next=merge(readLocal(),imported);if(!confirm(`Import ${imported.entries.length} saved sessions? This merges them with your current journal.`))return;
    localStorage.setItem(storeKey,JSON.stringify(next));status('Imported. Reloading…');location.reload();
  }catch(err){status('Import failed: '+err.message)}finally{e.target.value=''}
});
function updateAuth(session){
  user=session?.user||null;$('authSignedOut').hidden=!!user;$('authSignedIn').hidden=!user;
  $('accountInfo').textContent=user?'Signed in as '+user.email+'. Use this same account on your other device.':'Sign in on both devices with the same email to share your journal.';
  if(user)sync();else status(configured?'Local-only — sign in to sync':'Local-only — configure Supabase');
}
if(supabase){
  supabase.auth.getSession().then(({data,error})=>{if(error)status(error.message);else updateAuth(data.session)});
  supabase.auth.onAuthStateChange((_event,session)=>{updateAuth(session)});
}else status('Local-only — configure Supabase');
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(console.warn);
