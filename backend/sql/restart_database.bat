@echo off
cd %~dp0

set PATH_TO_MYSQL=mysql
set USER=root
set DB=ENGLISH_CENTER_DATABASE

set /p PASSWORD=Enter MySQL password:

for %%f in (*.sql) do (
    %PATH_TO_MYSQL% -u %USER% -p"%PASSWORD%" %DB% < "%%f"
)

echo All files have been successfully executed.
pause
