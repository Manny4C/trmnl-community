CREATE TABLE IF NOT EXISTS tp_world (id integer PRIMARY KEY CHECK(id=1), state jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS tp_moves (
 turn bigint PRIMARY KEY, actor text NOT NULL, day date NOT NULL, nonce text UNIQUE NOT NULL,
 action text NOT NULL, x integer NOT NULL, y integer NOT NULL, kind text NOT NULL,
 message text NOT NULL, chapter integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(actor,day)
);
CREATE TABLE IF NOT EXISTS tp_sessions (id text PRIMARY KEY, actor text NOT NULL, token text NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS tp_oauth_nonces (id text PRIMARY KEY, expires_at timestamptz NOT NULL);
CREATE OR REPLACE FUNCTION tp_island(ch integer) RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
 SELECT jsonb_build_object('chapter',ch,'turn',0,'tiles',to_jsonb(CASE mod(ch-1,3) WHEN 0 THEN ARRAY['~~~~~~~~','~..s...~','~.T.#..~','~..s#..~','~...T..~','~~~~~~~~'] WHEN 1 THEN ARRAY['~~~~~~~~','~..#s..~','~.T....~','~...#T.~','~s.....~','~~~~~~~~'] ELSE ARRAY['~~~~~~~~','~.s..#.~','~...T..~','~T.#...~','~..s...~','~~~~~~~~'] END),'water',6,'seeds',6,'wood',2,'stone',2,'last_autopilot_day',null);
$$;
INSERT INTO tp_world(id,state) VALUES(1,tp_island(1)) ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION tp_move(p_actor text,p_action text,p_x integer,p_y integer,p_nonce text,p_kind text DEFAULT 'player',p_day date DEFAULT ((now() AT TIME ZONE 'UTC')::date))
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s jsonb; tiles text[]; tile text; rowtext text; n bigint; msg text; existing tp_moves%ROWTYPE; groves integer; water integer; seeds integer; wood integer; stone integer; ch integer;
BEGIN
 IF p_actor IS NULL OR length(p_actor)<8 OR p_nonce IS NULL OR length(p_nonce)<16 OR p_kind NOT IN ('player','autopilot') THEN RAISE EXCEPTION 'invalid_request'; END IF;
 SELECT state INTO s FROM tp_world WHERE id=1 FOR UPDATE;
 SELECT * INTO existing FROM tp_moves WHERE nonce=p_nonce;
 IF FOUND THEN
  IF existing.actor<>p_actor OR existing.action<>p_action OR existing.x<>p_x OR existing.y<>p_y THEN RAISE EXCEPTION 'nonce_conflict'; END IF;
  RETURN jsonb_build_object('accepted',true,'duplicate',true,'turn',existing.turn,'message',existing.message);
 END IF;
 IF EXISTS(SELECT 1 FROM tp_moves WHERE actor=p_actor AND day=p_day) THEN RAISE EXCEPTION 'daily_quota'; END IF;
 IF p_x IS NULL OR p_y IS NULL OR p_x<0 OR p_x>7 OR p_y<0 OR p_y>5 THEN RAISE EXCEPTION 'invalid_cell'; END IF;
 tiles=ARRAY(SELECT jsonb_array_elements_text(s->'tiles'));tile=substring(tiles[p_y+1] FROM p_x+1 FOR 1);
 water=(s->>'water')::int;seeds=(s->>'seeds')::int;wood=(s->>'wood')::int;stone=(s->>'stone')::int;ch=(s->>'chapter')::int;n=(s->>'turn')::bigint+1;
 groves=length(array_to_string(tiles,''))-length(replace(array_to_string(tiles,''),'T',''));
 CASE p_action
 WHEN 'plant' THEN
  IF tile<>'.' OR seeds<1 THEN RAISE EXCEPTION 'plant_needs_meadow_and_seed'; END IF;
  tile='s';seeds=seeds-1;msg='Planted a sapling';
 WHEN 'water' THEN
  IF tile<>'s' OR water<1 THEN RAISE EXCEPTION 'water_needs_sapling_and_water'; END IF;
  tile='T';water=water-1;seeds=seeds+2;wood=wood+1;msg='Grew a grove (+2 seeds, +1 wood)';
 WHEN 'gather' THEN
  IF tile='~' THEN water=water+2;msg='Collected 2 water';
  ELSIF tile='T' THEN wood=wood+1;msg='Gathered 1 fallen wood';
  ELSIF tile='#' THEN stone=stone+1;msg='Gathered 1 stone';
  ELSE RAISE EXCEPTION 'gather_needs_water_grove_or_rock';END IF;
 WHEN 'clear' THEN
  IF tile NOT IN ('s','T','B') THEN RAISE EXCEPTION 'clear_needs_sapling_or_grove'; END IF;
  IF tile='T' THEN wood=wood+1; ELSIF tile='B' THEN wood=wood+2;stone=stone+1; ELSE seeds=seeds+1; END IF;
  tile='.';msg='Made a meadow clearing';
 WHEN 'build' THEN
  IF tile<>'.' OR wood<6 OR stone<4 THEN RAISE EXCEPTION 'beacon_needs_meadow_6_wood_4_stone'; END IF;
  tile='B';wood=wood-6;stone=stone-4;msg='Built a beacon';
 WHEN 'sail' THEN
  IF tile<>'B' OR groves<8 THEN RAISE EXCEPTION 'sail_needs_beacon_and_8_groves'; END IF;
  s=tp_island(ch+1)||jsonb_build_object('turn',n,'last_autopilot_day',s->'last_autopilot_day');msg='Sailed to island '||(ch+1);
 ELSE RAISE EXCEPTION 'invalid_action';
 END CASE;
 IF p_action<>'sail' THEN
  rowtext=overlay(tiles[p_y+1] PLACING tile FROM p_x+1 FOR 1);tiles[p_y+1]=rowtext;
  s=s||jsonb_build_object('tiles',to_jsonb(tiles),'turn',n,'water',water,'seeds',seeds,'wood',wood,'stone',stone);
 END IF;
 IF p_kind='autopilot' THEN s=s||jsonb_build_object('last_autopilot_day',p_day); END IF;
 UPDATE tp_world SET state=s WHERE id=1;
 INSERT INTO tp_moves(turn,actor,day,nonce,action,x,y,kind,message,chapter) VALUES(n,p_actor,p_day,p_nonce,p_action,p_x,p_y,p_kind,msg,ch);
 RETURN jsonb_build_object('accepted',true,'duplicate',false,'turn',n,'message',msg);
END $$;
CREATE OR REPLACE FUNCTION tp_autopilot() RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE s jsonb; tiles text[]; day_cursor date; today date=((now() AT TIME ZONE 'UTC')::date); action text; x int; y int; pos int; alltiles text; groves int; result jsonb; moves int=0;
BEGIN
 SELECT state INTO s FROM tp_world WHERE id=1 FOR UPDATE;
 day_cursor=COALESCE((s->>'last_autopilot_day')::date,today-1)+1;
 IF day_cursor<today-30 THEN day_cursor=today-30; END IF;
 WHILE day_cursor<=today LOOP
  tiles=ARRAY(SELECT jsonb_array_elements_text(s->'tiles'));alltiles=array_to_string(tiles,'');groves=length(alltiles)-length(replace(alltiles,'T',''));
  IF position('B' in alltiles)>0 AND groves>=8 THEN action='sail';pos=position('B' in alltiles);
  ELSIF position('s' in alltiles)>0 AND (s->>'water')::int>0 THEN action='water';pos=position('s' in alltiles);
  ELSIF groves<8 AND (s->>'seeds')::int>0 AND position('.' in alltiles)>0 THEN action='plant';pos=position('.' in alltiles);
  ELSIF position('s' in alltiles)>0 AND (s->>'water')::int<1 THEN action='gather';pos=position('~' in alltiles);
  ELSIF groves<8 AND position('.' in alltiles)=0 AND position('B' in alltiles)>0 THEN action='clear';pos=position('B' in alltiles);
  ELSIF (s->>'wood')::int<6 AND position('T' in alltiles)>0 THEN action='gather';pos=position('T' in alltiles);
  ELSIF (s->>'stone')::int<4 THEN action='gather';pos=position('#' in alltiles);
  ELSIF position('.' in alltiles)>0 AND (s->>'wood')::int>=6 THEN action='build';pos=position('.' in alltiles);
  ELSIF position('B' in alltiles)>0 THEN action='clear';pos=position('B' in alltiles);
  ELSE action='clear';pos=position('T' in alltiles);
  END IF;
  IF pos<1 THEN action='gather';pos=position('~' in alltiles); END IF;
  x=mod(pos-1,8);y=(pos-1)/8;
  result=tp_move('owner-autopilot',action,x,y,'owner-autopilot-'||day_cursor,'autopilot',day_cursor);
  moves=moves+1;SELECT state INTO s FROM tp_world WHERE id=1;day_cursor=day_cursor+1;
 END LOOP;
 RETURN jsonb_build_object('moves',moves,'day',today,'last_autopilot_day',s->'last_autopilot_day');
END $$;
