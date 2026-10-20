"""仅下载官方公开预训练模型。没有训练本项目自己的模型。"""
import hashlib
import json
import urllib.request
from pathlib import Path
url = 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite'
out = Path(__file__).parent / 'models'
out.mkdir(exist_ok=True)
target = out / 'efficientdet_lite0.tflite'
urllib.request.urlretrieve(url, target)
manifest = {'url':url, 'sha256':hashlib.sha256(target.read_bytes()).hexdigest(), 'bytes':target.stat().st_size,
            'purpose':'COCO目标检测，非空座可用性判定', 'docs':'https://developers.google.com/edge/mediapipe/solutions/vision/object_detector'}
(out/'model-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(manifest,ensure_ascii=False))
