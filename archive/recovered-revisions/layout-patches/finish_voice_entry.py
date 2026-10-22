from pathlib import Path
H=Path(__file__).resolve().parent;OWN=H.parents[1]/'outputs/12_嘉庚知座_统一方案/本人保留'
p=H/'portal.html';t=p.read_text(encoding='utf-8')
t=t.replace('一至五楼独立座位图，筛选偏好、查看第1至4优先，再办理到座登记。','一至五楼独立座位图，语音或文字表达需求，确认后比较第1至4优先，再办理到座登记。')
p.write_text(t,encoding='utf-8')
p=OWN/'材料/本人学习入口.html';t=p.read_text(encoding='utf-8')
if '语音输入扩展' not in t:
    t=t.replace('</main>','''<article><h2>语音输入扩展</h2><p>语音转写、条件核对和本机识别见当前说明；逐行学习页已收录seat-voice.js。69页手册用于基础模块学习。</p><div class="links"><a href="../本轮使用说明/分层选座与到座登记说明.pdf">当前操作说明</a><a href="../语音服务/使用说明.txt">本机语音说明</a></div></article></main>''')
p.write_text(t,encoding='utf-8')
print('Voice discovery and learning links synchronized')
