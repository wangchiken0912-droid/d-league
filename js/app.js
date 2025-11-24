const DATA_URL = 'data/data.json';

// 通用：獲取數據
async function fetchData() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// 通用：根據球隊名稱找 Logo
function getTeamLogo(teamName, teamsData) {
    const team = teamsData.find(t => t.name === teamName);
    return team ? team.logo : ''; 
}

// --- 頁面邏輯：賽程表 ---
async function loadSchedulePage() {
    const data = await fetchData();
    if (!data) return;

    const container = document.getElementById('schedule-container');
    const filter = document.getElementById('leagueFilter');
    container.innerHTML = ''; // Clear loading

    // 分組渲染函數
    function render(filterValue) {
        container.innerHTML = '';
        let currentMonth = '';

        data.schedule.forEach(match => {
            // 處理轉會窗或休息
            if (match.type === 'break') {
                const breakEl = document.createElement('div');
                breakEl.className = 'bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-4 text-center text-indigo-300 font-bold my-6';
                breakEl.innerHTML = `📅 ${match.desc} (${match.start} - ${match.end})`;
                container.appendChild(breakEl);
                return;
            }

            // 過濾器邏輯
            if (filterValue !== 'all' && match.league !== filterValue) return;

            // 日期標題分組
            const matchDate = new Date(match.date);
            const dateStr = `${matchDate.getFullYear()} / ${matchDate.getMonth() + 1} / ${matchDate.getDate()}`;
            
            if (dateStr !== currentMonth) {
                currentMonth = dateStr;
                const dateHeader = document.createElement('h3');
                dateHeader.className = 'text-xl font-bold text-slate-200 mt-8 mb-4 flex items-center gap-2';
                dateHeader.innerHTML = `<span class="w-2 h-8 bg-indigo-500 rounded-full inline-block"></span> ${dateStr}`;
                container.appendChild(dateHeader);
            }

            // 比賽卡片
            const homeLogo = getTeamLogo(match.home, data.teams);
            const awayLogo = getTeamLogo(match.away, data.teams);
            const homeScore = match.score_home !== null ? match.score_home : '-';
            const awayScore = match.score_away !== null ? match.score_away : '-';

            const matchCard = document.createElement('div');
            matchCard.className = 'bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-700 hover:border-slate-600 transition shadow-lg flex flex-col md:flex-row items-center justify-between gap-4';
            
            matchCard.innerHTML = `
                <div class="flex items-center gap-4 w-full md:w-1/3 justify-center md:justify-start">
                    <span class="text-xs font-bold px-2 py-1 rounded ${match.league === 'L1' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'} border border-white/5">
                        ${match.league} 輪次 ${match.round}
                    </span>
                    <span class="text-slate-400 text-sm font-mono">${match.time}</span>
                </div>

                <div class="flex items-center justify-center w-full md:w-1/3 gap-4 md:gap-8">
                    <div class="flex flex-col items-center w-24 text-center">
                        <img src="${homeLogo}" class="w-12 h-12 md:w-16 md:h-16 object-contain mb-2" alt="${match.home}">
                        <span class="text-sm font-bold leading-tight">${match.home}</span>
                    </div>
                    
                    <div class="text-2xl md:text-3xl font-black text-white bg-slate-900 px-4 py-2 rounded-lg tracking-widest whitespace-nowrap">
                        ${homeScore} : ${awayScore}
                    </div>

                    <div class="flex flex-col items-center w-24 text-center">
                        <img src="${awayLogo}" class="w-12 h-12 md:w-16 md:h-16 object-contain mb-2" alt="${match.away}">
                        <span class="text-sm font-bold leading-tight">${match.away}</span>
                    </div>
                </div>

                <div class="w-full md:w-1/3 text-center md:text-right text-xs text-slate-500">
                    ${data.league_info.venue}
                </div>
            `;
            container.appendChild(matchCard);
        });
    }

    render('all'); // 初始渲染

    filter.addEventListener('change', (e) => {
        render(e.target.value);
    });
}

// --- 頁面邏輯：球隊列表 ---
async function loadTeamsPage() {
    const data = await fetchData();
    if (!data) return;

    const l1Container = document.getElementById('l1-teams-container');
    const l2Container = document.getElementById('l2-teams-container');

    data.teams.forEach(team => {
        const card = document.createElement('div');
        // 動態產生漸層背景
        const color1 = team.colors[0] || '#000';
        const color2 = team.colors[1] || color1;
        
        card.className = 'group relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-all duration-300 hover:-translate-y-1 shadow-xl';
        
        card.innerHTML = `
            <div class="h-2 w-full" style="background: linear-gradient(to right, ${color1}, ${color2})"></div>
            <div class="p-6 flex flex-col items-center text-center">
                <div class="w-24 h-24 mb-4 relative">
                    <div class="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition"></div>
                    <img src="${team.logo}" class="w-full h-full object-contain relative z-10" alt="${team.name}">
                </div>
                <h3 class="text-xl font-bold text-white mb-1">${team.name}</h3>
                <span class="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded uppercase tracking-widest">${team.league} LEAGUE</span>
            </div>
        `;

        if (team.league === 'L1') {
            l1Container.appendChild(card);
        } else {
            l2Container.appendChild(card);
        }
    });
}