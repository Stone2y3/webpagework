/* =========================================================================
 *  BUAA OJ · 应用脚本
 *  ---------------------------------------------------------------------
 *  职责：页面骨架（顶栏 / 页脚 / 弹窗）、登录鉴权、主题、题库与比赛渲染、
 *        模拟评测、收藏与错题、排行榜、小游戏。
 *  说明：纯前端演示，无后端；所有数据保存在 localStorage。
 * ========================================================================= */
(function () {
  'use strict';

  /* ============================== 0. 工具 ============================== */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC_MAP[c]);

  const KEY = {
    theme: 'oj_theme',
    user: 'oj_user',
    fav: 'oj_favorites',
    wrong: 'oj_wrongs',
    progress: 'oj_progress',
    subs: 'oj_submissions',
    feedback: 'oj_feedback',
    snake: 'oj_snake_best'
  };

  const storage = {
    read(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (raw == null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    write(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    },
    readRaw(key, fallback) {
      try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
    },
    writeRaw(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }
  };

  const PAGE = document.body.dataset.page || 'home';

  /* ============================== 1. 主题 ============================== */
  const THEMES = [
    { key: 'theme-blue', label: '北航蓝' },
    { key: 'theme-green', label: '青竹绿' },
    { key: 'theme-dark', label: '夜间模式' }
  ];

  function currentTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    return THEMES.some((x) => x.key === t) ? t : 'theme-blue';
  }

  function themeLabel(key) {
    const t = THEMES.find((x) => x.key === key);
    return t ? t.label : '北航蓝';
  }

  let vtBusy = false;

  /**
   * 切换主题。
   * 使用 View Transition 做整页交叉淡入，避免逐元素过渡时出现的白点闪烁；
   * 浏览器不支持或过渡异常时退回纯 CSS 变色过渡（并有兜底，确保一定落色）。
   */
  function applyTheme(key, quiet) {
    const next = THEMES.some((x) => x.key === key) ? key : 'theme-blue';
    let applied = false;

    const paint = () => {
      if (applied) return;
      applied = true;
      document.documentElement.setAttribute('data-theme', next);
      storage.writeRaw(KEY.theme, next);
      const logo = $('#themeToggle');
      if (logo) logo.title = '点击切换主题（当前：' + themeLabel(next) + '）';
    };

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canTransition = !quiet && typeof document.startViewTransition === 'function' && !reduce && !vtBusy;

    if (!canTransition) {
      paint();
      return;
    }

    vtBusy = true;
    try {
      const vt = document.startViewTransition(paint);
      const release = () => { vtBusy = false; };
      if (vt && vt.updateCallbackDone) vt.updateCallbackDone.then(release, release);
      if (vt && vt.finished) vt.finished.then(release, release);
      setTimeout(release, 1500);
      // 兜底：若过渡回调因特殊环境没有执行，450ms 后直接落色
      setTimeout(() => { if (!applied) { vtBusy = false; paint(); } }, 450);
    } catch (e) {
      vtBusy = false;
      paint();
    }
  }

  function cycleTheme() {
    const idx = THEMES.findIndex((t) => t.key === currentTheme());
    const next = THEMES[(idx + 1) % THEMES.length];
    applyTheme(next.key);
    toast('主题已切换：' + next.label, 'info', 1600);
  }

  /* ============================== 2. 账号 ============================== */
  function normaliseUser(raw) {
    if (!raw) return null;
    if (typeof raw === 'string') {
      // 兼容旧版本的纯字符串存储
      if (/^2\d{7}$/.test(raw)) return { type: 'student', account: raw, username: '', since: Date.now() };
      return null;
    }
    if (typeof raw === 'object' && raw.account) {
      return {
        type: raw.type === 'book' ? 'book' : 'student',
        account: String(raw.account),
        username: raw.username || '',
        since: raw.since || Date.now()
      };
    }
    return null;
  }

  function getUser() {
    return normaliseUser(storage.read(KEY.user, null));
  }

  function setUser(user) {
    storage.write(KEY.user, user);
  }

  function displayName(user) {
    if (!user) return '登录';
    if (user.type === 'book') return user.username || 'User';
    return user.account.slice(0, 2) + '级本科生';
  }

  function avatarOf(user) {
    return user && user.type === 'student' ? 'images/xyy.jpg' : 'images/user.jpg';
  }

  function accountLabel(user) {
    if (!user) return '';
    return user.type === 'book' ? user.account.slice(0, 8) + '@hep.cc' : user.account;
  }

  /* ============================== 3. 提示条 ============================== */
  let toastTimer = null;
  function toast(message, type, duration) {
    const root = $('#toastRoot');
    if (!root) return;
    const item = document.createElement('div');
    item.className = 'toast ' + (type || 'info');
    item.innerHTML = '<span class="toast-dot"></span><span>' + esc(message) + '</span>';
    root.appendChild(item);
    requestAnimationFrame(() => item.classList.add('in'));
    setTimeout(() => {
      item.classList.remove('in');
      setTimeout(() => item.remove(), 320);
    }, duration || 2400);
    clearTimeout(toastTimer);
  }

  /* ============================== 4. 弹窗 ============================== */
  function openModal(id) {
    const mask = document.getElementById(id);
    if (!mask) return;
    mask.classList.add('show');
    mask.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const focusable = mask.querySelector('input, button.btn, select, textarea');
    if (focusable) setTimeout(() => focusable.focus(), 60);
  }

  function closeModal(id) {
    const mask = document.getElementById(id);
    if (!mask) return;
    mask.classList.remove('show');
    mask.setAttribute('aria-hidden', 'true');
    if (!$$('.modal-mask.show').length) document.body.classList.remove('modal-open');
  }

  function closeAllModals() {
    $$('.modal-mask.show').forEach((m) => closeModal(m.id));
  }

  /* ============================== 5. 页面骨架 ============================== */
  const NAV = [
    { key: 'home', label: '首页', href: 'Oj_5th.html' },
    { key: 'problems', label: '题库', href: 'problems.html' },
    { key: 'contests', label: '比赛', href: 'contests.html', needLogin: true },
    { key: 'leaderboard', label: '排行榜', href: 'leaderboard.html' }
  ];

  function activeKey() {
    if (PAGE === 'contest-detail') return 'contests';
    if (PAGE === 'problem-detail') return 'problems';
    return PAGE;
  }

  function navHTML() {
    const user = getUser();
    const active = activeKey();

    const links = NAV.map((item) => {
      const cls = 'nav-link' + (item.key === active ? ' active' : '');
      const attrs = item.needLogin ? ' data-need-login="1"' : '';
      const title = item.needLogin && !user ? ' title="登录后可查看比赛"' : '';
      return '<a class="' + cls + '" href="' + item.href + '"' + attrs + title + '>' + item.label + '</a>';
    }).join('');

    const leisureActive = PAGE === 'game' || PAGE === 'books' ? ' active' : '';
    const userArea = user
      ? '<div class="user-wrap">' +
          '<button class="user-chip" id="userChip" type="button" aria-haspopup="true" aria-expanded="false" title="' + esc(accountLabel(user)) + '">' +
            '<img class="avatar" src="' + avatarOf(user) + '" alt="头像">' +
            '<span class="user-name">' + esc(displayName(user)) + '</span>' +
            '<span class="caret">▾</span>' +
          '</button>' +
          '<div class="user-menu" id="userMenu" hidden>' +
            '<div class="user-menu-head">' +
              '<img class="avatar lg" src="' + avatarOf(user) + '" alt="">' +
              '<div class="user-menu-id">' +
                '<strong>' + esc(displayName(user)) + '</strong>' +
                '<small>' + esc(user.type === 'book' ? '教材账号 · ' + accountLabel(user) : '学工号账号 · ' + accountLabel(user)) + '</small>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="menu-item" data-act="profile">我的数据</button>' +
            (user.type === 'book' ? '<button type="button" class="menu-item" data-act="rename">修改用户名</button>' : '') +
            '<button type="button" class="menu-item" data-act="theme">切换主题</button>' +
            '<button type="button" class="menu-item danger" data-act="logout">退出登录</button>' +
          '</div>' +
        '</div>'
      : '<button class="btn-login" id="loginTrigger" type="button">登录 / 注册</button>';

    return '' +
      '<div class="nav-inner">' +
        '<div class="brand">' +
          '<button class="logo-mark" id="themeToggle" type="button" title="点击切换主题（当前：' + themeLabel(currentTheme()) + '）" aria-label="切换主题">' +
            '<span class="logo-type">AC</span><span class="logo-caret" aria-hidden="true"></span>' +
          '</button>' +
          '<a class="brand-text" href="Oj_5th.html">' +
            '<strong>BUAA OJ</strong><small>在线评测平台</small>' +
          '</a>' +
        '</div>' +
        '<nav class="nav-links" id="navLinks">' +
          links +
          '<div class="nav-dropdown" id="navDropdown">' +
            '<button class="nav-link nav-drop-btn' + leisureActive + '" id="leisureBtn" type="button" aria-expanded="false">休闲区<span class="caret">▾</span></button>' +
            '<div class="dropdown-menu" id="leisureMenu">' +
              '<a href="game.html">小游戏 · 贪吃蛇</a>' +
              '<a href="books.html">好书推荐</a>' +
            '</div>' +
          '</div>' +
          '<button class="nav-link nav-plain" id="feedbackBtn" type="button">反馈</button>' +
        '</nav>' +
        '<div class="nav-user" id="navUser">' + userArea + '</div>' +
        '<button class="nav-burger" id="navBurger" type="button" aria-label="展开菜单">☰</button>' +
      '</div>';
  }

  function footerHTML() {
    return '' +
      '<div class="footer-inner">' +
        '<p>该页面版权属于北京航空航天大学 26 级本科生 <span class="hl">26371014</span></p>' +
        '<p>如有问题请联系我：<a href="mailto:stone_2y3@buaa.edu.cn">stone_2y3@buaa.edu.cn</a></p>' +
        '<p>本平台仅用于课程演示，不能用于真实评测，刷题请回到 <a href="https://accoding.buaa.edu.cn/" target="_blank" rel="noopener">OJ4TH</a></p>' +
      '</div>';
  }

  function modalsHTML() {
    return '' +
      /* ---- 登录 ---- */
      '<div class="modal-mask" id="loginModal" aria-hidden="true">' +
        '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="loginTitle">' +
          '<button class="modal-close" type="button" data-close="loginModal" aria-label="关闭">×</button>' +
          '<h2 id="loginTitle">登录 / 注册</h2>' +
          '<p class="modal-sub">两种账号格式任选其一，首次登录自动创建账号</p>' +
          '<div class="seg" id="loginSeg">' +
            '<button class="seg-btn active" type="button" data-mode="book">教材数字（20 位）</button>' +
            '<button class="seg-btn" type="button" data-mode="student">学工号</button>' +
          '</div>' +
          '<form id="loginForm" novalidate>' +
            '<label class="field">' +
              '<span id="accLabel">20 位数字</span>' +
              '<input id="accInput" type="text" autocomplete="off" inputmode="numeric" placeholder="例如 12345678901234567890">' +
            '</label>' +
            '<label class="field">' +
              '<span>密码</span>' +
              '<input id="pwdInput" type="password" autocomplete="off" placeholder="刮刮卡后 4 位数字">' +
            '</label>' +
            '<p class="field-hint" id="loginHint">用户名 = 前 8 位 @hep.cc，密码 = 后 4 位数字。</p>' +
            '<div class="form-error" id="loginError" hidden></div>' +
            '<button class="btn btn-primary btn-block" type="submit">登录</button>' +
          '</form>' +
          '<p class="modal-foot">账号格式说明见 <a href="books.html">好书推荐</a> 页《C 语言程序设计——原理与实践》封底。</p>' +
        '</div>' +
      '</div>' +
      /* ---- 反馈：第一步 ---- */
      '<div class="modal-mask" id="feedbackModal1" aria-hidden="true">' +
        '<div class="modal modal-sm" role="dialog" aria-modal="true">' +
          '<button class="modal-close" type="button" data-close="feedbackModal1" aria-label="关闭">×</button>' +
          '<h2>反馈</h2>' +
          '<p class="modal-center">你确定本网页有什么问题吗？</p>' +
          '<div class="modal-actions">' +
            '<button class="btn btn-primary" type="button" id="fb1Yes">是，我要反馈</button>' +
            '<button class="btn btn-ghost" type="button" id="fb1No">否，没有问题</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      /* ---- 反馈：第二步 ---- */
      '<div class="modal-mask" id="feedbackModal2" aria-hidden="true">' +
        '<div class="modal modal-sm" role="dialog" aria-modal="true">' +
          '<button class="modal-close" type="button" data-close="feedbackModal2" aria-label="关闭">×</button>' +
          '<h2>再确认一次</h2>' +
          '<p class="modal-center">你确定吗？连续选择「否」将前往北航 OJ 官方平台继续刷题。</p>' +
          '<div class="modal-actions">' +
            '<button class="btn btn-primary" type="button" id="fb2Yes">是</button>' +
            '<button class="btn btn-ghost" type="button" id="fb2No">否</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      /* ---- 反馈：表单 ---- */
      '<div class="modal-mask" id="feedbackFormModal" aria-hidden="true">' +
        '<div class="modal" role="dialog" aria-modal="true">' +
          '<button class="modal-close" type="button" data-close="feedbackFormModal" aria-label="关闭">×</button>' +
          '<h2>问题反馈</h2>' +
          '<p class="modal-sub">反馈会保存在本机，用于课程汇报时演示。</p>' +
          '<form id="feedbackForm">' +
            '<label class="field">' +
              '<span>问题类型</span>' +
              '<select id="fbType">' +
                '<option>功能异常</option>' +
                '<option>题目描述有误</option>' +
                '<option>界面显示问题</option>' +
                '<option>其他建议</option>' +
              '</select>' +
            '</label>' +
            '<label class="field">' +
              '<span>详细描述</span>' +
              '<textarea id="fbText" rows="4" placeholder="请描述你遇到的问题或建议…"></textarea>' +
            '</label>' +
            '<div class="form-error" id="fbError" hidden></div>' +
            '<button class="btn btn-primary btn-block" type="submit">提交反馈</button>' +
          '</form>' +
        '</div>' +
      '</div>' +
      /* ---- 我的数据 ---- */
      '<div class="modal-mask" id="profileModal" aria-hidden="true">' +
        '<div class="modal" role="dialog" aria-modal="true">' +
          '<button class="modal-close" type="button" data-close="profileModal" aria-label="关闭">×</button>' +
          '<h2>我的数据</h2>' +
          '<div id="profileBody"></div>' +
        '</div>' +
      '</div>' +
      /* ---- 修改用户名 ---- */
      '<div class="modal-mask" id="renameModal" aria-hidden="true">' +
        '<div class="modal modal-sm" role="dialog" aria-modal="true">' +
          '<button class="modal-close" type="button" data-close="renameModal" aria-label="关闭">×</button>' +
          '<h2>修改用户名</h2>' +
          '<p class="modal-sub">教材账号支持自定义昵称，2 ~ 16 个字符。</p>' +
          '<form id="renameForm">' +
            '<label class="field">' +
              '<span>新用户名</span>' +
              '<input id="renameInput" type="text" maxlength="16" autocomplete="off" placeholder="请输入新的用户名">' +
            '</label>' +
            '<div class="form-error" id="renameError" hidden></div>' +
            '<button class="btn btn-primary btn-block" type="submit">保存</button>' +
          '</form>' +
        '</div>' +
      '</div>' +
      '<div class="toast-root" id="toastRoot" aria-live="polite"></div>';
  }

  /* ============================== 6. 顶栏行为 ============================== */
  let dropdownTimer = null;

  function refreshShell() {
    const nav = $('#appNav');
    if (nav) nav.innerHTML = navHTML();
    bindNav();
  }

  function closeUserMenu() {
    const menu = $('#userMenu');
    const chip = $('#userChip');
    if (menu) menu.hidden = true;
    if (chip) {
      chip.classList.remove('open');
      chip.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleUserMenu() {
    const menu = $('#userMenu');
    const chip = $('#userChip');
    if (!menu || !chip) return;
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    chip.classList.toggle('open', willOpen);
    chip.setAttribute('aria-expanded', String(willOpen));
  }

  function openLeisureMenu() {
    const dd = $('#navDropdown');
    if (!dd) return;
    clearTimeout(dropdownTimer);
    dd.classList.add('open');
    const btn = $('#leisureBtn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  function scheduleCloseLeisure(delay) {
    const dd = $('#navDropdown');
    if (!dd) return;
    clearTimeout(dropdownTimer);
    dropdownTimer = setTimeout(() => {
      dd.classList.remove('open');
      const btn = $('#leisureBtn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }, delay == null ? 180 : delay);
  }

  function bindNav() {
    const logo = $('#themeToggle');
    if (logo) {
      logo.addEventListener('click', cycleTheme);
      logo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleTheme(); }
      });
    }

    const loginTrigger = $('#loginTrigger');
    if (loginTrigger) loginTrigger.addEventListener('click', () => openLogin());

    const chip = $('#userChip');
    if (chip) {
      chip.addEventListener('click', (e) => { e.stopPropagation(); toggleUserMenu(); });
    }

    const menu = $('#userMenu');
    if (menu) {
      menu.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        handleUserAction(btn.dataset.act);
      });
    }

    // 休闲区下拉：鼠标停留在整个 nav-dropdown 区域都不会收起
    const dd = $('#navDropdown');
    if (dd) {
      dd.addEventListener('mouseenter', openLeisureMenu);
      dd.addEventListener('mouseleave', () => scheduleCloseLeisure(200));
      const btn = $('#leisureBtn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (dd.classList.contains('open')) scheduleCloseLeisure(0);
          else openLeisureMenu();
        });
      }
    }

    const fbBtn = $('#feedbackBtn');
    if (fbBtn) {
      fbBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('feedbackModal1'); });
    }

    // 未登录点「比赛」
    $$('[data-need-login]', $('#appNav') || document).forEach((link) => {
      link.addEventListener('click', (e) => {
        if (getUser()) return;
        e.preventDefault();
        toast('尚未登录，请先登录后查看比赛', 'warn', 2200);
        openLogin();
      });
    });

    const burger = $('#navBurger');
    if (burger) {
      burger.addEventListener('click', () => {
        const nav = $('#appNav');
        if (nav) nav.classList.toggle('nav-open');
      });
    }
  }

  function handleUserAction(act) {
    closeUserMenu();
    if (act === 'logout') return logout();
    if (act === 'rename') {
      const user = getUser();
      if (!user) return;
      const input = $('#renameInput');
      if (input) input.value = user.username || 'User';
      const err = $('#renameError');
      if (err) err.hidden = true;
      openModal('renameModal');
      return;
    }
    if (act === 'theme') return cycleTheme();
    if (act === 'profile') return openProfile();
  }

  /* ============================== 7. 登录 / 退出 ============================== */
  let loginMode = 'book';

  function setLoginMode(mode) {
    loginMode = mode === 'student' ? 'student' : 'book';
    $$('#loginSeg .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === loginMode));
    const label = $('#accLabel');
    const acc = $('#accInput');
    const pwd = $('#pwdInput');
    const hint = $('#loginHint');
    const err = $('#loginError');
    if (label) label.textContent = loginMode === 'book' ? '20 位数字' : '学工号';
    if (acc) {
      acc.value = '';
      acc.placeholder = loginMode === 'book' ? '例如 12345678901234567890' : '例如 26371014';
      acc.inputMode = loginMode === 'book' ? 'numeric' : 'text';
    }
    if (pwd) {
      pwd.value = '';
      pwd.placeholder = loginMode === 'book' ? '刮刮卡后 4 位数字' : '学工号@buaa.edu.cn';
    }
    if (hint) {
      hint.textContent = loginMode === 'book'
        ? '用户名 = 前 8 位 @hep.cc，密码 = 后 4 位数字。'
        : '密码为「学工号@buaa.edu.cn」，登录后右上角显示为 xx 级本科生。';
    }
    if (err) err.hidden = true;
  }

  function openLogin() {
    if (getUser()) return;
    setLoginMode(loginMode);
    openModal('loginModal');
  }

  function showLoginError(msg) {
    const box = $('#loginError');
    if (!box) return;
    box.textContent = msg;
    box.hidden = false;
  }

  function submitLogin(e) {
    e.preventDefault();
    const accEl = $('#accInput');
    const pwdEl = $('#pwdInput');
    if (!accEl || !pwdEl) return;

    // 去掉数字里可能出现的空格、制表符，方便直接粘贴刮刮卡号码
    const account = accEl.value.replace(/\s+/g, '');
    const password = pwdEl.value;

    if (!account) return showLoginError('请输入账号');
    if (!password) return showLoginError('请输入密码');

    if (loginMode === 'book') {
      if (!/^\d+$/.test(account)) return showLoginError('20 位数字只能包含数字，请检查是否有多余字符');
      if (account.length !== 20) return showLoginError('数字位数不对，应为 20 位，当前 ' + account.length + ' 位');
      const expected = account.slice(-4);
      if (password !== expected) return showLoginError('密码错误：应为号码后 4 位 ' + expected);
      const user = {
        type: 'book',
        account,
        username: storage.read(KEY.user + '_name_' + account, ''),
        since: Date.now()
      };
      setUser(user);
      closeModal('loginModal');
      afterLogin(user);
      return;
    }

    if (!/^2\d{7}$/.test(account)) return showLoginError('学工号格式不正确，应为 2 开头的 8 位数字');
    if (password !== account + '@buaa.edu.cn') return showLoginError('密码错误：应为 ' + account + '@buaa.edu.cn');
    const user = { type: 'student', account, username: '', since: Date.now() };
    setUser(user);
    closeModal('loginModal');
    afterLogin(user);
  }

  function afterLogin(user) {
    refreshShell();
    toast((user.type === 'book' ? '欢迎，User' : '欢迎回来，' + displayName(user)), 'ok', 2400);
    // 需要登录的页面在登录后重新渲染
    if (typeof window.__pageRefresh === 'function') window.__pageRefresh();
  }

  function logout() {
    storage.remove(KEY.user);
    closeUserMenu();
    refreshShell();
    toast('已退出登录，学习记录仍保留在本机', 'info', 2600);
    // 不再弹出登录框，仅把当前页切回未登录视图
    if (typeof window.__pageRefresh === 'function') window.__pageRefresh();
  }

  function openProfile() {
    const user = getUser();
    if (!user) return;
    const s = getStats();
    const body = $('#profileBody');
    if (body) {
      body.innerHTML = '' +
        '<div class="profile-head">' +
          '<img class="avatar xl" src="' + avatarOf(user) + '" alt="">' +
          '<div><strong>' + esc(displayName(user)) + '</strong>' +
          '<small>' + esc(user.type === 'book' ? '教材账号（20 位数字）' : '学工号账号') + ' · ' + esc(accountLabel(user)) + '</small></div>' +
        '</div>' +
        '<div class="profile-grid">' +
          '<div class="profile-cell"><b>' + s.solved + '</b><span>已解决</span></div>' +
          '<div class="profile-cell"><b>' + s.submissions + '</b><span>总提交</span></div>' +
          '<div class="profile-cell"><b>' + s.rate + '%</b><span>通过率</span></div>' +
          '<div class="profile-cell"><b>' + s.favorites + '</b><span>收藏</span></div>' +
        '</div>' +
        '<p class="modal-foot">' + (user.type === 'book'
          ? '点击右上角用户名可修改昵称。'
          : '学工号账号的显示名由学号前两位决定。') + '</p>';
    }
    openModal('profileModal');
  }

  function submitRename(e) {
    e.preventDefault();
    const user = getUser();
    if (!user || user.type !== 'book') return;
    const input = $('#renameInput');
    const err = $('#renameError');
    const value = input ? input.value.trim() : '';
    if (value.length < 2) {
      if (err) { err.textContent = '用户名至少 2 个字符'; err.hidden = false; }
      return;
    }
    if (value.length > 16) {
      if (err) { err.textContent = '用户名最多 16 个字符'; err.hidden = false; }
      return;
    }
    user.username = value;
    setUser(user);
    closeModal('renameModal');
    refreshShell();
    toast('用户名已更新为「' + value + '」', 'ok');
    if (typeof window.__pageRefresh === 'function') window.__pageRefresh();
  }

  /* ============================== 8. 学习数据 ============================== */
  function getProgress() {
    const raw = storage.read(KEY.progress, {});
    return raw && typeof raw === 'object' ? raw : {};
  }

  function setProgress(map) {
    storage.write(KEY.progress, map);
  }

  function getSubs() {
    const raw = storage.read(KEY.subs, []);
    return Array.isArray(raw) ? raw : [];
  }

  function pushSub(sub) {
    const list = getSubs();
    list.unshift(sub);
    storage.write(KEY.subs, list.slice(0, 80));
  }

  function statusOfProblem(pid) {
    const p = getProgress()[pid];
    return p === 'AC' ? 'AC' : (p ? 'TRY' : 'NEW');
  }

  function markSolved(pid, status) {
    const map = getProgress();
    if (status === 'AC') map[pid] = 'AC';
    else if (map[pid] !== 'AC') map[pid] = status;
    setProgress(map);
  }

  function getFavorites() {
    const raw = storage.read(KEY.fav, []);
    return Array.isArray(raw) ? raw : [];
  }

  function getWrongs() {
    const raw = storage.read(KEY.wrong, []);
    return Array.isArray(raw) ? raw : [];
  }

  function getStats() {
    const progress = getProgress();
    const subs = getSubs();
    const all = DATA_API.allProblems();
    let solved = 0;
    all.forEach((p) => { if (progress[p.id] === 'AC') solved += 1; });
    const acSubs = subs.filter((s) => s.status === 'AC').length;
    const attempted = all.filter((p) => progress[p.id]).length;
    return {
      solved,
      total: all.length,
      submissions: subs.length,
      acSubs,
      rate: subs.length ? Math.round((acSubs / subs.length) * 100) : 0,
      percent: all.length ? Math.round((solved / all.length) * 100) : 0,
      attempted,
      favorites: getFavorites().length,
      wrongs: getWrongs().length,
      recent: subs.slice(0, 6)
    };
  }

  function solvedCountOf(contestId) {
    const progress = getProgress();
    return DATA_API.problemsOf(contestId).filter((p) => progress[p.id] === 'AC').length;
  }

  function lastVisitedProblem() {
    const subs = getSubs();
    if (subs.length && PROBLEMS[subs[0].pid]) return subs[0].pid;
    const progress = getProgress();
    const keys = Object.keys(progress);
    if (keys.length) return keys[keys.length - 1];
    return DATA_API.allProblems()[0].id;
  }

  function dailyProblem() {
    const all = DATA_API.allProblems();
    const day = Math.floor(Date.now() / 86400000);
    return all[day % all.length];
  }

  /* ============================== 9. 通用片段 ============================== */
  const DIFF_CLASS = { '入门': 'diff-1', '简单': 'diff-2', '中等': 'diff-3', '困难': 'diff-4' };
  const KIND_LABEL = { homework: '作业赛', lab: '上机赛' };
  const KIND_CLASS = { homework: 'kind-home', lab: 'kind-lab' };

  function diffBadge(diff) {
    return '<span class="diff ' + (DIFF_CLASS[diff] || 'diff-2') + '">' + esc(diff) + '</span>';
  }

  function statusBadge(st) {
    if (st === 'AC') return '<span class="st st-ac">已通过</span>';
    if (st === 'TRY') return '<span class="st st-try">尝试过</span>';
    return '<span class="st st-new">未开始</span>';
  }

  function tagOfStatus(status) {
    const map = { live: 'live', upcoming: 'upcoming', ended: 'ended' };
    return '<span class="tag ' + (map[status] || 'ended') + '">' + DATA_API.statusLabel(status) + '</span>';
  }

  function kindBadge(kind) {
    return '<span class="badge ' + (KIND_CLASS[kind] || '') + '">' + (KIND_LABEL[kind] || '') + '</span>';
  }

  function emptyHint(text) {
    return '<p class="empty">' + esc(text) + '</p>';
  }

  /* ============================== 10. 首页 ============================== */
  function greeting() {
    const h = new Date().getHours();
    if (h < 6) return '夜深了';
    if (h < 12) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  function renderHome() {
    const root = $('#homeRoot');
    if (!root) return;
    const user = getUser();
    const s = getStats();
    const daily = dailyProblem();

    // 推荐比赛：进行中优先，其次最近的未开始，最后最近的已结束
    const sorted = DATA_API.statusOf ? CONTESTS.slice().sort((a, b) => {
      const rank = { live: 0, upcoming: 1, ended: 2 };
      const ra = rank[DATA_API.statusOf(a)];
      const rb = rank[DATA_API.statusOf(b)];
      if (ra !== rb) return ra - rb;
      return new Date(a.end.replace(' ', 'T')) - new Date(b.end.replace(' ', 'T'));
    }) : [];
    const spotlight = sorted.slice(0, 2);

    const pathRows = UNITS.map((u) => {
      const list = DATA_API.contestsOfUnit(u.n);
      const ids = list.reduce((acc, c) => acc.concat(DATA_API.problemsOf(c.id).map((p) => p.id)), []);
      const done = ids.filter((id) => getProgress()[id] === 'AC').length;
      const pct = ids.length ? Math.round((done / ids.length) * 100) : 0;
      return '' +
        '<li class="path-row">' +
          '<span class="path-no">' + String(u.n).padStart(2, '0') + '</span>' +
          '<div class="path-info">' +
            '<a href="problems.html?unit=' + u.n + '#path" class="path-title">' + esc(u.title) + '</a>' +
            '<div class="path-bar"><i style="width:' + pct + '%"></i></div>' +
          '</div>' +
          '<span class="path-count">' + done + '/' + ids.length + '</span>' +
        '</li>';
    }).join('');

    const contestRows = spotlight.map((c) => {
      const st = DATA_API.statusOf(c);
      const solved = solvedCountOf(c.id);
      const total = DATA_API.problemsOf(c.id).length;
      return '' +
        '<div class="contest-row">' +
          '<div class="contest-row-main">' +
            '<div class="contest-row-title">' + kindBadge(c.kind) + '<a href="contest-detail.html?id=' + c.id + '">' + c.id + ' · ' + esc(c.title) + '</a>' + tagOfStatus(st) + '</div>' +
            '<div class="meta">' + esc(c.start) + ' — ' + esc(c.end) + '<span class="dot">·</span>已通过 ' + solved + '/' + total + '</div>' +
          '</div>' +
          '<a class="btn btn-sm ' + (st === 'live' ? 'btn-primary' : 'btn-ghost') + '" href="contest-detail.html?id=' + c.id + '">' + (st === 'live' ? '进入比赛' : '查看详情') + '</a>' +
        '</div>';
    }).join('');

    const favs = getFavorites().filter((id) => PROBLEMS[id]);
    const wrongs = getWrongs().filter((id) => PROBLEMS[id]);

    const favHTML = favs.length
      ? favs.slice(0, 5).map((id) => {
          const p = PROBLEMS[id];
          return '<a class="side-item" href="problem-detail.html?pid=' + id + '&cid=' + p.contest + '">' +
            '<span class="side-item-title">' + id + ' ' + esc(p.title) + '</span>' +
            diffBadge(p.difficulty) +
          '</a>';
        }).join('')
      : emptyHint('还没有收藏题目');

    const wrongHTML = wrongs.length
      ? wrongs.slice(0, 5).map((id) => {
          const p = PROBLEMS[id];
          return '<a class="side-item" href="problem-detail.html?pid=' + id + '&cid=' + p.contest + '">' +
            '<span class="side-item-title">' + id + ' ' + esc(p.title) + '</span>' +
            diffBadge(p.difficulty) +
          '</a>';
        }).join('')
      : emptyHint('错题本还是空的');

    const recentHTML = s.recent.length
      ? s.recent.map((sub) => {
          const p = PROBLEMS[sub.pid];
          return '<div class="side-item static">' +
            '<span class="side-item-title">' + (p ? esc(p.title) : esc(sub.pid)) + '</span>' +
            '<span class="verdict ' + sub.status.toLowerCase() + '">' + sub.status + '</span>' +
          '</div>';
        }).join('')
      : emptyHint('还没有提交记录');

    root.innerHTML = '' +
      '<section class="hero">' +
        '<div class="hero-main">' +
          '<p class="eyebrow">C 语言程序设计 · 课程在线评测</p>' +
          '<h1>' + greeting() + (user ? '，<span class="hl">' + esc(displayName(user)) + '</span>' : '，同学') + '</h1>' +
          '<p class="hero-sub">从顺序结构到指针与结构体，E 作业赛打基础，C 上机赛练实战，48 道题按课程进度排好了队。</p>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-primary" href="problems.html">进入学习路径</a>' +
            '<a class="btn btn-ghost" href="problem-detail.html?pid=' + lastVisitedProblem() + '">继续上次练习</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-side">' +
          '<div class="ring" style="--p:' + s.percent + '">' +
            '<div class="ring-inner"><b>' + s.percent + '%</b><small>完成度</small></div>' +
          '</div>' +
          '<p class="ring-note">已解决 <b>' + s.solved + '</b> / ' + s.total + ' 题</p>' +
        '</div>' +
      '</section>' +
      '<section class="stat-grid">' +
        '<div class="stat"><span class="stat-label">已解决</span><b>' + s.solved + '</b><small>共 ' + s.total + ' 题</small></div>' +
        '<div class="stat"><span class="stat-label">提交次数</span><b>' + s.submissions + '</b><small>AC ' + s.acSubs + ' 次</small></div>' +
        '<div class="stat"><span class="stat-label">通过率</span><b>' + s.rate + '%</b><small>仅统计本机提交</small></div>' +
        '<div class="stat"><span class="stat-label">收藏 / 错题</span><b>' + s.favorites + ' / ' + s.wrongs + '</b><small>随时回顾</small></div>' +
      '</section>' +
      '<div class="home-grid">' +
        '<div class="col-main">' +
          '<section class="card">' +
            '<div class="card-head"><h2>学习路径</h2><a class="more" href="problems.html">查看全部 →</a></div>' +
            '<ol class="mini-path">' + pathRows + '</ol>' +
          '</section>' +
          '<section class="card">' +
            '<div class="card-head"><h2>比赛</h2><a class="more" href="contests.html">全部比赛 →</a></div>' +
            (contestRows || emptyHint('暂无比赛')) +
            '<p class="note">比赛无需报名，点击即可参加；未登录时仅能浏览。</p>' +
          '</section>' +
        '</div>' +
        '<aside class="col-side">' +
          '<section class="card daily">' +
            '<div class="card-head"><h2>每日一题</h2><span class="tag upcoming">今日</span></div>' +
            '<p class="daily-title"><a href="problem-detail.html?pid=' + daily.id + '&cid=' + daily.contest + '">' + daily.id + ' · ' + esc(daily.title) + '</a></p>' +
            '<p class="daily-desc">' + esc(daily.desc.slice(0, 56)) + '…</p>' +
            '<div class="daily-meta">' + diffBadge(daily.difficulty) + '<span class="muted">' + esc(daily.tags.join(' / ')) + '</span></div>' +
            '<a class="btn btn-sm btn-primary" href="problem-detail.html?pid=' + daily.id + '&cid=' + daily.contest + '">去完成</a>' +
          '</section>' +
          '<section class="card">' +
            '<div class="card-head"><h2>收藏单</h2><a class="more" href="problems.html">更多 →</a></div>' +
            favHTML +
          '</section>' +
          '<section class="card">' +
            '<div class="card-head"><h2>错题单</h2><a class="more" href="problems.html">更多 →</a></div>' +
            wrongHTML +
          '</section>' +
          '<section class="card">' +
            '<div class="card-head"><h2>最近提交</h2></div>' +
            recentHTML +
          '</section>' +
        '</aside>' +
      '</div>';
  }

  /* ============================== 11. 题库 ============================== */
  const problemState = {
    view: 'path',
    page: 1,
    unit: 'all',
    kind: 'all',
    diff: 'all',
    status: 'all',
    q: ''
  };
  const PAGE_SIZE = 8;

  function renderProblems() {
    const root = $('#problemsRoot');
    if (!root) return;

    const params = new URLSearchParams(location.search);
    if (params.get('unit')) problemState.unit = params.get('unit');
    if (params.get('view') === 'all') problemState.view = 'all';

    root.innerHTML = '' +
      '<div class="page-head">' +
        '<div>' +
          '<h1>题库</h1>' +
          '<p>按课程进度编排：每个单元先完成 <b>E 作业赛</b> 打基础，再挑战 <b>C 上机赛</b>。共 ' + DATA_API.allProblems().length + ' 道题。</p>' +
        '</div>' +
        '<div class="page-head-side">' +
          '<span class="pill">已解决 ' + getStats().solved + ' / ' + DATA_API.allProblems().length + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="tabbar">' +
        '<button class="tab' + (problemState.view === 'path' ? ' active' : '') + '" data-view="path" type="button">学习路径</button>' +
        '<button class="tab' + (problemState.view === 'all' ? ' active' : '') + '" data-view="all" type="button">全部题目</button>' +
      '</div>' +
      '<section id="viewPath" class="' + (problemState.view === 'path' ? '' : 'hidden') + '"></section>' +
      '<section id="viewAll" class="' + (problemState.view === 'all' ? '' : 'hidden') + '"></section>';

    $$('.tabbar .tab', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        problemState.view = btn.dataset.view;
        $$('.tabbar .tab', root).forEach((b) => b.classList.toggle('active', b === btn));
        $('#viewPath').classList.toggle('hidden', problemState.view !== 'path');
        $('#viewAll').classList.toggle('hidden', problemState.view !== 'all');
        if (problemState.view === 'all') renderAllProblems();
      });
    });

    renderPath();
    renderAllProblems();
  }

  function renderPath() {
    const box = $('#viewPath');
    if (!box) return;
    const progress = getProgress();

    const blocks = UNITS.map((u) => {
      const contests = DATA_API.contestsOfUnit(u.n);
      const allIds = contests.reduce((acc, c) => acc.concat(DATA_API.problemsOf(c.id).map((p) => p.id)), []);
      const done = allIds.filter((id) => progress[id] === 'AC').length;
      const pct = allIds.length ? Math.round((done / allIds.length) * 100) : 0;

      const contestBlocks = contests.map((c) => {
        const st = DATA_API.statusOf(c);
        const list = DATA_API.problemsOf(c.id);
        const chips = list.map((p) => {
          const pst = progress[p.id] === 'AC' ? ' ac' : (progress[p.id] ? ' try' : '');
          return '<a class="chip' + pst + '" href="problem-detail.html?pid=' + p.id + '&cid=' + c.id + '">' +
            '<span class="chip-no">' + p.no + '</span>' + esc(p.title) +
            '</a>';
        }).join('');
        const solved = list.filter((p) => progress[p.id] === 'AC').length;
        return '' +
          '<div class="contest-block ' + KIND_CLASS[c.kind] + '">' +
            '<div class="contest-block-head">' +
              '<span class="block-id">' + c.id + '</span>' +
              '<div class="block-name">' + esc(c.title) + '<small>' + (c.kind === 'homework' ? '基础巩固 · 时间充裕' : '限时实战 · 2 小时') + '</small></div>' +
              tagOfStatus(st) +
            '</div>' +
            '<div class="chips">' + chips + '</div>' +
            '<div class="block-foot">' +
              '<span class="muted">已通过 ' + solved + '/' + list.length + '</span>' +
              '<a class="link-arrow" href="contest-detail.html?id=' + c.id + '">进入比赛 →</a>' +
            '</div>' +
          '</div>';
      }).join('');

      return '' +
        '<article class="unit-card" id="unit-' + u.n + '">' +
          '<header class="unit-head">' +
            '<span class="unit-no">' + String(u.n).padStart(2, '0') + '</span>' +
            '<div class="unit-text">' +
              '<h3>' + esc(u.title) + '</h3>' +
              '<p>' + esc(u.topics) + '</p>' +
            '</div>' +
            '<span class="unit-pct">' + pct + '%</span>' +
          '</header>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
          '<p class="unit-goal">' + esc(u.goal) + '</p>' +
          '<div class="unit-contests">' + contestBlocks + '</div>' +
        '</article>';
    });

    // 单元之间插入「进阶」连接
    const withConnector = [];
    blocks.forEach((b, i) => {
      withConnector.push(b);
      if (i < blocks.length - 1) {
        withConnector.push('<div class="path-connector" aria-hidden="true"><span>进阶</span></div>');
      }
    });

    box.innerHTML = '<div class="path-list">' + withConnector.join('') + '</div>';

    if (problemState.unit !== 'all') {
      const card = document.getElementById('unit-' + problemState.unit);
      if (card) setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }

  function filteredProblems() {
    const progress = getProgress();
    const q = problemState.q.trim().toLowerCase();
    return DATA_API.allProblems().filter((p) => {
      if (problemState.unit !== 'all' && String(p.unit) !== String(problemState.unit)) return false;
      if (problemState.kind !== 'all') {
        const c = DATA_API.contest(p.contest);
        if (!c || c.kind !== problemState.kind) return false;
      }
      if (problemState.diff !== 'all' && p.difficulty !== problemState.diff) return false;
      if (problemState.status === 'solved' && progress[p.id] !== 'AC') return false;
      if (problemState.status === 'todo' && progress[p.id] === 'AC') return false;
      if (q) {
        const hay = (p.id + ' ' + p.title + ' ' + p.tags.join(' ') + ' ' + p.desc).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderAllProblems() {
    const box = $('#viewAll');
    if (!box) return;

    const options = (list, cur, label) => list.map((o) =>
      '<option value="' + o.value + '"' + (String(o.value) === String(cur) ? ' selected' : '') + '>' + o.label + '</option>'
    ).join('');

    const unitOpts = [{ value: 'all', label: '全部章节' }].concat(UNITS.map((u) => ({ value: u.n, label: '第' + u.n + '章 ' + u.title })));
    const kindOpts = [{ value: 'all', label: '全部类型' }, { value: 'homework', label: '作业赛 E' }, { value: 'lab', label: '上机赛 C' }];
    const diffOpts = ['all', '入门', '简单', '中等', '困难'].map((d) => ({ value: d, label: d === 'all' ? '全部难度' : d }));
    const statusOpts = [{ value: 'all', label: '全部状态' }, { value: 'solved', label: '已通过' }, { value: 'todo', label: '未通过' }];

    const list = filteredProblems();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (problemState.page > totalPages) problemState.page = totalPages;
    const start = (problemState.page - 1) * PAGE_SIZE;
    const rows = list.slice(start, start + PAGE_SIZE).map((p) => {
      const st = statusOfProblem(p.id);
      return '' +
        '<tr>' +
          '<td class="mono">' + p.id + '</td>' +
          '<td><a class="cell-title" href="problem-detail.html?pid=' + p.id + '&cid=' + p.contest + '">' + esc(p.title) + '</a>' +
            '<div class="cell-tags">' + p.tags.map((t) => '<span class="chip-tag">' + esc(t) + '</span>').join('') + '</div></td>' +
          '<td><a class="cell-soft" href="contest-detail.html?id=' + p.contest + '">' + p.contest + '</a></td>' +
          '<td>' + diffBadge(p.difficulty) + '</td>' +
          '<td class="mono">' + p.rate + '%</td>' +
          '<td>' + statusBadge(st) + '</td>' +
          '<td><a class="btn btn-sm btn-ghost" href="problem-detail.html?pid=' + p.id + '&cid=' + p.contest + '">' + (st === 'AC' ? '回顾' : '去做题') + '</a></td>' +
        '</tr>';
    }).join('');

    const pager = [];
    pager.push('<button class="page-btn" type="button" data-page="' + (problemState.page - 1) + '"' + (problemState.page === 1 ? ' disabled' : '') + '>上一页</button>');
    for (let i = 1; i <= totalPages; i += 1) {
      pager.push('<button class="page-btn num' + (i === problemState.page ? ' active' : '') + '" type="button" data-page="' + i + '">' + i + '</button>');
    }
    pager.push('<button class="page-btn" type="button" data-page="' + (problemState.page + 1) + '"' + (problemState.page === totalPages ? ' disabled' : '') + '>下一页</button>');

    box.innerHTML = '' +
      '<div class="filter-bar">' +
        '<label class="filter"><span>章节</span><select id="fUnit">' + options(unitOpts, problemState.unit) + '</select></label>' +
        '<label class="filter"><span>类型</span><select id="fKind">' + options(kindOpts, problemState.kind) + '</select></label>' +
        '<label class="filter"><span>难度</span><select id="fDiff">' + options(diffOpts, problemState.diff) + '</select></label>' +
        '<label class="filter"><span>状态</span><select id="fStatus">' + options(statusOpts, problemState.status) + '</select></label>' +
        '<label class="filter search"><span>搜索</span><input id="fQ" type="search" placeholder="题号 / 标题 / 标签" value="' + esc(problemState.q) + '"></label>' +
      '</div>' +
      '<div class="table-wrap"><table class="data-table">' +
        '<thead><tr><th>题号</th><th>题目</th><th>比赛</th><th>难度</th><th>通过率</th><th>状态</th><th>操作</th></tr></thead>' +
        '<tbody>' + (rows || '<tr><td colspan="7" class="table-empty">没有符合条件的题目</td></tr>') + '</tbody>' +
      '</table></div>' +
      '<div class="table-foot"><span class="muted">共 ' + list.length + ' 题 · 第 ' + problemState.page + ' / ' + totalPages + ' 页</span>' +
        '<div class="pager">' + pager.join('') + '</div>' +
      '</div>';

    const applyFilter = () => { problemState.page = 1; renderAllProblems(); };
    $('#fUnit').addEventListener('change', (e) => { problemState.unit = e.target.value; applyFilter(); });
    $('#fKind').addEventListener('change', (e) => { problemState.kind = e.target.value; applyFilter(); });
    $('#fDiff').addEventListener('change', (e) => { problemState.diff = e.target.value; applyFilter(); });
    $('#fStatus').addEventListener('change', (e) => { problemState.status = e.target.value; applyFilter(); });
    $('#fQ').addEventListener('input', (e) => {
      if (e.isComposing) return; // 中文输入法组合过程中不重绘，避免打断输入
      problemState.q = e.target.value;
      problemState.page = 1;
      renderAllProblems();
      const q = $('#fQ');
      if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
    });
    $$('.page-btn', box).forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const target = parseInt(btn.dataset.page, 10);
        if (!target || target < 1 || target > totalPages) return;
        problemState.page = target;
        renderAllProblems();
        const table = $('.table-wrap');
        if (table) table.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  /* ============================== 12. 比赛列表 ============================== */
  const contestState = { filter: 'all', page: 1 };
  const CONTEST_PAGE_SIZE = 6;

  function renderContests() {
    const root = $('#contestsRoot');
    if (!root) return;
    const user = getUser();

    if (!user) {
      root.innerHTML = guardHTML('查看比赛需要登录', '登录后可以查看 E 作业赛与 C 上机赛的题目、时间与排名。');
      bindGuard();
      return;
    }

    const filters = [
      { key: 'all', label: '全部' },
      { key: 'lab', label: '上机赛 C' },
      { key: 'homework', label: '作业赛 E' },
      { key: 'live', label: '进行中' },
      { key: 'ended', label: '已结束' }
    ];

    const list = CONTESTS.filter((c) => {
      if (contestState.filter === 'all') return true;
      if (contestState.filter === 'lab' || contestState.filter === 'homework') return c.kind === contestState.filter;
      return DATA_API.statusOf(c) === contestState.filter;
    }).sort((a, b) => {
      // 进行中 → 未开始（最近的在前）→ 已结束（最新的在前）
      const rank = { live: 0, upcoming: 1, ended: 2 };
      const ra = rank[DATA_API.statusOf(a)];
      const rb = rank[DATA_API.statusOf(b)];
      if (ra !== rb) return ra - rb;
      const ta = new Date(a.start.replace(' ', 'T')).getTime();
      const tb = new Date(b.start.replace(' ', 'T')).getTime();
      return ra === 2 ? tb - ta : ta - tb;
    });

    const totalPages = Math.max(1, Math.ceil(list.length / CONTEST_PAGE_SIZE));
    if (contestState.page > totalPages) contestState.page = totalPages;
    const start = (contestState.page - 1) * CONTEST_PAGE_SIZE;
    const pageItems = list.slice(start, start + CONTEST_PAGE_SIZE);

    const rows = pageItems.map((c) => {
      const st = DATA_API.statusOf(c);
      const solved = solvedCountOf(c.id);
      const total = DATA_API.problemsOf(c.id).length;
      return '' +
        '<tr>' +
          '<td><a class="cell-title" href="contest-detail.html?id=' + c.id + '">' + c.id + ' · ' + esc(c.title) + '</a>' +
            '<div class="cell-tags"><span class="chip-tag">第 ' + c.unit + ' 章 ' + esc(UNITS[c.unit - 1].title) + '</span></div></td>' +
          '<td>' + kindBadge(c.kind) + '</td>' +
          '<td>' + tagOfStatus(st) + '</td>' +
          '<td class="mono small">' + esc(c.start) + '<br>' + esc(c.end) + '</td>' +
          '<td class="mono">' + solved + ' / ' + total + '<div class="mini-bar"><i style="width:' + (total ? Math.round(savedPercent(solved, total)) : 0) + '%"></i></div></td>' +
          '<td><a class="btn btn-sm ' + (st === 'live' ? 'btn-primary' : 'btn-ghost') + '" href="contest-detail.html?id=' + c.id + '">' +
            (st === 'live' ? '进入比赛' : st === 'upcoming' ? '查看详情' : '去补题') + '</a></td>' +
        '</tr>';
    }).join('');

    const pager = [];
    pager.push('<button class="page-btn" type="button" data-page="' + (contestState.page - 1) + '"' + (contestState.page === 1 ? ' disabled' : '') + '>上一页</button>');
    for (let i = 1; i <= totalPages; i += 1) {
      pager.push('<button class="page-btn num' + (i === contestState.page ? ' active' : '') + '" type="button" data-page="' + i + '">' + i + '</button>');
    }
    pager.push('<button class="page-btn" type="button" data-page="' + (contestState.page + 1) + '"' + (contestState.page === totalPages ? ' disabled' : '') + '>下一页</button>');

    root.innerHTML = '' +
      '<div class="page-head">' +
        '<div><h1>比赛</h1><p>E 作业赛与 C 上机赛交替进行，无需报名，登录后可直接进入。</p></div>' +
        '<div class="page-head-side"><span class="pill">进行中 ' + CONTESTS.filter((c) => DATA_API.statusOf(c) === 'live').length + ' 场</span></div>' +
      '</div>' +
      '<div class="tabbar">' + filters.map((f) =>
        '<button class="tab' + (contestState.filter === f.key ? ' active' : '') + '" data-filter="' + f.key + '" type="button">' + f.label + '</button>'
      ).join('') + '</div>' +
      '<section class="card table-card">' +
        '<div class="table-wrap"><table class="data-table">' +
          '<thead><tr><th>比赛名称</th><th>类型</th><th>状态</th><th>时间</th><th>我的进度</th><th>操作</th></tr></thead>' +
          '<tbody>' + (rows || '<tr><td colspan="6" class="table-empty">暂无符合条件的比赛</td></tr>') + '</tbody>' +
        '</table></div>' +
        '<div class="table-foot"><span class="muted">共 ' + list.length + ' 场 · 第 ' + contestState.page + ' / ' + totalPages + ' 页</span>' +
          '<div class="pager">' + pager.join('') + '</div>' +
        '</div>' +
      '</section>';

    $$('.tabbar .tab', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        contestState.filter = btn.dataset.filter;
        contestState.page = 1;
        renderContests();
      });
    });
    $$('.page-btn', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const target = parseInt(btn.dataset.page, 10);
        if (!target || target < 1 || target > totalPages) return;
        contestState.page = target;
        renderContests();
      });
    });
  }

  function savedPercent(done, total) {
    return total ? (done / total) * 100 : 0;
  }

  /* ============================== 13. 比赛详情 ============================== */
  let countdownTimer = null;

  function mockRank(contestId) {
    // 由比赛 id 生成稳定的演示排名
    let seed = 0;
    for (let i = 0; i < contestId.length; i += 1) seed = (seed * 31 + contestId.charCodeAt(i)) % 9973;
    const total = DATA_API.problemsOf(contestId).length;
    const pool = RANKS.slice(0, 10);
    const rows = pool.map((r, i) => {
      const solved = Math.max(1, Math.min(total, total - (i % 3)));
      const penalty = 12 + ((seed + i * 37) % 90);
      return { name: r.name, solved, penalty };
    }).sort((a, b) => (b.solved - a.solved) || (a.penalty - b.penalty));
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  }

  function renderContestDetail() {
    const root = $('#contestDetailRoot');
    if (!root) return;
    const params = new URLSearchParams(location.search);
    const cid = params.get('id') || 'E1';
    const contest = DATA_API.contest(cid);
    if (!contest) {
      root.innerHTML = '<section class="card">' + emptyHint('没有找到这场比赛') +
        '<p class="center"><a class="btn btn-primary" href="contests.html">返回比赛列表</a></p></section>';
      return;
    }

    if (!getUser()) {
      root.innerHTML = guardHTML('查看比赛需要登录', '登录后即可进入「' + contest.id + ' ' + contest.title + '」，比赛无需报名。');
      bindGuard();
      return;
    }

    const st = DATA_API.statusOf(contest);
    const problems = DATA_API.problemsOf(cid);
    const solved = problems.filter((p) => getProgress()[p.id] === 'AC').length;
    const rankRows = mockRank(cid);
    const me = getUser();

    const problemRows = problems.map((p) => {
      const pst = statusOfProblem(p.id);
      return '' +
        '<tr>' +
          '<td class="mono">' + p.id + '</td>' +
          '<td><a class="cell-title" href="problem-detail.html?pid=' + p.id + '&cid=' + cid + '">' + esc(p.title) + '</a></td>' +
          '<td>' + diffBadge(p.difficulty) + '</td>' +
          '<td class="mono">' + p.rate + '%</td>' +
          '<td>' + statusBadge(pst) + '</td>' +
          '<td><a class="btn btn-sm btn-ghost" href="problem-detail.html?pid=' + p.id + '&cid=' + cid + '">' + (pst === 'AC' ? '回顾' : '去做题') + '</a></td>' +
        '</tr>';
    }).join('');

    const rankHTML = rankRows.slice(0, 10).map((r) =>
      '<tr' + (r.name === me.account ? ' class="me-row"' : '') + '>' +
        '<td class="mono">' + r.rank + '</td>' +
        '<td>' + esc(r.name) + (r.name === me.account ? ' <span class="me-tag">我</span>' : '') + '</td>' +
        '<td class="mono">' + r.solved + '</td>' +
        '<td class="mono">' + r.penalty + ' min</td>' +
      '</tr>'
    ).join('');

    root.innerHTML = '' +
      '<div class="page-head with-back">' +
        '<a class="back-link" href="contests.html">← 返回比赛列表</a>' +
      '</div>' +
      '<section class="card contest-hero ' + KIND_CLASS[contest.kind] + '">' +
        '<div class="contest-hero-main">' +
          '<div class="contest-hero-top">' + kindBadge(contest.kind) + tagOfStatus(st) +
            '<span class="muted">第 ' + contest.unit + ' 章 · ' + esc(UNITS[contest.unit - 1].title) + '</span>' +
          '</div>' +
          '<h1>' + contest.id + ' · ' + esc(contest.title) + '</h1>' +
          '<p class="contest-hero-desc">' + esc(contest.desc) + '</p>' +
          '<div class="meta-row"><span>' + esc(contest.start) + ' — ' + esc(contest.end) + '</span><span class="dot">·</span><span>' + problems.length + ' 道题</span></div>' +
        '</div>' +
        '<div class="contest-hero-side">' +
          '<div class="countdown" id="contestCountdown">--</div>' +
          '<small>' + (st === 'live' ? '距结束' : st === 'upcoming' ? '距开始' : '比赛已结束') + '</small>' +
          '<div class="contest-progress"><span>我的进度</span><b>' + solved + ' / ' + problems.length + '</b></div>' +
        '</div>' +
      '</section>' +
      '<div class="grid-2">' +
        '<section class="card">' +
          '<div class="card-head"><h2>题目列表</h2><span class="muted">共 ' + problems.length + ' 题</span></div>' +
          '<div class="table-wrap"><table class="data-table">' +
            '<thead><tr><th>题号</th><th>题目</th><th>难度</th><th>通过率</th><th>状态</th><th>操作</th></tr></thead>' +
            '<tbody>' + problemRows + '</tbody>' +
          '</table></div>' +
        '</section>' +
        '<section class="card">' +
          '<div class="card-head"><h2>本场排名</h2><span class="muted">演示数据</span></div>' +
          '<div class="table-wrap"><table class="data-table compact">' +
            '<thead><tr><th>名次</th><th>用户名</th><th>通过</th><th>罚时</th></tr></thead>' +
            '<tbody>' + rankHTML + '</tbody>' +
          '</table></div>' +
          '<p class="note">比赛无需报名，题目在比赛时间内随时可做。</p>' +
        '</section>' +
      '</div>';

    startCountdown(contest, st);
  }

  function startCountdown(contest, st) {
    const el = $('#contestCountdown');
    if (!el) return;
    clearInterval(countdownTimer);
    if (st === 'ended') { el.textContent = '已结束'; return; }

    const target = new Date((st === 'live' ? contest.end : contest.start).replace(' ', 'T')).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        el.textContent = st === 'live' ? '已结束' : '已开始';
        clearInterval(countdownTimer);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.textContent = (d > 0 ? d + ' 天 ' : '') + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  /* ============================== 14. 题目详情 ============================== */
  let judgeTimer = null;

  function renderProblemDetail() {
    const root = $('#problemDetailRoot');
    if (!root) return;
    const params = new URLSearchParams(location.search);
    const pid = params.get('pid') || 'E1-1';
    const problem = PROBLEMS[pid];
    if (!problem) {
      root.innerHTML = '<section class="card">' + emptyHint('没有找到这道题目') +
        '<p class="center"><a class="btn btn-primary" href="problems.html">返回题库</a></p></section>';
      return;
    }

    const cid = params.get('cid') || problem.contest;
    const contest = DATA_API.contest(cid);
    const siblings = contest ? DATA_API.problemsOf(cid) : [];
    const idx = siblings.findIndex((p) => p.id === pid);
    const nextProblem = siblings.length ? siblings[(idx + 1) % siblings.length] : null;
    const user = getUser();
    const st = statusOfProblem(pid);
    const subs = getSubs().filter((s) => s.pid === pid).slice(0, 8);

    const navBar = siblings.length ? siblings.map((p) =>
      '<a class="contest-nav-item' + (p.id === pid ? ' active' : '') + (statusOfProblem(p.id) === 'AC' ? ' ac' : '') + '"' +
      ' href="problem-detail.html?pid=' + p.id + '&cid=' + cid + '" title="' + esc(p.title) + '">' + p.no + '</a>'
    ).join('') : '';

    const subRows = subs.length ? subs.map((s) =>
      '<tr><td class="mono">' + s.id + '</td><td><span class="verdict ' + s.status.toLowerCase() + '">' + s.status + '</span></td>' +
      '<td class="mono">' + s.time + 'ms</td><td class="mono">' + esc(s.lang) + '</td></tr>'
    ).join('') : '<tr><td colspan="4" class="table-empty">还没有提交记录</td></tr>';

    const fav = getFavorites().includes(pid);
    const wrong = getWrongs().includes(pid);

    root.innerHTML = '' +
      '<div class="page-head with-back">' +
        '<a class="back-link" href="' + (contest ? 'contest-detail.html?id=' + cid : 'problems.html') + '">' +
          (contest ? '← 返回 ' + contest.id + ' ' + esc(contest.title) : '← 返回题库') +
        '</a>' +
        '<span class="crumb">' + (contest ? esc(CONTESTS.find((c) => c.id === cid).title) : '题库') + ' / ' + pid + '</span>' +
      '</div>' +
      (navBar ? '<div class="contest-nav-bar">' + navBar + '</div>' : '') +
      '<div class="problem-layout">' +
        '<div class="col-main">' +
          '<section class="card statement">' +
            '<div class="problem-title-area">' +
              '<div class="problem-title-top">' + diffBadge(problem.difficulty) +
                problem.tags.map((t) => '<span class="chip-tag">' + esc(t) + '</span>').join('') +
                statusBadge(st) +
              '</div>' +
              '<h1>' + pid + '. ' + esc(problem.title) + '</h1>' +
              '<div class="problem-stats">时间限制 1000ms · 内存限制 128MB · 通过率 ' + problem.rate + '% · 所属 ' + esc(problem.contest) + ' ' + esc(contest ? contest.title : '') + '</div>' +
            '</div>' +
            '<div class="statement-section"><h3>题目描述</h3><p>' + esc(problem.desc) + '</p></div>' +
            '<div class="statement-section"><h3>输入格式</h3><p>' + esc(problem.input) + '</p></div>' +
            '<div class="statement-section"><h3>输出格式</h3><p>' + esc(problem.output) + '</p></div>' +
            '<div class="statement-section"><h3>输入样例</h3>' +
              '<div class="sample-block"><pre class="code-block" id="sampleIn">' + esc(problem.sampleIn) + '</pre>' +
              '<button class="copy-btn" type="button" data-copy="sampleIn">复制</button></div>' +
            '</div>' +
            '<div class="statement-section"><h3>输出样例</h3>' +
              '<div class="sample-block"><pre class="code-block" id="sampleOut">' + esc(problem.sampleOut) + '</pre>' +
              '<button class="copy-btn" type="button" data-copy="sampleOut">复制</button></div>' +
            '</div>' +
            '<div class="statement-section">' +
              '<button class="hint-toggle" type="button" id="hintToggle">提示 ▾</button>' +
              '<div class="hint-body hidden" id="hintBody">' + esc(problem.hint) + '</div>' +
            '</div>' +
            '<div class="action-bar">' +
              '<div class="btn-group">' +
                '<button class="btn btn-ghost' + (fav ? ' active' : '') + '" type="button" id="favBtn">' + (fav ? '★ 已收藏' : '☆ 收藏') + '</button>' +
                '<button class="btn btn-ghost' + (wrong ? ' active' : '') + '" type="button" id="wrongBtn">' + (wrong ? '已加入错题' : '加入错题') + '</button>' +
              '</div>' +
              '<a class="btn btn-ghost" href="' + (nextProblem ? 'problem-detail.html?pid=' + nextProblem.id + '&cid=' + cid : 'problems.html') + '">下一题 →</a>' +
            '</div>' +
          '</section>' +
          '<section class="card submit-card">' +
            '<div class="card-head"><h2>代码提交</h2>' +
              '<div class="submit-tools">' +
                '<select id="langSelect"><option value="C">C</option><option value="C++" selected>C++</option></select>' +
                '<button class="btn btn-sm btn-ghost" type="button" id="resetCode">重置</button>' +
              '</div>' +
            '</div>' +
            '<textarea class="code-area" id="codeArea" spellcheck="false" placeholder="// 在此处输入代码&#10;#include &lt;stdio.h&gt;&#10;int main() {&#10;    return 0;&#10;}"></textarea>' +
            '<div class="submit-bar">' +
              '<span class="muted">' + (user ? '当前账号：' + esc(displayName(user)) : '未登录：可以阅读题目，登录后才能提交') + '</span>' +
              '<div class="btn-group">' +
                '<button class="btn btn-ghost" type="button" id="runBtn">运行样例</button>' +
                '<button class="btn btn-primary" type="button" id="submitBtn">' + (user ? '提交代码' : '登录后提交') + '</button>' +
              '</div>' +
            '</div>' +
            '<div class="judge-panel hidden" id="judgePanel"></div>' +
          '</section>' +
        '</div>' +
        '<aside class="col-side">' +
          '<section class="card">' +
            '<div class="card-head"><h2>本题状态</h2></div>' +
            '<div class="status-box">' +
              '<div class="status-line"><span>我的状态</span><b>' + (st === 'AC' ? '已通过' : st === 'TRY' ? '尝试过' : '未开始') + '</b></div>' +
              '<div class="status-line"><span>提交次数</span><b>' + subs.length + '</b></div>' +
              '<div class="status-line"><span>全局通过率</span><b>' + problem.rate + '%</b></div>' +
            '</div>' +
          '</section>' +
          '<section class="card">' +
            '<div class="card-head"><h2>我的提交</h2><span class="muted">最近 8 条</span></div>' +
            '<div class="table-wrap"><table class="data-table compact">' +
              '<thead><tr><th>ID</th><th>状态</th><th>耗时</th><th>语言</th></tr></thead>' +
              '<tbody>' + subRows + '</tbody>' +
            '</table></div>' +
          '</section>' +
          '<section class="card">' +
            '<div class="card-head"><h2>同场比赛</h2></div>' +
            (siblings.length ? siblings.map((p) =>
              '<a class="side-item' + (p.id === pid ? ' current' : '') + '" href="problem-detail.html?pid=' + p.id + '&cid=' + cid + '">' +
                '<span class="side-item-title">' + p.id + ' ' + esc(p.title) + '</span>' +
                (statusOfProblem(p.id) === 'AC' ? '<span class="st st-ac">AC</span>' : '') +
              '</a>'
            ).join('') : emptyHint('暂无关联题目')) +
          '</section>' +
        '</aside>' +
      '</div>';

    bindProblemActions(problem, cid);
  }

  function bindProblemActions(problem, cid) {
    const pid = problem.id;

    $$('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.copy);
        if (!target) return;
        const text = target.textContent;
        const done = () => toast('已复制到剪贴板', 'ok', 1400);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
        } else {
          fallbackCopy(text, done);
        }
      });
    });

    const hintToggle = $('#hintToggle');
    if (hintToggle) {
      hintToggle.addEventListener('click', () => {
        const body = $('#hintBody');
        if (!body) return;
        const open = body.classList.toggle('hidden');
        hintToggle.textContent = open ? '提示 ▾' : '收起 ▴';
      });
    }

    const favBtn = $('#favBtn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        if (!requireLogin('收藏题目')) return;
        let favs = getFavorites();
        const has = favs.includes(pid);
        favs = has ? favs.filter((x) => x !== pid) : favs.concat(pid);
        storage.write(KEY.fav, favs);
        favBtn.textContent = has ? '☆ 收藏' : '★ 已收藏';
        favBtn.classList.toggle('active', !has);
        toast(has ? '已取消收藏' : '已收藏本题', 'ok', 1500);
      });
    }

    const wrongBtn = $('#wrongBtn');
    if (wrongBtn) {
      wrongBtn.addEventListener('click', () => {
        if (!requireLogin('加入错题')) return;
        let wrongs = getWrongs();
        const has = wrongs.includes(pid);
        wrongs = has ? wrongs.filter((x) => x !== pid) : wrongs.concat(pid);
        storage.write(KEY.wrong, wrongs);
        wrongBtn.textContent = has ? '加入错题' : '已加入错题';
        wrongBtn.classList.toggle('active', !has);
        toast(has ? '已从错题本移除' : '已加入错题本', 'ok', 1500);
      });
    }

    const code = $('#codeArea');
    const resetBtn = $('#resetCode');
    if (resetBtn && code) {
      resetBtn.addEventListener('click', () => {
        code.value = '';
        code.focus();
      });
    }

    const runBtn = $('#runBtn');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        const panel = $('#judgePanel');
        if (!panel) return;
        panel.classList.remove('hidden');
        panel.innerHTML = '' +
          '<div class="judge-head"><span class="spinner"></span>正在本地模拟运行样例…</div>' +
          '<pre class="judge-out">输入：\n' + esc(problem.sampleIn) + '\n\n期望输出：\n' + esc(problem.sampleOut) + '</pre>' +
          '<p class="note">前端无法真实编译运行 C 代码，此处展示题面样例，提交后由模拟评测给出结果。</p>';
      });
    }

    const submitBtn = $('#submitBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (!requireLogin('提交代码')) return;
        const area = $('#codeArea');
        const langSel = $('#langSelect');
        const codeText = area ? area.value : '';
        const lang = langSel ? langSel.value : 'C++';
        const panel = $('#judgePanel');
        if (!panel) return;
        panel.classList.remove('hidden');
        const status = pseudoJudge(codeText, pid);
        panel.innerHTML = '' +
          '<div class="judge-head"><span class="spinner"></span>评测中…<span class="judge-sub">' + esc(lang) + ' · 模拟评测机</span></div>' +
          '<div class="judge-progress"><i></i></div>' +
          '<div class="judge-tests">' +
            ['样例 1', '测试点 1', '测试点 2', '测试点 3', '测试点 4'].map((t) => '<span class="test">' + t + '</span>').join('') +
          '</div>';

        clearTimeout(judgeTimer);
        judgeTimer = setTimeout(() => {
          const detail = verdictDetail(status);
          panel.innerHTML = '' +
            '<div class="judge-head"><span class="verdict big ' + status.toLowerCase() + '">' + status + '</span>' +
              '<span class="judge-detail">' + esc(detail.text) + '</span></div>' +
            '<div class="judge-meta"><span>耗时 ' + detail.time + 'ms</span><span>内存 ' + detail.mem + 'KB</span><span>' + esc(lang) + '</span></div>' +
            '<p class="note">' + esc(detail.tip) + '</p>';

          const sub = {
            id: Math.floor(Math.random() * 900000 + 100000),
            pid,
            cid,
            lang,
            status,
            time: detail.time,
            ts: Date.now()
          };
          pushSub(sub);
          markSolved(pid, status);
          if (status !== 'AC') {
            const wrongs = getWrongs();
            if (!wrongs.includes(pid)) {
              storage.write(KEY.wrong, wrongs.concat(pid));
            }
          }
          toast(status === 'AC' ? '恭喜通过！' : '评测结果：' + status, status === 'AC' ? 'ok' : 'warn', 2600);
          // 刷新侧栏状态
          const stateEl = $('.status-line b');
          if (stateEl) stateEl.textContent = status === 'AC' ? '已通过' : '尝试过';
        }, 1100);
      });
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请手动选择', 'warn'); }
    ta.remove();
  }

  function pseudoJudge(code, pid) {
    const trimmed = (code || '').trim();
    if (trimmed.length < 12) return 'CE';
    if (!/#\s*include/.test(trimmed)) return 'CE';
    if (!/main\s*\(/.test(trimmed)) return 'CE';
    let h = 2166136261;
    const seedText = pid + '|' + trimmed;
    for (let i = 0; i < seedText.length; i += 1) {
      h ^= seedText.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const r = Math.abs(h % 100);
    if (r < 70) return 'AC';
    if (r < 88) return 'WA';
    if (r < 95) return 'TLE';
    return 'RE';
  }

  function verdictDetail(status) {
    const map = {
      AC: { text: '答案正确，全部测试点通过', time: 6 + Math.floor(Math.random() * 10), mem: 1024 + Math.floor(Math.random() * 800), tip: '继续保持，可以看看下一题了。' },
      WA: { text: '答案错误，存在输出不一致的测试点', time: 5 + Math.floor(Math.random() * 8), mem: 980 + Math.floor(Math.random() * 700), tip: '检查边界数据、空格与换行，以及多组输入的处理。' },
      TLE: { text: '运行超时，程序运行时间超过限制', time: 1012, mem: 1200 + Math.floor(Math.random() * 600), tip: '检查循环是否可能死循环，或者算法复杂度是否过高。' },
      RE: { text: '运行错误，程序异常退出', time: 3, mem: 900 + Math.floor(Math.random() * 400), tip: '注意数组越界、除零、空指针等问题。' },
      CE: { text: '编译错误，代码无法通过编译', time: 0, mem: 0, tip: '检查是否包含头文件、括号是否配对、语句末尾是否缺少分号。' }
    };
    return map[status] || map.WA;
  }

  /* ============================== 15. 排行榜 ============================== */
  function renderLeaderboard() {
    const root = $('#leaderboardRoot');
    if (!root) return;
    const user = getUser();
    const s = getStats();

    const rows = RANKS.filter((r) => !user || r.name !== (user.type === 'student' ? user.account : (user.username || 'User')))
      .map((r) => ({ name: r.name, ac: r.ac, sub: r.sub, me: false }));
    if (user) {
      const label = user.type === 'student' ? user.account : (user.username || 'User');
      rows.push({ name: label, ac: s.solved, sub: Math.max(s.submissions, s.solved), me: true });
    }
    rows.sort((a, b) => (b.ac - a.ac) || (a.sub - b.sub));
    rows.forEach((r, i) => { r.rank = i + 1; });

    const top3 = rows.slice(0, 3);
    const rest = rows;
    const podium = top3.map((r, i) =>
      '<div class="podium-card rank-' + (i + 1) + (r.me ? ' me' : '') + '">' +
        '<span class="podium-medal">' + ['🥇', '🥈', '🥉'][i] + '</span>' +
        '<span class="podium-name">' + esc(r.name) + '</span>' +
        '<span class="podium-ac">' + r.ac + ' <small>题</small></span>' +
        '<span class="podium-sub">提交 ' + r.sub + ' 次</span>' +
      '</div>'
    ).join('');

    const tableRows = rest.map((r) =>
      '<tr' + (r.me ? ' class="me-row"' : '') + '>' +
        '<td class="mono">' + r.rank + '</td>' +
        '<td>' + esc(r.name) + (r.me ? ' <span class="me-tag">我</span>' : '') + '</td>' +
        '<td class="mono">' + r.ac + '</td>' +
        '<td class="mono">' + r.sub + '</td>' +
        '<td class="mono">' + (r.sub ? Math.round((r.ac / r.sub) * 100) : 0) + '%</td>' +
      '</tr>'
    ).join('');

    root.innerHTML = '' +
      '<div class="page-head">' +
        '<div><h1>排行榜</h1><p>按已解决题目数排序，题数相同时提交更少者靠前。演示数据 + 本机学习记录。</p></div>' +
        (user ? '<div class="page-head-side"><span class="pill">我的排名 第 ' + rows.find((r) => r.me).rank + ' 名</span></div>' : '') +
      '</div>' +
      '<div class="podium">' + podium + '</div>' +
      '<section class="card table-card">' +
        '<div class="table-wrap"><table class="data-table">' +
          '<thead><tr><th>名次</th><th>用户名</th><th>已解决</th><th>提交</th><th>通过率</th></tr></thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table></div>' +
      '</section>' +
      (!user ? '<p class="note center">登录后会把你的成绩加入排行榜。</p>' : '');
  }

  /* ============================== 16. 书单 ============================== */
  function bindBooks() {
    $$('.js-toggle-book').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.target);
        if (!target) return;
        const isHidden = target.classList.toggle('hidden');
        btn.textContent = isHidden ? '查看更多 ▾' : '收起 ▴';
      });
    });
    $$('.js-login-hint').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (getUser()) {
          toast('你已登录，可以去题库刷题了', 'info');
        } else {
          openLogin();
        }
      });
    });
  }

  /* ============================== 17. 小游戏 ============================== */
  function initSnake() {
    const canvas = $('#snakeCanvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const COLS = 22;
    const ROWS = 22;
    const CELL = 22;
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;

    const scoreEl = $('#snakeScore');
    const bestEl = $('#snakeBest');
    const stateEl = $('#snakeState');
    const startBtn = $('#snakeStart');
    const pauseBtn = $('#snakePause');
    const resetBtn = $('#snakeReset');

    let best = parseInt(storage.readRaw(KEY.snake, '0'), 10) || 0;
    let snake = [];
    let dir = { x: 1, y: 0 };
    let nextDir = { x: 1, y: 0 };
    let food = { x: 0, y: 0 };
    let score = 0;
    let timer = null;
    let running = false;
    let paused = false;
    let over = false;

    if (bestEl) bestEl.textContent = best;

    function reset() {
      snake = [{ x: 8, y: 11 }, { x: 7, y: 11 }, { x: 6, y: 11 }];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      score = 0;
      over = false;
      paused = false;
      placeFood();
      if (scoreEl) scoreEl.textContent = '0';
      setState('准备开始');
      draw();
    }

    function setState(text) {
      if (stateEl) stateEl.textContent = text;
    }

    function placeFood() {
      let guard = 0;
      do {
        food = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS)
        };
        guard += 1;
      } while (snake.some((s) => s.x === food.x && s.y === food.y) && guard < 500);
    }

    function draw() {
      const styles = getComputedStyle(document.documentElement);
      const accent = (styles.getPropertyValue('--game-accent') || '#38bdf8').trim();
      const accent2 = (styles.getPropertyValue('--game-accent-2') || '#a3e635').trim();

      ctx.fillStyle = '#0b1220';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 网格
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      for (let i = 1; i < COLS; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * CELL + 0.5, 0);
        ctx.lineTo(i * CELL + 0.5, canvas.height);
        ctx.stroke();
      }
      for (let j = 1; j < ROWS; j += 1) {
        ctx.beginPath();
        ctx.moveTo(0, j * CELL + 0.5);
        ctx.lineTo(canvas.width, j * CELL + 0.5);
        ctx.stroke();
      }

      // 食物
      ctx.fillStyle = accent2;
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // 蛇
      snake.forEach((seg, i) => {
        const pad = i === 0 ? 1.5 : 2.5;
        ctx.fillStyle = i === 0 ? accent : mix(accent, '#0b1220', Math.min(0.55, i / (snake.length + 4)));
        roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 5);
        ctx.fill();
      });

      // 眼睛
      const head = snake[0];
      if (head) {
        ctx.fillStyle = '#0b1220';
        const cx = head.x * CELL + CELL / 2;
        const cy = head.y * CELL + CELL / 2;
        const ox = dir.y !== 0 ? 4 : 0;
        const oy = dir.x !== 0 ? 4 : 0;
        const fx = dir.x !== 0 ? (dir.x > 0 ? 2 : -2) : 0;
        const fy = dir.y !== 0 ? (dir.y > 0 ? 2 : -2) : 0;
        ctx.beginPath();
        ctx.arc(cx + ox + fx, cy + oy + fy, 1.6, 0, Math.PI * 2);
        ctx.arc(cx - ox + fx, cy - oy + fy, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function mix(a, b, t) {
      const pa = hexToRgb(a);
      const pb = hexToRgb(b);
      if (!pa || !pb) return a;
      const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
      return 'rgb(' + c.join(',') + ')';
    }

    function hexToRgb(hex) {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
    }

    function step() {
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) return gameOver();
      if (snake.some((s, i) => i < snake.length - 1 && s.x === head.x && s.y === head.y)) return gameOver();

      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        if (scoreEl) scoreEl.textContent = String(score);
        placeFood();
        if (score > best) {
          best = score;
          storage.writeRaw(KEY.snake, String(best));
          if (bestEl) bestEl.textContent = best;
        }
        draw();
        return;
      }
      snake.pop();
      draw();
      loop();
    }

    function loop() {
      clearTimeout(timer);
      if (!running || paused || over) return;
      const speed = Math.max(70, 150 - Math.floor(score / 50) * 10);
      timer = setTimeout(step, speed);
    }

    function start() {
      if (over) reset();
      running = true;
      paused = false;
      setState('游戏中');
      if (startBtn) startBtn.textContent = '重新开始';
      if (pauseBtn) pauseBtn.textContent = '暂停';
      loop();
    }

    function togglePause() {
      if (!running) return start();
      if (over) return reset();
      paused = !paused;
      setState(paused ? '已暂停' : '游戏中');
      if (pauseBtn) pauseBtn.textContent = paused ? '继续' : '暂停';
      if (!paused) loop();
      else clearTimeout(timer);
    }

    function gameOver() {
      running = false;
      over = true;
      clearTimeout(timer);
      setState('游戏结束');
      if (pauseBtn) pauseBtn.textContent = '暂停';
      toast('本局得分 ' + score, 'info', 2000);
      draw();
      ctx.fillStyle = 'rgba(11, 18, 32, 0.72)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 20px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '400 14px "Segoe UI", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('得分 ' + score + ' · 点击「重新开始」再来一局', canvas.width / 2, canvas.height / 2 + 20);
    }

    function turn(nx, ny) {
      if (over) return;
      if (nx === -dir.x && ny === -dir.y) return;
      if (nx === dir.x && ny === dir.y) return;
      nextDir = { x: nx, y: ny };
    }

    document.addEventListener('keydown', (e) => {
      const keys = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0] };
      const k = keys[e.key];
      if (!k) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''))) return;
      e.preventDefault();
      if (!running) start();
      turn(k[0], k[1]);
    });

    $$('[data-dir]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
        const d = map[btn.dataset.dir];
        if (!d) return;
        if (!running) start();
        turn(d[0], d[1]);
      });
    });

    if (startBtn) startBtn.addEventListener('click', start);
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        clearTimeout(timer);
        running = false;
        reset();
        if (startBtn) startBtn.textContent = '开始游戏';
      });
    }

    reset();
  }

  /* ============================== 18. 守卫 ============================== */
  function guardHTML(title, desc) {
    return '' +
      '<section class="card guard-card">' +
        '<div class="guard-icon">🔒</div>' +
        '<h2>' + esc(title) + '</h2>' +
        '<p>' + esc(desc) + '</p>' +
        '<div class="guard-actions">' +
          '<button class="btn btn-primary" type="button" id="guardLogin">立即登录</button>' +
          '<a class="btn btn-ghost" href="Oj_5th.html">返回首页</a>' +
        '</div>' +
        '<p class="note">未登录时依然可以浏览题库与题目内容。</p>' +
      '</section>';
  }

  function bindGuard() {
    const btn = $('#guardLogin');
    if (btn) btn.addEventListener('click', openLogin);
  }

  function requireLogin(action) {
    if (getUser()) return true;
    toast('请先登录后再' + (action || '操作'), 'warn', 2200);
    openLogin();
    return false;
  }

  /* ============================== 19. 启动 ============================== */
  function bindGlobal() {
    // 关闭按钮 / 点击遮罩 / ESC
    $$('.modal-mask').forEach((mask) => {
      mask.addEventListener('click', (e) => {
        if (e.target === mask) closeModal(mask.id);
      });
    });
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-close]');
      if (closeBtn) closeModal(closeBtn.dataset.close);
      if (!e.target.closest('#userId') && !e.target.closest('#userChip') && !e.target.closest('#userMenu')) closeUserMenu();
      if (!e.target.closest('#navDropdown')) scheduleCloseLeisure(0);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
        closeUserMenu();
        scheduleCloseLeisure(0);
      }
    });

    // 登录相关
    const seg = $('#loginSeg');
    if (seg) {
      seg.addEventListener('click', (e) => {
        const btn = e.target.closest('.seg-btn');
        if (!btn) return;
        setLoginMode(btn.dataset.mode);
      });
    }
    const loginForm = $('#loginForm');
    if (loginForm) loginForm.addEventListener('submit', submitLogin);
    const accInput = $('#accInput');
    if (accInput) accInput.addEventListener('input', () => { const err = $('#loginError'); if (err) err.hidden = true; });
    const pwdInput = $('#pwdInput');
    if (pwdInput) pwdInput.addEventListener('input', () => { const err = $('#loginError'); if (err) err.hidden = true; });

    // 反馈
    const fb1Yes = $('#fb1Yes');
    if (fb1Yes) {
      fb1Yes.addEventListener('click', () => {
        closeModal('feedbackModal1');
        const err = $('#fbError');
        if (err) err.hidden = true;
        const ta = $('#fbText');
        if (ta) ta.value = '';
        openModal('feedbackFormModal');
      });
    }
    const fb1No = $('#fb1No');
    if (fb1No) {
      fb1No.addEventListener('click', () => {
        closeModal('feedbackModal1');
        openModal('feedbackModal2');
      });
    }
    const fb2Yes = $('#fb2Yes');
    if (fb2Yes) {
      fb2Yes.addEventListener('click', () => {
        closeModal('feedbackModal2');
        toast('好的，祝你刷题顺利～', 'ok', 2000);
      });
    }
    const fb2No = $('#fb2No');
    if (fb2No) {
      fb2No.addEventListener('click', () => {
        closeModal('feedbackModal2');
        toast('正在前往北航 OJ 官方平台…', 'info', 1800);
        setTimeout(() => { window.location.href = 'https://accoding.buaa.edu.cn/index'; }, 700);
      });
    }
    const feedbackForm = $('#feedbackForm');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = ($('#fbText') || {}).value || '';
        if (text.trim().length < 5) {
          const err = $('#fbError');
          if (err) { err.textContent = '请至少填写 5 个字符'; err.hidden = false; }
          return;
        }
        const list = storage.read(KEY.feedback, []);
        list.unshift({
          type: ($('#fbType') || {}).value || '其他建议',
          text: text.trim(),
          ts: Date.now()
        });
        storage.write(KEY.feedback, list.slice(0, 30));
        closeModal('feedbackFormModal');
        toast('反馈已记录，感谢你的建议！', 'ok', 2600);
      });
    }

    // 修改用户名
    const renameForm = $('#renameForm');
    if (renameForm) renameForm.addEventListener('submit', submitRename);

    // 主题在切换后同步 logo 提示
    applyTheme(currentTheme(), true);
  }

  function boot() {
    applyTheme(currentTheme(), true);

    const nav = $('#appNav');
    if (nav) nav.innerHTML = navHTML();
    const footer = $('#appFooter');
    if (footer) footer.innerHTML = footerHTML();

    const modalRoot = document.createElement('div');
    modalRoot.id = 'modalRoot';
    modalRoot.innerHTML = modalsHTML();
    document.body.appendChild(modalRoot);

    bindNav();
    bindGlobal();

    if (PAGE === 'home') renderHome();
    if (PAGE === 'problems') renderProblems();
    if (PAGE === 'contests') renderContests();
    if (PAGE === 'contest-detail') renderContestDetail();
    if (PAGE === 'problem-detail') renderProblemDetail();
    if (PAGE === 'leaderboard') renderLeaderboard();
    if (PAGE === 'books') bindBooks();
    if (PAGE === 'game') initSnake();

    // 登录 / 退出后刷新当前页
    window.__pageRefresh = function () {
      if (PAGE === 'home') renderHome();
      if (PAGE === 'problems') renderProblems();
      if (PAGE === 'contests') renderContests();
      if (PAGE === 'contest-detail') renderContestDetail();
      if (PAGE === 'problem-detail') renderProblemDetail();
      if (PAGE === 'leaderboard') renderLeaderboard();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
