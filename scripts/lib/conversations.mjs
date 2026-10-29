import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {REPO_ROOT} from './db.mjs';
export const tables=['meetings','segments','commitments','observations','scores','activity'];
export const reads={
 'meetings':'select * from meeting_review order by held_on desc,title',
 'call-review':"select title,account,owner,held_on,review_state,segments,open_commitments from meeting_review order by held_on desc,title",
 'commitments-due':"select title,account,owner,due_on,days_overdue,review_state from commitment_review where status='open' and due_on<=current_date+7 order by due_on,title",
 'coaching':'select * from coaching_review order by owner,criterion',
 'topics':"select o.topic,m.account,count(*) as mentions,count(distinct m.id) as calls from observations o join meetings m on m.id=o.meeting_id join meeting_review r on r.id=m.id where r.review_state='Ready' group by o.topic,m.account order by mentions desc,o.topic",
 'attention':"select 'Call' as kind,title,owner,review_state as issue from meeting_review where review_state<>'Ready' union all select 'Commitment',title,owner,'Overdue '||days_overdue||' days' from commitment_review where status='open' and days_overdue>0 order by kind,title",
 'compliance':'select title,owner,rule,issue from privacy_exceptions order by rule,title',
 'activity':'select actor,action,detail,created_at from activity order by created_at,id'
};
export const questions=[
 ['Which commitments are overdue on calls cleared for use?',"select title,owner,days_overdue from commitment_review where status='open' and days_overdue>0 and review_state='Ready' order by days_overdue desc"],
 ['Which open commitments rely on calls needing privacy review?',"select title,owner,review_state from commitment_review where status='open' and review_state<>'Ready' order by title"],
 ['Which accounts have repeated decision blockers?',"select m.account,count(*) as mentions from observations o join meetings m on m.id=o.meeting_id where o.topic='decision blocker' group by m.account having count(*)>1 order by m.account"],
 ['Which calls still lack a recorded next step?',"select title,account,owner from meeting_review where open_commitments=0 order by title"],
 ['Who owns the oldest unfinished promise?',"select title,owner,due_on,days_overdue from commitment_review where status='open' order by due_on,title limit 1"],
 ['Which recent calls have no coaching review?',"select m.title,m.owner from meetings m where held_on>=current_date-30 and not exists(select 1 from scores s where s.meeting_id=m.id) order by title"],
 ['Which calls have no collection notice evidence?',"select title,owner from meetings where coalesce(trim(notice_evidence),'')='' order by title"],
 ['Which retained calls need a decision about keeping them?',"select title,owner,retention_review_on from meetings where retention_review_on is null or retention_review_on<=current_date order by title"],
 ['Which owners have low scores on calls cleared for use?',"select owner,criterion,average_score from coaching_review where average_score<3 order by owner,criterion"],
 ['Which accounts have more than one open promise?',"select account,count(*) as open_promises from commitment_review where status='open' group by account having count(*)>1 order by account"]
];
export function required(o,key){const v=o[key];if(typeof v!=='string'||!v.trim())throw Error(`--${key} is required`);return v.trim();}
export function date(v,name='date'){if(!/^\d{4}-\d{2}-\d{2}$/.test(v||'')||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`Invalid ${name}: use YYYY-MM-DD`);return v;}
export function integer(v,name,min=0,max=2147483647){if(!/^\d+$/.test(String(v)))throw Error(`${name} must be an integer`);const n=Number(v);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(`${name} out of range`);return n;}
export async function resolve(db,tab,query){
 if(!['meetings','commitments'].includes(tab))throw Error('Unsupported lookup');
 if(!query)throw Error(`Supply a ${tab} name or ID`);
 let rows=await db.query(`select id,title from ${tab} where lower(title)=lower($1) or id::text=$1 order by title,id`,[query]);
 if(!rows.length)rows=await db.query(`select id,title from ${tab} where strpos(lower(title),lower($1))>0 or starts_with(id::text,lower($1)) order by title,id`,[query]);
 if(rows.length!==1){const e=Error(rows.length?'Ambiguous name: choose one ID':'No matching record');e.candidates=rows;throw e;}
 return rows[0];
}
export function parseTranscript(raw,extension){
 const text=raw.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
 if(text.includes('\u0000')||text.includes('\ufffd'))throw Error('Transcript must be valid UTF-8 text');
 if(extension==='.txt'){
  const lines=text.split('\n').map(s=>s.trim()).filter(Boolean);
  if(!lines.length)throw Error('Transcript is empty');
  return lines.map((body,i)=>({sequence:i+1,speaker:'Unlabelled',start_ms:null,end_ms:null,body}));
 }
 if(extension!=='.vtt'||!/^WEBVTT(?:[ \t].*)?\n/.test(text))throw Error('Use an Avoma .vtt or .txt download with a valid header');
 const time=v=>{const m=v.match(/^(?:(\d{2,}):)?(\d{2}):(\d{2})\.(\d{3})$/);if(!m||+m[2]>59||+m[3]>59)throw Error('Invalid VTT timestamp');return integer((+m[1]||0)*3600000+(+m[2])*60000+(+m[3])*1000+(+m[4]),'timestamp');};
 const decode=s=>s.replace(/&(amp|lt|gt|nbsp|quot|apos);/g,(_,k)=>({amp:'&',lt:'<',gt:'>',nbsp:' ',quot:'"',apos:"'"}[k]));
 const out=[];let prior=-1;
 for(const block of text.split(/\n[ \t]*\n/).slice(1)){
  if(!block.trim()||/^(NOTE|STYLE|REGION)(?:\s|$)/.test(block))continue;
  const lines=block.split('\n');const ti=lines.findIndex(s=>s.includes('-->'));
  if(ti<0)throw Error('Malformed VTT cue');
  const match=lines[ti].trim().match(/^(\S+)\s+-->\s+(\S+)(?:\s+.*)?$/);if(!match)throw Error('Malformed VTT timing');
  const start_ms=time(match[1]),end_ms=time(match[2]);if(end_ms<=start_ms||start_ms<prior)throw Error('Invalid VTT cue order or duration');prior=start_ms;
  const cue=lines.slice(ti+1).join('\n').trim();
  const speaker=decode(cue.match(/<v(?:\.[^\s>]*)?\s+([^>]+)>/)?.[1]||'Unlabelled');
  const body=decode(cue.replace(/<[^>]+>/g,'')).trim();if(!body)throw Error('Empty VTT cue');
  out.push({sequence:out.length+1,speaker,start_ms,end_ms,body});
 }
 if(!out.length)throw Error('Transcript has no cues');return out;
}
async function audit(db,meeting,actor,action,detail){await db.query('insert into activity(meeting_id,actor,action,detail) values($1,$2,$3,$4)',[meeting,actor,action,detail]);}
async function writable(db,o,fn){required(o,'actor');await db.exec('BEGIN');try{const result=await fn();await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return {...result,dry_run:Boolean(o['dry-run'])};}catch(e){await db.exec('ROLLBACK');throw e;}}
async function cleared(db,id){const [r]=await db.query('select review_state from meeting_review where id=$1',[id]);if(r?.review_state!=='Ready')throw Error('Call needs privacy and transcript review before this operation');}
async function evidence(db,m,o){
 const seq=integer(required(o,'segment'),'segment',1);const quote=required(o,'quote');
 const [s]=await db.query('select * from segments where meeting_id=$1 and sequence=$2',[m.id,seq]);
 if(!s||!s.body.includes(quote))throw Error('Quote must match the selected transcript segment exactly');return {...s,quote};
}
export async function importAvoma(db,args,o){
 if(args.length!==2||args[0]!=='avoma')throw Error('import avoma <file.vtt|file.txt>');
 const source_id=required(o,'source-id'),title=required(o,'title'),account=required(o,'account'),owner=required(o,'owner');
 const held_on=date(required(o,'date'));if(held_on>new Date().toISOString().slice(0,10))throw Error('Meeting date cannot be in the future');
 if(fs.statSync(args[1]).size>10*1024*1024)throw Error('Transcript exceeds 10 MB');
 const raw=fs.readFileSync(args[1],'utf8');const segments=parseTranscript(raw,path.extname(args[1]).toLowerCase());
 const hash=createHash('sha256').update(JSON.stringify({raw,title,account,owner,held_on})).digest('hex');
 return writable(db,o,async()=>{
  const [old]=await db.query('select id,source_hash from meetings where source_id=$1',[source_id]);
  if(old){if(old.source_hash!==hash)throw Error('Source ID already exists with changed transcript or metadata');return {id:old.id,inserted:0,skipped:1,segments:segments.length};}
  const [m]=await db.query('insert into meetings(source_id,title,account,owner,held_on,source_hash,raw_transcript) values($1,$2,$3,$4,$5,$6,$7) returning id',[source_id,title,account,owner,held_on,hash,raw]);
  for(const s of segments)await db.query('insert into segments(meeting_id,sequence,speaker,start_ms,end_ms,body) values($1,$2,$3,$4,$5,$6)',[m.id,s.sequence,s.speaker,s.start_ms,s.end_ms,s.body]);
  await audit(db,m.id,o.actor,'import','Avoma transcript imported, review required');
  return {id:m.id,inserted:1,skipped:0,segments:segments.length};
 });
}
function writePrivate(dir,stem,ext,content){const root=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,dir);fs.mkdirSync(root,{recursive:true,mode:0o700});const file=path.join(root,`${stem}-${randomUUID()}.${ext}`);fs.writeFileSync(file,content,{mode:0o600,flag:'wx'});return {file};}
export async function execute(db,command,args=[],o={}){
 if(reads[command]){if(args.length)throw Error('Unexpected positional argument');return db.query(reads[command]);}
 if(command==='insights'){const out=[];for(const [question,sql] of questions)out.push({question,rows:await db.query(sql)});return out;}
 if(command==='weekly-review')return {calls:await execute(db,'call-review'),commitments:await execute(db,'commitments-due'),compliance:await execute(db,'compliance')};
 if(command==='import')return importAvoma(db,args,o);
 if(command==='export'){
  await db.exec('BEGIN READ ONLY');try{const records={};for(const tab of tables)records[tab]=await db.query(`select * from ${tab} order by id`);return writePrivate('exports','conversations','json',JSON.stringify({format:1,exported_at:new Date().toISOString(),records},null,2)+'\n');}finally{await db.exec('ROLLBACK');}
 }
 if(command==='draft-weekly-brief'){const data=await execute(db,'weekly-review');return writePrivate('drafts','weekly-brief','md','# Internal draft: weekly conversation review\n\nContains restricted metadata. Review before sharing.\n\n'+JSON.stringify(data,null,2)+'\n');}
 const allowed=['transcript','meeting','review-meeting','add-commitment','resolve-commitment','observe','score-call','log','draft-follow-up','draft-coaching'];
 if(!allowed.includes(command))throw Error('Unknown command. Use --help');
 if(args.length!==1)throw Error('Supply exactly one meeting or commitment name/ID');
 if(command==='resolve-commitment')return writable(db,o,async()=>{
  const c=await resolve(db,'commitments',args[0]);const status=required(o,'status');if(!['done','cancelled'].includes(status))throw Error('status must be done or cancelled');
  const note=required(o,'note');const [row]=await db.query("update commitments set status=$1,resolution=$2,resolved_on=current_date where id=$3 and status='open' returning *",[status,note,c.id]);if(!row)throw Error('Commitment already resolved');
  await audit(db,row.meeting_id,o.actor,command,`${row.id}: ${status}`);return row;
 });
 const m=await resolve(db,'meetings',args[0]);
 if(command==='transcript')return db.query('select sequence,speaker,start_ms,end_ms,body from segments where meeting_id=$1 order by sequence',[m.id]);
 if(command==='meeting')return {meeting:(await db.query('select * from meeting_review where id=$1',[m.id]))[0],commitments:await db.query('select * from commitment_review where meeting_id=$1 order by due_on',[m.id]),observations:await db.query('select topic,note,quote,reviewer from observations where meeting_id=$1',[m.id]),scores:await db.query('select criterion,score,note,quote,reviewer from scores where meeting_id=$1',[m.id])};
 if(command.startsWith('draft-')){
  await cleared(db,m.id);
  const rows=command==='draft-follow-up'?await db.query("select title,owner,due_on,quote from commitments where meeting_id=$1 and status='open' order by due_on",[m.id]):await db.query('select criterion,score,note,quote from scores where meeting_id=$1 order by criterion',[m.id]);
  if(!rows.length)throw Error('No evidenced records for this draft');
  return writePrivate('drafts',command,'md',`# Internal draft: ${m.title}\n\nReview the exact wording, recipient and current dates before sharing. Nothing was sent.\n\n`+rows.map(r=>Object.entries(r).map(([k,v])=>`- ${k}: ${v}`).join('\n')).join('\n\n')+'\n');
 }
 return writable(db,o,async()=>{
  let row;
  if(command==='review-meeting'){
   const retention=date(required(o,'retention'),'retention');if(retention<=new Date().toISOString().slice(0,10))throw Error('Retention review must be a future date');
   [row]=await db.query('update meetings set purpose=$1,notice_evidence=$2,retention_review_on=$3,reviewed_on=current_date,reviewed_by=$4 where id=$5 returning id,title,reviewed_on,retention_review_on',[required(o,'purpose'),required(o,'notice'),retention,o.actor,m.id]);
  }else if(command==='log'){
   await audit(db,m.id,o.actor,'note',required(o,'note'));return {id:m.id,logged:true};
  }else{
   await cleared(db,m.id);const e=await evidence(db,m,o);
   if(command==='add-commitment'){
    const due=date(required(o,'due'),'due');const [held]=await db.query('select held_on::text from meetings where id=$1',[m.id]);if(due<held.held_on)throw Error('Commitment due date precedes meeting');
    [row]=await db.query('insert into commitments(meeting_id,segment_id,quote,title,owner,due_on) values($1,$2,$3,$4,$5,$6) returning *',[m.id,e.id,e.quote,required(o,'title'),required(o,'owner'),due]);
   }else if(command==='observe'){
    [row]=await db.query('insert into observations(meeting_id,segment_id,quote,topic,note,reviewer) values($1,$2,$3,$4,$5,$6) returning *',[m.id,e.id,e.quote,required(o,'topic'),required(o,'note'),o.actor]);
   }else if(command==='score-call'){
    [row]=await db.query('insert into scores(meeting_id,segment_id,quote,criterion,score,note,reviewer) values($1,$2,$3,$4,$5,$6,$7) returning *',[m.id,e.id,e.quote,required(o,'criterion'),integer(required(o,'score'),'score',0,5),required(o,'note'),o.actor]);
   }
  }
  await audit(db,m.id,o.actor,command,row.id);return row;
 });
}
