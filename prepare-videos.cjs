const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const ff=path.join(__dirname,'node_modules/ffmpeg-static/ffmpeg.exe');
const run=args=>execFileSync(ff,['-y','-hide_banner','-loglevel','error',...args],{stdio:'inherit'});
const assets=path.join(__dirname,'dist/assets');
const masks={
jetta:[[528,617],[528,561],[534,508],[551,476],[588,451],[661,424],[662,408],[695,387],[741,351],[795,334],[990,329],[1040,345],[1071,371],[1106,410],[1142,425],[1155,472],[1154,536],[1136,589],[1107,600],[1094,594],[973,641],[947,660],[913,665],[878,651],[682,646],[554,641]],
kombajn:[[462,588],[469,482],[485,446],[538,405],[574,389],[626,323],[656,296],[739,279],[869,272],[1122,294],[1138,305],[1163,376],[1168,482],[1175,513],[1170,541],[1145,555],[1142,587],[1126,605],[1099,609],[1074,594],[867,645],[850,669],[811,682],[780,674],[756,650],[557,644],[526,654],[502,641],[483,612]],
pezo:[[542,588],[547,528],[559,483],[580,454],[645,419],[702,375],[762,345],[799,330],[907,322],[964,331],[981,361],[1010,357],[1041,372],[1097,383],[1121,399],[1133,444],[1140,510],[1134,559],[1119,583],[1094,589],[1080,575],[950,630],[929,650],[899,655],[871,641],[669,640],[574,627],[551,612]]};
function mask(name,points){const w=1280,h=720,pixels=Buffer.alloc(w*h);for(let y=0;y<h;y++){let crosses=[];for(let i=0,j=points.length-1;i<points.length;j=i++){let a=points[i],b=points[j];if((a[1]>y)!=(b[1]>y))crosses.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}crosses.sort((a,b)=>a-b);for(let i=0;i<crosses.length;i+=2)pixels.fill(255,y*w+Math.max(0,Math.floor(crosses[i])),y*w+Math.min(w,Math.ceil(crosses[i+1])));}fs.writeFileSync(`qa/${name}-mask.pgm`,Buffer.concat([Buffer.from(`P5\n${w} ${h}\n255\n`),pixels]));}
const stops={golf:3.15,seat:2.1,mazda:2.1,passat:2.1,jetta:2.9,kombajn:2.9,pezo:2.9};
for(const name of Object.keys(stops)){
 const src=path.resolve(__dirname,'..',name+'.mp4'),out=path.join(assets,name+'.mp4');
 if(masks[name]){
  mask(name,masks[name]);
  run(['-i',src,'-vf','scale=1280:720','-frames:v','1',`qa/${name}-first.png`]);
  run(['-loop','1','-i',path.resolve(__dirname,'../Auta/Golf-Plus/01-start.png'),'-loop','1','-i',`qa/${name}-first.png`,'-loop','1','-i',`qa/${name}-mask.pgm`,'-filter_complex',"[0:v]scale=1280:720,setsar=1[bg];[2:v]gblur=sigma=1.2[m];[1:v][m]alphamerge[car];[bg][car]overlay=x='800*pow(max(0,1-t/2.5),2)':y='-65*pow(max(0,1-t/2.5),2)':shortest=1,format=yuv420p[v]",'-map','[v]','-t','2.6','-r','30','-c:v','libx264','-preset','fast','-crf','20',`qa/${name}-arrival.mp4`]);
  run(['-i',`qa/${name}-arrival.mp4`,'-i',src,'-filter_complex',"[0:v]fps=30,settb=AVTB,setsar=1[a];[1:v]scale=1280:720,fps=30,settb=AVTB,setsar=1[b];[a][b]xfade=transition=fade:duration=0.2:offset=2.4,format=yuv420p[v]",'-map','[v]','-an','-c:v','libx264','-preset','fast','-crf','21','-movflags','+faststart',out]);
 } else run(['-i',src,'-vf','scale=1280:720,setsar=1','-an','-c:v','libx264','-preset','fast','-crf','21','-r','30','-movflags','+faststart',out]);
 if(name==='jetta'){
  // This source ends before the rear bumper clears the left edge.
  // Extend the last foreground motion over a patched stationary street.
  run(['-sseof','-0.04','-i',out,'-frames:v','1','qa/jetta-tail.png']);
  mask('jetta-tail',[[0,250],[48,265],[100,318],[164,363],[215,410],[276,430],[294,471],[294,545],[307,602],[322,633],[320,720],[0,720]]);
  run(['-loop','1','-i','qa/jetta-tail.png','-loop','1','-i',path.resolve(__dirname,'../Auta/Golf-Plus/01-start.png'),'-loop','1','-i','qa/jetta-tail-mask.pgm','-filter_complex',"[0:v]split=2[last][car];[2:v]gblur=sigma=1,split=2[m1][m2];[1:v]scale=1280:720,setsar=1[empty];[empty][m1]alphamerge[patch];[last][patch]overlay=0:0[bg];[car][m2]alphamerge[cutout];[bg][cutout]overlay=x='-650*t':y=0,format=yuv420p[v]",'-map','[v]','-t','0.65','-r','30','-c:v','libx264','-crf','21','qa/jetta-tail.mp4']);
  run(['-i',out,'-i','qa/jetta-tail.mp4','-filter_complex','[0:v][1:v]concat=n=2:v=1:a=0[v]','-map','[v]','-c:v','libx264','-preset','fast','-crf','21','-movflags','+faststart','qa/jetta-complete.mp4']);
  fs.copyFileSync('qa/jetta-complete.mp4',out);
 }
 run(['-ss',String(stops[name]),'-i',out,'-frames:v','1','-q:v','2',path.join(assets,name+'-poster.jpg')]);
 console.log('Prepared '+name);
}
