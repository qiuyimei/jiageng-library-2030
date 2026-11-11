"""嘉庚知座本机语音入口：仅回环监听，不写入读者录音，不代替正式预约。"""
from pathlib import Path
import os,sys,json,io,wave,time,secrets,threading,argparse,mimetypes
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from urllib.parse import urlsplit,unquote,quote

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE/'依赖'))
os.environ.setdefault('OMP_NUM_THREADS','2')
MODEL=None
MODEL_LOCK=threading.Lock()
MAX_SECONDS=30
def transcribe_wav(data):
    """仅接受16kHz单声道16位PCM，拒绝超长/损坏数据；音频只在内存中处理。"""
    global MODEL
    try:
        with wave.open(io.BytesIO(data),'rb') as f:
            if f.getnchannels()!=1 or f.getsampwidth()!=2 or f.getframerate()!=16000 or f.getcomptype()!='NONE':
                raise ValueError('请使用16kHz单声道PCM WAV。')
            if not 1600<=f.getnframes()<=16000*MAX_SECONDS:raise ValueError('录音需为0.1至30秒。')
            frames=f.readframes(f.getnframes())
            if len(frames)!=f.getnframes()*2:raise ValueError('录音数据不完整。')
    except (wave.Error,EOFError) as e:raise ValueError('无法读取录音WAV。') from e
    from vosk import Model,KaldiRecognizer,SetLogLevel
    with MODEL_LOCK:
        SetLogLevel(-1)
        if MODEL is None:
            # Windows原生库可能不能打开含中文的绝对路径；只在加载时使用ASCII相对目录名。
            previous=Path.cwd()
            try:
                os.chdir(HERE);MODEL=Model('vosk-model-small-cn-0.22')
            finally:os.chdir(previous)
        recognizer=KaldiRecognizer(MODEL,16000)
        for start in range(0,len(frames),8000):recognizer.AcceptWaveform(frames[start:start+8000])
        text=json.loads(recognizer.FinalResult()).get('text','')
    return ''.join(text.split())

def serve(root,port=8766,idle_seconds=600,on_ready=None):
    root=Path(root).resolve();token=secrets.token_urlsafe(24)
    state={'last':time.monotonic(),'stop':False}
    origins={f'http://127.0.0.1:{port}',f'http://localhost:{port}'}
    hosts={f'127.0.0.1:{port}',f'localhost:{port}'}
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
        def log_message(self,*args):pass # 不在日志中写入音频或转写文字。
        def trusted_host(self):return self.headers.get('Host') in hosts
        def trusted_origin(self):return self.headers.get('Origin') in origins
        def reply(self,status,value):
            body=json.dumps(value,ensure_ascii=False).encode('utf-8')
            self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
        def do_GET(self):
            if not self.trusted_host():return self.reply(403,{'error':'仅允许本机访问。'})
            path=unquote(urlsplit(self.path).path)
            if path=='/api/health':
                state['last']=time.monotonic();return self.reply(200,{'service':'jiageng-local-voice','ready':True,'token':token,'maxSeconds':MAX_SECONDS})
            # 仅展示明确文件，不列目录；解析后的绝对路径必须留在本人包内部。
            target=(root/path.lstrip('/')).resolve()
            if not target.is_relative_to(root) or not target.is_file() or target.suffix.lower() not in {'.html','.png','.jpg','.jpeg','.webp','.pdf','.mp4','.srt','.txt','.docx','.pptx'}:
                return self.reply(404,{'error':'文件不存在或未开放。'})
            state['last']=time.monotonic();return super().do_GET()
        def do_OPTIONS(self):self.reply(403,{'error':'不开放跨站录音请求。'})
        def do_POST(self):
            if not self.trusted_host() or not self.trusted_origin():return self.reply(403,{'error':'不接受跨站请求。'})
            if self.headers.get('X-Local-Token')!=token:return self.reply(403,{'error':'本机会话已过期。'})
            state['last']=time.monotonic()
            path=urlsplit(self.path).path
            if path=='/api/stop':
                self.reply(200,{'stopped':True});self.wfile.flush();state['stop']=True;return
            if path!='/api/transcribe':return self.reply(404,{'error':'未知接口。'})
            try:length=int(self.headers.get('Content-Length','0'))
            except ValueError:return self.reply(400,{'error':'录音长度无效。'})
            if not 44<length<=16000*2*MAX_SECONDS+4096:return self.reply(413,{'error':'录音为空或超过30秒。'})
            if self.headers.get('Content-Type','').split(';')[0]!='audio/wav':return self.reply(415,{'error':'只接受WAV录音。'})
            self.connection.settimeout(20)
            try:
                data=self.rfile.read(length)
                if len(data)!=length:raise ValueError('录音数据不完整。')
                text=transcribe_wav(data)
                self.reply(200,{'text':text,'engine':'Vosk small Chinese 0.22','local':True,'stored':False})
            except ValueError as e:self.reply(400,{'error':str(e)})
            except Exception:self.reply(500,{'error':'本机识别暂时失败，请重录或输入文字。'})
    server=ThreadingHTTPServer(('127.0.0.1',port),Handler);server.timeout=.5
    # 等响应线程收尾后再退出，避免结束接口的JSON在Windows被截断。
    server.daemon_threads=False
    print(f'嘉庚知座本地语音：http://127.0.0.1:{port}/'+quote('Demo/嘉庚知座.html')+'#floor=2',flush=True)
    print('只监听本机；10分钟无操作自动停止。',flush=True)
    try:
        if on_ready is not None:on_ready()
        while not state['stop'] and time.monotonic()-state['last']<idle_seconds:server.handle_request()
    finally:server.server_close()
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,default=HERE.parent);parser.add_argument('--port',type=int,default=8766);parser.add_argument('--idle',type=int,default=600)
    args=parser.parse_args();serve(args.root,args.port,args.idle)
