"""同步已实现的语音入口、当前书架方向和制作说明，不改写实地事实。"""
from pathlib import Path
import json
H=Path(__file__).resolve().parent
def edit(file,a,b):
    p=H/file;t=p.read_text(encoding='utf-8');assert a in t,(file,a[:75]);p.write_text(t.replace(a,b),encoding='utf-8')
edit('proposal_20261018.py','自然语言需求理解、实时预约接口、全馆共享状态和真实资源目录仍是后续工作。','另已加入中文语音转写、有限关键词条件提取与确认后推荐。实时预约接口、全馆共享状态、通用语言模型和真实资源目录仍是后续工作。')
edit('proposal_20261018.py','北、南翼采用中间书架带、两侧座位的组织关系，东区保持独立表达。','北、南翼书架居中横向成组，每组书架分多排摆放，每排四个单元，内外两侧各放两张桌；东区深处书架纵向多列，阅览桌沿中央长方形边缘排列。五楼保留报刊与备考专门桌型。')
edit('proposal_20261018.py','表达需求时，读者选择本次资料主题、比较当前层或五层、临窗偏好、带电源的模型桌型以及顺路打印等条件。','表达需求时，读者可以说一句话、输入文字，或直接使用表单。语音转写先进入可编辑文本，再提取资料主题、当前层或五层、临窗、电源和打印等有限条件；必须点击确认才填入表单并生成推荐。不认识的条件会提示手动核对，不推断专业身份。')
edit('proposal_20261018.py','列表和座位图同步突出对应椅位。','列表和座位图同步突出对应椅位。第1至4优先有快捷按钮：平面可放大到推荐区域或指定椅位，列表直接跳到相应页；跨层候选同步切换楼层，无需逐页翻找。')
edit('proposal_20261018.py','2030阶段的AI模块首先服务于需求理解。语言模型将自然语言转成结构化条件','当前已实现两种语音转写入口：浏览器提供的中文识别，以及本机Vosk中文预训练模型。前者可能调用浏览器在线服务，后者只在本机内存处理录音，附带模型并提供独立启动入口。转写后由明确的关键词和否定语规则提取有限字段，这不是通用语义理解，也不是本项目训练的模型。2030阶段可进一步由语言模型将自然语言转成结构化条件')
edit('proposal_20261018.py','seat-page.js负责楼层、列表、平面与登记交互；','seat-page.js负责楼层、列表、平面与登记交互；seat-voice.js负责转写、否定语处理和确认入口；本机voice_server.py验证录音格式并调用预训练识别器；')
edit('proposal_20261018.py','第四阶段加入AI需求理解和授权资源目录。','第四阶段在现有语音转写与有限字段规则基础上，评估通用语言模型需求理解和授权资源目录。')
edit('proposal_20261018.py','现阶段开发资源包括能够运行现代浏览器的电脑、代码编辑器、Node构建环境和文档制作工具。','现阶段开发资源包括能够运行现代浏览器的电脑、代码编辑器、Node构建环境和文档制作工具。本机离线语音另需64位Python 3.12，作者包已准备相应依赖及中文小模型；启动后仅监听127.0.0.1，可手动关闭，十分钟无请求自动结束。文件网页和本机服务网页属于不同存储来源，登记不自动互通。')
edit('proposal_20261018.py','当前已执行规则、空间、漫游与内存事件检查，并对完整模型椅位逐一匹配。','当前已执行156项规则、空间、漫游与内存事件检查，并对完整模型椅位逐一匹配。另用明确标记的合成中文录音验证本机转写，可识别文学、靠窗、打印这组词；同时核验格式错误和跨站请求的拒绝。该测试不构成真实麦克风、口音适应或识别准确率评估。')
edit('proposal_20261018.py','AI需求理解属于规划中的明确模块。','语音转写和有限条件提取已能演示，通用语言模型需求理解仍是后续模块。')
edit('proposal_20261018.py','主要交互是静态屏幕或手机上的静音操作','文字和表单是馆内默认可用的静音方式，语音可在入口或不影响他人的地点主动开启；系统不自动播放声音。其余交互是屏幕上的静音操作')
edit('proposal_20261018.py','共享后台和AI接入各自设立单独验收','共享后台和通用语言模型接入各自设立单独验收')
edit('build_proposal_only.py','2026年10月18日','2026年10月19日')
edit('build_proposal_only.py','AI需求理解与经授权的可选感知为后续实施内容。','现已加入语音转写、有限条件提取与确认后推荐；通用语言模型与经授权的可选感知为后续实施内容。')
edit('build_proposal_only.py',"doc.add_heading('公开资料',2)","sources += [('Vosk官方预训练模型与许可','https://alphacephei.com/vosk/models'),('浏览器SpeechRecognition能力与兼容说明','https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition')]\ndoc.add_heading('公开资料',2)")
edit('make_current_guide.py','当前排序为透明规则计算，AI需求理解和可选授权感知仍属后续接入。','当前排序为透明规则计算；中文语音转写和有限字段提取已加入，通用语言模型和可选授权感知仍待接入。')
edit('make_current_guide.py',"d.add_heading('数据与实现边界',2)","d.add_heading('说出需求并确认',2);d.add_paragraph('点说出需求，允许麦克风，录音后核对转写文字，再点解析条件、确认并推荐。可直接输入文字。浏览器语音不支持或联网失败时，完整解压本人包后双击启动本地语音.cmd，在自动打开的本机页面操作；结束后关闭服务窗口。文件页与本机服务页的登记不互通。')\nd.add_heading('数据与实现边界',2)")
edit('make_current_guide.py','勾选临窗并生成最多四个优先，解释理由和取舍。','说出或输入文学、靠窗、打印等需求，核对条件后推荐；点击优先按钮直接放大或跳到所在页。')
for file in ['make_documents.py','package_current.py','check_photo_package.py']:
    edit(file,"'seat-status.js','seat-page.js'","'seat-status.js','seat-voice.js','seat-page.js'")
