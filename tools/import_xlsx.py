"""python tools/import_xlsx.py 题库.xlsx [输出目录]; 仅使用 Python 标准库。"""
import sys, json, zipfile, re, hashlib, collections
from pathlib import Path
import xml.etree.ElementTree as ET

def convert(path, output):
    ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    questions, issues = [], []
    with zipfile.ZipFile(path) as z:
        strings = [''.join(x.itertext()) for x in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', ns)] if 'xl/sharedStrings.xml' in z.namelist() else []
        for row in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//m:sheetData/m:row', ns)[1:]:
            d = {}
            for cell in row:
                v = cell.find('m:v', ns)
                value = v.text if v is not None else ''.join(cell.itertext())
                d[re.sub(r'\d', '', cell.get('r'))] = (strings[int(value)] if cell.get('t') == 's' else value or '').strip()
            if not d.get('D'): continue
            opts = [{'key': chr(65+i), 'text': d[col]} for i,col in enumerate('FGHIJK') if d.get(col)]
            raw = d.get('E','').strip().upper()
            if d['C'] == '判断':
                answer = [o['key'] for o in opts if o['text'] == raw]
            else: answer = sorted(set(re.findall('[A-F]', raw)))
            errors = []
            if not answer: errors.append('缺少可识别答案')
            if any(a not in [o['key'] for o in opts] for a in answer): errors.append('答案引用不存在的选项')
            if d['C'] in ['判断','单选'] and len(answer) != 1: errors.append('非唯一答案')
            if d['C'] not in ['判断','单选','多选']: errors.append('未知题型')
            q = {'id': hashlib.sha256((d['B']+'|'+d['A']+'|'+d['D']).encode()).hexdigest()[:16], 'no': int(d['A']), 'dept': d['B'], 'type': d['C'], 'text': d['D'], 'options': opts, 'answer': answer, 'sourceRow': int(row.get('r')), 'issues': errors}
            questions.append(q)
            if errors: issues.append({'dept':q['dept'],'no':q['no'],'issues':errors})
    assert len({q['id'] for q in questions}) == len(questions), '存在重复题目 ID'
    report = {'total':len(questions),'types':dict(collections.Counter(q['type'] for q in questions)),'departments':dict(collections.Counter(q['dept'] for q in questions)),'issues':issues,'source':'题库.xlsx','note':'原题库未提供解析；未改写题干、选项或答案。仅清理首尾空格。'}
    out = Path(output); out.mkdir(parents=True, exist_ok=True)
    (out/'questions.js').write_text('window.SHIZHI_BANK = '+json.dumps({'meta':report,'questions':questions},ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    (out/'import-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))

if __name__ == '__main__': convert(sys.argv[1], sys.argv[2] if len(sys.argv)>2 else 'dist')
