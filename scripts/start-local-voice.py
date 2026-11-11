"""Start the repository's optional local Vosk service without package-specific paths."""
from pathlib import Path
from urllib.parse import quote
import importlib
import struct
import sys
import webbrowser

ROOT = Path(__file__).resolve().parents[1]


def main():
    if sys.version_info < (3, 9):
        print('请使用 Python 3.9 或更新版本；建议使用已验证的 64 位 Python 3.12。')
        return 1
    if sys.platform == 'win32' and struct.calcsize('P') != 8:
        print('Windows 本机语音需要 64 位 Python；建议使用 Python 3.12。')
        return 1

    entry = ROOT / 'Demo' / '嘉庚知座.html'
    if not entry.is_file():
        print('未找到 Demo/嘉庚知座.html，请先在仓库根目录执行 npm ci 和 npm run build。')
        return 1

    sys.path.insert(0, str(ROOT / 'src'))
    from voice_server import serve

    try:
        importlib.import_module('vosk')
    except (ImportError, OSError):
        print('未能加载 Vosk，请在当前 Python 环境安装 src/requirements-voice.txt。')
        return 1

    model = ROOT / 'src' / 'vosk-model-small-cn-0.22'
    if not (model / 'am' / 'final.mdl').is_file():
        print('未找到中文模型，请用当前 Python 执行 src/prepare_voice.py。')
        return 1

    url = 'http://127.0.0.1:8766/' + quote(entry.relative_to(ROOT).as_posix()) + '#floor=2'

    def open_page():
        # serve calls this only after binding the port successfully.
        try:
            webbrowser.open(url)
        except (OSError, webbrowser.Error):
            print('未能自动打开浏览器，请手动打开上方的本机地址。')

    print('关闭此窗口或按 Ctrl+C 停止；默认 10 分钟无活动自动退出。')
    try:
        serve(ROOT, on_ready=open_page)
    except KeyboardInterrupt:
        print('本机语音服务已停止。')
    except OSError as error:
        print('本机语音服务未启动，请检查 8766 端口及运行环境：', error)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
