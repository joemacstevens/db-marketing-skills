import json
R=[0.32,1.36,2.48,3.60,4.64,5.76,7.12,8.24,9.44,10.64,11.76,12.95,14.25,15.52,16.8,18.0,19.36,20.88,23.92,25.6,28.24,31.52,35.84,40.48,47.9]
A=[None,0.8,2.0,3.12,4.32,5.52,6.8,8.08,9.28,10.56,11.76,12.96,14.48,15.84,17.12,18.4,19.76,21.44,22.88,24.56,26.0,28.0,29.76,31.36,33.36,35.68,37.2]
def rm(s): return 1.5+s if s<2.9 else (4.4+(s-2.9)/10 if s<44.3 else 8.54+(s-44.3))
def am(s): return 13.84+s if s<2.3 else (16.14+(s-2.3)/10 if s<35.6 else 19.47+(s-35.6))
r=[round(rm(s),3) for s in R]; a=[13.84]+[round(am(s),3) for s in A[1:]]
ticks=[rm(s) for s in R if 2.9<=s<44.3]+[am(s) for s in A[1:] if 2.3<=s<35.6]
json.dump({"roberto":r,"ahmed":a,"ticks":[round(t,3) for t in ticks]},open("reps.json","w"))
print(r);print(a);print(len(ticks))
