"""本地视觉技术验证：识别人框与座位ROI的关系，不裁定使用权。
只读取明确传入的图片文件，不启动摄像头，不上传图片，不保存人脸。
未检出人一律输出 unknown；这一步不能证明座位干净、无人暂离或可使用。
"""
import argparse
import json
import time
from pathlib import Path
import mediapipe as mp
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import ObjectDetector, ObjectDetectorOptions, RunningMode


def infer(image_path, model_path, regions_path, output_path):
    # 座位校准信息由操作者在获许可的测试区域填写。x、y、w、h均为0到1比例。
    regions = json.loads(Path(regions_path).read_text(encoding='utf-8'))['regions']
    image = mp.Image.create_from_file(str(image_path))
    height, width = image.height, image.width
    options = ObjectDetectorOptions(
        base_options=BaseOptions(model_asset_path=str(model_path)),
        running_mode=RunningMode.IMAGE,
        score_threshold=0.45,  # 测试阈值，不是准确率；现场必须重新评估。
        max_results=30,
    )
    with ObjectDetector.create_from_options(options) as detector:
        result = detector.detect(image)
    observations = []
    for region in regions:
        x, y, w, h = [float(region[k]) for k in ('x', 'y', 'w', 'h')]
        if w <= 0 or h <= 0 or min(x,y) < 0 or x+w > 1 or y+h > 1:
            raise ValueError('ROI越界：' + region['id'])
        matches = []
        for detection in result.detections:
            category = detection.categories[0]
            if category.category_name != 'person':
                continue
            box = detection.bounding_box
            # 底部中心点比框中心更接近座位投影，但经过的人也可能误关联。
            # 单张图片的关联只代表测试候选；正式使用须加入时序与遮挡校验。
            px = (box.origin_x + box.width/2) / width
            py = (box.origin_y + box.height*0.85) / height
            if x <= px <= x+w and y <= py <= y+h:
                matches.append(float(category.score))
        observations.append({
            'id': region['id'], 'observed': 'occupied' if matches else 'unknown',
            'quality': max(matches) if matches else 0,
            'obsAt': int(time.time()*1000),
        })
    # quality只是模型输出分数，并未经过可靠性校准。规则模块仍可拒绝低分观测。
    output = {'observations': observations, 'scope': '本机单帧技术测试；规则接口仍为模拟；不能用于实际选座'}
    Path(output_path).write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'detections':len(result.detections),'seat_observations':len(observations),'output':str(output_path)},ensure_ascii=False))
    return output


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--image', required=True)
    parser.add_argument('--model', default='models/efficientdet_lite0.tflite')
    parser.add_argument('--regions', default='fixtures/regions.json')
    parser.add_argument('--output', default='observations.json')
    args = parser.parse_args()
    infer(args.image, args.model, args.regions, args.output)
