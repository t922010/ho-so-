// Mini-AI Toán Học
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const chartContainer = document.getElementById('chartContainer');
const ctx = document.getElementById('chart');
let chart;

function appendMessage(text, who='bot') {
  const d = document.createElement('div');
  d.className = 'm ' + (who === 'user' ? 'user' : 'bot');
  d.textContent = text;
  messagesEl.appendChild(d);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function toRadians(deg) { return deg * Math.PI / 180; }

function calcExpression(expr) {
  try {
    expr = expr.trim().toLowerCase();

    // Phương trình bậc 2
    if (expr.startsWith("pt2:")) {
      const [a, b, c] = expr.replace("pt2:", ",").split(",").map(Number);
      if (isNaN(a) || isNaN(b) || isNaN(c)) return "Hệ số không hợp lệ!";
      const delta = b*b - 4*a*c;
      if (delta < 0) return "Phương trình vô nghiệm.";
      if (delta === 0) return "Phương trình có nghiệm kép: x = " + (-b/(2*a));
      const x1 = (-b + Math.sqrt(delta)) / (2*a);
      const x2 = (-b - Math.sqrt(delta)) / (2*a);
      return `Nghiệm: x1 = ${x1}, x2 = ${x2}`;
    }

    // Vẽ đồ thị
    if (expr.startsWith("plot:")) {
      const parts = expr.replace("plot:", ",").split(",");
      const funcs = parts[0].split(";").map(f => f.trim());
      let min = -10, max = 10;
      if (parts.length >= 3) { min = parseFloat(parts[1]); max = parseFloat(parts[2]); }
      drawPlot(funcs, min, max);
      return `Đã vẽ đồ thị: ${funcs.join(", ")} từ ${min} đến ${max}`;
    }

    // Biểu thức toán thông thường
    const safeExpr = expr
      .replace(/\^/g, '**')
      .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
      .replace(/sin\(([^)]+)\)/g, 'Math.sin(toRadians($1))')
      .replace(/cos\(([^)]+)\)/g, 'Math.cos(toRadians($1))')
      .replace(/tan\(([^)]+)\)/g, 'Math.tan(toRadians($1))')
      .replace(/log\(([^)]+)\)/g, 'Math.log10($1)')
      .replace(/ln\(([^)]+)\)/g, 'Math.log($1)');

    const val = Function('toRadians', 'return (' + safeExpr + ')')(toRadians);
    return val;
  } catch(e) {
    return 'Biểu thức không hợp lệ!';
  }
}

function drawPlot(funcs, min, max) {
  const datasets = [];
  const colors = ['#7c3aed','#22c55e','#eab308','#ef4444','#06b6d4'];

  funcs.forEach((funcText, idx) => {
    const xValues = [];
    const yValues = [];
    for (let x=min; x<=max; x += (max-min)/200) {
      try {
        const y = Function('x','toRadians',
          'return ' + funcText
            .replace(/\^/g,'**')
            .replace(/sqrt\(([^)]+)\)/g,'Math.sqrt($1)')
            .replace(/sin\(([^)]+)\)/g,'Math.sin(toRadians($1))')
            .replace(/cos\(([^)]+)\)/g,'Math.cos(toRadians($1))')
            .replace(/tan\(([^)]+)\)/g,'Math.tan(toRadians($1))')
            .replace(/log\(([^)]+)\)/g,'Math.log10($1)')
            .replace(/ln\(([^)]+)\)/g,'Math.log($1)')
        )(x, toRadians);
        xValues.push(x);
        yValues.push(y);
      } catch(e){}
    }
    datasets.push({ label: 'y='+funcText, data: yValues, borderColor: colors[idx % colors.length], borderWidth: 2, pointRadius:0 });
  });

  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type:'line',
    data:{ labels:xValues, datasets },
    options:{ responsive:true, scales:{ x:{ title:{ display:true, text:'x'}}, y:{ title:{ display:true, text:'y'} } } }
  });
  chartContainer.style.display='block';
}

function send() {
  const text = inputEl.value.trim();
  if(!text) return;
  appendMessage(text,'user');
  const res = calcExpression(text);
  appendMessage('Kết quả: '+res,'bot');
  inputEl.value='';
}

document.getElementById('sendBtn').addEventListener('click', send);
inputEl.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ send(); } });

appendMessage('Xin chào! Bạn có thể tính toán, diện tích, chu vi hình học hoặc vẽ nhiều đồ thị. Ví dụ: sqrt(16), pt2:1,-3,2, plot: sin(x);cos(x), -180,180','bot');
