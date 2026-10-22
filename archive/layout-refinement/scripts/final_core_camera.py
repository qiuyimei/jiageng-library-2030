from pathlib import Path
import json
here=Path(__file__).parent
p=here/'photo-reference.js';text=p.read_text(encoding='utf-8');prefix=text.split('export const PHOTO_REFERENCES=',1)[0]
refs=json.loads(text.split('export const PHOTO_REFERENCES=',1)[1].strip().rstrip(';'))
assert len(refs)==18
next(r for r in refs if r['id']=='traffic')['eye']=[23,13,-.5]
p.write_text(prefix+'export const PHOTO_REFERENCES='+json.dumps(refs,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
(here.parents[1]/'work/photo_reference_20261014/reference-scenes.json').write_text(json.dumps(refs,ensure_ascii=False,indent=2),encoding='utf-8')
# Only the HTML line guide contains photo-reference.js; Word/PDF bodies are unchanged.
source=(here/'make_documents.py').read_text(encoding='utf-8')
namespace={'__file__':str(here/'make_documents.py')}
exec(compile(source[:source.index('proposal=setup()')],str(here/'make_documents.py'),'exec'),namespace)
namespace['source_html']()
print('Raised the traffic-detail camera and synchronized the complete line guide.')
