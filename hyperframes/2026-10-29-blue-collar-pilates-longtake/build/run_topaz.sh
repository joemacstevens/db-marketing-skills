#!/usr/bin/env bash
# Upscale the locked cut's windows one at a time (gate: don-drops/2026-10-25/TOPAZ_OK).
cd "$(dirname "$0")/../../.."
D=don-drops/2026-10-25
[ -f $D/TOPAZ_OK ] || { echo "no TOPAZ_OK"; exit 1; }
while read c s d n; do
  [ -f $D/upscaled/$n.mp4 ] && { echo "skip $n"; continue; }
  for try in 1 2; do bash $D/upscale.sh $D/raw/$c.mov $s $d $n </dev/null && break; echo "retry $n"; done
done < hyperframes/2026-10-29-blue-collar-pilates-longtake/build/topaz_windows.txt
echo ALLDONE
