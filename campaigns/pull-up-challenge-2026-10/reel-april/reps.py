import json
# April's rep tops (source s), from head-at-bar motion detection on IMG_6018, matches Chad's 10 + coach cues
A=[1.2,3.4,6.1,9.1,11.7,14.5,17.4,20.5,27.2,35.6]
# out = hook 1.5 | 0-2.3 1x | 2.3-26.4 4x | 26.4-29.2 1x | 29.2-34.6 4x | 34.6-39.8 1x + hold
def m(s):
    if s<2.3: return 1.5+s
    if s<26.4: return 3.8+(s-2.3)/4
    if s<29.2: return 9.825+(s-26.4)
    if s<34.6: return 12.625+(s-29.2)/4
    return 13.975+(s-34.6)
a=[round(m(s),3) for s in A]
ticks=[m(s) for s in A if 2.3<=s<26.4]
json.dump({"april":a,"ticks":[round(t,3) for t in ticks]},open("reps.json","w"))
print(a)
