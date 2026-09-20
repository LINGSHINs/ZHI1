const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const E=require(fs.existsSync(path.join(__dirname,'../dist/engine.js'))?'../dist/engine.js':'../engine.js');
const q={answer:['A','C']};
assert.equal(E.grade(q,['C','A']),true);assert.equal(E.grade(q,['A']),false);assert.equal(E.grade(q,['A','B','C']),false);
let now=100000,s=E.record(null,false,now);assert.equal(s.stage,0);assert.equal(s.due,now+60000);
s=E.record(s,true,now+1000);assert.equal(s.stage,0,'提前答对不得晋级');assert.equal(s.right,1);
for(let stage=1;stage<=7;stage++){now=s.due;s=E.record(s,true,now);assert.equal(s.stage,stage);assert.equal(s.mastered,stage===7);}
s=E.record(s,false,now+100);assert.equal(s.mastered,false);assert.equal(s.stage,0);
assert.deepEqual(E.loopNext(['a'],{a:{mastered:true}}).remaining,0);
assert.equal(E.loopNext(['a'],{a:{due:5000}},1000).id,null);
assert.equal(E.loopNext(['a','b'],{a:{due:5000},b:{due:800}},1000).id,'b');
assert.equal(E.filter([{dept:'运营',no:1,type:'判断'},{dept:'运营',no:50,type:'单选'},{dept:'审计',no:1,type:'判断'}],{dept:'运营',from:1,to:30}).length,1);
console.log('PASS: 多选精确判分、提前练习、全部记忆阶段、掌握回退、循环调度、部门题号筛选');
