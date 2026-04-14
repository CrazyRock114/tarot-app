#!/bin/bash
SKILL_DIR="/home/ecs-user/.openclaw/workspace/skills/draw-image"
OUT_DIR="/home/ecs-user/.openclaw/workspace/tarot-app/client/public/cards"
mkdir -p "$OUT_DIR"

STYLE="Mystical art nouveau style with ornate golden border frame, deep purple and midnight blue background with stars, rich gold accents and decorative flourishes. Traditional tarot card proportions (portrait). Style: hand-painted mystical illustration, detailed linework, luminous colors, ethereal glow."
NEG="blurry, low quality, photorealistic, modern, cartoon, anime, chibi, text errors, watermark"

generate() {
  local file="$1" prompt="$2"
  if [ -f "$OUT_DIR/$file" ]; then
    echo "SKIP: $file"
    return
  fi
  echo "START: $file"
  cd "$SKILL_DIR" && python3 scripts/generate_image.py \
    "Tarot card illustration: $prompt. $STYLE" \
    --negative "$NEG" \
    --size 1024x1792 \
    --output "$OUT_DIR/$file" 2>&1 | tail -1
  echo "DONE: $file"
}

MAX_JOBS=3
job_count=0
run_job() {
  generate "$@" &
  job_count=$((job_count + 1))
  if [ "$job_count" -ge "$MAX_JOBS" ]; then
    wait -n 2>/dev/null || wait
    job_count=$((job_count - 1))
  fi
}

run_job "01-magician.jpg" "The Magician (I). A robed figure before an altar with wand, cup, sword, pentacle. One hand points sky, other to earth. Infinity symbol above head. Roses and lilies surround"
run_job "02-high-priestess.jpg" "The High Priestess (II). Serene woman between two pillars black and white, holding scroll of wisdom. Crescent moon at feet, veil of pomegranates behind"
run_job "03-empress.jpg" "The Empress (III). Regal woman in lush garden with golden wheat and flowing water. Crown of twelve stars, flowing robes. Nature blooms abundantly"
run_job "04-emperor.jpg" "The Emperor (IV). Powerful ruler on stone throne with ram heads. Armor beneath red robes, ankh scepter and orb. Mountains behind"
run_job "05-hierophant.jpg" "The Hierophant (V). Spiritual leader between two pillars, ceremonial vestments, triple crown. Two followers kneel. Staff and blessing gesture. Crossed keys"
run_job "06-lovers.jpg" "The Lovers (VI). Man and woman beneath radiant angel with wings. Tree of Knowledge with serpent behind woman, tree of flames behind man"
run_job "07-chariot.jpg" "The Chariot (VII). Warrior in golden chariot pulled by black and white sphinx. Star-adorned armor, holding wand. City behind, stars above"
run_job "08-strength.jpg" "Strength (VIII). Gentle woman calmly opens jaws of lion, infinity symbol above. White robe with flower garland. Quiet power and courage"
run_job "09-hermit.jpg" "The Hermit (IX). Old sage atop mountain holding lantern with six-pointed star. Grey cloak, staff. Snow peaks in moonlight"
run_job "10-wheel-of-fortune.jpg" "Wheel of Fortune (X). Great golden wheel in sky with alchemical symbols. Sphinx atop, serpent descends, Anubis rises. Four winged creatures in corners"
run_job "11-justice.jpg" "Justice (XI). Crowned figure on throne between pillars, raised sword right hand, balanced scales left. Red and green robes"
run_job "12-hanged-man.jpg" "The Hanged Man (XII). Young man hangs upside down from living tree by one foot, other leg crossed. Golden halo, serene face, autumn leaves"
run_job "13-death.jpg" "Death (XIII). Skeletal knight in black armor on white horse, black banner with white rose. King fallen, bishop prays, sun rises between towers"
run_job "14-temperance.jpg" "Temperance (XIV). Angel with wings, one foot on land one in water, pouring liquid between two golden chalices. Radiant path to horizon. Irises bloom"
run_job "15-devil.jpg" "The Devil (XV). Horned winged demon on dark throne. Man and woman chained loosely below with small horns. Inverted pentagram glows. Chains are loose"
run_job "16-tower.jpg" "The Tower (XVI). Tall stone tower struck by lightning, crown blown off in flames. Two figures fall. Dark stormy sky, sparks rain down"
run_job "17-star.jpg" "The Star (XVII). Woman kneels by pool under starry sky, one great star and seven small stars. Pours water from two jugs. Bird in tree. Serene"
run_job "18-moon.jpg" "The Moon (XVIII). Full moon with face over winding path between two towers. Wolf and dog howl. Crayfish from pool. Dreamlike mysterious"
run_job "19-sun.jpg" "The Sun (XIX). Radiant golden sun over walled garden. Joyful child rides white horse arms outstretched. Sunflowers bloom. Bright warm happiness"
run_job "20-judgement.jpg" "Judgement (XX). Archangel blows trumpet from clouds, red cross banner. Below people rise from coffins arms raised. Mountains and sea. Spiritual awakening"
run_job "21-world.jpg" "The World (XXI). Dancing figure in purple sash within laurel wreath, holding two wands. Four corners: angel, eagle, lion, bull. Completion and wholeness"

wait
echo "=== ALL 21 CARDS DONE ==="
ls -la "$OUT_DIR"
