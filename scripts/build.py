import concurrent.futures,json,pathlib,shutil,subprocess
p=pathlib.Path(__file__).resolve().parent.parent
d=p/'_site';d.mkdir(exist_ok=True)
for f in p.iterdir():
 if f.suffix in ['.html','.css','.js','.json']:shutil.copy(f,d/f.name)
def download(a):
 target=d/a['file'];target.parent.mkdir(exist_ok=True)
 local=p/a['file']
 if local.exists():shutil.copy(local,target)
 else:subprocess.run(['curl','--fail','--location','--retry','3','--max-time','120',a['source'],'--output',str(target)],check=True,capture_output=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:list(pool.map(download,json.loads((p/'asset-manifest.json').read_text())))
print('Built six pages and all portfolio media.')
