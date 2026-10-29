#!/usr/bin/env node
import {getDb} from './lib/db.mjs';
import {execute,reads} from './lib/conversations.mjs';
import {table} from './lib/format.mjs';
const options={
 import:['actor','dry-run','source-id','title','account','owner','date'],
 'review-meeting':['actor','dry-run','retention','purpose','notice'],
 'add-commitment':['actor','dry-run','segment','quote','title','owner','due'],
 'resolve-commitment':['actor','dry-run','status','note'],
 observe:['actor','dry-run','segment','quote','topic','note'],
 'score-call':['actor','dry-run','segment','quote','criterion','score','note'],
 log:['actor','dry-run','note']
};
const argv=process.argv.slice(2);let db;
try{
 if(argv.includes('--help')||!argv.length){console.log('Conversation review CLI\n'+[...Object.keys(reads),'transcript <meeting>','meeting <meeting>','insights','weekly-review',...Object.keys(options),'draft-follow-up <meeting>','draft-coaching <meeting>','draft-weekly-brief','export'].join('\n')+'\nOptions: --json; writes require --actor. Use --key=value. See docs/cli.md.');process.exit(0);}
 const command=argv.shift(),args=[],o={};
 for(const arg of argv){if(!arg.startsWith('--')){args.push(arg);continue;}const i=arg.indexOf('=');const key=arg.slice(2,i<0?undefined:i);if(!['json',...(options[command]||[])].includes(key))throw Error(`Unknown option --${key}`);if(key in o)throw Error(`Repeated --${key}`);if(['json','dry-run'].includes(key)){if(i>=0)throw Error(`--${key} takes no value`);o[key]=true;}else{if(i<0)throw Error(`Use --${key}=value`);o[key]=arg.slice(i+1);}}
 if(['insights','weekly-review','export','draft-weekly-brief'].includes(command)&&args.length)throw Error('Unexpected positional argument');
 db=await getDb();const result=await execute(db,command,args,o);
 if(o.json)console.log(JSON.stringify(result,null,2));
 else if(Array.isArray(result)&&!result.some(x=>x.rows))console.log(table(result,Object.keys(result[0]||{}).map(key=>({key,label:key.replaceAll('_',' '),width:key==='body'?110:42}))));
 else console.log(JSON.stringify(result,null,2));
}catch(e){console.error(JSON.stringify({error:e.message,...(e.candidates?{candidates:e.candidates}:{})},null,2));process.exitCode=1;}finally{if(db)await db.close();}
