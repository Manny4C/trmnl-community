CREATE TABLE IF NOT EXISTS td_canvas(id integer PRIMARY KEY CHECK(id=1),version bigint NOT NULL DEFAULT 0,pixels text NOT NULL CONSTRAINT td_canvas_pixels_check CHECK(length(pixels) IN (6000,384000) AND pixels !~ '[^0-9A-F]'),updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS td_usage(actor text NOT NULL,day date NOT NULL,used integer NOT NULL CHECK(used BETWEEN 0 AND 10),PRIMARY KEY(actor,day));
CREATE TABLE IF NOT EXISTS td_edits(version bigint PRIMARY KEY,actor text NOT NULL,day date NOT NULL,nonce text UNIQUE NOT NULL,pixels jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS td_snapshots(version bigint PRIMARY KEY,pixels text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS td_entries(code text PRIMARY KEY CHECK(code ~ '^[A-HJ-NP-Z2-9]{4}$'),day date UNIQUE NOT NULL,expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS td_sessions(id text PRIMARY KEY,actor text NOT NULL,token text NOT NULL,entry_day date NOT NULL,expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS td_handoffs(id text PRIMARY KEY,actor text NOT NULL,token text NOT NULL,challenge text NOT NULL,session_expires timestamptz NOT NULL,expires_at timestamptz NOT NULL DEFAULT now()+interval '2 minutes');
CREATE OR REPLACE FUNCTION td_paint(p_actor text,p_pixels jsonb,p_nonce text,p_entry_day date,p_format text) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE today date=((now() AT TIME ZONE 'UTC')::date); drawing td_canvas%ROWTYPE; prior td_edits%ROWTYPE; changes jsonb; cell jsonb; x int;y int;c int;e int;n int;used_count int;total bigint;positions int[]='{}';position_index int;board text;
BEGIN
 IF p_actor IS NULL OR p_actor !~ '^[a-f0-9]{64}$' OR p_nonce IS NULL OR p_nonce !~ '^[a-zA-Z0-9_-]{16,80}$' OR p_entry_day IS NULL OR p_entry_day<>today THEN RAISE EXCEPTION 'entry_expired'; END IF;
 IF jsonb_typeof(p_pixels)<>'array' OR jsonb_array_length(p_pixels)<1 OR jsonb_array_length(p_pixels)>10 THEN RAISE EXCEPTION 'invalid_pixels'; END IF;
 SELECT * INTO drawing FROM td_canvas WHERE id=1 FOR UPDATE;
 SELECT * INTO prior FROM td_edits WHERE nonce=p_nonce;
 IF FOUND THEN
  IF prior.actor<>p_actor OR prior.pixels<>p_pixels THEN RAISE EXCEPTION 'nonce_conflict'; END IF;
  SELECT COALESCE((SELECT used FROM td_usage WHERE actor=p_actor AND day=today),0) INTO used_count;
  RETURN jsonb_build_object('accepted',true,'duplicate',true,'version',prior.version,'placed',jsonb_array_length(prior.pixels),'remaining',10-used_count);
 END IF;
 IF p_format IS DISTINCT FROM 'native-v2' OR length(drawing.pixels)<>384000 THEN RAISE EXCEPTION 'canvas_upgrading'; END IF;
 n=jsonb_array_length(p_pixels);SELECT COALESCE((SELECT used FROM td_usage WHERE actor=p_actor AND day=today),0) INTO used_count;
 IF used_count+n>10 THEN RAISE EXCEPTION 'daily_quota'; END IF;
 board=drawing.pixels;
 FOR cell IN SELECT * FROM jsonb_array_elements(p_pixels) LOOP
  IF jsonb_typeof(cell)<>'object' OR NOT(cell ?& ARRAY['x','y','color','expected']) OR jsonb_typeof(cell->'x')<>'number' OR jsonb_typeof(cell->'y')<>'number' OR jsonb_typeof(cell->'color')<>'number' OR jsonb_typeof(cell->'expected')<>'number' OR (cell->>'x') !~ '^\d+$' OR (cell->>'y') !~ '^\d+$' OR (cell->>'color') !~ '^\d+$' OR (cell->>'expected') !~ '^\d+$' THEN RAISE EXCEPTION 'invalid_pixels'; END IF;
  x=(cell->>'x')::int;y=(cell->>'y')::int;c=(cell->>'color')::int;e=(cell->>'expected')::int;
  IF x<0 OR x>=800 OR y<0 OR y>=480 OR c<0 OR c>15 OR e<0 OR e>15 OR (x>=608 AND y>=240) THEN RAISE EXCEPTION 'invalid_pixels'; END IF;
  position_index=y*800+x+1;
  IF position_index=ANY(positions) THEN RAISE EXCEPTION 'duplicate_pixel'; END IF;positions=array_append(positions,position_index);
  IF substring(board FROM position_index FOR 1)<>upper(to_hex(e)) THEN RAISE EXCEPTION 'pixel_conflict'; END IF;
  IF c=e THEN RAISE EXCEPTION 'unchanged_pixel'; END IF;
  board=overlay(board PLACING upper(to_hex(c)) FROM position_index FOR 1);
 END LOOP;
 total=drawing.version+1;
 UPDATE td_canvas SET pixels=board,version=total,updated_at=now() WHERE id=1;
 INSERT INTO td_usage(actor,day,used) VALUES(p_actor,today,n) ON CONFLICT(actor,day) DO UPDATE SET used=td_usage.used+EXCLUDED.used;
 INSERT INTO td_edits(version,actor,day,nonce,pixels) VALUES(total,p_actor,today,p_nonce,p_pixels);
 INSERT INTO td_snapshots(version,pixels) VALUES(total,board);
 DELETE FROM td_snapshots WHERE version<total-255;
 RETURN jsonb_build_object('accepted',true,'duplicate',false,'version',total,'placed',n,'remaining',10-used_count-n);
END $$;
