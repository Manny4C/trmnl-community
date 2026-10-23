CREATE TABLE IF NOT EXISTS td_artwork_upgrades(name text PRIMARY KEY,version bigint NOT NULL,preserved_cells integer NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE OR REPLACE FUNCTION td_photo_upgrade(p_old text,p_photo text) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE drawing td_canvas%ROWTYPE; upgraded text; retained int; board_bytes bytea; old_bytes bytea; photo_bytes bytea;
BEGIN
 SELECT * INTO drawing FROM td_canvas WHERE id=1 FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'canvas_missing'; END IF;
 IF EXISTS(SELECT 1 FROM td_artwork_upgrades WHERE name='generated-cat-photo-2026-10-22') THEN RETURN jsonb_build_object('upgraded',false); END IF;
 IF length(drawing.pixels)<>384000 OR length(p_old)<>384000 OR length(p_photo)<>384000 OR p_photo ~ '[^0-9A-F]' THEN RAISE EXCEPTION 'invalid_photo_upgrade'; END IF;
 IF drawing.pixels=p_photo THEN
  INSERT INTO td_artwork_upgrades(name,version,preserved_cells) VALUES('generated-cat-photo-2026-10-22',drawing.version,0);
  RETURN jsonb_build_object('upgraded',false,'already_photo',true);
 END IF;
 board_bytes=convert_to(drawing.pixels,'UTF8');old_bytes=convert_to(p_old,'UTF8');photo_bytes=convert_to(p_photo,'UTF8');
 -- Production had NO legacy edits before its native upgrade. Thus every audited placement
 -- belongs to the native grid. Retain touched cells even when repainted to the old seed color.
 WITH touched AS (
  SELECT i AS pos FROM generate_series(0,383999) AS i WHERE get_byte(board_bytes,i)<>get_byte(old_bytes,i)
  UNION
  SELECT (cell->>'y')::int*800+(cell->>'x')::int FROM td_edits CROSS JOIN LATERAL jsonb_array_elements(pixels) AS cell
 )
 SELECT string_agg(chr(CASE WHEN touched.pos IS NOT NULL THEN get_byte(board_bytes,i) ELSE get_byte(photo_bytes,i) END),'' ORDER BY i),count(touched.pos)::int
 INTO upgraded,retained FROM generate_series(0,383999) AS i LEFT JOIN touched ON touched.pos=i;
 UPDATE td_canvas SET pixels=upgraded,version=drawing.version+1,updated_at=now() WHERE id=1;
 INSERT INTO td_snapshots(version,pixels) VALUES(drawing.version+1,upgraded);
 INSERT INTO td_artwork_upgrades(name,version,preserved_cells) VALUES('generated-cat-photo-2026-10-22',drawing.version+1,retained);
 DELETE FROM td_snapshots WHERE version<drawing.version+1-255;
 RETURN jsonb_build_object('upgraded',true,'version',drawing.version+1,'preserved_cells',retained);
END $$;
