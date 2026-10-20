# rows = reps, cols = frames around a centre time; pick the top frame by eye
import subprocess,sys,io
from PIL import Image,ImageDraw,ImageFont
name=sys.argv[1]; out=sys.argv[3]; offs=[-0.75,-0.6,-0.45,-0.3,-0.15,0,0.15,0.3]
reps=[(r.split(':')[0],float(r.split(':')[1])) for r in sys.argv[2].split(',')]
W,H=150,267; sheet=Image.new('RGB',(W*len(offs)+70,H*len(reps)),'black'); d=ImageDraw.Draw(sheet)
f=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf',20)
for j,(lab,c) in enumerate(reps):
    d.text((4,j*H+H//2),lab,fill='yellow',font=f)
    for i,o in enumerate(offs):
        t=max(0,c+o)
        png=subprocess.run(['ffmpeg','-v','error','-ss',f'{t:.3f}','-i',f'build/proxy/{name}.mp4','-frames:v','1','-vf',f'crop=1080:1080:0:120,scale={W}:{H}','-f','image2pipe','-vcodec','png','-'],capture_output=True).stdout
        sheet.paste(Image.open(io.BytesIO(png)),(70+i*W,j*H)); d.text((70+i*W+4,j*H+4),f'{t:.2f}',fill='yellow',font=f)
sheet.save(out,quality=78)
