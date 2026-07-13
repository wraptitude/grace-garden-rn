import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/features/graceGarden/assets");
const assets = [
  ["backgrounds/sky/sky_day_gradient.png", false],
  ["effects/clouds/cloud_back_large.png", true],
  ["effects/clouds/cloud_mid_medium.png", true],
  ["effects/clouds/cloud_front_wide.png", true],
  ["terrain/islands/floating_island_base.png", true],
  ["terrain/islands/floating_island_front.png", true],
  ["terrain/islands/floating_island_shadow.png", true],
  ["decorations/seating/garden_bench.png", true],
  ["decorations/lighting/garden_lamp.png", true],
  ["decorations/water/garden_well.png", true],
  ["decorations/structures/garden_arch.png", true],
  ["decorations/seating/garden_hammock.png", true],
  ["decorations/boundaries/garden_fence.png", true],
  ["decorations/dining/garden_patio_set.png", true],
  ["decorations/water/grace_fountain.png", true],
  ["thumbnails/garden_bench.png", true],
  ["thumbnails/garden_lamp.png", true],
  ["thumbnails/garden_well.png", true],
  ["thumbnails/garden_arch.png", true],
  ["thumbnails/garden_hammock.png", true],
  ["thumbnails/garden_fence.png", true],
  ["thumbnails/garden_patio_set.png", true],
  ["thumbnails/grace_fountain.png", true],
];
function readPngInfo(filepath) {
  const buffer=fs.readFileSync(filepath);
  const signature=Buffer.from([137,80,78,71,13,10,26,10]);
  if(buffer.length<26||!buffer.subarray(0,8).equals(signature)) throw new Error("not a valid PNG signature");
  if(buffer.toString("ascii",12,16)!=="IHDR") throw new Error("missing PNG IHDR chunk");
  return {width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20),bitDepth:buffer[24],colorType:buffer[25]};
}
let failed=false;
for(const [relativePath,requiresAlpha] of assets){
  const filepath=path.join(root,relativePath);
  try{
    if(!fs.existsSync(filepath)) throw new Error("file is missing");
    const info=readPngInfo(filepath); const hasAlpha=info.colorType===4||info.colorType===6;
    if(requiresAlpha&&!hasAlpha) throw new Error(`PNG has no alpha channel (color type ${info.colorType})`);
    console.log(`✓ ${relativePath} — ${info.width}x${info.height}, colorType=${info.colorType}`);
  }catch(error){failed=true;console.error(`✗ ${relativePath} — ${error instanceof Error?error.message:String(error)}`);}
}
if(failed) process.exitCode=1; else console.log(`\nAll ${assets.length} Grace Garden assets passed validation.`);
