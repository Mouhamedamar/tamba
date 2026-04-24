import urllib.request
import urllib.error

try:
    req = urllib.request.Request(
        'http://localhost:8000/api/membres/?page=1',
        headers={'Accept': 'application/json'}
    )
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    content = e.read().decode('utf-8', errors='ignore')
    with open('error.txt', 'w', encoding='utf-8') as f:
        f.write(content)
