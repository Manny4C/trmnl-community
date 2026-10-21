DROP FUNCTION IF EXISTS td_paint(text,jsonb,text,date);
ALTER TABLE td_canvas DROP CONSTRAINT IF EXISTS td_canvas_pixels_check;
ALTER TABLE td_canvas ADD CONSTRAINT td_canvas_pixels_check CHECK(length(pixels) IN (6000,384000) AND pixels !~ '[^0-9A-F]');
CREATE OR REPLACE FUNCTION td_native_upgrade(p_native_seed text,p_legacy_seed text) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE drawing td_canvas%ROWTYPE; upgraded text; changed_count int; legacy_pos int; row_offset int; pigment text;
BEGIN
 SELECT * INTO drawing FROM td_canvas WHERE id=1 FOR UPDATE;
 IF NOT FOUND OR length(drawing.pixels)=384000 THEN RETURN jsonb_build_object('upgraded',false); END IF;
 IF length(drawing.pixels)<>6000 OR length(p_legacy_seed)<>6000 OR length(p_native_seed)<>384000 THEN RAISE EXCEPTION 'invalid_upgrade'; END IF;
 SELECT count(*) INTO changed_count FROM generate_series(1,6000) AS i WHERE substring(drawing.pixels FROM i FOR 1)<>substring(p_legacy_seed FROM i FOR 1);
 upgraded=p_native_seed;
 IF changed_count>0 THEN
  FOR legacy_pos IN SELECT i FROM generate_series(0,5999) AS i WHERE substring(drawing.pixels FROM i+1 FOR 1)<>substring(p_legacy_seed FROM i+1 FOR 1) LOOP
   pigment=repeat(substring(drawing.pixels FROM legacy_pos+1 FOR 1),8);
   FOR row_offset IN 0..7 LOOP
    upgraded=overlay(upgraded PLACING pigment FROM ((legacy_pos/100)*8+row_offset)*800+(legacy_pos%100)*8+1 FOR 8);
   END LOOP;
  END LOOP;
 END IF;
 UPDATE td_canvas SET pixels=upgraded,version=drawing.version+1,updated_at=now() WHERE id=1;
 INSERT INTO td_snapshots(version,pixels) VALUES(drawing.version+1,upgraded);
 -- Existing audit events, daily allowances, sessions and immutable snapshots are untouched.
 RETURN jsonb_build_object('upgraded',true,'version',drawing.version+1,'preserved_legacy_cells',changed_count);
END $$;
