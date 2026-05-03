:: куда
set DEPLOY=D:\_sites\worked\ishvara
:: откуда
set SOURCE=D:\_sites\ishvara

::: копирование клиента
:: Обновляем файлы клиента
rmdir /S /Q %DEPLOY%\client
xcopy /E /Y /I %SOURCE%\client\dist %DEPLOY%\client

::: копирование сервера
:: Обновляем файлы сервера
rmdir /S /Q %DEPLOY%\server
xcopy /E /Y /I %SOURCE%\server\dist %DEPLOY%\server
copy /Y %SOURCE%\server\package.json %DEPLOY%\server\package.json
copy /Y %SOURCE%\.env %DEPLOY%\server\.env

:: Обновляем зависимости
cd %DEPLOY%\server
npm install --omit=dev


