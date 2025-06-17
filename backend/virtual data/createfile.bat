@echo off
for /L %%i in (0,1,19) do (
    echo The %%ith file > "file%%i.txt"
)
echo Done! 20 files were created.
pause
