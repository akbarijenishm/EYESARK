"""Run on GitHub: verify the exact reviewed ZIP, upload only to its draft."""
import base64,hashlib,json,os
from pathlib import Path,PurePosixPath
import urllib.parse,urllib.request
import zipfile

ROOT=Path(__file__).resolve().parent
target=json.loads((ROOT/'ready.json').read_text())
manifest=json.loads((ROOT/'manifest.json').read_text())
assert target['repository']=='akbarijenishm/EYESARK'
assert str(target['release_id']).isdigit()
package=ROOT/'EYESARK-corporate-HD-site.zip'
digest=hashlib.sha256();size=0
with package.open('wb') as output:
    for item in target['chunks']:
        name=item['path']
        assert PurePosixPath(name).parent.as_posix()=='chunks'
        encoded=(ROOT/name).read_bytes()
        assert hashlib.sha256(encoded).hexdigest()==item['sha256']
        chunk=base64.b64decode(encoded,validate=True)
        output.write(chunk);digest.update(chunk);size+=len(chunk)
assert size==manifest['zip']['bytes']
assert digest.hexdigest()==manifest['zip']['sha256']
expected={item['path']:item for item in manifest['public_files']}
with zipfile.ZipFile(package) as archive:
    assert archive.testzip() is None and set(archive.namelist())==set(expected)
    for item in archive.infolist():
        path=PurePosixPath(item.filename)
        assert not path.is_absolute() and '..' not in path.parts
        assert item.file_size==expected[item.filename]['bytes']
        assert hashlib.sha256(archive.read(item)).hexdigest()==expected[item.filename]['sha256']
API='https://api.github.com/repos/'+target['repository']
headers={'Authorization':'Bearer '+os.environ['GITHUB_TOKEN'],'Accept':'application/vnd.github+json',
         'X-GitHub-Api-Version':'2022-11-28','User-Agent':'EYESARK-reviewed-package-delivery'}
def read(path):
    with urllib.request.urlopen(urllib.request.Request(API+path,headers=headers),timeout=60) as r:
        return json.load(r)
release=read('/releases/'+str(target['release_id']))
assert release['draft'] is True and release['tag_name']==target['tag']
asset_name=package.name
assets=[asset for asset in read('/releases/'+str(target['release_id'])+'/assets') if asset['name']==asset_name]
if assets:
    assert len(assets)==1
    asset=assets[0]
else:
    url=release['upload_url'].split('{')[0]+'?'+urllib.parse.urlencode({'name':asset_name})
    assert urllib.parse.urlparse(url).hostname=='uploads.github.com'
    upload_headers=dict(headers);upload_headers['Content-Type']='application/zip'
    with urllib.request.urlopen(urllib.request.Request(url,data=package.read_bytes(),headers=upload_headers,method='POST'),timeout=300) as r:
        asset=json.load(r)
assert asset['state']=='uploaded' and asset['size']==size
assert asset['digest']=='sha256:'+digest.hexdigest()
print('Reviewed ZIP verified and attached to draft:',asset['name'],asset['size'],'bytes')
print('Package SHA256:',digest.hexdigest())
# The root agent publishes only after inspecting this uploaded asset.
