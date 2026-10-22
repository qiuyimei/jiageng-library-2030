from pathlib import Path
import json
H=Path(__file__).parent
base=json.loads((H/'20261016-pending-rear-depth.json').read_text(encoding='utf-8'))['reviewed_file_hashes']
pages={k.removeprefix('qa\\'):v for k,v in base.items() if k.startswith('qa\\')}
slides={Path(k).name:v for k,v in base.items() if k.startswith('deck_build\\renders\\')}
(H/'rear-reviewed-page-baseline.json').write_text(json.dumps(pages),encoding='utf-8')
(H/'rear-slide-baseline.json').write_text(json.dumps(slides),encoding='utf-8')
t=(H/'review_rooms_20261016.py').read_text(encoding='utf-8').replace('rooms-reviewed-page-baseline.json','rear-reviewed-page-baseline.json').replace('qa_rooms_20261015','qa_rear_depth_20261016')
(H/'review_rear_depth.py').write_text(t,encoding='utf-8')
t=(H/'prepare_final_rooms_qa.py').read_text(encoding='utf-8').replace('qa_rooms_20261015','qa_rear_depth_20261016').replace('rooms-slide-baseline.json','rear-slide-baseline.json').replace('rooms-slide-review.json','rear-slide-review.json')
(H/'prepare_final_rear_qa.py').write_text(t,encoding='utf-8')
print('BASELINE',len(pages),len(slides))
