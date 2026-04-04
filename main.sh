bash
python3 -c "
html = '''<!DOCTYPE html>
<html lang=\"zh-CN\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>你好</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: \"PingFang SC\", \"Microsoft YaHei\", sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        h1 {
            font-size: 72px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <h1>你好！</h1>
</body>
</html>'''

with open('/Users/lizhelan/Desktop/hello.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('文件已创建成功！')
"