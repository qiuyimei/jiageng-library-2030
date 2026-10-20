"""从Vosk官方地址准备可选中文模型，不保存或上传任何读者录音。"""
from pathlib import Path
import urllib.request,zipfile,hashlib,json
root=Path(__file__).resolve().parent
url='https://alphacephei.com/vosk/models/vosk-model-small-cn-0.22.zip'
archive=root/'vosk-model-small-cn-0.22.zip'
urllib.request.urlretrieve(url,archive)
with zipfile.ZipFile(archive) as z:
    for info in z.infolist():
        target=(root/info.filename).resolve()
        if not target.is_relative_to(root):raise ValueError('非法压缩路径')
    z.extractall(root)
(root/'voice-model-manifest.json').write_text(json.dumps({'url':url,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()},ensure_ascii=False,indent=2),encoding='utf-8')
archive.unlink()
print('模型已就绪；启动时用 --root 指定实际作品根目录。')