edit('make_documents.py',"'source_files_in_line_guide':35","'source_files_in_line_guide':36")
edit('content.py','新增分层页面的35个完整源文件','新增分层与语音页面的36个完整源文件')
with (H/'content.py').open('a',encoding='utf-8') as f:f.write("\nFUNCTION_GUIDE.update({'parseSeatDemand':'把有限关键词、否定语及楼层表达转成待确认条件，保留歧义说明，不是通用大模型理解。','recordingToWav':'解码浏览器录音，混合声道并重新采样为16kHz PCM WAV；释放音频上下文。','initSeatVoice':'连接录音、可编辑转写、条件预览和确认按钮；离开页面停止麦克风，确认前不改推荐。','groupedUpperDesks':'建立北南书架组两侧及东区边缘桌排，兼容三楼展品和五楼备考桌型。'})\n")
for file in ['package_current.py','finalize_assets_20261018.py']:
    p=H/file;t=p.read_text(encoding='utf-8').replace('142项','156项').replace('135项','156项').replace('35个源文件','36个源文件').replace('19页','20页').replace('正文6966个中文字符','正文超过7000个中文字符').replace('不声称已完成AI需求理解或真人效果测试','已加入语音转写与有限字段解析，未接通用语言模型或完成真人效果测试');p.write_text(t,encoding='utf-8')
