@echo off
setlocal
chcp 65001 >nul
if defined JIAGENG_PYTHON (
  "%JIAGENG_PYTHON%" "%~dp0start-local-voice.py"
) else (
  where py >nul 2>nul
  if not errorlevel 1 (
    py -3.12 -c "import sys" >nul 2>nul
    if not errorlevel 1 (
      py -3.12 "%~dp0start-local-voice.py"
    ) else (
      python "%~dp0start-local-voice.py"
    )
  ) else (
    python "%~dp0start-local-voice.py"
  )
)
set "JIAGENG_EXIT=%errorlevel%"
if not "%JIAGENG_EXIT%"=="0" pause
exit /b %JIAGENG_EXIT%
