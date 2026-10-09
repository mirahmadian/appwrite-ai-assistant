@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

rem ===== تنظیمات =====
rem پوشهٔ مبدا: پوشه‌ای که این فایل در آن قرار دارد (یا مسیری که به‌عنوان آرگومان بدهید)
set "SOURCE=%~1"
if "%SOURCE%"=="" set "SOURCE=%~dp0"
if "%SOURCE:~-1%"=="\" set "SOURCE=%SOURCE:~0,-1%"

rem پوشهٔ مقصد
set "DEST=%SOURCE%\آمار نهایی - جمع آوری شده"

rem برای جابه‌جایی (به‌جای کپی) مقدار زیر را MOVE بگذارید
set "MODE=COPY"
rem ====================

if not exist "%DEST%" mkdir "%DEST%"

set /a COUNT=0
for %%E in (xlsx xls xlsm) do (
    for /r "%SOURCE%" %%F in ("آمار نهایی*.%%E") do (
        if exist "%%~fF" (
            rem فایل‌های داخل پوشهٔ مقصد نادیده گرفته شوند
            if /i not "%%~dpF"=="%DEST%\" call :process "%%~fF"
        )
    )
)

echo.
echo تعداد فایل پردازش شده: %COUNT%
echo پوشه مقصد: %DEST%
pause
exit /b

:process
set "SRC=%~1"
set "NAME=%~n1"
set "EXT=%~x1"
set "TARGET=%DEST%\%~nx1"
set /a N=1
:check
if exist "!TARGET!" (
    set "TARGET=%DEST%\!NAME!_!N!!EXT!"
    set /a N+=1
    goto check
)
if /i "%MODE%"=="MOVE" (
    move "!SRC!" "!TARGET!" >nul
) else (
    copy "!SRC!" "!TARGET!" >nul
)
echo !SRC!
set /a COUNT+=1
exit /b