edit('package_current.py','5. 方案Word/PDF','语音入口：选座页可录音或输入文字，核对条件后生成推荐。浏览器语音失败时，双击启动本地语音.cmd使用附带Vosk识别器；结束时关闭服务窗口。仅本机处理，不保存录音。文件页和本地服务页登记不互通。\n5. 方案Word/PDF')
edit('package_current.py',"'export-reader.cjs','import_photo_batch_20261018.py'","'export-reader.cjs','voice_server.py','install_voice_entry.py','import_photo_batch_20261018.py'")
edit('package_current.py','北南翼书架居中、桌椅分列两边，东区独立','北南翼书架横向多排成组，组内两侧各两桌；东区后部纵向多列书架，桌椅沿中庭边缘')
edit('package_current.py','[ ] 两段MP4可播放','[ ] 语音转写可编辑并确认后推荐；不支持时有文字入口，本机服务可结束；真实麦克风需本人核验。\n[ ] 两段MP4可播放')
edit('finish_reader_delivery.py','27项新界面内存事件','41项新界面内存事件')
edit('polish_assets_20261018.py','选择资料主题、临窗偏好和必须条件。','语音或文字表达需求，核对条件后再推荐。')
for file in ['refresh_design_pdfs.py','make_recording_doc.py']:
    if file=='refresh_design_pdfs.py':edit(file,"'04_实地调研与设计依据.png']","'04_实地调研与设计依据.png','05_语音输入与条件确认.png']")
    else:edit(file,"OWN/'本轮使用说明/04_实地调研与设计依据.png']","OWN/'本轮使用说明/04_实地调研与设计依据.png',OWN/'本轮使用说明/05_语音输入与条件确认.png']")
edit('build_narration_media.py',"name.startswith(('02_完整','03_学生'))","name.startswith(('02_完整','03_学生','05_语音'))")
edit('build_narration_media.py','共享后台和 AI 仍待接入','已能语音转写，通用模型待接入')
story=json.loads((H/'narration_20261018.json').read_text(encoding='utf-8'))
story['short'][2]=['说出或输入今天的需求','05_语音输入与条件确认.png','可以说一句文学资料附近、喜欢靠窗、稍后打印，也可以直接输入文字。先核对转写与提取条件，再点确认并推荐，避免识别错误直接影响选择。']
story['short'][7][2]='当前已有语音转写、有限条件提取、本机登记和示例状态。通用语言模型、全馆共享后台与真实资源目录仍待授权接入，不能把演示颜色当成真实空座。'
story['long'][4]=['语音表达并核对条件','05_语音输入与条件确认.png','我们可以说出今天的需求，例如在文学资料附近、喜欢靠窗、稍后打印。系统先显示可修改的转写文字，再列出提取条件。核对以后点击确认，才生成推荐；也可以全程输入文字，保持安静。']
story['long'][10]=['语音识别与推荐各有职责','05_语音输入与条件确认.png','现在能演示中文语音转写，以及主题、临窗、打印等有限字段的规则提取。本机入口使用第三方预训练识别器，不保存录音。通用语言模型仍待接入，识别不清时可以修改文字，正式使用资格仍由馆方规则决定。']
(H/'narration_20261018.json').write_text(json.dumps(story,ensure_ascii=False,indent=2),encoding='utf-8')
slides=json.loads((H/'deck_build/current-slides.json').read_text(encoding='utf-8'))
slides[0]['notes']='本机原型已加入中文语音转写与有限条件提取；通用语言模型和共享后台仍待接入。'
slides[2]['notes']='当前可用语音或文字表达有限条件，核对后推荐。2030阶段继续接入授权后台、通用语言模型及实时目录。'
slides[11]={'title':'说出需求 核对后推荐','image':'本轮使用说明/05_语音输入与条件确认.png','caption':'中文转写与有限字段提取已实现；确认后才推荐，通用语言模型待接入','notes':'浏览器语音可能使用在线服务；本机入口采用Vosk中文预训练识别器。合成中文录音测试通过，尚未完成实际麦克风及口音评测。不保存本机录音。'}
slides[12]['body'][0]='可语音转写、分层选座并办理本人登记。'
slides[14]['table'][3]=['共享与语义','授权后台、身份与通用语言模型','接口与可靠性单独验收']
(H/'deck_build/current-slides.json').write_text(json.dumps(slides,ensure_ascii=False,indent=2),encoding='utf-8')
edit('deck_build/build_current.mjs','26.1015.12040','26.1017.11052')
edit('deck_build/build_current.mjs','current-20261018-v3','current-20261019-voice')
edit('export_current_deck_and_media_qa.py','current-20261018-v3','current-20261019-voice')
edit('package_current.py','current-20261018-v3','current-20261019-voice')
print('voice capabilities, grouped layout and material sources synchronized')
