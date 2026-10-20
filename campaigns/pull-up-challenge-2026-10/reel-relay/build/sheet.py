import subprocess,sys,io
from PIL import Image,ImageDraw,ImageFont
name=sys.argv[1]; times=[float(x) for x in sys.argv[2].split(',')]; out=sys.argv[3]
W,H=270,480; cols=min(len(times),7); rows=(len(times)+cols-1)//cols
sheet=Image.new('RGB',(cols*W,rows*H),'black'); d=ImageDraw.Draw(sheet)
f=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf',26)
for i,t in enumerate(times):
    png=subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',f'build/proxy/{name}.mp4','-frames:v','1','-vf',f'scale={W}:{H}','-f','image2pipe','-vcodec','png','-'],capture_output=True).stdout
    im=Image.open(io.BytesIO(png)); x,y=(i%cols)*W,(i//cols)*H; sheet.paste(im,(x,y))
    d.rectangle([x,y,x+150,y+34],fill='black'); d.text((x+6,y+4),f'{i+1}: {t:.2f}',fill='yellow',font=f)
sheet.save(out,quality=80)
