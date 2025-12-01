// 최소 WebSocket 상담 서버
// 설치: npm init -y && npm i ws
const http = require('http');
const { WebSocketServer } = require('ws');
const server = http.createServer();
const wss = new WebSocketServer({ server, path:'/support' });

// 세션 저장
let nextId = 1;
function genId(){ return 'u'+ (nextId++); }

const clients = new Map(); // ws -> {id, role, city, ua}

function broadcastToAgents(obj){
  const msg = JSON.stringify(obj);
  for(const [ws,meta] of clients){
    if(meta.role === 'agent' && ws.readyState === ws.OPEN){
      ws.send(msg);
    }
  }
}
function sendTo(ws,obj){
  if(ws.readyState === ws.OPEN){
    ws.send(JSON.stringify(obj));
  }
}
function findById(id){
  for(const [ws,meta] of clients){
    if(meta.id===id) return ws;
  }
  return null;
}
function listUsers(){
  return [...clients.values()].filter(m=>m.role==='user').map(m=>({
    id:m.id, city:m.city, ua:m.ua
  }));
}

wss.on('connection', ws => {
  const meta = { id: genId(), role:'user', city:'', ua:'' };
  clients.set(ws, meta);

  // 초기에 상담사에게 시스템 메세지로 알림
  broadcastToAgents({ type:'system', text:`사용자 접속: ${meta.id}` });

  ws.on('message', raw => {
    let data;
    try{ data = JSON.parse(raw); } catch { data = { type:'message', text:String(raw) }; }

    if(data.type === 'hello'){
      // role 지정
      meta.role = data.role === 'agent' ? 'agent' : 'user';
      meta.city = data.city || '';
      meta.ua = data.ua || '';
      if(meta.role === 'agent'){
        // 상담사에게 현재 사용자 목록 전송
        sendTo(ws, { type:'users', users:listUsers() });
      } else {
        // 새 사용자 목록 갱신
        broadcastToAgents({ type:'users', users:listUsers() });
      }
      return;
    }

    if(data.type === 'list' && meta.role === 'agent'){
      sendTo(ws, { type:'users', users:listUsers() });
      return;
    }

    if(data.type === 'kick' && meta.role === 'agent' && data.targetId){
      const targetWs = findById(data.targetId);
      if(targetWs){
        sendTo(targetWs,{ type:'system', text:'상담사에 의해 연결 해제됨.' });
        targetWs.close();
      }
      return;
    }

    if(data.type === 'message'){
      if(meta.role === 'user'){
        // 사용자 -> 상담사 전달
        broadcastToAgents({ type:'message', text:data.text||'', from:meta.id, role:'user' });
      } else if(meta.role === 'agent'){
        // 상담사 -> 특정 사용자 또는 전체
        if(data.target === 'all'){
          // 모든 사용자에게
          for(const [cws,m] of clients){
            if(m.role === 'user') sendTo(cws,{ type:'message', text:data.text||'', role:'agent' });
          }
        } else if(data.target){
          const targetWs = findById(data.target);
          if(targetWs){
            sendTo(targetWs,{ type:'message', text:data.text||'', role:'agent' });
          } else {
            sendTo(ws,{ type:'system', text:'대상 사용자를 찾을 수 없습니다.' });
          }
        }
        // 상담사 자신의 콘솔에도 echo (이미 UI에서 표시하므로 생략 가능)
      }
      return;
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    if(meta.role === 'user'){
      broadcastToAgents({ type:'system', text:`사용자 종료: ${meta.id}` });
      broadcastToAgents({ type:'users', users:listUsers() });
    }
  });
});

server.listen(3000, () => {
  console.log('Support WS server running on ws://localhost:3000/support');
});
