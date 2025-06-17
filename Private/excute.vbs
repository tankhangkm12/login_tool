Set WshShell = CreateObject("WScript.Shell")

' Replace this path with your actual script path
WshShell.Run "cmd /c node ""D:\foolishPlay\Private\running.js""", 0, False

Set WshShell = Nothing
