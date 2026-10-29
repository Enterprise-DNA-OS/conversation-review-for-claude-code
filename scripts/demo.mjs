import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {getDb,REPO_ROOT} from './lib/db.mjs';import {migrate} from './migrate.mjs';import {seed} from './seed.mjs';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'conversation-demo-'));process.env.DATABASE_URL='';process.env.DATA_DIR=path.join(temp,'db');process.env.OUTPUT_DIR=temp;
let db;
try{db=await getDb();await migrate(db);await seed(db);await db.close();db=null;
 for(const cmd of ['call-review','commitments-due','coaching']){console.log('\n'+cmd);const p=spawnSync(process.execPath,['scripts/conversations.mjs',cmd],{cwd:REPO_ROOT,env:process.env,encoding:'utf8'});if(p.status!==0)throw Error(p.stderr);console.log(p.stdout);}
 console.log('Demo finished with temporary fictional data. No working database changed.');
}finally{if(db)await db.close();fs.rmSync(temp,{recursive:true,force:true});}
