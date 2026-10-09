"""Independently download the published asset without authentication."""
import hashlib,json,os
from pathlib import Path
import urllib.parse,urllib.request

ROOT=Path(__file__).resolve().parent
target=json.loads((ROOT/'ready.json').read_text())
manifest=json.loads((ROOT/'manifest.json').read_text())
assert target['repository']=='akbarijenishm/EYESARK'
API='https://api.github.com/repos/'+target['repository']
headers={'Authorization':'Bearer '+os.environ['GITHUB_TOKEN'],'Accept':'application/vnd.github+json',
         'X-GitHub-Api-Version':'2022-11-28','User-Agent':'EYESARK-download-verification'}
with urllib.request.urlopen(urllib.request.Request(API+'/releases/'+str(target['release_id']),headers=headers),timeout=60) as response:
    release=json.load(response)
assert not release['draft'] and release['tag_name']==target['tag']
assets=[a for a in release['assets'] if a['name']=='EYESARK-corporate-HD-site.zip']
assert len(assets)==1
asset=assets[0]
assert asset['size']==manifest['zip']['bytes'] and asset['digest']=='sha256:'+manifest['zip']['sha256']
url=asset['browser_download_url']
assert url.startswith('https://github.com/akbarijenishm/EYESARK/releases/download/'+target['tag']+'/')
digest=hashlib.sha256();size=0
# This request deliberately has no Authorization header or credential.
with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'EYESARK-public-download-check'}),timeout=180) as response:
    assert response.status==200
    while True:
        chunk=response.read(1024*1024)
        if not chunk:break
        size+=len(chunk);assert size<=512*1024*1024
        digest.update(chunk)
assert size==manifest['zip']['bytes'] and digest.hexdigest()==manifest['zip']['sha256']
receipt={'anonymous_download':True,'bytes':size,'sha256':digest.hexdigest(),
         'files':len(manifest['public_files']),'run_id':os.environ['GITHUB_RUN_ID'],'url':url}
data=json.dumps(receipt,indent=2).encode()
upload=release['upload_url'].split('{')[0]+'?'+urllib.parse.urlencode({'name':'EYESARK-download-verification.json'})
assert urllib.parse.urlparse(upload).hostname=='uploads.github.com'
upload_headers=dict(headers);upload_headers['Content-Type']='application/json'
with urllib.request.urlopen(urllib.request.Request(upload,data=data,headers=upload_headers,method='POST'),timeout=60) as response:
    uploaded=json.load(response)
assert uploaded['digest']=='sha256:'+hashlib.sha256(data).hexdigest()
print('ANONYMOUS PUBLIC ZIP VERIFIED:',size,'bytes; SHA256',digest.hexdigest())
