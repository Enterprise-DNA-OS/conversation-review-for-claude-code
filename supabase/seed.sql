insert into meetings(id,source_id,title,account,owner,held_on,source_hash,raw_transcript,purpose,notice_evidence,retention_review_on,reviewed_on,reviewed_by) values
('10000000-0000-0000-0000-000000000001','demo-discovery','Harbour discovery','Harbour Fixtures','Mia Chen',current_date-12,'fictional-1','Fictional demo transcript.','Service follow-up','Demo notice acknowledged',current_date+90,current_date-11,'Demo reviewer'),
('10000000-0000-0000-0000-000000000002','demo-renewal','Harbour renewal','Harbour Fixtures','Mia Chen',current_date-40,'fictional-2','Fictional demo transcript.','Renewal follow-up','Demo notice acknowledged',current_date-2,current_date-39,'Demo reviewer'),
('10000000-0000-0000-0000-000000000003','demo-alpine','Alpine handover','Alpine Supplies','Noah Patel',current_date-3,'fictional-3','Fictional demo transcript.',null,null,null,null,null)
on conflict do nothing;
insert into segments(id,meeting_id,sequence,speaker,start_ms,end_ms,body) values
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',1,'Buyer',0,9000,'We need a stock exception report before we can decide.'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',2,'Mia Chen',10000,22000,'I will send the sample report on Friday. Who else needs to review it?'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002',1,'Buyer',0,10000,'The operations director has not signed off on renewal.'),
('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000002',2,'Mia Chen',11000,21000,'I will arrange a review with the operations director.'),
('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000003',1,'Buyer',0,12000,'Please confirm who owns our stock migration.'),
('20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000003',2,'Noah Patel',13000,20000,'I will ask delivery to confirm the owner.') on conflict do nothing;
insert into commitments(id,meeting_id,segment_id,quote,title,owner,due_on) values
('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','I will send the sample report on Friday.','Send sample stock report','Mia Chen',current_date-7),
('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000004','I will arrange a review with the operations director.','Arrange renewal review','Mia Chen',current_date-21) on conflict do nothing;
insert into observations(id,meeting_id,segment_id,quote,topic,note,reviewer) values
('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','We need a stock exception report','decision blocker','Buyer needs evidence before deciding.','Demo reviewer'),
('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','has not signed off on renewal','decision blocker','Renewal authority remains unconfirmed.','Demo reviewer') on conflict do nothing;
insert into scores(id,meeting_id,segment_id,quote,criterion,score,note,reviewer) values
('50000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','Who else needs to review it?','decision process',4,'Asked about additional reviewers.','Demo reviewer'),
('50000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000004','I will arrange a review','decision process',2,'No specific next review date in this cue.','Demo reviewer') on conflict do nothing;
