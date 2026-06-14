const http = require('http');
const fs = require('fs');
const path = require('path');
const build = require('./build');

const PORT = 3000;
const MOCK_CHECKLIST_FILE = 'mock_checklist.json';
const MOCK_STATES_FILE = 'mock_states.json';
const MOCK_REPORTS_FILE = 'mock_monthly_reports.json';

// Initialize mock data files if not present
if (!fs.existsSync(MOCK_STATES_FILE)) {
  fs.writeFileSync(MOCK_STATES_FILE, JSON.stringify({}), 'utf8');
}
if (!fs.existsSync(MOCK_REPORTS_FILE)) {
  fs.writeFileSync(MOCK_REPORTS_FILE, JSON.stringify({}), 'utf8');
}

// Helper: load default checklist structure as mock data
function getDefaultChecklistStructure() {
  // Simulates Code.gs initialization of default rows
  // Returning the default checklist structure nested
  return buildChecklistStructureFromDefaults();
}

function buildChecklistStructureFromDefaults() {
  // This mock matches the nested structure returned by ChecklistService
  // We can just parse flat tasks or read a file, but since we compiled DEFAULT_CHECKLIST in Scripts.html,
  // we can use a basic structure or simply mock it. Let's write a parser that mimics the GS one.
  const defaults = [
    { id: "start_clean_floor", no: 1, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Vệ sinh sàn & Khu vực chung", desc: "Quét và lau sạch tổng thể khu trực. Quét dọn sạch sẽ khu vực cổng ra vào.", subId: "floor_sweep", subText: "Quét sạch tổng thể sàn khu trực" },
    { id: "start_clean_floor", no: 1, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Vệ sinh sàn & Khu vực chung", desc: "Quét và lau sạch tổng thể khu trực. Quét dọn sạch sẽ khu vực cổng ra vào.", subId: "floor_mop", subText: "Lau sàn, xử lý vết bẩn dễ thấy" },
    { id: "start_table_setup", no: 2, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Bàn ghế", desc: "Lau sạch bàn ghế...", subId: "table_wipe", subText: "Lau sạch mặt bàn" },
    { id: "start_background", no: 3, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "I. Vệ sinh & setup khu trực", title: "Background tiệc", desc: "Lau bụi background...", subId: "bg_dust", subText: "Lau bụi background" },
    { id: "start_tools_check", no: 4, phase: "CHECKLIST ĐẦU CA", shift: "CA 15H: SETUP BÀN", section: "II. Công cụ & Vật tư", title: "Diêm/bật lửa...", desc: "Kiểm tra...", subId: "match_lighter", subText: "Kiểm tra diêm/bật lửa" },
    { id: "mid_double_check", no: 9, phase: "CHECKLIST ĐẦU CA", shift: "CA 17H: RÀ SOÁT & HOÀN THIỆN", section: "V. Kiểm tra chéo & Bổ sung", title: "Double-check ca 15h", desc: "Rà soát...", subId: "double_clean", subText: "Rà soát vệ sinh" },
    { id: "end1_prepare_next", no: 16, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA LẦN 1", section: "VIII. Xuống ca lần 1 (21h - 22h)", title: "Thu dọn...", desc: "Cất dọn...", subId: "end1_sweep", subText: "Quét dọn khu" },
    { id: "end_final_clean", no: 20, phase: "CHECKLIST CUỐI CA", shift: "XUỐNG CA SAU CÙNG", section: "IX. Xuống ca sau cùng", title: "Vệ sinh & Thu dọn", desc: "Vệ sinh menu...", subId: "final_menu", subText: "Vệ sinh menu" }
  ];
  
  // Group them
  const groupsMap = {};
  const itemsMap = {};
  
  defaults.forEach(row => {
    const itemId = row.id;
    const groupKey = `${row.phase}||${row.shift}||${row.section}`;
    
    if (!groupsMap[groupKey]) {
      groupsMap[groupKey] = {
        phase: row.phase,
        shift: row.shift,
        section: row.section,
        items: []
      };
    }
    
    if (!itemsMap[itemId]) {
      itemsMap[itemId] = {
        no: row.no,
        id: itemId,
        title: row.title,
        text: row.desc,
        subitems: []
      };
      groupsMap[groupKey].items.push(itemsMap[itemId]);
    }
    
    if (row.subId && row.subText) {
      itemsMap[itemId].subitems.push({
        id: row.subId,
        text: row.subText
      });
    }
  });
  
  return Object.values(groupsMap);
}

// Format summary cell text exactly as ChecklistService.gs does
function formatZoneReportText(dateStr, area, participants, items, supply, signatures, checklistStructure) {
  let totalTasks = 0;
  let completedTasks = 0;
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  const incompleteLines = [];
  const noteLines = [];

  checklistStructure.forEach(group => {
    group.items.forEach(item => {
      totalTasks++;
      let isItemChecked = false;
      const subTotal = item.subitems.length;
      let subDone = 0;
      
      const savedItem = items[item.id] || {};
      
      if (subTotal > 0) {
        totalSubtasks += subTotal;
        const savedSubchecks = savedItem.subchecks || {};
        item.subitems.forEach(sub => {
          if (savedSubchecks[sub.id]) {
            completedSubtasks++;
            subDone++;
          }
        });
        isItemChecked = (subDone === subTotal);
      } else {
        isItemChecked = !!savedItem.checked;
      }

      if (isItemChecked) {
        completedTasks++;
      } else {
        const details = subTotal > 0 ? ` (${subDone}/${subTotal} việc con)` : '';
        incompleteLines.push(` - STT ${item.no}: ${item.title}${details}`);
      }

      const note = (savedItem.note || '').trim();
      if (note) {
        noteLines.push(` - STT ${item.no}: ${note}`);
      }
    });
  });

  const progressPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const names = participants.map(p => p.name).join(', ') || '(Chưa có nhân viên)';
  
  const selectedSupplies = Object.entries(supply)
    .filter(([k, v]) => !['note', 'by', 'savedAt'].includes(k) && v)
    .map(([k]) => k)
    .join(', ');
  let supplyText = `Đề xuất: ${selectedSupplies || 'Không'}`;
  if (supply.note) supplyText += ` | Ghi chú: ${supply.note}`;

  const sigText = `Nhận: ${signatures.receive || 'Chưa ký'} | Giao: ${signatures.handover || 'Chưa ký'} | QL: ${signatures.manager || 'Chưa ký'}`;

  return `[👤 Nhân viên]: ${names}
[📈 Tiến độ]: ${progressPct}% (${completedTasks}/${totalTasks} hạng mục)
[⚠️ Chưa xong]:
${incompleteLines.join('\n') || ' - Không có'}
[📝 Ghi chú]:
${noteLines.join('\n') || ' - Không có'}
[📦 Vật tư]: ${supplyText}
[✍️ Bàn giao]: ${sigText}
[🕒 Cập nhật]: ${new Date().toLocaleTimeString('vi-VN')} ${new Date().toLocaleDateString('vi-VN')}`;
}

// Handle request routing
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET Request (Serves the Webapp)
  const urlPath = req.url.split('?')[0];
  if (req.method === 'GET' && (urlPath === '/' || urlPath === '/index.html')) {
    // Recompile project on refresh
    build();
    
    fs.readFile(path.join('dist', 'index.html'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain;charset=utf-8' });
        res.end('Error loading index.html: ' + err.toString());
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        res.end(data);
      }
    });
    return;
  }

  // POST Request (Simulates Apps Script API)
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { method, args } = payload;
        
        console.log(`[Mock API Call] Method: ${method}`);

        if (method === 'getAppInitData') {
          const [dateStr] = args;
          // Load checklist structure
          let checklistData;
          if (fs.existsSync(MOCK_CHECKLIST_FILE)) {
            checklistData = JSON.parse(fs.readFileSync(MOCK_CHECKLIST_FILE, 'utf8'));
          } else {
            checklistData = getDefaultChecklistStructure();
          }

          // Load progress states
          const allStates = JSON.parse(fs.readFileSync(MOCK_STATES_FILE, 'utf8'));
          const dayStates = allStates[dateStr] || {};

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: {
              checklist: checklistData,
              states: dayStates
            }
          }));
        } 
        
        else if (method === 'saveChecklistState') {
          const [dateStr, area, participants, items, supply, signatures] = args;
          
          // 1. Save state to raw states log
          const allStates = JSON.parse(fs.readFileSync(MOCK_STATES_FILE, 'utf8'));
          if (!allStates[dateStr]) {
            allStates[dateStr] = {};
          }
          allStates[dateStr][area] = {
            participants,
            items,
            supply,
            signatures,
            savedAt: new Date().toISOString()
          };
          fs.writeFileSync(MOCK_STATES_FILE, JSON.stringify(allStates, null, 2), 'utf8');

          // 2. Format human readable summary and save to mock reports sheet
          let checklistData;
          if (fs.existsSync(MOCK_CHECKLIST_FILE)) {
            checklistData = JSON.parse(fs.readFileSync(MOCK_CHECKLIST_FILE, 'utf8'));
          } else {
            checklistData = getDefaultChecklistStructure();
          }

          const formattedReport = formatZoneReportText(dateStr, area, participants, items, supply, signatures, checklistData);
          
          const reports = JSON.parse(fs.readFileSync(MOCK_REPORTS_FILE, 'utf8'));
          const [year, month, day] = dateStr.split('-');
          const monthKey = `Tháng ${month}-${year}`;
          const dateKey = `${day}/${month}/${year}`;
          
          if (!reports[monthKey]) {
            reports[monthKey] = {};
          }
          if (!reports[monthKey][dateKey]) {
            reports[monthKey][dateKey] = {};
          }
          reports[monthKey][dateKey][`Khu ${area}`] = formattedReport;
          fs.writeFileSync(MOCK_REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf8');

          console.log(`\n--- [Mock Sheets Cell Written] Sheet: ${monthKey} | Row: ${dateKey} | Column: Khu ${area} ---`);
          console.log(formattedReport);
          console.log(`-----------------------------------------------------------------------------------------\n`);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: {
              success: true,
              monthSheet: monthKey,
              date: dateKey,
              area
            }
          }));
        } 
        
        else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Unknown method' }));
        }
      } catch (err) {
        console.error("Mock Server POST Processing Error:", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.toString() }));
      }
    });
    return;
  }

  // Fallback for 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Mock Development Server running at http://localhost:${PORT}`);
  console.log(`To open the app in dev mode, visit http://localhost:${PORT}`);
  console.log(`To simulate API sync locally, check the console logs for Sheet write outputs.`);
});
