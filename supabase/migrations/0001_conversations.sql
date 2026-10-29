create function touch_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table meetings (
 id uuid primary key default gen_random_uuid(), source_id text not null unique,
 title text not null check(length(trim(title))>0), account text not null, owner text not null,
 held_on date not null, source_hash text not null, raw_transcript text not null,
 purpose text, notice_evidence text, retention_review_on date, reviewed_on date, reviewed_by text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table segments (
 id uuid primary key default gen_random_uuid(), meeting_id uuid not null references meetings(id),
 sequence integer not null check(sequence>0), speaker text not null default 'Unlabelled',
 start_ms integer check(start_ms>=0), end_ms integer check(end_ms>start_ms), body text not null check(length(trim(body))>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(meeting_id,sequence), unique(id,meeting_id)
);
create table commitments (
 id uuid primary key default gen_random_uuid(), meeting_id uuid not null references meetings(id),
 segment_id uuid not null, quote text not null check(length(trim(quote))>0),
 title text not null, owner text not null, due_on date not null,
 status text not null default 'open' check(status in ('open','done','cancelled')),
 resolution text, resolved_on date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(segment_id,meeting_id) references segments(id,meeting_id),
 check((status='open' and resolution is null and resolved_on is null) or (status<>'open' and length(trim(resolution))>0 and resolved_on is not null))
);
create table observations (
 id uuid primary key default gen_random_uuid(), meeting_id uuid not null references meetings(id),
 segment_id uuid not null, quote text not null check(length(trim(quote))>0),
 topic text not null, note text not null, reviewer text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(segment_id,meeting_id) references segments(id,meeting_id)
);
create table scores (
 id uuid primary key default gen_random_uuid(), meeting_id uuid not null references meetings(id),
 segment_id uuid not null, quote text not null check(length(trim(quote))>0),
 criterion text not null, score integer not null check(score between 0 and 5), note text not null, reviewer text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(segment_id,meeting_id) references segments(id,meeting_id), unique(meeting_id,criterion)
);
create table activity (
 id uuid primary key default gen_random_uuid(), meeting_id uuid references meetings(id),
 actor text not null, action text not null, detail text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function immutable_activity() returns trigger language plpgsql as $$ begin raise exception 'activity is append-only'; end $$;
create trigger activity_immutable before update or delete on activity for each row execute function immutable_activity();
create function evidence_quote_check() returns trigger language plpgsql as $$
 declare actual text;
 begin
 select body into actual from segments where id=new.segment_id and meeting_id=new.meeting_id;
 if actual is null or position(new.quote in actual)=0 then raise exception 'quote must occur in the linked segment'; end if;
 return new;
 end $$;
do $$ declare tab text; begin
 foreach tab in array array['meetings','segments','commitments','observations','scores','activity'] loop
 execute format('alter table %I enable row level security',tab);
 execute format('revoke all on %I from public',tab);
 if tab<>'activity' then execute format('create trigger updated before update on %I for each row execute function touch_updated()',tab); end if;
 end loop;
 foreach tab in array array['commitments','observations','scores'] loop
 execute format('create trigger evidence before insert or update on %I for each row execute function evidence_quote_check()',tab);
 end loop;
end $$;
create unique index meeting_title_source on meetings(source_id);
create index segment_meeting on segments(meeting_id);
create index commitment_due on commitments(status,due_on);
create view meeting_review with (security_invoker=true) as
select m.id,m.title,m.account,m.owner,m.held_on,
 case when reviewed_on is null then 'Unreviewed' when coalesce(trim(purpose),'')='' or coalesce(trim(notice_evidence),'')='' then 'Missing privacy evidence'
 when retention_review_on is null then 'No retention review' when retention_review_on<=current_date then 'Retention review due' else 'Ready' end as review_state,
 m.retention_review_on,(select count(*) from segments s where s.meeting_id=m.id) as segments,
 (select count(*) from commitments c where c.meeting_id=m.id and c.status='open') as open_commitments
from meetings m;
create view commitment_review with (security_invoker=true) as
select c.id,c.meeting_id,c.title,m.account,c.owner,c.due_on,c.status,
 greatest(current_date-c.due_on,0) as days_overdue,mr.review_state,
 s.sequence as evidence_segment,c.quote,c.resolution
from commitments c join meetings m on m.id=c.meeting_id join meeting_review mr on mr.id=m.id join segments s on s.id=c.segment_id;
create view coaching_review with (security_invoker=true) as
select m.owner,s.criterion,count(*) as reviews,round(avg(s.score),2) as average_score,
 min(s.score) as lowest_score,max(m.held_on) as latest_call
from scores s join meetings m on m.id=s.meeting_id join meeting_review r on r.id=m.id where r.review_state='Ready'
group by m.owner,s.criterion;
create view privacy_exceptions with (security_invoker=true) as
select id,title,owner,'COLLECTION' as rule,'Missing purpose or notice evidence' as issue from meetings where coalesce(trim(purpose),'')='' or coalesce(trim(notice_evidence),'')=''
union all select id,title,owner,'RETENTION','Retention review missing or due' from meetings where retention_review_on is null or retention_review_on<=current_date
union all select id,title,owner,'REVIEW','Transcript not reviewed' from meetings where reviewed_on is null;
revoke all on meeting_review,commitment_review,coaching_review,privacy_exceptions from public;
